import fs from "fs";
import path from "path";
import matter from "gray-matter";
import {
  ContentMeta,
  ContentFrontmatter,
  KnowledgeGraph,
  RecipeFrontmatter,
  JournalFrontmatter,
  KnowledgeFrontmatter,
  SearchResult,
} from "./types";
import { excerpt } from "./utils";

const CONTENT_ROOT = path.join(process.cwd(), "content");

/** Convert gray-matter Date objects to strings */
function normalize(v: unknown): unknown {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (Array.isArray(v)) return v.map(normalize);
  if (v && typeof v === "object") {
    // Detect YAML-misparsed colon-strings like "First steep: 15s" → {First steep: "15s"}
    const entries = Object.entries(v as Record<string, unknown>);
    if (entries.length === 1 && typeof entries[0][1] === "string") {
      return `${entries[0][0]}: ${entries[0][1]}`;
    }
    const obj: Record<string, unknown> = {};
    for (const [k, val] of entries) {
      obj[k] = normalize(val);
    }
    return obj;
  }
  return v;
}

export function getContentRoot(): string {
  return CONTENT_ROOT;
}

/**
 * Read a single MDX file and parse its frontmatter + content.
 */
function parseMdxFile(filePath: string): ContentMeta | null {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    const fm = normalize(data) as Record<string, unknown>;

    const slug = (fm.slug as string) || path.basename(filePath, ".mdx");
    const type = (fm.type as string) || "recipe";

    const base: ContentMeta = {
      slug,
      title: (fm.title as string) || slug,
      type: type as ContentMeta["type"],
      tags: (fm.tags as string[]) || [],
      summary: (fm.summary as string) || undefined,
      lang: (fm.lang as string) || undefined,
      translation_of: (fm.translation_of as string) || undefined,
      filePath,
      rawContent: content,
      excerpt: excerpt(content, 150) || (fm.summary as string) || "",
    };

    if (type === "recipe" || type === "variation") {
      base.category = fm.category as string;
      base.difficulty = fm.difficulty as RecipeFrontmatter["difficulty"];
      base.rating = fm.rating as number;
      base.time = fm.time as number;
      base.ingredients = (fm.ingredients as RecipeFrontmatter["ingredients"]) || [];
      base.equipment = (fm.equipment as string[]) || [];
      base.flavor = fm.flavor as RecipeFrontmatter["flavor"];
      base.tips = (fm.tips as string[]) || [];
      base.parent = fm.parent as string | undefined;
      base.variations = (fm.variations as string[]) || [];

      // Generate ingredient slugs
      if (base.ingredients) {
        base.ingredients = base.ingredients.map((ing) => ({
          ...ing,
          slug: ing.slug || ing.name.toLowerCase().replace(/\s+/g, "-"),
        }));
      }
    } else if (type === "journal") {
      base.recipe = fm.recipe as string;
      base.date = fm.date as string;
      base.rating = fm.rating as number;
    } else if (type === "knowledge") {
      base.category = fm.category as string;
      base.related = (fm.related as string[]) || [];
    }

    return base;
  } catch (err) {
    console.error(`Error parsing ${filePath}:`, err);
    return null;
  }
}

/**
 * Recursively scan content directory for .mdx files.
 */
function scanDirectory(dir: string): string[] {
  const files: string[] = [];

  if (!fs.existsSync(dir)) return files;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...scanDirectory(fullPath));
    } else if (entry.name.endsWith(".mdx")) {
      files.push(fullPath);
    }
  }

  return files;
}

// Cache for build-time content
let _contentCache: ContentMeta[] | null = null;
let _graphCache: KnowledgeGraph | null = null;

/**
 * Load all content from the content/ directory.
 * Results are cached in memory for the lifetime of the process.
 */
export function getAllContent(): ContentMeta[] {
  if (_contentCache) return _contentCache;

  const files = scanDirectory(CONTENT_ROOT);
  const content = files
    .map(parseMdxFile)
    .filter((c): c is ContentMeta => c !== null)
    .sort((a, b) => {
      // Sort by date descending for journals, by title for others
      if (a.type === "journal" && b.type === "journal") {
        return (b.date || "").localeCompare(a.date || "");
      }
      if (a.type === "journal") return -1;
      if (b.type === "journal") return 1;
      return a.title.localeCompare(b.title);
    });

  _contentCache = content;
  return content;
}

/**
 * Build the knowledge graph from all content.
 */
