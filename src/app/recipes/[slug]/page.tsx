import Link from "next/link";
import { Star, Clock, ArrowLeft, ChevronRight, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getRecipeBySlug, getAllContent, getRelatedContent, getKnowledgeGraph } from "@/lib/content";
import { formatDuration, difficultyLabel, categoryLabel } from "@/lib/utils";
import FlavorMeter from "@/components/recipe/FlavorMeter";
import IngredientList from "@/components/recipe/IngredientList";
import EquipmentList from "@/components/recipe/EquipmentList";
import RecipeCard from "@/components/recipe/RecipeCard";
import StructuredData from "@/components/StructuredData";
import { MarkdownContent } from "./MarkdownContent";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const all = getAllContent();
  return all
    .filter((c) => c.type === "recipe" || c.type === "variation")
    .map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = getRecipeBySlug(slug);
  if (!data) return { title: "未找到" };

  const { recipe } = data;
  return {
    title: recipe.title,
    description: recipe.summary || `${recipe.title} - 详细配方与制作步骤`,
    openGraph: {
      title: recipe.title,
      description: recipe.summary,
      type: "article",
    },
  };
}

export default async function RecipePage({ params }: PageProps) {
  const { slug } = await params;
  const data = getRecipeBySlug(slug);
  if (!data) notFound();

  const { recipe, variations, parent, journals } = data;
  const related = getRelatedContent(slug, 4);
  const graph = getKnowledgeGraph();
  const allIngredients = recipe.ingredients || [];

  const url = `/recipes/${slug}`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <StructuredData recipe={recipe} url={url} />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-foreground/50 mb-6">
        <Link href="/" className="hover:text-tea-600 dark:hover:text-tea-400 transition-colors">
          首页
        </Link>
        <ChevronRight className="h-3 w-3" />
        {recipe.category && (
          <>
            <Link
              href={`/categories/${recipe.category}`}
              className="hover:text-tea-600 dark:hover:text-tea-400 transition-colors"
            >
              {categoryLabel(recipe.category)}
            </Link>
            <ChevronRight className="h-3 w-3" />
          </>
        )}
        <span className="text-foreground/80">{recipe.title}</span>
      </nav>

      {/* Parent link for variations */}
      {recipe.type === "variation" && parent && (
        <div className="mb-4 text-sm">
          <span className="text-foreground/50">来源：</span>
          <Link
            href={`/recipes/${parent.slug}`}
            className="text-tea-600 dark:text-tea-400 hover:underline inline-flex items-center gap-1"
          >
            {parent.title} <ArrowLeft className="h-3 w-3" />
          </Link>
          <span className="text-foreground/40 mx-1">→</span>
          <span className="text-foreground/80">{recipe.title}</span>
        </div>
      )}

      {/* Title */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          {recipe.type === "variation" && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-tea-100 text-green-tea-700 dark:bg-green-tea-900/40 dark:text-green-tea-400">
              变体
            </span>
          )}
          {recipe.type === "recipe" && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-tea-100 text-tea-700 dark:bg-tea-900/40 dark:text-tea-400">
              配方
            </span>
          )}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">{recipe.title}</h1>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-foreground/60 mb-6">
        {recipe.rating && (
          <span className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= recipe.rating!
                    ? "fill-tea-500 text-tea-500"
                    : "text-tea-200 dark:text-tea-800"
                }`}
              />
            ))}
          </span>
        )}
        {recipe.difficulty && (
          <span className="px-2 py-0.5 rounded-md bg-warm-100 dark:bg-tea-900/20">
            难度：{difficultyLabel(recipe.difficulty)}
          </span>
        )}
        {recipe.time && (
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            耗时：{formatDuration(recipe.time)}
          </span>
        )}
      </div>

      {/* Summary */}
      {recipe.summary && (
        <div className="bg-tea-50 dark:bg-tea-900/20 rounded-xl p-4 mb-8 border border-tea-200 dark:border-tea-800">
          <p className="text-foreground/80 leading-relaxed">{recipe.summary}</p>
        </div>
      )}

      {/* Flavor Profile */}
      {recipe.flavor && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">风味</h2>
          <div className="max-w-md">
            <FlavorMeter flavor={recipe.flavor} />
          </div>
        </section>
      )}

      {/* Ingredients */}
      {allIngredients.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">材料</h2>
          <div className="bg-white dark:bg-tea-900/10 rounded-xl p-4 border border-tea-200 dark:border-tea-800">
            <IngredientList ingredients={allIngredients} />
          </div>
        </section>
      )}

      {/* Equipment */}
      {recipe.equipment && recipe.equipment.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">工具</h2>
          <div className="bg-white dark:bg-tea-900/10 rounded-xl p-4 border border-tea-200 dark:border-tea-800">
            <EquipmentList equipment={recipe.equipment} />
          </div>
        </section>
      )}

      {/* Steps */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">制作步骤</h2>
        <div className="bg-white dark:bg-tea-900/10 rounded-xl p-6 border border-tea-200 dark:border-tea-800">
          <MarkdownContent content={recipe.rawContent} />
        </div>
      </section>

      {/* Tips */}
      {recipe.tips && recipe.tips.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">经验总结</h2>
          <div className="bg-warm-50 dark:bg-tea-900/20 rounded-xl p-4 border border-warm-200 dark:border-tea-800">
            <ul className="space-y-2">
              {recipe.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                  <span className="text-tea-500 mt-0.5">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Variations */}
      {variations.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">衍生配方</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {variations.map((v) => (
              <RecipeCard key={v.slug} recipe={v} />
            ))}
          </div>
        </section>
      )}

      {/* Journals about this recipe */}
      {journals.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">实践记录</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {journals.map((j) => (
              <RecipeCard key={j.slug} recipe={j} />
            ))}
          </div>
        </section>
      )}

      {/* Related Content */}
      {related.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">相关文章</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {related.map((item) => (
              <RecipeCard key={item.slug} recipe={item} />
            ))}
          </div>
        </section>
      )}

      {/* Ingredient Links */}
      {allIngredients.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">使用此食材的其他配方</h2>
          <div className="space-y-4">
            {allIngredients.map((ing) => {
              const recipes = graph.ingredientIndex.get(ing.slug || ing.name) || [];
              const others = recipes.filter((r) => r.slug !== slug);
              if (others.length === 0) return null;
              return (
                <div key={ing.name}>
                  <h3 className="text-sm font-medium text-foreground/60 mb-2">
                    <Link
                      href={`/ingredients/${ing.slug || ing.name}`}
                      className="hover:text-tea-600 dark:hover:text-tea-400 transition-colors"
                    >
                      {ing.name}
                    </Link>
                    <span className="text-foreground/40 ml-1">({others.length} 个相关配方)</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {others.slice(0, 5).map((r) => (
                      <Link
                        key={r.slug}
                        href={`/recipes/${r.slug}`}
                        className="text-xs px-2.5 py-1 rounded-full bg-tea-50 dark:bg-tea-900/20 border border-tea-200 dark:border-tea-800 text-foreground/70 hover:text-tea-600 dark:hover:text-tea-400 hover:border-tea-400 transition-colors"
                      >
                        {r.title}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
