import { NewsDetail } from "@/components/news/news-detail";
import { escapeJsonLd } from "@/lib/security";
import type { NewsArticle } from "@/lib/types";
import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return null;

  return createClient(supabaseUrl, supabaseAnonKey);
}

function hasSupabaseConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

async function getNewsArticle(slug: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("news_articles")
    .select(`
      *,
      submitter:profiles!submitted_by(display_name, avatar_url)
    `)
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!data) return null;

  const article = data as Partial<NewsArticle> & {
    submitter?: NewsArticle["submitter"] | NewsArticle["submitter"][] | null;
  };
  const submitter = Array.isArray(article.submitter)
    ? article.submitter[0] || null
    : article.submitter || null;

  return {
    ...(article as NewsArticle),
    title: typeof article.title === "string" ? article.title : "Untitled",
    url: typeof article.url === "string" ? article.url : "",
    slug: typeof article.slug === "string" ? article.slug : slug,
    source_domain:
      typeof article.source_domain === "string" ? article.source_domain : "",
    summary: typeof article.summary === "string" ? article.summary : null,
    tags: Array.isArray(article.tags)
      ? article.tags.filter((tag): tag is string => typeof tag === "string")
      : [],
    upvote_count:
      typeof article.upvote_count === "number" ? article.upvote_count : 0,
    comment_count:
      typeof article.comment_count === "number" ? article.comment_count : 0,
    view_count: typeof article.view_count === "number" ? article.view_count : 0,
    submitter,
    user_vote: null,
  } satisfies NewsArticle;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getNewsArticle(slug);
  const fallbackTitle = slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const title = `${article?.title || fallbackTitle} — BASidekick`;
  const description =
    article?.summary?.slice(0, 160) ||
    (article?.source_domain
      ? `BAS industry news discussion sourced from ${article.source_domain}.`
      : "Discussion on BAS industry news article.");
  const canonical = `https://basidekick.com/news/${encodeURIComponent(slug)}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      siteName: "BASidekick",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

function generateNewsJsonLd(article: NewsArticle) {
  const canonical = `https://basidekick.com/news/${encodeURIComponent(article.slug)}`;
  const datePublished = article.published_at || article.created_at;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${canonical}#article`,
    headline: article.title,
    description:
      article.summary || `BAS industry news discussion sourced from ${article.source_domain}.`,
    url: canonical,
    mainEntityOfPage: canonical,
    datePublished,
    dateModified: article.updated_at || datePublished,
    author: {
      "@type": "Organization",
      name: "BASidekick",
      url: "https://basidekick.com",
    },
    publisher: {
      "@id": "https://basidekick.com/#organization",
    },
    citation: article.url,
    isBasedOn: {
      "@type": "CreativeWork",
      url: article.url,
      publisher: article.source_domain
        ? {
            "@type": "Organization",
            name: article.source_domain,
          }
        : undefined,
    },
    about: article.tags,
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getNewsArticle(slug);

  if (!article && hasSupabaseConfig()) {
    notFound();
  }

  return (
    <>
      {article && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: escapeJsonLd(generateNewsJsonLd(article)),
          }}
        />
      )}
      <NewsDetail slug={slug} initialArticle={article} />
    </>
  );
}
