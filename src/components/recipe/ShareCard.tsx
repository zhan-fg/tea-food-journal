"use client";

import { forwardRef } from "react";
import type { ContentMeta } from "@/lib/types";
import { formatDuration, difficultyLabel, categoryLabel } from "@/lib/utils";
import { Star, Clock } from "lucide-react";

interface ShareCardProps {
  recipe: ContentMeta;
}

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  function ShareCard({ recipe }, ref) {
    return (
      <div
        ref={ref}
        className="fixed left-[-9999px] top-0"
        style={{ width: 600, height: 800 }}
      >
        <div className="w-[600px] h-[800px] bg-gradient-to-br from-tea-50 via-warm-50 to-white dark:from-[#1c1610] dark:via-[#2d1f10] dark:to-[#1c1610] p-10 flex flex-col font-sans relative overflow-hidden">
          {/* Decorative corner */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-tea-100 dark:bg-tea-900/30 rounded-bl-full opacity-50" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-warm-100 dark:bg-tea-900/20 rounded-tr-full opacity-50" />

          {/* Type badge */}
          <div className="flex items-center gap-2 mb-3 relative z-10">
            <span className="text-xs px-3 py-1 rounded-full bg-tea-500 text-white font-medium">
              {recipe.type === "variation" ? "变体" : "配方"}
            </span>
            {recipe.category && (
              <span className="text-xs text-tea-700 dark:text-tea-400">
                {categoryLabel(recipe.category)}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-[#3d2e1c] dark:text-[#e8dcc8] mb-3 relative z-10 leading-tight">
            {recipe.title}
          </h1>

          {/* Rating + Meta */}
          <div className="flex items-center gap-4 mb-4 relative z-10">
            {recipe.rating && (
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} className={s <= recipe.rating! ? "text-tea-500" : "text-tea-200 dark:text-tea-800"}>
                    ★
                  </span>
                ))}
              </div>
            )}
            {recipe.difficulty && (
              <span className="text-xs text-tea-700 dark:text-tea-400 bg-tea-100 dark:bg-tea-900/40 px-2 py-0.5 rounded">
                {difficultyLabel(recipe.difficulty)}
              </span>
            )}
            {recipe.time && (
              <span className="text-xs text-tea-700 dark:text-tea-400">
                {formatDuration(recipe.time)}
              </span>
            )}
          </div>

          {/* Summary */}
          {recipe.summary && (
            <div className="bg-white/60 dark:bg-white/5 rounded-lg p-3 mb-4 relative z-10 border border-tea-200 dark:border-tea-800">
              <p className="text-sm text-[#5c4a3a] dark:text-[#c4b8a8] leading-relaxed">
                {recipe.summary}
              </p>
            </div>
          )}

          {/* Flavor */}
          {recipe.flavor && (
            <div className="mb-4 relative z-10">
              <h3 className="text-xs font-semibold text-tea-600 dark:text-tea-500 mb-2 uppercase tracking-wide">风味</h3>
              <div className="space-y-1">
                {[
                  ["甜度", recipe.flavor.sweetness],
                  ["辛辣", recipe.flavor.spiciness],
                  ["香气", recipe.flavor.aroma],
                ].map(([label, val]) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="text-xs text-tea-700 dark:text-tea-400 w-8">{label}</span>
                    <div className="flex-1 h-2 bg-tea-200 dark:bg-tea-800 rounded-full">
                      <div
                        className="h-full bg-tea-500 rounded-full"
                        style={{ width: `${((val as number) / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ingredients */}
          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <div className="mb-4 relative z-10">
              <h3 className="text-xs font-semibold text-tea-600 dark:text-tea-500 mb-2 uppercase tracking-wide">材料</h3>
              <div className="flex flex-wrap gap-1.5">
                {recipe.ingredients.map((ing, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-full bg-white/80 dark:bg-white/10 border border-tea-200 dark:border-tea-800 text-tea-800 dark:text-tea-300"
                  >
                    {ing.name}
                    {ing.amount && <span className="text-tea-400 ml-1">{ing.amount}</span>}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tips — most valuable for sharing */}
          {recipe.tips && recipe.tips.length > 0 && (
            <div className="flex-1 relative z-10">
              <h3 className="text-xs font-semibold text-tea-600 dark:text-tea-500 mb-2 uppercase tracking-wide">经验要点</h3>
              <div className="space-y-1.5">
                {recipe.tips.slice(0, 5).map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-[#5c4a3a] dark:text-[#c4b8a8]">
                    <span className="text-tea-500 mt-0.5 shrink-0">•</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-tea-200 dark:border-tea-800 relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-lg">🍵</span>
              <span className="text-sm font-medium text-tea-700 dark:text-tea-400">
                Tea &amp; Food Journal
              </span>
            </div>
            <span className="text-xs text-tea-400 dark:text-tea-600">
              tea-food-journal.vercel.app
            </span>
          </div>
        </div>
      </div>
    );
  }
);

export default ShareCard;
