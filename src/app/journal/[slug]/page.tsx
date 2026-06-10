import Link from "next/link";
import { Star, ChevronRight, Calendar } from "lucide-react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getJournalBySlug, getAllContent } from "@/lib/content";
import { MarkdownContent } from "../../recipes/[slug]/MarkdownContent";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const all = getAllContent();
  return all
    .filter((c) => c.type === "journal")
    .map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = getJournalBySlug(slug);
  if (!data) return { title: "未找到" };
  return {
    title: data.entry.title,
    description: data.entry.summary || data.entry.excerpt,
  };
}

export default async function JournalPage({ params }: PageProps) {
  const { slug } = await params;
  const data = getJournalBySlug(slug);
  if (!data) notFound();

  const { entry, recipe } = data;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-foreground/50 mb-6">
        <Link href="/" className="hover:text-tea-600 dark:hover:text-tea-400">首页</Link>
        <ChevronRight className="h-3 w-3" />
        {recipe && (
          <>
            <Link href={`/recipes/${recipe.slug}`} className="hover:text-tea-600 dark:hover:text-tea-400">
              {recipe.title}
            </Link>
            <ChevronRight className="h-3 w-3" />
          </>
        )}
        <span className="text-foreground/80">实践记录</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 mb-3 inline-block">
          实践记录
        </span>
        <h1 className="text-3xl font-bold text-foreground mt-2">{entry.title}</h1>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-foreground/60 mb-6">
        {entry.date && (
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {entry.date}
          </span>
        )}
        {entry.rating && (
          <span className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= entry.rating!
                    ? "fill-tea-500 text-tea-500"
                    : "text-tea-200 dark:text-tea-800"
                }`}
              />
            ))}
          </span>
        )}
      </div>

      {/* Recipe link */}
      {recipe && (
        <div className="mb-6 text-sm">
          <span className="text-foreground/50">相关配方：</span>
          <Link
            href={`/recipes/${recipe.slug}`}
            className="text-tea-600 dark:text-tea-400 hover:underline"
          >
            {recipe.title}
          </Link>
        </div>
      )}

      {/* Content */}
      <div className="bg-white dark:bg-tea-900/10 rounded-xl p-6 border border-tea-200 dark:border-tea-800 mb-8">
        <MarkdownContent content={entry.rawContent} />
      </div>

      {/* Tags */}
      {entry.tags && entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {entry.tags.map((tag) => (
            <Link
              key={tag}
              href={`/tags/${tag}`}
              className="text-xs px-3 py-1 rounded-full bg-warm-100 dark:bg-tea-900/20 border border-warm-200 dark:border-tea-800 text-foreground/70 hover:text-tea-600 hover:border-tea-400 transition-colors"
            >
              {tag}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
