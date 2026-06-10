import { ContentMeta, SearchResult } from "./types";

/**
 * Client-safe search function — takes content array as parameter instead of reading from filesystem.
 */
export function searchContentClient(
  content: ContentMeta[],
  query: string
): SearchResult[] {
  const q = query.toLowerCase();
  const terms = q.split(/\s+/).filter(Boolean);

  if (terms.length === 0) return [];

  const results: SearchResult[] = [];

  for (const item of content) {
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

    // Individual term matching
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
