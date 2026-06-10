// Content type definitions for Tea & Food Journal

export type ContentType = "recipe" | "variation" | "journal" | "knowledge";

export type Difficulty = "easy" | "medium" | "hard";

export type Category = "tea" | "soup" | "dessert" | "staple" | "home-cooking" | "ingredients" | "technique" | "other";

export interface FlavorProfile {
  sweetness: number;   // 1-5
  spiciness: number;   // 1-5
  aroma: number;       // 1-5
  bitterness: number;  // 1-5
  richness: number;    // 1-5
}

export interface Ingredient {
  name: string;
  amount?: string;
  slug?: string;
}

export interface RecipeStep {
  title: string;
  description: string;
  image?: string;
}

export interface RecipeFrontmatter {
  title: string;
  slug: string;
  type: "recipe" | "variation";
  parent?: string;
  category: Category;
  difficulty: Difficulty;
  rating: number;       // 1-5
  time: number;         // minutes
  ingredients: Ingredient[];
  equipment: string[];
  tags: string[];
  flavor: FlavorProfile;
  summary: string;
  tips: string[];
  variations?: string[];
  image?: string;
}

export interface JournalFrontmatter {
  title: string;
  slug: string;
  type: "journal";
  recipe: string;
  date: string;         // YYYY-MM-DD
  rating: number;
  tags: string[];
  summary?: string;
}

export interface KnowledgeFrontmatter {
  title: string;
  slug: string;
  type: "knowledge";
  category: "ingredients" | "technique" | "culture" | "health" | "other";
  tags: string[];
  related: string[];
  summary?: string;
}

export type ContentFrontmatter = RecipeFrontmatter | JournalFrontmatter | KnowledgeFrontmatter;

export interface ContentMeta {
  slug: string;
  title: string;
  type: ContentType;
  category?: Category | string;
  difficulty?: Difficulty;
  rating?: number;
  time?: number;
  date?: string;
  tags: string[];
  summary?: string;
  parent?: string;
  ingredients?: Ingredient[];
  equipment?: string[];
  flavor?: FlavorProfile;
  tips?: string[];
  variations?: string[];
  related?: string[];
  image?: string;
  // For journal
  recipe?: string;
  // Raw path
  filePath: string;
  rawContent: string;
  excerpt: string;
}

export interface KnowledgeGraph {
  ingredientIndex: Map<string, ContentMeta[]>;
  equipmentIndex: Map<string, ContentMeta[]>;
  variationTree: Map<string, ContentMeta[]>;
  categoryIndex: Map<string, ContentMeta[]>;
  tagIndex: Map<string, ContentMeta[]>;
}

export interface SearchResult {
  item: ContentMeta;
  score: number;
  matches: string[];
}
