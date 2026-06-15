import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";
import { getAllContent, getTopRecipes, getLatestContent, getKnowledgeGraph } from "@/lib/content";
import RecipeCard from "@/components/recipe/RecipeCard";
import { RandomRecipeLink } from "@/components/RandomRecipeLink";
import { categoryLabel } from "@/lib/utils";

const FEATURED_CATEGORIES = [
  { key: "tea" },
  { key: "soup" },
  { key: "dessert" },
  { key: "staple" },
  { key: "home-cooking" },
];

export default function HomePage() {
  const content = getAllContent();
  const topRecipes = getTopRecipes(6);
  const latest = getLatestContent(5);
  const graph = getKnowledgeGraph();

  // Get available categories from actual content
  const availableCategories = [...new Set(
    content
      .filter((c) => c.category && (c.type === "recipe" || c.type === "variation"))
      .map((c) => c.category!)
  )];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-16">
      {/* Hero Section */}
      <section className="text-center py-12 md:py-20">
        <h1 className="text-4xl md:text-5xl font-bold text-tea-700 dark:text-tea-400 mb-4">
          Tea &amp; Food Journal
        </h1>
        <p className="text-lg text-foreground/60 mb-8 max-w-lg mx-auto">
          记录每一次真实制作体验
        </p>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-tea-300 dark:border-tea-700 bg-white dark:bg-tea-900/20 text-foreground/70 hover:border-tea-500 hover:text-tea-600 dark:hover:text-tea-400 transition-all shadow-sm hover:shadow-md"
        >
          <Search className="h-4 w-4" />
          <span>搜索配方</span>
        </Link>
      </section>

      {/* Hot Tea Drinks */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">热门茶饮</h2>
          <Link
            href="/categories/tea"
            className="text-sm text-tea-600 dark:text-tea-400 hover:underline inline-flex items-center gap-1"
          >
            查看全部 <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {topRecipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topRecipes.map((recipe) => (
              <RecipeCard key={recipe.slug} recipe={recipe} showFlavor />
            ))}
          </div>
        ) : (
          <p className="text-foreground/40 text-center py-8">暂无配方，开始添加你的第一个配方吧</p>
        )}
      </section>

      {/* Latest Updates */}
      {latest.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">最新更新</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {latest.slice(0, 3).map((item) => (
              <RecipeCard key={item.slug} recipe={item} />
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      <section>
        <h2 className="text-2xl font-bold text-foreground mb-6">分类</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {FEATURED_CATEGORIES.map(({ key }) => {
            const hasContent = availableCategories.includes(key);
            const count = graph.categoryIndex.get(key)?.length || 0;
            return (
              <Link
                key={key}
                href={`/categories/${key}`}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                  hasContent
                    ? "border-tea-200 dark:border-tea-800 bg-white dark:bg-tea-900/10 hover:border-tea-400 hover:shadow-md dark:hover:border-tea-600"
                    : "border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/20 opacity-60"
                }`}
              >
                <span className="text-sm font-medium text-foreground/80">
                  {categoryLabel(key)}
                </span>
                {count > 0 && (
                  <span className="text-xs text-foreground/40">{count} 篇</span>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Random Discovery */}
      <section className="text-center py-8">
        <RandomRecipeLink recipes={content.filter((c) => c.type === "recipe" || c.type === "variation")} />
      </section>
    </div>
  );
}
