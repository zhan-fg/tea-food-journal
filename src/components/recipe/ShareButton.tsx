"use client";

import { useState, useCallback, useRef } from "react";
import { Share2, Download, Loader2, Check } from "lucide-react";
import type { ContentMeta } from "@/lib/types";
import ShareCard from "./ShareCard";

interface ShareButtonProps {
  recipe: ContentMeta;
}

export default function ShareButton({ recipe }: ShareButtonProps) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleShare = useCallback(async () => {
    if (!cardRef.current) {
      setError(true);
      return;
    }

    setLoading(true);
    setError(false);

    try {
      // Dynamically import html2canvas to avoid SSR issues
      const html2canvas = (await import("html2canvas")).default;

      const target = cardRef.current.firstElementChild as HTMLElement;
      if (!target) throw new Error("No target element");

      const canvas = await html2canvas(target, {
        scale: 2,
        backgroundColor: "#faf7f2",
        useCORS: true,
        logging: false,
      });

      // Download
      const link = document.createElement("a");
      link.download = `${recipe.slug}.png`;
      link.href = canvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDone(true);
      setTimeout(() => setDone(false), 2500);
    } catch (err) {
      console.error("Share image failed:", err);
      setError(true);
      setTimeout(() => setError(false), 2500);
    } finally {
      setLoading(false);
    }
  }, [recipe.slug]);

  return (
    <>
      {/* Hidden share card for capture — uses opacity:0 so browser renders it */}
      <ShareCard ref={cardRef} recipe={recipe} />

      <button
        onClick={handleShare}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-tea-500 hover:bg-tea-600 text-white text-sm font-medium transition-colors disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            生成中...
          </>
        ) : done ? (
          <>
            <Check className="h-4 w-4" />
            已下载
          </>
        ) : error ? (
          <>
            <Share2 className="h-4 w-4" />
            重试
          </>
        ) : (
          <>
            <Share2 className="h-4 w-4" />
            分享
          </>
        )}
      </button>
    </>
  );
}
