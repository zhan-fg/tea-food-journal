"use client";

import { forwardRef } from "react";
import type { ContentMeta } from "@/lib/types";
import { formatDuration, difficultyLabel, categoryLabel } from "@/lib/utils";

interface ShareCardProps {
  recipe: ContentMeta;
}

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  function ShareCard({ recipe }, ref) {
    return (
      <div
        ref={ref}
        className="absolute top-0 left-0 opacity-0 pointer-events-none"
        style={{ width: 600, height: 800 }}
        aria-hidden="true"
      >
        <div className="w-[600px] h-[800px] bg-[#faf7f2] p-10 flex flex-col relative overflow-hidden" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          {/* Decorative corner */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#ffedd5] rounded-bl-full opacity-50" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#fef9c3] rounded-tr-full opacity-50" />

          {/* Type badge */}
          <div className="flex items-center gap-2 mb-3 relative z-10">
            <span className="inline-block text-xs px-3 py-1 rounded-full bg-[#f97316] text-white font-bold">
              {recipe.type === "variation" ? "Variation" : "Recipe"}
            </span>
            {recipe.category && (
              <span className="text-xs text-[#c2410c]">
                {categoryLabel(recipe.category)}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-[#3d2e1c] mb-3 relative z-10 leading-tight">
            {recipe.title}
          </h1>

          {/* Rating + Meta */}
          <div className="flex items-center gap-4 mb-4 relative z-10">
            {recipe.rating && (
              <div className="flex gap-0.5 text-xl">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} className={s <= recipe.rating! ? "text-[#f97316]" : "text-[#fed7aa]"}>
                    ★
                  </span>
                ))}
              </div>
            )}
            {recipe.difficulty && (
              <span className="text-xs text-[#c2410c] bg-[#ffedd5] px-2 py-0.5 rounded font-medium">
                {difficultyLabel(recipe.difficulty)}
              </span>
            )}
            {recipe.time && (
              <span className="text-xs text-[#c2410c]">
                {formatDuration(recipe.time)}
              </span>
            )}
          </div>

          {/* Summary */}
          {recipe.summary && (
            <div className="bg-white/60 rounded-lg p-3 mb-4 relative z-10 border border-[#fed7aa]">
              <p className="text-sm text-[#5c4a3a] leading-relaxed">
                {recipe.summary}
              </p>
            </div>
          )}

          {/* Flavor */}
          {recipe.flavor && (
            <div className="mb-4 relative z-10">
              <p className="text-xs font-bold text-[#c2410c] mb-2">FLAVOR</p>
              <div className="space-y-1.5">
                {[
                  ["Sweetness", recipe.flavor.sweetness],
                  ["Spiciness", recipe.flavor.spiciness],
                  ["Aroma", recipe.flavor.aroma],
                ].map(([label, val]) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="text-xs text-[#5c4a3a] w-20">{label}</span>
                    <div className="flex-1 h-2.5 bg-[#fed7aa] rounded-full">
                      <div
                        className="h-full bg-[#f97316] rounded-full"
                        style={{ width: `${((val as number) / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-[#9a3412] w-12 text-right">
                      {"★".repeat(val as number)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ingredients */}
          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <div className="mb-4 relative z-10">
              <p className="text-xs font-bold text-[#c2410c] mb-2">INGREDIENTS</p>
              <div className="flex flex-wrap gap-1.5">
                {recipe.ingredients.map((ing, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-full bg-white border border-[#fed7aa] text-[#5c4a3a]"
                  >
                    {ing.name}
                    {ing.amount && <span className="text-[#fdba74] ml-1">{ing.amount}</span>}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          {recipe.tips && recipe.tips.length > 0 && (
            <div className="flex-1 relative z-10">
              <p className="text-xs font-bold text-[#c2410c] mb-2">KEY TIPS</p>
              <div className="space-y-1.5">
                {recipe.tips.slice(0, 5).map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-[#5c4a3a]">
                    <span className="text-[#f97316] mt-0.5 shrink-0">•</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-[#fed7aa] relative z-10 mt-auto">
            <div className="flex items-center gap-2">
              <span className="text-lg">🍵</span>
              <span className="text-sm font-bold text-[#c2410c]">
                Tea &amp; Food Journal
              </span>
            </div>
            <span className="text-xs text-[#fdba74]">
              tea-food-journal.vercel.app
            </span>
          </div>
        </div>
      </div>
    );
  }
);

export default ShareCard;