export function getKnowledgeGraph(): KnowledgeGraph {
  if (_graphCache) return _graphCache;

  const all = getAllContent();
  const graph: KnowledgeGraph = {
    ingredientIndex: new Map(),
    equipmentIndex: new Map(),
    variationTree: new Map(),
    categoryIndex: new Map(),
    tagIndex: new Map(),
  };

  // Recipe/variation indices
  const recipes = all.filter(
    (c) => c.type === "recipe" || c.type === "variation"
  );

  for (const recipe of recipes) {
    // Ingredient index
    for (const ing of recipe.ingredients || []) {
      const key = ing.slug || ing.name;
      if (!graph.ingredientIndex.has(key)) {
        graph.ingredientIndex.set(key, []);
      }
      graph.ingredientIndex.get(key)!.push(recipe);
    }

    // Equipment index
    for (const equip of recipe.equipment || []) {
      const key = equip;
      if (!graph.equipmentIndex.has(key)) {
        graph.equipmentIndex.set(key, []);
      }
      graph.equipmentIndex.get(key)!.push(recipe);
    }

    // Category index (only for recipes)
    if (recipe.category) {
      if (!graph.categoryIndex.has(recipe.category)) {
        graph.categoryIndex.set(recipe.category, []);
      }
      graph.categoryIndex.get(recipe.category)!.push(recipe);
    }

    // Tag index
    for (const tag of recipe.tags || []) {
      if (!graph.tagIndex.has(tag)) {
        graph.tagIndex.set(tag, []);
      }
      graph.tagIndex.get(tag)!.push(recipe);
    }
  }

  // Variation tree
  for (const recipe of recipes) {
    if (recipe.type === "variation" && recipe.parent) {
      if (!graph.variationTree.has(recipe.parent)) {
        graph.variationTree.set(recipe.parent, []);
      }
      graph.variationTree.get(recipe.parent)!.push(recipe);
    }
  }

  // Knowledge articles: add to category and tag indices
  for (const article of all.filter((c) => c.type === "knowledge")) {
    if (article.category) {
      if (!graph.categoryIndex.has(article.category)) {
        graph.categoryIndex.set(article.category, []);
      }
      graph.categoryIndex.get(article.category)!.push(article);
    }
    for (const tag of article.tags || []) {
      if (!graph.tagIndex.has(tag)) {
        graph.tagIndex.set(tag, []);
      }
      graph.tagIndex.get(tag)!.push(article);
    }
  }

  // Journal: add to tag index
  for (const journal of all.filter((c) => c.type === "journal")) {
    for (const tag of journal.tags || []) {
      if (!graph.tagIndex.has(tag)) {
        graph.tagIndex.set(tag, []);
      }
      graph.tagIndex.get(tag)!.push(journal);
    }
  }

  _graphCache = graph;
  return graph;
}

/**
 * Get a single recipe by slug. Returns the recipe and any variations/children.
 */
export function getRecipeBySlug(slug: string): {
  recipe: ContentMeta;
  variations: ContentMeta[];
  parent: ContentMeta | null;
  journals: ContentMeta[];
} | null {
  const all = getAllContent();
  const recipe = all.find(
    (c) =>
      c.slug === slug && (c.type === "recipe" || c.type === "variation")
  );
  if (!recipe) return null;

  const graph = getKnowledgeGraph();
  const variations = graph.variationTree.get(slug) || [];

  // If this is a variation, find parent
  let parent: ContentMeta | null = null;
  if (recipe.type === "variation" && recipe.parent) {
    parent =
      all.find((c) => c.slug === recipe.parent) || null;
  }

  // Find journal entries about this recipe
  const journals = all.filter(
    (c) => c.type === "journal" && c.recipe === slug
  );

  return { recipe, variations, parent, journals };
}

/**
 * Get a journal entry by slug.
 */
export function getJournalBySlug(
  slug: string
): { entry: ContentMeta; recipe: ContentMeta | null } | null {
  const all = getAllContent();
  const entry = all.find((c) => c.slug === slug && c.type === "journal");
  if (!entry) return null;

  const recipe = entry.recipe
    ? all.find((c) => c.slug === entry.recipe) || null
    : null;

  return { entry, recipe };
}

/**
 * Get a knowledge article by slug.
 */
export function getKnowledgeBySlug(slug: string): ContentMeta | null {
  const all = getAllContent();
  return all.find((c) => c.slug === slug && c.type === "knowledge") || null;
}

/**
 * Get content by category.
 */
export function getByCategory(category: string): ContentMeta[] {
  const graph = getKnowledgeGraph();
  return graph.categoryIndex.get(category) || [];
}

/**
 * Get content by tag.
 */
export function getByTag(tag: string): ContentMeta[] {
  const graph = getKnowledgeGraph();
  const direct = graph.tagIndex.get(tag);
  if (direct) return direct;
  // Try URL-decoded match (Chinese characters may come encoded from Next.js params)
  const decoded = decodeURIComponent(tag);
  if (decoded !== tag) return graph.tagIndex.get(decoded) || [];
  // Try matching against existing keys
  for (const [key, val] of graph.tagIndex) {
    if (decodeURIComponent(key) === tag || key === decoded) return val;
  }
  return [];
}

/**
 * Get recipes by ingredient.
 */
export function getByIngredient(ingredient: string): ContentMeta[] {
  const graph = getKnowledgeGraph();
  const direct = graph.ingredientIndex.get(ingredient);
  if (direct) return direct;
  const decoded = decodeURIComponent(ingredient);
  if (decoded !== ingredient) return graph.ingredientIndex.get(decoded) || [];
  for (const [key, val] of graph.ingredientIndex) {
    if (decodeURIComponent(key) === ingredient || key === decoded) return val;
  }
  return [];
}

