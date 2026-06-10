"use client";

import { useState, useCallback, useRef } from "react";
import { Share2, Download, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import type { ContentMeta } from "@/lib/types";
import ShareCard from "./ShareCard";

interface ShareButtonProps {
  recipe: ContentMeta;
}

export default function ShareButton({ recipe }: ShareButtonProps) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleShare = useCallback(async () => {
    if (!cardRef.current) return;
    setLoading(true);

    try {
      const canvas = await html2canvas(cardRef.current.firstElementChild as HTMLElement, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      });

      // Download
      const link = document.createElement("a");
      link.download = `${recipe.slug}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch (err) {
      console.error("Share image generation failed:", err);
    } finally {
      setLoading(false);
    }
  }, [recipe.slug]);

  return (
    <>
      {/* Hidden share card for capture */}
      <ShareCard ref={cardRef} recipe={recipe} />

      <button
        onClick={handleShare}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-tea-500 hover:bg-tea-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            生成中...
          </>
        ) : done ? (
          <>
            <Download className="h-4 w-4" />
            已下载
          </>
        ) : (
          <>
            <Share2 className="h-4 w-4" />
            分享图片
          </>
        )}
      </button>
    </>
  );
}
