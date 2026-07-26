import type { SupabaseClient } from "@/lib/supabase/client";
import { NewsArticle, NewsArticleComment, NewsFeedFilter } from "@/lib/types";

// ============================================================
// NORMALIZATION HELPERS
// (ported from basidekick-site/components/news/news-api.ts)
// ============================================================

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

type RawNewsArticle = Partial<NewsArticle> & {
  submitter?: NewsArticle["submitter"] | NewsArticle["submitter"][] | null;
};

function normalizeArticle(article: RawNewsArticle): NewsArticle {
  const submitter = Array.isArray(article.submitter)
    ? article.submitter[0] || null
    : article.submitter || null;

  return {
    ...(article as NewsArticle),
    title: typeof article.title === "string" ? article.title : "Untitled",
    url: typeof article.url === "string" ? article.url : "",
    source_domain: typeof article.source_domain === "string" ? article.source_domain : "",
    tags: asStringArray(article.tags),
    upvote_count: asNumber(article.upvote_count),
    comment_count: asNumber(article.comment_count),
    view_count: asNumber(article.view_count),
    submitter,
  };
}

function normalizeArticles(articles: RawNewsArticle[] | null | undefined): NewsArticle[] {
  return (articles || []).map(normalizeArticle);
}

// ============================================================
// ARTICLES API (read-only)
// ============================================================

export async function fetchArticles(
  client: SupabaseClient | null,
  filter?: NewsFeedFilter,
  limit = 30,
  offset = 0
): Promise<NewsArticle[]> {
  if (!client) return [];

  let query = client
    .from("news_articles")
    .select(`
      *,
      submitter:profiles!submitted_by(display_name, avatar_url)
    `)
    .eq("is_published", true)
    .range(offset, offset + limit - 1);

  if (filter?.tags && filter.tags.length > 0) {
    query = query.contains("tags", filter.tags);
  }

  if (filter?.timeRange && filter.timeRange !== "all") {
    const now = new Date();
    let since: Date;
    switch (filter.timeRange) {
      case "day":
        since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "week":
        since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        since = new Date(0);
    }
    query = query.gte("created_at", since.toISOString());
  }

  if (filter?.sortBy === "top") {
    query = query.order("upvote_count", { ascending: false });
  } else if (filter?.sortBy === "commented") {
    query = query.order("comment_count", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw error;
  return normalizeArticles(data as RawNewsArticle[] | null);
}

export async function fetchArticleBySlug(
  client: SupabaseClient | null,
  slug: string
): Promise<NewsArticle | null> {
  if (!client) return null;

  const { data, error } = await client
    .from("news_articles")
    .select(`
      *,
      submitter:profiles!submitted_by(display_name, avatar_url)
    `)
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data ? normalizeArticle(data as RawNewsArticle) : null;
}

// ============================================================
// COMMENTS API (read-only)
// ============================================================

export async function fetchComments(
  client: SupabaseClient | null,
  articleId: string
): Promise<NewsArticleComment[]> {
  if (!client) return [];

  const { data, error } = await client
    .from("news_article_comments")
    .select(`
      *,
      author:profiles!author_id(display_name, avatar_url)
    `)
    .eq("article_id", articleId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}
