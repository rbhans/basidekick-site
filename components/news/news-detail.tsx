"use client";

import { useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import {
  ArrowSquareOut,
  ArrowLeft,
  Spinner,
} from "@phosphor-icons/react";
import { ROUTES } from "@/lib/routes";
import { VoteButton } from "@/components/pointstack/shared/vote-button";
import { useNewsStore } from "./news-store";
import { useAuth } from "@/hooks/use-auth";
import { CommentSection } from "./comment-section";

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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 text-center">
        <p className="text-muted-foreground mb-4">Article not found.</p>
        <Link href={ROUTES.NEWS} className="text-primary hover:underline text-sm">
          Back to News
        </Link>
      </div>
    );
  }

  const createdDate = new Date(article.created_at);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Back link */}
      <Link
        href={ROUTES.NEWS}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-3 h-3" />
        Back to News
      </Link>

      {/* Article header */}
      <div className="flex gap-4">
        <div className="shrink-0 pt-1">
          <VoteButton
            count={article.upvote_count}
            userVote={article.user_vote}
            onVote={(voteType) => user && voteArticle(article.id, voteType)}
            disabled={!user}
            size="md"
            vertical
          />
        </div>

        <div className="flex-1 min-w-0">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xl font-bold text-foreground hover:text-primary transition-colors leading-snug inline-flex items-baseline gap-2"
          >
            {article.title}
            <ArrowSquareOut className="w-4 h-4 opacity-40 shrink-0" />
          </a>

          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground/60 flex-wrap">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono hover:text-muted-foreground transition-colors"
            >
              {article.source_domain}
            </a>
            <span>·</span>
            <span>
              {article.upvote_count} {article.upvote_count === 1 ? "point" : "points"}
            </span>
            {article.submitter?.display_name && (
              <>
                <span>·</span>
                <span>by {article.submitter.display_name}</span>
              </>
            )}
            {article.is_ai_submitted && (
              <>
                <span>·</span>
                <span>AI curated</span>
              </>
            )}
            <span>·</span>
            <time dateTime={article.created_at} title={format(createdDate, "MMM d, yyyy 'at' h:mm a")}>
              {formatDistanceToNow(createdDate, { addSuffix: true })}
            </time>
          </div>

          {/* Summary */}
          {article.summary && (
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              {article.summary}
            </p>
          )}

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 rounded-full border border-border text-[11px] font-mono text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Comments section */}
      <div className="mt-10 pt-6 border-t border-border">
        <h2 className="text-sm font-semibold text-muted-foreground mb-6">
          {article.comment_count} {article.comment_count === 1 ? "Comment" : "Comments"}
        </h2>
        <CommentSection articleId={article.id} />
      </div>
    </div>
  );
}