/**
 * Get recipes by equipment.
 */
export function getByEquipment(equipment: string): ContentMeta[] {
  const graph = getKnowledgeGraph();
  const direct = graph.equipmentIndex.get(equipment);
  if (direct) return direct;
  const decoded = decodeURIComponent(equipment);
  if (decoded !== equipment) return graph.equipmentIndex.get(decoded) || [];
  for (const [key, val] of graph.equipmentIndex) {
    if (decodeURIComponent(key) === equipment || key === decoded) return val;
  }
  return [];
}

/**
 * Get top-rated recipes (for homepage).
 */
export function getTopRecipes(limit: number = 6): ContentMeta[] {
  const all = getAllContent();
  return all
    .filter((c) => c.type === "recipe" || c.type === "variation")
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, limit);
}

/**
 * Get latest content (for homepage).
 */
export function getLatestContent(limit: number = 5): ContentMeta[] {
  const all = getAllContent();
  return all.slice(0, limit);
}

/**
 * Get related content by shared tags and ingredients.
 */
export function getRelatedContent(
  slug: string,
  limit: number = 5
): ContentMeta[] {
  const all = getAllContent();
  const current = all.find((c) => c.slug === slug);
  if (!current) return [];

  const currentTags = new Set(current.tags || []);
  const currentIngredients = new Set(
    (current.ingredients || []).map((i) => i.name)
  );

  const scored = all
    .filter((c) => c.slug !== slug)
    .map((c) => {
      let score = 0;
      const cTags = c.tags || [];
      const cIngredients = (c.ingredients || []).map((i) => i.name);

      for (const tag of cTags) {
        if (currentTags.has(tag)) score += 2;
      }
      for (const ing of cIngredients) {
        if (currentIngredients.has(ing)) score += 1;
      }
      // Bonus for same category
      if (c.category && c.category === current.category) score += 1;
      // Bonus for same type
      if (c.type === current.type) score += 1;

      return { item: c, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ item }) => item);

  return scored;
}

/**
 * Search across all content.
 */
export function searchContent(query: string): SearchResult[] {
  const all = getAllContent();
  const q = query.toLowerCase();
  const terms = q.split(/\s+/).filter(Boolean);

  if (terms.length === 0) return [];

  const results: SearchResult[] = [];

  for (const item of all) {
    let score = 0;
    const matches: string[] = [];

    // Title match
    if (item.title.toLowerCase().includes(q)) {
      score += 10;
      matches.push("标题匹配");
    }

    // Summary match
    if (item.summary?.toLowerCase().includes(q)) {
      score += 5;
      matches.push("简介匹配");
    }

    // Tag match
    const tagMatch = item.tags?.find((t) => t.toLowerCase().includes(q));
    if (tagMatch) {
      score += 4;
      matches.push(`标签: ${tagMatch}`);
    }

    // Ingredient match
    const ingMatch = item.ingredients?.find(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        (i.slug && i.slug.toLowerCase().includes(q))
    );
    if (ingMatch) {
      score += 3;
      matches.push(`食材: ${ingMatch.name}`);
    }

    // Equipment match
    const equipMatch = item.equipment?.find((e) => e.toLowerCase().includes(q));
    if (equipMatch) {
      score += 2;
      matches.push(`工具: ${equipMatch}`);
    }

    // Content match
    if (item.excerpt.toLowerCase().includes(q)) {
      score += 1;
      matches.push("内容匹配");
    }

    // Individual term matching for partial matches
    for (const term of terms) {
      if (item.title.toLowerCase().includes(term) && !matches.includes("标题匹配")) {
        score += 3;
        matches.push(`部分匹配: ${term}`);
      }
      if (
        item.ingredients?.find(
          (i) =>
            i.name.toLowerCase().includes(term) ||
            (i.slug && i.slug.includes(term))
        )
      ) {
        score += 1;
      }
    }

    if (score > 0) {
      results.push({ item, score, matches });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results;
}

/**
 * Get a random recipe (for "random discovery" feature).
 */
export function getRandomRecipe(): ContentMeta | null {
  const all = getAllContent().filter(
    (c) => c.type === "recipe" || c.type === "variation"
  );
  if (all.length === 0) return null;
  return all[Math.floor(Math.random() * all.length)];
}

/**
 * Find a translation for a given content item.
 * Returns the counterpart in the other language, if it exists.
 */
export function getTranslation(slug: string): ContentMeta | null {
  const all = getAllContent();
  // First check: does this item have a translation_of field?
  const item = all.find((c) => c.slug === slug);
  if (item?.translation_of) {
    return all.find((c) => c.slug === item.translation_of) || null;
  }
  // Second check: does another item have translation_of pointing to this?
  return all.find((c) => c.translation_of === slug) || null;
}

/** Get content filtered by language */
export function getContentByLang(lang: string): ContentMeta[] {
  return getAllContent().filter((c) => c.lang === lang || !c.lang);
}

/**
 * Clear caches (useful in development).
 */
export function clearCache(): void {
  _contentCache = null;
  _graphCache = null;
}
