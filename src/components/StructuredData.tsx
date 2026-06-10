import { ContentMeta } from "@/lib/types";

interface StructuredDataProps {
  recipe: ContentMeta;
  url: string;
}

export default function StructuredData({ recipe, url }: StructuredDataProps) {
  if (recipe.type !== "recipe" && recipe.type !== "variation") return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    description: recipe.summary || "",
    url,
    ...(recipe.image && { image: recipe.image }),
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
    recipeIngredient: recipe.ingredients?.map(
      (i) => `${i.amount ? i.amount + " " : ""}${i.name}`
    ) || [],
    ...(recipe.equipment && recipe.equipment.length > 0 && {
      tool: recipe.equipment.map((e) => ({ "@type": "HowToTool", name: e })),
    }),
    recipeInstructions: [],
    ...(recipe.type === "variation" && recipe.parent && {
      isBasedOn: recipe.parent,
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
