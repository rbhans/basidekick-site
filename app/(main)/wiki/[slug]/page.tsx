import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { WikiArticleDetail } from "@/components/wiki/wiki-article-detail";
import { WikiFacet } from "@/lib/types";
import { escapeJsonLd } from "@/lib/security";

// ISR: Revalidate daily — articles rarely change
export const revalidate = 86400;

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
      title: "Article not found — BASidekick",
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
      title: "Article not found — BASidekick",
    };
  }

  const description = article.summary || article.content?.slice(0, 160) || "BAS knowledge article";

  // Handle author which may be an object or array from the join
  const author = article.author as { display_name?: string } | { display_name?: string }[] | null;
  const authorName = Array.isArray(author) ? author[0]?.display_name : author?.display_name;

  return {
    title: `${article.title} — BASidekick`,
    description,
    authors: authorName ? [{ name: authorName }] : undefined,
    openGraph: {
      title: article.title,
      description,
      type: "article",
      siteName: "BASidekick",
      url: `https://basidekick.com/wiki/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
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
      name: article.author?.display_name || "BASidekick Community",
    },
    publisher: {
      "@type": "Organization",
      name: "BASidekick",
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

  // Fetch facets for this article (replaces legacy wiki_article_tags)
  const { data: facetData } = await supabase
    .from("wiki_article_facets")
    .select("facet_id, wiki_facets(*, group:wiki_facet_groups!wiki_facets_group_id_fkey(slug, name))")
    .eq("article_id", article.id);

  const facets = (facetData || []).map((f: { wiki_facets: unknown }) => {
    const wikiFacet = Array.isArray(f.wiki_facets) ? f.wiki_facets[0] : f.wiki_facets;
    if (wikiFacet && typeof wikiFacet === "object" && "group" in wikiFacet) {
      const group = Array.isArray(wikiFacet.group) ? wikiFacet.group[0] : wikiFacet.group;
      return { ...wikiFacet, group } as WikiFacet;
    }
    return wikiFacet as WikiFacet;
  }).filter(Boolean);

  const jsonLd = generateArticleJsonLd(article);
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://basidekick.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Wiki",
        item: "https://basidekick.com/wiki",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: `https://basidekick.com/wiki/${slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: escapeJsonLd(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: escapeJsonLd(breadcrumbJsonLd) }}
      />
      <WikiArticleDetail article={article} tags={[]} facets={facets} />
    </>
  );
}
