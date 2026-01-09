"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { CircuitBackground } from "@/components/circuit-background";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { WikiArticle, WikiTag, WikiComment } from "@/lib/types";
import { ROUTES } from "@/lib/routes";
import { validateContent, MAX_LENGTHS, checkRateLimit, getRateLimitReset } from "@/lib/security";
import {
  ArrowLeft,
  Eye,
  Calendar,
  User,
  ChatCircle,
  SignIn,
} from "@phosphor-icons/react";
import { MarkdownContent } from "@/components/markdown-content";
import { RelatedArticles } from "@/components/wiki/related-articles";
import { BookmarkButton } from "@/components/bookmark-button";

interface WikiArticleDetailProps {
  article: WikiArticle;
  tags: WikiTag[];
}

export function WikiArticleDetail({ article, tags }: WikiArticleDetailProps) {
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
      <section className="relative py-12 overflow-hidden">
        <CircuitBackground opacity={0.15} />
        <div className="container mx-auto px-4 relative z-10">
          <Link
            href={ROUTES.WIKI}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="size-4" />
            Back to Wiki
          </Link>

          {article.category && (
            <Badge variant="outline" className="mb-4">
              {article.category.name}
            </Badge>
          )}

          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            {article.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="size-4" />
                {article.author?.display_name || "Anonymous"}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="size-4" />
                {formatDate(article.created_at)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="size-4" />
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

          {tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={ROUTES.WIKI_TAG(tag.slug)}
                  className="px-2 py-0.5 text-xs border border-border hover:bg-accent transition-colors"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Article Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <MarkdownContent content={article.content || ""} />
        </div>
      </section>

      {/* Comments */}
      <section className="py-8 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-6">
            <ChatCircle className="size-5 text-primary" />
            <h2 className="text-xl font-semibold">Comments ({comments.length})</h2>
          </div>

          {comments.length === 0 ? (
            <p className="text-muted-foreground mb-6">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            <div className="space-y-4 mb-8">
              {comments.map((comment) => (
                <div key={comment.id} className="border border-border bg-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="size-8 bg-primary/10 flex items-center justify-center text-sm font-mono text-primary">
                      {(comment.author?.display_name || "A")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">
                        {comment.author?.display_name || "Anonymous"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(comment.created_at)}
                        {comment.is_edited && " (edited)"}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* Comment form */}
          {user ? (
            <div>
              <h3 className="text-lg font-semibold mb-3">Add a Comment</h3>
              <textarea
                value={commentContent}
                onChange={(e) => {
                  setCommentContent(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Write your comment..."
                maxLength={MAX_LENGTHS.COMMENT}
                className="w-full min-h-[100px] p-4 bg-background border border-border resize-y focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {commentContent.length}/{MAX_LENGTHS.COMMENT}
                </span>
                {error && (
                  <span className="text-xs text-destructive">{error}</span>
                )}
              </div>
              <div className="mt-3 flex justify-end">
                <Button
                  onClick={handlePostComment}
                  disabled={submitting || !commentContent.trim()}
                >
                  {submitting ? "Posting..." : "Post Comment"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 border border-dashed border-border">
              <p className="text-muted-foreground mb-4">Sign in to leave a comment.</p>
              <Button asChild>
                <Link href={ROUTES.SIGNIN}>
                  <SignIn className="size-4 mr-2" />
                  Sign In
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Related Articles */}
      <RelatedArticles
        currentArticleId={article.id}
        categoryId={article.category_id}
        tagIds={tags.map((t) => t.id)}
      />
    </div>
  );
}
