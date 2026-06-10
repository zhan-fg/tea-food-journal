import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format minutes to Chinese duration string */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}分钟`;
  if (mins === 0) return `${hours}小时`;
  return `${hours}小时${mins}分钟`;
}

/** Map difficulty to Chinese label */
export function difficultyLabel(difficulty: string): string {
  const map: Record<string, string> = {
    easy: "简单",
    medium: "中等",
    hard: "困难",
  };
  return map[difficulty] || difficulty;
}

/** Map category to Chinese label */
export function categoryLabel(category: string): string {
  const map: Record<string, string> = {
    tea: "茶饮",
    soup: "养生汤",
    dessert: "甜品",
    staple: "主食",
    "home-cooking": "家常菜",
    ingredients: "食材知识",
    technique: "技法",
    culture: "文化",
    health: "健康",
    other: "其他",
  };
  return map[category] || category;
}

/** Slugify Chinese + English text */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .trim();
}

/** Get all unique values from content for tag/ingredient/equipment pages */
export function listAllTags(contents: { tags: string[] }[]): string[] {
  return [...new Set(contents.flatMap((c) => c.tags))].sort();
}

export function listAllIngredients(
  contents: { ingredients?: { name: string }[] }[]
): string[] {
  return [
    ...new Set(
      contents
        .flatMap((c) => c.ingredients?.map((i) => i.name) || [])
    ),
  ].sort();
}

export function listAllEquipment(
  contents: { equipment?: string[] }[]
): string[] {
  return [...new Set(contents.flatMap((c) => c.equipment || []))].sort();
}

/** List all categories from content */
export function listAllCategories(
  contents: { type: string; category?: string }[]
): string[] {
  return [
    ...new Set(
      contents
        .filter((c) => c.type === "recipe" || c.type === "variation" || c.type === "knowledge")
        .map((c) => c.category || "")
        .filter(Boolean)
    ),
  ].sort();
}

/** Truncate text to excerpt */
export function excerpt(text: string, maxLen: number = 120): string {
  const plain = text.replace(/[#*`\[\]()>!\n\r]/g, " ").replace(/\s+/g, " ").trim();
  if (plain.length <= maxLen) return plain;
  return plain.slice(0, maxLen) + "…";
}

/**
 * Get the first heading from MDX content as a summary fallback
 */
export function firstHeading(text: string): string {
  const match = text.match(/^##?\s+(.+)$/m);
  return match ? match[1] : "";
}
