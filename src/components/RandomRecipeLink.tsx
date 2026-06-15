"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shuffle } from "lucide-react";
import type { ContentMeta } from "@/lib/types";

export function RandomRecipeLink({ recipes }: { recipes: ContentMeta[] }) {
  const [slug, setSlug] = useState<string | null>(null);

  useEffect(() => {
    if (recipes.length > 0) {
      const random = recipes[Math.floor(Math.random() * recipes.length)];
      setSlug(random.slug);
    }
  }, [recipes]);

  const href = slug ? `/recipes/${slug}` : "#";

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-tea-300 dark:border-tea-700 bg-gradient-to-r from-warm-50 to-tea-50 dark:from-tea-900/20 dark:to-tea-800/10 hover:shadow-md transition-all text-foreground/70 hover:text-tea-600 dark:hover:text-tea-400"
    >
      <Shuffle className="h-4 w-4" />
      <span>随机发现</span>
    </Link>
  );
}
