import { getClient } from "@/lib/supabase/client";
import {
  NewsArticle,
  NewsArticleComment,
  NewsFeedFilter,
  CreateNewsCommentInput,
} from "@/lib/types";
import { User } from "@supabase/supabase-js";

// ============================================================
// AUTH HELPERS
// ============================================================

async function requireAuth(): Promise<User> {
  const supabase = getClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Your session has expired. Please sign in again.");
  return user;
}

async function verifyCommentOwnership(commentId: string, userId: string): Promise<void> {
  const supabase = getClient();
  const { data } = await supabase
    .from("news_article_comments")
    .select("author_id")
    .eq("id", commentId)
    .single();
  if (!data || data.author_id !== userId) {
    throw new Error("Not authorized to modify this comment");
  }
}

// ============================================================
// NORMALIZATION HELPERS
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

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 50);
  const array = new Uint8Array(6);
  crypto.getRandomValues(array);
  const suffix = Array.from(array, b => b.toString(36)).join("").slice(0, 8);
  return `${base}-${suffix}`;
}

function extractDomain(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, "");
  } catch {
    return "unknown";
  }
}

// ============================================================
// ARTICLES API
// ============================================================

export async function fetchArticles(
  filter?: NewsFeedFilter,
  limit = 30,
  offset = 0
): Promise<NewsArticle[]> {
  const supabase = getClient();

  let query = supabase
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

export async function fetchArticleBySlug(slug: string): Promise<NewsArticle | null> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("news_articles")
    .select(`
      *,
      submitter:profiles!submitted_by(display_name, avatar_url)
    `)
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data ? normalizeArticle(data as RawNewsArticle) : null;
}

export async function submitArticle(
  url: string,
  title: string,
  tags?: string[]
): Promise<NewsArticle> {
  const user = await requireAuth();
  const supabase = getClient();

  const slug = generateSlug(title);
  const source_domain = extractDomain(url);

  const { data, error } = await supabase
    .from("news_articles")
    .insert({
      title,
      url,
      slug,
      source_domain,
      submitted_by: user.id,
      is_ai_submitted: false,
      tags: tags || [],
    })
    .select(`
      *,
      submitter:profiles!submitted_by(display_name, avatar_url)
    `)
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("This article has already been submitted.");
    }
    throw error;
  }
  return normalizeArticle(data as RawNewsArticle);
}

export async function incrementArticleViewCount(articleId: string): Promise<void> {
  const supabase = getClient();
  // Direct update — no RPC needed since triggers handle counts
  await supabase
    .from("news_articles")
    .update({ view_count: supabase.rpc ? undefined : 0 })
    .eq("id", articleId)
    .catch(() => {});

  // Simple approach: increment via raw SQL or just track client-side
  // For now, fire-and-forget update
  await supabase.rpc("increment_news_view_count", { article_id: articleId }).catch(() => {
    // Fallback — view count is non-critical
  });
}

// ============================================================
// ARTICLE VOTES API
// ============================================================

export async function voteArticle(articleId: string, voteType: 1 | -1): Promise<void> {
  const supabase = getClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Your session has expired. Please sign in again.");

  const { data: existingVote } = await supabase
    .from("news_article_votes")
    .select("vote_type")
    .eq("user_id", user.id)
    .eq("article_id", articleId)
    .single();

  if (existingVote) {
    if (existingVote.vote_type === voteType) {
      // Remove vote (toggle off)
      await supabase
        .from("news_article_votes")
        .delete()
        .eq("user_id", user.id)
        .eq("article_id", articleId);
    } else {
      // Switch vote
      await supabase
        .from("news_article_votes")
        .update({ vote_type: voteType })
        .eq("user_id", user.id)
        .eq("article_id", articleId);
    }
  } else {
    // New vote
    await supabase.from("news_article_votes").insert({
      user_id: user.id,
      article_id: articleId,
      vote_type: voteType,
    });
  }
}

// ============================================================
// COMMENTS API
// ============================================================

export async function fetchComments(articleId: string): Promise<NewsArticleComment[]> {
  const supabase = getClient();
  const { data, error } = await supabase
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

export async function createComment(input: CreateNewsCommentInput): Promise<NewsArticleComment> {
  const user = await requireAuth();
  const supabase = getClient();

  const { data, error } = await supabase
    .from("news_article_comments")
    .insert({
      article_id: input.article_id,
      author_id: user.id,
      content: input.content,
      parent_id: input.parent_id || null,
    })
    .select(`
      *,
      author:profiles!author_id(display_name, avatar_url)
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteComment(commentId: string): Promise<void> {
  const user = await requireAuth();
  await verifyCommentOwnership(commentId, user.id);

  const supabase = getClient();
  const { error } = await supabase.from("news_article_comments").delete().eq("id", commentId);
  if (error) throw error;
}

// ============================================================
// COMMENT VOTES API
// ============================================================

export async function voteComment(commentId: string, voteType: 1 | -1): Promise<void> {
  const supabase = getClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Your session has expired. Please sign in again.");

  const { data: existingVote } = await supabase
    .from("news_article_comment_votes")
    .select("vote_type")
    .eq("user_id", user.id)
    .eq("comment_id", commentId)
    .single();

  if (existingVote) {
    if (existingVote.vote_type === voteType) {
      await supabase
        .from("news_article_comment_votes")
        .delete()
        .eq("user_id", user.id)
        .eq("comment_id", commentId);
    } else {
      await supabase
        .from("news_article_comment_votes")
        .update({ vote_type: voteType })
        .eq("user_id", user.id)
        .eq("comment_id", commentId);
    }
  } else {
    await supabase.from("news_article_comment_votes").insert({
      user_id: user.id,
      comment_id: commentId,
      vote_type: voteType,
    });
  }
}
