"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowSquareOut,
  Heart,
  ChatCircle,
  Share,
  CheckCircle,
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

/** Google's public favicon service — returns 64px icon for any domain */
function getFaviconUrl(domain: string, size = 64) {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size}`;
}

export function NewsCard({ article }: NewsCardProps) {
  const { user } = useAuth();
  const { voteArticle } = useNewsStore();
  const detailHref = ROUTES.NEWS_ARTICLE(article.slug);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [faviconError, setFaviconError] = useState(false);

  const createdDate = new Date(article.created_at);
  const fullTimestamp = format(createdDate, "MMM d, yyyy 'at' h:mm a");
  const relativeTime = formatDistanceToNow(createdDate, { addSuffix: true });
  const faviconSrc = getFaviconUrl(article.source_domain);

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
    <article className="relative bg-card border border-border rounded-xl p-6 hover:border-[#3F3F46] transition-colors group/card overflow-hidden">
      {/* Faint favicon watermark in top-right corner */}
      {!faviconError && (
        <div className="absolute top-4 right-4 w-20 h-20 opacity-[0.04] pointer-events-none">
          <Image
            src={faviconSrc}
            alt=""
            width={80}
            height={80}
            className="w-full h-full object-contain"
            onError={() => setFaviconError(true)}
            unoptimized
          />
        </div>
      )}

      {/* Source row */}
      <div className="flex items-center gap-3 mb-4 relative">
        <div className="w-10 h-10 rounded-full bg-[#27272A] flex items-center justify-center shrink-0 overflow-hidden">
          {!faviconError ? (
            <Image
              src={faviconSrc}
              alt={article.source_domain}
              width={24}
              height={24}
              className="w-6 h-6"
              onError={() => setFaviconError(true)}
              unoptimized
            />
          ) : (
            <ArrowSquareOut className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[14px] font-semibold text-foreground truncate block">
            {article.source_domain}
          </span>
          <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground/60">
            {article.submitter?.display_name && (
              <>
                <span>by {article.submitter.display_name}</span>
                <span>·</span>
              </>
            )}
            <time dateTime={article.created_at} title={fullTimestamp}>
              About {relativeTime}
            </time>
          </div>
        </div>
      </div>

      {/* Title — links to detail/comments page */}
      <Link href={detailHref} className="block group/link relative">
        <h3 className="font-heading text-[16px] font-bold text-foreground group-hover/link:text-primary transition-colors leading-snug">
          {article.title}
        </h3>
      </Link>

      {/* Summary */}
      {article.summary && (
        <Link href={detailHref} className="block relative">
          <p className="text-[14px] text-muted-foreground leading-relaxed mt-2 line-clamp-3">
            {article.summary}
          </p>
        </Link>
      )}

      {/* External link */}
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="relative inline-flex items-center gap-1.5 mt-3 text-[13px] text-primary/70 hover:text-primary transition-colors"
      >
        Read at {article.source_domain}
        <ArrowSquareOut className="w-3 h-3" />
      </a>

      {/* Tags */}
      {article.tags.length > 0 && (
        <div className="flex items-center gap-2 mt-4 flex-wrap relative">
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
      <div className="flex items-center gap-6 pt-4 mt-4 border-t border-border relative">
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
