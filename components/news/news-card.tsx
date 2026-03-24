"use client";

import { useState } from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowSquareOut,
  Heart,
  ChatCircle,
  Share,
  CheckCircle,
  Robot,
} from "@phosphor-icons/react";
import { NewsArticle } from "@/lib/types";
import { ROUTES } from "@/lib/routes";
import { useNewsStore } from "./news-store";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface NewsCardProps {
  article: NewsArticle;
}

export function NewsCard({ article }: NewsCardProps) {
  const { user } = useAuth();
  const { voteArticle } = useNewsStore();
  const detailHref = ROUTES.NEWS_ARTICLE(article.slug);
  const [shareSuccess, setShareSuccess] = useState(false);

  const createdDate = new Date(article.created_at);
  const fullTimestamp = format(createdDate, "MMM d, yyyy 'at' h:mm a");
  const relativeTime = formatDistanceToNow(createdDate, { addSuffix: true });

  const handleShare = async () => {
    const url = `${window.location.origin}${detailHref}`;
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
      // User cancelled share
    }
  };

  return (
    <article className="bg-card border border-border rounded-xl p-6 hover:border-[#3F3F46] transition-colors group/card">
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
        <h3 className="font-heading text-[16px] font-bold text-foreground group-hover/link:text-primary transition-colors leading-snug">
          {article.title}
          <ArrowSquareOut className="w-3.5 h-3.5 inline ml-2 opacity-30 group-hover/link:opacity-60 transition-opacity" />
        </h3>
      </a>

      {/* Summary */}
      {article.summary && (
        <Link href={detailHref} className="block">
          <p className="text-[14px] text-muted-foreground leading-relaxed mt-2 line-clamp-3">
            {article.summary}
          </p>
        </Link>
      )}

      {/* Tags */}
      {article.tags.length > 0 && (
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          {article.tags.slice(0, 5).map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full border border-border text-[11px] font-mono text-muted-foreground"
            >
              {tag}
            </span>
          ))}
          {article.tags.length > 5 && (
            <span className="px-3 py-1 rounded-full border border-border text-[11px] font-mono text-muted-foreground">
              +{article.tags.length - 5}
            </span>
          )}
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
        <Link
          href={detailHref}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <ChatCircle className="w-4 h-4" />
          <span className="text-[13px]">{article.comment_count}</span>
        </Link>
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
    </article>
  );
}
