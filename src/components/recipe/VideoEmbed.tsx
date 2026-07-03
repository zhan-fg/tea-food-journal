"use client";

interface VideoEmbedProps {
  bilibili?: string;
  youtube?: string;
  lang?: string;
}

function extractBvid(input?: string): string | null {
  if (!input) return null;
  const m = input.match(/BV[a-zA-Z0-9]{10}/);
  return m ? m[0] : null;
}

function extractYoutubeId(input?: string): string | null {
  if (!input) return null;
  const t = input.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(t)) return t;
  const m = t.match(/[?&]v=([A-Za-z0-9_-]{11})/);
  if (m) return m[1];
  const m2 = t.match(/youtu\.be\/([A-Za-z0-9_-]{11})/);
  if (m2) return m2[1];
  const m3 = t.match(/embed\/([A-Za-z0-9_-]{11})/);
  if (m3) return m3[1];
  return null;
}

export default function VideoEmbed({ bilibili, youtube, lang }: VideoEmbedProps) {
  const bvid = extractBvid(bilibili);
  const ytId = extractYoutubeId(youtube);

  const bilibiliSrc = bvid
    ? `https://player.bilibili.com/player.html?bvid=${bvid}&page=1&high_quality=1&autoplay=0`
    : null;
  const youtubeSrc = ytId ? `https://www.youtube.com/embed/${ytId}` : null;

  let src: string | null;
  if (lang === "en") {
    src = youtubeSrc ?? bilibiliSrc;
  } else {
    src = bilibiliSrc ?? youtubeSrc;
  }

  if (!src) return null;

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl border border-tea-200 dark:border-tea-800 mb-8"
      style={{ aspectRatio: "16 / 9" }}
    >
      <iframe
        src={src}
        title="Recipe video tutorial"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}
