"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { WikiArticle, WikiTag, WikiFacet, WikiComment } from "@/lib/types";
import { ROUTES } from "@/lib/routes";
import { validateContent, MAX_LENGTHS, checkRateLimit, getRateLimitReset } from "@/lib/security";
import {
  ArrowLeft,
  Eye,
  Calendar,
  User,
  SignIn,
} from "@phosphor-icons/react";
import { MarkdownContent } from "@/components/markdown-content";
import { RelatedArticles } from "@/components/wiki/related-articles";
import { BookmarkButton } from "@/components/bookmark-button";

// Map facet group slugs to URL route prefixes
const GROUP_ROUTE_MAP: Record<string, string> = {
  platform_vendor: "platform",
  protocol: "protocol",
  system_domain: "topic",
  topic: "topic",
  content_format: "topic",
};

interface WikiArticleDetailProps {
  article: WikiArticle;
  tags: WikiTag[];
  facets?: WikiFacet[];
}

export function WikiArticleDetail({ article, tags, facets = [] }: WikiArticleDetailProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<WikiComment[]>([]);
  const [commentContent, setCommentContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  // Use server-rendered view count - don't update optimistically to avoid race conditions
  const viewCount = article.view_count || 0;
  const hasIncrementedRef = useRef(false);

  // Increment view count on mount (with session deduplication)
  useEffect(() => {
    async function incrementViews() {
      // Prevent double-counting in strict mode or re-renders
      if (hasIncrementedRef.current) return;
      hasIncrementedRef.current = true;

      // Session-based deduplication - only count once per article per session
      const viewedKey = `viewed_wiki_${article.id}`;
      if (typeof window !== "undefined" && sessionStorage.getItem(viewedKey)) {
        return;
      }

      const supabase = createClient();
      if (!supabase) return;

      // Use server-rendered value for the increment to minimize race condition window
      await supabase
        .from("wiki_articles")
        .update({ view_count: (article.view_count || 0) + 1 })
        .eq("id", article.id);

      // Mark as viewed for this session
      if (typeof window !== "undefined") {
        sessionStorage.setItem(viewedKey, "1");
      }
    }

    incrementViews();
  }, [article.id, article.view_count]);

  // Fetch comments
  useEffect(() => {
    async function fetchComments() {
      const supabase = createClient();
      if (!supabase) return;

      const { data } = await supabase
        .from("wiki_comments")
        .select(`
          *,
          author:profiles!wiki_comments_user_id_fkey(display_name)
        `)
        .eq("article_id", article.id)
        .order("created_at");

      if (data) {
        setComments(data as WikiComment[]);
      }
    }

    fetchComments();
  }, [article.id]);

  const handlePostComment = async () => {
    if (!user || !commentContent.trim()) return;

    // Validate content
    const validation = validateContent(commentContent, MAX_LENGTHS.COMMENT);
    if (!validation.valid) {
      setError(validation.error || "Invalid comment");
      return;
    }

    // Check rate limit (5 comments per minute)
    if (!checkRateLimit("wiki_comment", 5, 60000)) {
      const resetIn = getRateLimitReset("wiki_comment", 60000);
      setError(`Too many comments. Please wait ${resetIn} seconds.`);
      return;
    }

    setSubmitting(true);
    setError("");
    const supabase = createClient();
    if (!supabase) {
      setSubmitting(false);
      return;
    }

    const { data, error: insertError } = await supabase
      .from("wiki_comments")
      .insert({
        article_id: article.id,
        user_id: user.id,
        content: validation.sanitized,
      })
      .select(`
        *,
        author:profiles!wiki_comments_user_id_fkey(display_name)
      `)
      .single();

    if (data && !insertError) {
      setComments((prev) => [...prev, data as WikiComment]);
      setCommentContent("");
    } else {
      setError("Failed to post comment. Please try again.");
    }
    setSubmitting(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-full">
      {/* Title block strip */}
      <div className="title-block">
        <div className="field">
          <span className="field-label">Drawing</span>
          <span className="field-value">Wiki</span>
        </div>
        {article.category && (
          <div className="field hidden md:flex">
            <span className="field-label">Category</span>
            <span className="field-value">{article.category.name}</span>
          </div>
        )}
        <div className="field hidden lg:flex">
          <span className="field-label">Title</span>
          <span className="field-value truncate max-w-[340px]">{article.title}</span>
        </div>
        <div className="field">
          <span className="field-label">Rev</span>
          <span className="field-value">{formatDate(article.created_at)}</span>
        </div>
        <div className="field">
          <span className="field-label">Views</span>
          <span className="field-value tabular-nums">{viewCount}</span>
        </div>
        <div className="spacer" />
        <div className="field">
          <span className="field-label">Drawn by</span>
          <span className="field-value">{article.author?.display_name || "Anonymous"}</span>
        </div>
      </div>

      {/* Back strip + article header */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-16 pt-6 max-w-[880px]">
        <Link
          href={ROUTES.WIKI}
          className="font-mono text-[11px] uppercase tracking-[1.2px] text-muted-foreground hover:text-accent transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3 h-3 text-accent" />
          Back to wiki
        </Link>

        {/* Headline */}
        <h1 className="mt-6 font-heading font-semibold text-[32px] md:text-[38px] leading-[1.1] tracking-[-0.015em] text-foreground max-w-[760px]">
          {article.title}
        </h1>

        {/* Meta row */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-border">
          <div className="flex flex-wrap items-center gap-4 font-mono text-[11px] uppercase tracking-[1.2px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <User className="w-3 h-3" />
              {article.author?.display_name || "Anonymous"}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3" />
              {formatDate(article.created_at)}
            </span>
            <span className="flex items-center gap-1.5 tabular-nums">
              <Eye className="w-3 h-3" />
              {viewCount} views
            </span>
          </div>
          <BookmarkButton
            item={{
              id: article.id,
              type: "wiki",
              title: article.title,
              slug: article.slug,
              category: article.category?.name,
            }}
            size="sm"
          />
        </div>

        {/* Tags / facets */}
        {facets.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {facets.map((facet) => {
              const groupSlug = facet.group?.slug || "";
              const routePrefix = GROUP_ROUTE_MAP[groupSlug] || "topic";
              return (
                <Link
                  key={facet.id}
                  href={ROUTES.WIKI_FACET(routePrefix, facet.slug)}
                  className="px-2.5 py-1 font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground border border-border rounded-sm hover:border-foreground hover:text-foreground transition-colors"
                >
                  {facet.name}
                </Link>
              );
            })}
          </div>
        ) : tags.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={ROUTES.WIKI_TAG(tag.slug)}
                className="px-2.5 py-1 font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground border border-border rounded-sm hover:border-foreground hover:text-foreground transition-colors"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        ) : null}
      </div>

      {/* 01 / Article */}
      <section className="container mx-auto max-w-[880px] px-4 sm:px-6 lg:px-16 pt-10 pb-4">
        <div className="flex items-baseline gap-3.5 pb-3.5 border-b border-foreground mb-6">
          <span className="font-mono text-[11px] text-accent tracking-[1px]">01 /</span>
          <h2 className="font-heading font-semibold text-[22px] leading-none text-foreground">
            Article
          </h2>
        </div>
        <MarkdownContent content={article.content || ""} />
      </section>

      {/* 02 / Discussion */}
      <section className="container mx-auto max-w-[880px] px-4 sm:px-6 lg:px-16 py-10">
        <div className="flex items-baseline gap-3.5 pb-3.5 border-b border-foreground mb-6">
          <span className="font-mono text-[11px] text-accent tracking-[1px]">02 /</span>
          <h2 className="font-heading font-semibold text-[22px] leading-none text-foreground">
            Discussion
          </h2>
          <span className="ml-auto font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground tabular-nums">
            {comments.length} {comments.length === 1 ? "comment" : "comments"}
          </span>
        </div>

        {comments.length === 0 ? (
          <p className="font-heading italic text-[15px] text-muted-foreground mb-8">
            No comments yet. Be the first.
          </p>
        ) : (
          <div className="space-y-0 mb-8">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="grid grid-cols-[36px_1fr] gap-4 py-4 border-b border-muted"
              >
                <div className="size-8 border border-border bg-muted flex items-center justify-center font-heading font-semibold text-[14px] text-foreground">
                  {(comment.author?.display_name || "A")[0].toUpperCase()}
                </div>
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground mb-1.5">
                    {comment.author?.display_name || "Anonymous"} ·{" "}
                    <span className="tabular-nums">{formatDate(comment.created_at)}</span>
                    {comment.is_edited && " · edited"}
                  </div>
                  <p className="text-[14px] text-foreground leading-[1.55] whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Comment form */}
        {user ? (
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[1.3px] text-muted-foreground mb-2">
              Add a comment
            </div>
            <textarea
              value={commentContent}
              onChange={(e) => {
                setCommentContent(e.target.value);
                if (error) setError("");
              }}
              placeholder="Write your comment…"
              maxLength={MAX_LENGTHS.COMMENT}
              rows={4}
              className="w-full border border-border bg-card focus:border-foreground transition-colors outline-none p-3 text-[14px] text-foreground placeholder:text-muted-foreground/60 placeholder:italic font-sans resize-y"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground tabular-nums">
                {commentContent.length}/{MAX_LENGTHS.COMMENT}
              </span>
              {error && (
                <span className="font-mono text-[10px] uppercase tracking-[1.1px] text-destructive">
                  {error}
                </span>
              )}
              <button
                onClick={handlePostComment}
                disabled={submitting || !commentContent.trim()}
                className="px-4 py-2 border border-foreground bg-primary text-primary-foreground font-mono text-[10px] uppercase tracking-[1.2px] hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? "Posting…" : "Post comment"}
              </button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center border border-dashed border-border">
            <p className="font-heading italic text-[15px] text-muted-foreground mb-4">
              Sign in to leave a comment.
            </p>
            <Link
              href={ROUTES.SIGNIN}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-foreground bg-primary text-primary-foreground font-mono text-[10px] uppercase tracking-[1.2px] hover:bg-primary/90 transition-colors"
            >
              <SignIn className="w-3.5 h-3.5" />
              Sign in
            </Link>
          </div>
        )}
      </section>

      {/* Related Articles */}
      <RelatedArticles
        currentArticleId={article.id}
        categoryId={article.category_id}
        tagIds={tags.map((t) => t.id)}
        facetIds={facets.map((f) => f.id)}
      />
    </div>
  );
}
