import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getByIngredient, getAllContent } from "@/lib/content";
import { listAllIngredients } from "@/lib/utils";
import RecipeCard from "@/components/recipe/RecipeCard";

interface PageProps {
  params: Promise<{ ingredient: string }>;
}

export async function generateStaticParams() {
  const all = getAllContent();
  return listAllIngredients(all).map((ing) => ({ ingredient: ing }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { ingredient } = await params;
  return {
    title: `食材: ${ingredient}`,
    description: `使用${ingredient}的所有配方`,
  };
}

export default async function IngredientPage({ params }: PageProps) {
  const { ingredient } = await params;
  const recipes = getByIngredient(ingredient);

  if (recipes.length === 0) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="flex items-center gap-2 text-sm text-foreground/50 mb-6">
        <Link href="/" className="hover:text-tea-600 dark:hover:text-tea-400">首页</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground/80">食材</span>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground/80">{ingredient}</span>
      </nav>

      <h1 className="text-3xl font-bold text-foreground mb-2">{ingredient}</h1>
      <p className="text-foreground/50 mb-8">
        使用此食材的配方 · {recipes.length} 篇
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.slug} recipe={recipe} showFlavor />
        ))}
      </div>
    </div>
  );
}
