"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
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

/** Google's public favicon service */
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
  const relativeTime = formatDistanceToNow(createdDate, { addSuffix: true });
  const faviconSrc = getFaviconUrl(article.source_domain);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
      // User cancelled
    }
  };

  const handleVote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (user) voteArticle(article.id, article.user_vote === 1 ? -1 : 1);
  };

  return (
    <article className="group grid grid-cols-[56px_1fr_auto] gap-5 items-start py-5 px-4 border border-border rounded-md bg-card hover:border-foreground transition-colors">
      {/* Favicon tile */}
      <div className="w-10 h-10 border border-border rounded-sm bg-background flex items-center justify-center overflow-hidden shrink-0 mt-0.5">
        {!faviconError ? (
          <Image
            src={faviconSrc}
            alt={article.source_domain}
            width={28}
            height={28}
            className="w-7 h-7 object-contain"
            onError={() => setFaviconError(true)}
            unoptimized
          />
        ) : (
          <ArrowSquareOut className="w-4 h-4 text-muted-foreground" />
        )}
      </div>

      {/* Body */}
      <Link href={detailHref} className="block min-w-0">
        <div className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground mb-1">
          {article.source_domain}
          {article.submitter?.display_name && (
            <>
              <span className="mx-1.5 text-muted-foreground/50">·</span>
              <span>by {article.submitter.display_name}</span>
            </>
          )}
        </div>
        <h3 className="font-heading font-semibold text-[17px] leading-[1.3] text-foreground group-hover:text-accent transition-colors">
          {article.title}
        </h3>
        {article.summary && (
          <p className="mt-1.5 text-[13px] text-muted-foreground leading-[1.5] line-clamp-2 max-w-[640px]">
            {article.summary}
          </p>
        )}

        {/* Tags + engagement row */}
        <div className="mt-3 flex items-center gap-4 flex-wrap font-mono text-[10px] text-muted-foreground uppercase tracking-[1.1px]">
          <time dateTime={article.created_at}>{relativeTime}</time>

          {article.tags.length > 0 && (
            <>
              <span className="text-muted-foreground/40">·</span>
              <span className="normal-case tracking-normal text-[11px] text-muted-foreground">
                {article.tags.slice(0, 3).join(" · ")}
                {article.tags.length > 3 && ` · +${article.tags.length - 3}`}
              </span>
            </>
          )}
        </div>
      </Link>

      {/* Actions column */}
      <div className="flex flex-col items-end gap-2 text-right">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="font-mono text-[10px] uppercase tracking-[1.2px] text-foreground hover:text-accent transition-colors border-b border-accent/60 pb-0.5"
        >
          Read original
          <ArrowSquareOut className="inline w-3 h-3 ml-1" />
        </a>
        <div className="flex items-center gap-3 mt-auto pt-2">
          <button
            onClick={handleVote}
            disabled={!user}
            className={cn(
              "flex items-center gap-1 text-[11px] font-mono transition-colors tabular-nums",
              article.user_vote === 1
                ? "text-accent"
                : "text-muted-foreground hover:text-accent disabled:hover:text-muted-foreground",
            )}
            aria-label="Upvote"
          >
            <Heart className="w-3.5 h-3.5" weight={article.user_vote === 1 ? "fill" : "regular"} />
            {article.upvote_count}
          </button>
          <Link
            href={detailHref}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground hover:text-accent transition-colors tabular-nums"
          >
            <ChatCircle className="w-3.5 h-3.5" />
            {article.comment_count}
          </Link>
          <button
            onClick={handleShare}
            className={cn(
              "flex items-center gap-1 text-[11px] font-mono transition-colors",
              shareSuccess ? "text-accent" : "text-muted-foreground hover:text-accent",
            )}
            aria-label="Share"
          >
            {shareSuccess ? <CheckCircle className="w-3.5 h-3.5" weight="fill" /> : <Share className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </article>
  );
}
