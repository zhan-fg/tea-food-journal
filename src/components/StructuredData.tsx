import { ContentMeta } from "@/lib/types";

interface StructuredDataProps {
  recipe: ContentMeta;
  url: string;
}

/** Extract the steps (### headings + following paragraph) from the markdown body. */
function parseRecipeSteps(raw: string | undefined): { name: string; text: string }[] {
  if (!raw) return [];
  const lines = raw.split("\n");
  const steps: { name: string; text: string }[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("### ")) {
      const name = line.slice(4).trim();
      const textLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("### ") && !lines[i].startsWith("## ")) {
        if (lines[i].trim()) textLines.push(lines[i].trim());
        i++;
      }
      steps.push({ name, text: textLines.join(" ") });
    } else {
      i++;
    }
  }
  return steps;
}

function extractYoutubeId(input?: string): string | null {
  if (!input) return null;
  const t = input.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(t)) return t;
  const m = t.match(/[?&]v=([A-Za-z0-9_-]{11})/);
  if (m) return m[1];
  const m2 = t.match(/youtu\.be\/([A-Za-z0-9_-]{11})/);
  if (m2) return m2[1];
  return null;
}

function extractBvid(input?: string): string | null {
  if (!input) return null;
  const m = input.match(/BV[a-zA-Z0-9]{10}/);
  return m ? m[0] : null;
}

export default function StructuredData({ recipe, url }: StructuredDataProps) {
  if (recipe.type !== "recipe" && recipe.type !== "variation") return null;

  const steps = parseRecipeSteps(recipe.rawContent);
  const ytId = extractYoutubeId(recipe.videoYoutube);
  const bvid = extractBvid(recipe.videoBilibili);

  const video =
    ytId
      ? {
          "@type": "VideoObject",
          name: recipe.title,
          description: recipe.summary || "",
          thumbnailUrl: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
          embedUrl: `https://www.youtube.com/embed/${ytId}`,
          contentUrl: `https://www.youtube.com/watch?v=${ytId}`,
        }
      : bvid
        ? {
            "@type": "VideoObject",
            name: recipe.title,
            description: recipe.summary || "",
            embedUrl: `https://player.bilibili.com/player.html?bvid=${bvid}`,
          }
        : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    description: recipe.summary || "",
    url,
    inLanguage: recipe.lang === "en" ? "en" : "zh-CN",
    ...(recipe.image && { image: recipe.image }),
    ...(recipe.category && { recipeCategory: recipe.category }),
    ...(recipe.tags && recipe.tags.length > 0 && { keywords: recipe.tags.join(", ") }),
    ...(recipe.rating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: recipe.rating,
        bestRating: "5",
        worstRating: "1",
      },
    }),
    ...(recipe.time && {
      totalTime: `PT${recipe.time}M`,
    }),
    recipeIngredient:
      recipe.ingredients?.map(
        (i) => `${i.amount ? i.amount + " " : ""}${i.name}`
      ) || [],
    ...(recipe.equipment && recipe.equipment.length > 0 && {
      tool: recipe.equipment.map((e) => ({ "@type": "HowToTool", name: e })),
    }),
    recipeInstructions: steps.map((s) => ({
      "@type": "HowToStep",
      name: s.name,
      text: s.text,
    })),
    ...(video && { video }),
    ...(recipe.type === "variation" && recipe.parent && {
      isBasedOn: recipe.parent,
    }),
  };

  // FAQ entries for GEO / rich results
  const isEn = recipe.lang === "en";
  const faq: { q: string; a: string }[] = [];
  if (recipe.time) {
    faq.push({
      q: isEn ? `How long does ${recipe.title} take?` : `${recipe.title} 需要多长时间？`,
      a: isEn
        ? `About ${recipe.time} minutes in total.`
        : `总共约 ${recipe.time} 分钟。`,
    });
  }
  if (recipe.difficulty) {
    const d = isEn
      ? recipe.difficulty === "easy"
        ? "easy"
        : recipe.difficulty === "medium"
          ? "medium"
          : "hard"
      : recipe.difficulty === "easy"
        ? "简单"
        : recipe.difficulty === "medium"
          ? "中等"
          : "较难";
    faq.push({
      q: isEn ? `How difficult is ${recipe.title}?` : `${recipe.title} 的难度如何？`,
      a: isEn ? `It is ${d}.` : `难度为${d}。`,
    });
  }
  if (recipe.ingredients && recipe.ingredients.length > 0) {
    faq.push({
      q: isEn ? `What ingredients do I need for ${recipe.title}?` : `${recipe.title} 需要哪些材料？`,
      a: recipe.ingredients.map((i) => `${i.name}${i.amount ? ` (${i.amount})` : ""}`).join(isEn ? ", " : "、"),
    });
  }

  const faqLd =
    faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faq.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}
    </>
  );
}
