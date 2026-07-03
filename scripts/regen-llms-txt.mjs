// Regenerate public/llms.txt — a plain-text catalog of the site's content for LLMs.
// Run: node scripts/regen-llms-txt.mjs
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CONTENT = path.join(ROOT, "content");
const OUT = path.join(ROOT, "public", "llms.txt");
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tea-food-journal.vercel.app";

function scan(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...scan(p));
    else if (e.name.endsWith(".mdx")) out.push(p);
  }
  return out;
}

const files = scan(CONTENT);
const items = files.map((f) => {
  const raw = fs.readFileSync(f, "utf-8");
  const { data } = matter(raw);
  return { ...data, filePath: f };
});

const recipes = items.filter((i) => i.type === "recipe" || i.type === "variation");
const journals = items.filter((i) => i.type === "journal");
const knowledge = items.filter((i) => i.type === "knowledge");

const L = [];
L.push("# Tea & Food Journal");
L.push("");
L.push("> A personal knowledge base for tea and food, built on real experience. Bilingual (中文/English) recipes with ingredients, steps, tips, flavor profiles, and video tutorials.");
L.push("");
L.push(`Base URL: ${BASE_URL}`);
L.push("");
L.push("## Site Structure");
L.push("");
L.push("- `/` — Home with featured recipes and categories");
L.push("- `/recipes/[slug]` — Recipe detail (zh + en versions, language switch available)");
L.push("- `/journal/[slug]` — Practice journal entry");
L.push("- `/knowledge/[slug]` — Educational article");
L.push("- `/categories/[category]` — Content by category (tea, soup, dessert, staple, home-cooking)");
L.push("- `/tags/[tag]` — Content by tag");
L.push("- `/ingredients/[ingredient]` — Recipes using an ingredient");
L.push("- `/equipment/[equipment]` — Recipes using equipment");
L.push("- `/search` — Full-text search");
L.push("- `/rss.xml` — RSS feed");
L.push("- `/sitemap.xml` — Sitemap");
L.push("");
L.push("## Content Types");
L.push("");
L.push("1. Recipe — Core recipe with ingredients, steps, tips, flavor profile, optional video tutorial");
L.push("2. Variation — Derived from a parent recipe with modifications");
L.push("3. Journal — Practice log recording real cooking experiences");
L.push("4. Knowledge — Educational articles about ingredients, techniques, culture");
L.push("");
// Group zh + en versions by their base slug.
const byBase = new Map();
for (const r of recipes) {
  const base = r.translation_of || r.slug;
  if (!byBase.has(base)) byBase.set(base, {});
  byBase.get(base)[r.lang || "zh"] = r;
}

L.push(`## Recipe Catalog (${byBase.size} recipes)`);
L.push("");

for (const [base, pair] of byBase) {
  const primary = pair.zh || pair.en;
  L.push(`### ${primary.title}`);
  const ings = (primary.ingredients || []).map((i) => i.name).join(", ");
  if (ings) L.push(`- Ingredients: ${ings}`);
  if (primary.tags && primary.tags.length) L.push(`- Tags: ${primary.tags.join(", ")}`);
  if (primary.category) L.push(`- Category: ${primary.category}`);
  if (primary.difficulty) L.push(`- Difficulty: ${primary.difficulty}`);
  if (primary.time) L.push(`- Time: ${primary.time} min`);
  if (primary.summary) L.push(`- Summary: ${primary.summary}`);
  L.push(`- 中文: ${BASE_URL}/recipes/${pair.zh ? pair.zh.slug : base}`);
  if (pair.en) L.push(`- English: ${BASE_URL}/recipes/${pair.en.slug}`);
  L.push("");
}

if (knowledge.length) {
  L.push(`## Knowledge Articles (${knowledge.length})`);
  L.push("");
  for (const k of knowledge) {
    L.push(`- ${k.title}: ${BASE_URL}/knowledge/${k.slug}`);
  }
  L.push("");
}

if (journals.length) {
  L.push(`## Practice Journal (${journals.length})`);
  L.push("");
  for (const j of journals) {
    L.push(`- ${j.title}: ${BASE_URL}/journal/${j.slug}`);
  }
  L.push("");
}

L.push("## Knowledge Graph");
L.push("");
L.push("The site builds a knowledge graph at build time connecting ingredients, equipment, tags, categories, and recipe variations.");
L.push("");
L.push("## Tech Stack");
L.push("");
L.push("- Next.js App Router, TypeScript, TailwindCSS, MDX content with gray-matter, Static Site Generation, no database");
L.push("");

fs.writeFileSync(OUT, L.join("\n"), "utf-8");
console.log(`Regenerated ${OUT}`);
console.log(`  recipes: ${recipes.length} (${byBase.size} unique)`);
console.log(`  knowledge: ${knowledge.length}`);
console.log(`  journal: ${journals.length}`);
