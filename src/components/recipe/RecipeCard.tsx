import Link from "next/link";
import { Clock, Star, ChevronRight } from "lucide-react";
import { ContentMeta } from "@/lib/types";
import { formatDuration, difficultyLabel, categoryLabel } from "@/lib/utils";
import FlavorMeter from "./FlavorMeter";

interface RecipeCardProps {
  recipe: ContentMeta;
  showFlavor?: boolean;
}

export default function RecipeCard({ recipe, showFlavor = false }: RecipeCardProps) {
  const href =
    recipe.type === "journal"
      ? `/journal/${recipe.slug}`
      : recipe.type === "knowledge"
        ? `/knowledge/${recipe.slug}`
        : `/recipes/${recipe.slug}`;

  return (
    <Link
      href={href}
      className="recipe-card group block rounded-xl border border-tea-200 bg-white dark:bg-tea-900/20 dark:border-tea-800 p-5"
    >
      {/* Type badge + category */}
      <div className="flex items-center gap-2 mb-3">
        {recipe.type === "variation" && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-green-tea-100 text-green-tea-700 dark:bg-green-tea-900/40 dark:text-green-tea-400">
            变体
          </span>
        )}
        {recipe.type === "journal" && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">
            实践记录
          </span>
        )}
        {recipe.type === "knowledge" && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400">
            知识
          </span>
        )}
        {recipe.category && (
          <span className="text-xs text-foreground/50">
            {categoryLabel(recipe.category)}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-foreground group-hover:text-tea-600 dark:group-hover:text-tea-400 transition-colors mb-2">
        {recipe.title}
      </h3>

      {/* Summary */}
      {recipe.summary && (
        <p className="text-sm text-foreground/60 line-clamp-2 mb-3">
          {recipe.summary}
        </p>
      )}

      {/* Meta: rating, difficulty, time */}
      {(recipe.rating || recipe.difficulty || recipe.time) && (
        <div className="flex flex-wrap items-center gap-3 text-xs text-foreground/50 mb-3">
          {recipe.rating && (
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-tea-500 text-tea-500" />
              {recipe.rating}/5
            </span>
          )}
          {recipe.difficulty && (
            <span>{difficultyLabel(recipe.difficulty)}</span>
          )}
          {recipe.time && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatDuration(recipe.time)}
            </span>
          )}
        </div>
      )}

      {/* Flavor meter */}
      {showFlavor && recipe.flavor && (
        <div className="mb-3">
          <FlavorMeter flavor={recipe.flavor} compact />
        </div>
      )}

      {/* Tags */}
      {recipe.tags && recipe.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {recipe.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-md bg-warm-100 text-foreground/60 dark:bg-tea-900/30"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Parent link for variations */}
      {recipe.type === "variation" && recipe.parent && (
        <p className="text-xs text-foreground/40 mb-2">
          来源: {recipe.parent}
        </p>
      )}

      {/* Date for journals */}
      {recipe.date && (
        <p className="text-xs text-foreground/40">{recipe.date}</p>
      )}
    </Link>
  );
}
