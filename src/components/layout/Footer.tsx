import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-tea-200 dark:border-tea-800 mt-auto">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-foreground/60">
          <p>
            Tea &amp; Food Journal — 记录每一次真实制作体验
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/rss.xml"
              className="hover:text-tea-600 dark:hover:text-tea-400 transition-colors"
            >
              RSS
            </Link>
            <Link
              href="/sitemap.xml"
              className="hover:text-tea-600 dark:hover:text-tea-400 transition-colors"
            >
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
