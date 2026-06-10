import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getByCategory, getAllContent } from "@/lib/content";
import { categoryLabel, listAllCategories } from "@/lib/utils";
import RecipeCard from "@/components/recipe/RecipeCard";

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  const all = getAllContent();
  return listAllCategories(all).map((cat) => ({ category: cat }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  return {
    title: categoryLabel(category),
    description: `${categoryLabel(category)}分类下的所有内容`,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;
  const items = getByCategory(category);

  if (items.length === 0) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="flex items-center gap-2 text-sm text-foreground/50 mb-6">
        <Link href="/" className="hover:text-tea-600 dark:hover:text-tea-400">首页</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground/80">{categoryLabel(category)}</span>
      </nav>

      <h1 className="text-3xl font-bold text-foreground mb-2">{categoryLabel(category)}</h1>
      <p className="text-foreground/50 mb-8">{items.length} 篇内容</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <RecipeCard key={item.slug} recipe={item} showFlavor />
        ))}
      </div>
    </div>
  );
}
