"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { searchContentClient } from "@/lib/search-client";
import RecipeCard from "@/components/recipe/RecipeCard";
import type { ContentMeta, SearchResult } from "@/lib/types";

interface SearchPageClientProps {
  allContent: ContentMeta[];
}

export function SearchPageClient({ allContent }: SearchPageClientProps) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const all = searchContentClient(allContent, query);
    if (typeFilter === "all") return all;
    return all.filter((r) => r.item.type === typeFilter);
  }, [query, typeFilter, allContent]);

  const grouped = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    for (const r of results) {
      const type = r.item.type;
      if (!groups[type]) groups[type] = [];
      groups[type].push(r);
    }
    return groups;
  }, [results]);

  const typeLabels: Record<string, string> = {
    recipe: "配方",
    variation: "变体",
    journal: "实践记录",
    knowledge: "知识",
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-6">搜索</h1>

      {/* Search input */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/40" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索配方、食材、工具..."
          className="w-full pl-12 pr-10 py-3 rounded-xl border border-tea-300 dark:border-tea-700 bg-white dark:bg-tea-900/20 text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-tea-400 focus:border-transparent transition-all"
          autoFocus
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/70"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Type filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["all", "recipe", "variation", "journal", "knowledge"].map((type) => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
              typeFilter === type
                ? "bg-tea-500 text-white"
                : "bg-warm-100 dark:bg-tea-900/20 text-foreground/60 hover:text-tea-600 border border-tea-200 dark:border-tea-800"
            }`}
          >
            {type === "all" ? "全部" : typeLabels[type] || type}
          </button>
        ))}
      </div>

      {/* Results */}
      {query.trim() === "" && (
        <div className="text-center py-16 text-foreground/40">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>输入关键词搜索</p>
          <p className="text-sm mt-1">支持搜索配方名、食材、工具、标签</p>
        </div>
      )}

      {query.trim() !== "" && results.length === 0 && (
        <div className="text-center py-16 text-foreground/40">
          <p>未找到与 &ldquo;{query}&rdquo; 相关的内容</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-8">
          <p className="text-sm text-foreground/50">
            找到 {results.length} 个结果
          </p>

          {Object.entries(grouped).map(([type, items]) => (
            <div key={type}>
              <h2 className="text-lg font-semibold text-foreground/80 mb-3">
                {typeLabels[type] || type}
                <span className="text-sm font-normal text-foreground/40 ml-2">
                  {items.length}
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {items.map(({ item }) => (
                  <RecipeCard key={item.slug} recipe={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
