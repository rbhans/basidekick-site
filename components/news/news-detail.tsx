"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import {
  ArrowSquareOut,
  ArrowLeft,
  Spinner,
  Heart,
  ChatCircle,
  Share,
  CheckCircle,
  Robot,
} from "@phosphor-icons/react";
import { ROUTES } from "@/lib/routes";
import { useNewsStore } from "./news-store";
import { useAuth } from "@/hooks/use-auth";
import { CommentSection } from "./comment-section";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface NewsDetailProps {
  slug: string;
}

export function NewsDetail({ slug }: NewsDetailProps) {
  const { user } = useAuth();
  const {
    currentArticle: article,
    currentArticleLoading: loading,
    fetchArticleBySlug,
    voteArticle,
    clearCurrentArticle,
  } = useNewsStore();
  const [shareSuccess, setShareSuccess] = useState(false);

  useEffect(() => {
    fetchArticleBySlug(slug);
    return () => clearCurrentArticle();
  }, [slug, fetchArticleBySlug, clearCurrentArticle]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto p-4 md:p-6 text-center py-12">
        <p className="text-muted-foreground mb-4">Article not found.</p>
        <Link href={ROUTES.NEWS} className="text-primary hover:underline text-sm">
          Back to News
        </Link>
      </div>
    );
  }

  const createdDate = new Date(article.created_at);
  const fullTimestamp = format(createdDate, "MMM d, yyyy 'at' h:mm a");
  const relativeTime = formatDistanceToNow(createdDate, { addSuffix: true });

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: article.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShareSuccess(true);
        toast.success("Link copied to clipboard");
        setTimeout(() => setShareSuccess(false), 2000);
      }
    } catch {
      // User cancelled
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      {/* Back link */}
      <Link
        href={ROUTES.NEWS}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-3 h-3" />
        Back to News
      </Link>

      {/* Article card */}
      <div className="bg-card border border-border rounded-xl p-6">
        {/* Source row */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#27272A] flex items-center justify-center shrink-0">
            <ArrowSquareOut className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[14px] font-semibold text-foreground hover:underline truncate"
              >
                {article.source_domain}
              </a>
              <span className="px-2 py-0.5 rounded-full bg-[#27272A] text-[11px] font-mono text-muted-foreground">
                {article.is_ai_submitted ? "AI Curated" : "Submitted"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground/60">
              {article.submitter?.display_name && (
                <span>by {article.submitter.display_name}</span>
              )}
              {article.is_ai_submitted && (
                <span className="inline-flex items-center gap-1">
                  <Robot className="w-3 h-3" />
                  AI
                </span>
              )}
              <span>·</span>
              <time dateTime={article.created_at} title={fullTimestamp}>
                About {relativeTime}
              </time>
            </div>
          </div>
        </div>

        {/* Title */}
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block group/link"
        >
          <h1 className="font-heading text-xl font-bold text-foreground group-hover/link:text-primary transition-colors leading-snug">
            {article.title}
            <ArrowSquareOut className="w-4 h-4 inline ml-2 opacity-30 group-hover/link:opacity-60 transition-opacity" />
          </h1>
        </a>

        {/* Summary */}
        {article.summary && (
          <p className="text-[14px] text-muted-foreground leading-relaxed mt-3">
            {article.summary}
          </p>
        )}

        {/* Visit article button */}
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 text-sm font-medium bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
        >
          Read Full Article
          <ArrowSquareOut className="w-3.5 h-3.5" />
        </a>

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full border border-border text-[11px] font-mono text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Engagement */}
        <div className="flex items-center gap-6 pt-4 mt-4 border-t border-border">
          <button
            onClick={() => user && voteArticle(article.id, article.user_vote === 1 ? -1 : 1)}
            disabled={!user}
            className={cn(
              "flex items-center gap-2 transition-colors",
              article.user_vote === 1
                ? "text-primary"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            <Heart className="w-4 h-4" weight={article.user_vote === 1 ? "fill" : "regular"} />
            <span className="text-[13px]">{article.upvote_count}</span>
          </button>
          <span className="flex items-center gap-2 text-muted-foreground">
            <ChatCircle className="w-4 h-4" />
            <span className="text-[13px]">{article.comment_count}</span>
          </span>
          <button
            onClick={handleShare}
            className={cn(
              "flex items-center gap-2 transition-colors",
              shareSuccess
                ? "text-green-500"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            {shareSuccess ? (
              <CheckCircle className="w-4 h-4" weight="fill" />
            ) : (
              <Share className="w-4 h-4" />
            )}
            <span className="text-[13px]">Share</span>
          </button>
        </div>
      </div>

      {/* Comments section */}
      <div className="bg-card border border-border rounded-xl p-6 mt-4">
        <h2 className="text-sm font-semibold text-muted-foreground mb-6">
          {article.comment_count} {article.comment_count === 1 ? "Comment" : "Comments"}
        </h2>
        <CommentSection articleId={article.id} />
      </div>
    </div>
  );
}
