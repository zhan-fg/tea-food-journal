import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getKnowledgeBySlug, getAllContent, getRelatedContent } from "@/lib/content";
import { categoryLabel } from "@/lib/utils";
import RecipeCard from "@/components/recipe/RecipeCard";
import { MarkdownContent } from "../../recipes/[slug]/MarkdownContent";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const all = getAllContent();
  return all
    .filter((c) => c.type === "knowledge")
    .map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getKnowledgeBySlug(slug);
  if (!article) return { title: "未找到" };
  return {
    title: article.title,
    description: article.summary || article.excerpt,
    openGraph: {
      title: article.title,
      description: article.summary,
      type: "article",
    },
  };
}

export default async function KnowledgePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getKnowledgeBySlug(slug);
  if (!article) notFound();

  const related = getRelatedContent(slug, 4);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <nav className="flex items-center gap-2 text-sm text-foreground/50 mb-6">
        <Link href="/" className="hover:text-tea-600 dark:hover:text-tea-400">首页</Link>
        <ChevronRight className="h-3 w-3" />
        {article.category && (
          <>
            <Link href={`/categories/${article.category}`} className="hover:text-tea-600 dark:hover:text-tea-400">
              {categoryLabel(article.category)}
            </Link>
            <ChevronRight className="h-3 w-3" />
          </>
        )}
        <span className="text-foreground/80">{article.title}</span>
      </nav>

      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400 mb-3 inline-block">
        知识
      </span>
      <h1 className="text-3xl font-bold text-foreground mt-2 mb-4">{article.title}</h1>

      {article.summary && (
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 mb-8 border border-purple-200 dark:border-purple-800">
          <p className="text-foreground/80 leading-relaxed">{article.summary}</p>
        </div>
      )}

      <div className="bg-white dark:bg-tea-900/10 rounded-xl p-6 border border-tea-200 dark:border-tea-800 mb-8">
        <MarkdownContent content={article.rawContent} />
      </div>

      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {article.tags.map((tag) => (
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

      {related.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">相关文章</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {related.map((item) => (
              <RecipeCard key={item.slug} recipe={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
