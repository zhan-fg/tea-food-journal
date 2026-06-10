import { getAllContent } from "@/lib/content";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tea-food-journal.vercel.app";

export async function GET() {
  const all = getAllContent();
  const latest = all.slice(0, 20);

  const items = latest
    .map((item) => {
      const typePath =
        item.type === "journal"
          ? "journal"
          : item.type === "knowledge"
            ? "knowledge"
            : "recipes";
      const url = `${BASE_URL}/${typePath}/${item.slug}`;
      const date = item.date
        ? new Date(item.date).toUTCString()
        : new Date().toUTCString();

      return `    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${date}</pubDate>
      <description><![CDATA[${item.summary || item.excerpt || ""}]]></description>
    </item>`;
    })
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Tea &amp; Food Journal</title>
    <link>${BASE_URL}</link>
    <description>记录每一次真实制作体验的茶饮美食知识库</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
