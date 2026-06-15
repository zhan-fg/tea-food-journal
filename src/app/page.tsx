import Link from "next/link";
import type { Metadata } from "next";
import { Search, ArrowRight } from "lucide-react";
import { getAllContent, getContentByLang, getKnowledgeGraph } from "@/lib/content";
import RecipeCard from "@/components/recipe/RecipeCard";
import { RandomRecipeLink } from "@/components/RandomRecipeLink";
import { categoryLabel } from "@/lib/utils";
import { getLang } from "@/lib/lang";

const HOME_TEXT = {
  zh: {
    hero: "记录每一次真实制作体验",
    search: "搜索配方",
    featured: "热门推荐",
    viewAll: "查看全部",
    latest: "最新更新",
    categories: "分类",
    empty: "暂无配方，开始添加你的第一个配方吧",
    count: "篇",
  },
  en: {
    hero: "Documenting every real cooking experience",
    search: "Search recipes",
    featured: "Top Picks",
    viewAll: "View all",
    latest: "Latest Updates",
    categories: "Categories",
    empty: "No recipes yet. Add your first one!",
    count: "",
  },
};

export const metadata: Metadata = {
  title: "Tea & Food Journal — 茶饮美食手册",
  description:
    "记录每一次真实制作体验的茶饮美食知识库。茶饮配方、家常菜谱、养生汤品、甜品烘焙，来自真实厨房经验。",
  keywords: [
    "茶饮", "食谱", "家常菜", "养生汤", "甜品",
    "美食", "配方", "厨房", "烹饪", "茶文化",
  ],
  openGraph: {
    title: "Tea & Food Journal — 茶饮美食手册",
    description:
      "记录每一次真实制作体验的茶饮美食知识库。茶饮配方、家常菜谱、养生汤品、甜品烘焙。",
    type: "website",
  },
};

const FEATURED_CATEGORIES = [
  { key: "tea" },
  { key: "soup" },
  { key: "dessert" },
  { key: "staple" },
  { key: "home-cooking" },
];

export default async function HomePage() {
  const lang = await getLang();
  const t = HOME_TEXT[lang];
  const allContent = getContentByLang(lang);
  const content = allContent.filter(
    (c) => c.type === "recipe" || c.type === "variation"
  );
  const topRecipes = content
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 6);
  const latest = allContent.slice(0, 5);
  const graph = getKnowledgeGraph();

  // Get available categories from actual content
  const availableCategories = [...new Set(
    content
      .filter((c) => c.category)
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
          {t.hero}
        </p>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-tea-300 dark:border-tea-700 bg-white dark:bg-tea-900/20 text-foreground/70 hover:border-tea-500 hover:text-tea-600 dark:hover:text-tea-400 transition-all shadow-sm hover:shadow-md"
        >
          <Search className="h-4 w-4" />
          <span>{t.search}</span>
        </Link>
      </section>

      {/* Featured */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">{t.featured}</h2>
        </div>
        {topRecipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topRecipes.map((recipe) => (
              <RecipeCard key={recipe.slug} recipe={recipe} showFlavor />
            ))}
          </div>
        ) : (
          <p className="text-foreground/40 text-center py-8">{t.empty}</p>
        )}
      </section>

      {/* Latest Updates */}
      {latest.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">{t.latest}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {latest.slice(0, 3).map((item) => (
              <RecipeCard key={item.slug} recipe={item} />
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      <section>
        <h2 className="text-2xl font-bold text-foreground mb-6">{t.categories}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {FEATURED_CATEGORIES.map(({ key }) => {
            const hasContent = availableCategories.includes(key);
            const count = graph.categoryIndex.get(key)?.filter(
              (c) => c.lang === lang || !c.lang
            ).length || 0;
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
                  <span className="text-xs text-foreground/40">{count} {t.count}</span>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Random Discovery */}
      <section className="text-center py-8">
        <RandomRecipeLink recipes={content} />
      </section>
    </div>
  );
}
