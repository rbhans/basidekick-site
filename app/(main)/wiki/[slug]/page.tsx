import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { WikiArticleDetail } from "@/components/wiki/wiki-article-detail";
import { WikiTag } from "@/lib/types";
import { escapeJsonLd } from "@/lib/security";

// ISR: Revalidate every hour - articles rarely change
export const revalidate = 3600;

// Create a Supabase client for server-side data fetching
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

interface WikiArticlePageProps {
  params: Promise<{ slug: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: WikiArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = getSupabaseClient();

  if (!supabase) {
    return {
      title: "Article Not Found | basidekick Wiki",
    };
  }

  const { data: article } = await supabase
    .from("wiki_articles")
    .select("title, summary, content, author:profiles!wiki_articles_author_id_fkey(display_name)")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!article) {
    return {
      title: "Article Not Found | basidekick Wiki",
    };
  }

  const description = article.summary || article.content?.slice(0, 160) || "BAS knowledge article";

  // Handle author which may be an object or array from the join
  const author = article.author as { display_name?: string } | { display_name?: string }[] | null;
  const authorName = Array.isArray(author) ? author[0]?.display_name : author?.display_name;

  return {
    title: `${article.title} | basidekick Wiki`,
    description,
    authors: authorName ? [{ name: authorName }] : undefined,
    openGraph: {
      title: article.title,
      description,
      type: "article",
      siteName: "basidekick",
      url: `https://basidekick.com/wiki/${slug}`,
    },
    twitter: {
      card: "summary",
      title: article.title,
      description,
    },
    alternates: {
      canonical: `https://basidekick.com/wiki/${slug}`,
    },
  };
}

// JSON-LD structured data for the article
function generateArticleJsonLd(article: {
  title: string;
  content: string;
  summary?: string;
  slug: string;
  created_at: string;
  updated_at?: string;
  author?: { display_name?: string };
  view_count?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: article.title,
    description: article.summary || article.content?.slice(0, 160),
    author: {
      "@type": "Person",
      name: article.author?.display_name || "basidekick Community",
    },
    publisher: {
      "@type": "Organization",
      name: "basidekick",
      url: "https://basidekick.com",
    },
    datePublished: article.created_at,
    dateModified: article.updated_at || article.created_at,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://basidekick.com/wiki/${article.slug}`,
    },
    about: {
      "@type": "Thing",
      name: "Building Automation Systems",
    },
    inLanguage: "en-US",
  };
}

export default async function WikiArticlePage({ params }: WikiArticlePageProps) {
  const { slug } = await params;
  const supabase = getSupabaseClient();

  if (!supabase) {
    notFound();
  }

  // Fetch article with related data
  const { data: article } = await supabase
    .from("wiki_articles")
    .select(`
      *,
      author:profiles!wiki_articles_author_id_fkey(display_name),
      category:wiki_categories!wiki_articles_category_id_fkey(name, slug)
    `)
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!article) {
    notFound();
  }

  // Fetch tags for this article
  const { data: tagData } = await supabase
    .from("wiki_article_tags")
    .select("tag_id, wiki_tags(*)")
    .eq("article_id", article.id);

  // Handle wiki_tags which may be an object or array from the join
  const tags = (tagData || []).map((t: { wiki_tags: unknown }) => {
    const wikiTag = Array.isArray(t.wiki_tags) ? t.wiki_tags[0] : t.wiki_tags;
    return wikiTag as WikiTag;
  }).filter(Boolean);

  const jsonLd = generateArticleJsonLd(article);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: escapeJsonLd(jsonLd) }}
      />
      <WikiArticleDetail article={article} tags={tags} />
    </>
  );
}
