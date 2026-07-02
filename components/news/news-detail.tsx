"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow, format } from "date-fns";
import {
  ArrowSquareOut,
  Spinner,
  Heart,
  Share,
  CheckCircle,
} from "@phosphor-icons/react";
import { ROUTES } from "@/lib/routes";
import type { NewsArticle } from "@/lib/types";
import { useNewsStore } from "./news-store";
import { useAuth } from "@/hooks/use-auth";
import { CommentSection } from "./comment-section";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function getFaviconUrl(domain: string, size = 128) {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size}`;
}

interface NewsDetailProps {
  slug: string;
  initialArticle?: NewsArticle | null;
}

export function NewsDetail({ slug, initialArticle = null }: NewsDetailProps) {
  const { user } = useAuth();
  const {
    currentArticle,
    currentArticleLoading: loading,
    fetchArticleBySlug,
    voteArticle,
    clearCurrentArticle,
  } = useNewsStore();
  const [shareSuccess, setShareSuccess] = useState(false);
  const [faviconError, setFaviconError] = useState(false);

  useEffect(() => {
    fetchArticleBySlug(slug);
    return () => clearCurrentArticle();
  }, [slug, fetchArticleBySlug, clearCurrentArticle]);

  const article = currentArticle ?? initialArticle;

  const lastUpdated = useMemo(
    () =>
      new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    [],
  );

  if (loading && !article) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-full flex-1">
        <div className="title-block">
          <div className="field">
            <span className="field-label">Drawing</span>
            <span className="field-value">News</span>
          </div>
          <div className="field">
            <span className="field-label">Title</span>
            <span className="field-value">???</span>
          </div>
          <div className="field">
            <span className="field-label">Rev</span>
            <span className="field-value">???</span>
          </div>
          <div className="spacer" />
          <div className="field">
            <span className="field-label">Drawn by</span>
            <span className="field-value">???</span>
          </div>
        </div>
        <div className="max-w-[680px] mx-auto p-16 text-center">
          <p className="italic text-[20px] text-muted-foreground mb-4">
            This drawing isn&apos;t in the set.
          </p>
          <Link
            href={ROUTES.NEWS}
            className="font-mono text-[11px] uppercase tracking-[1.2px] text-foreground hover:text-accent transition-colors"
          >
            <span className="text-accent mr-1.5">←</span>
            Back to the news feed
          </Link>
        </div>
      </div>
    );
  }

  const createdDate = new Date(article.created_at);
  const fullTimestamp = format(createdDate, "MMM d, yyyy");
  const relativeTime = formatDistanceToNow(createdDate, { addSuffix: true });
  const faviconSrc = getFaviconUrl(article.source_domain);

  // Try to derive the URL path from the full URL
  let urlPath = "";
  try {
    const u = new URL(article.url);
    urlPath = u.pathname + (u.search || "");
  } catch {
    urlPath = article.url;
  }

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
    <div className="min-h-full flex-1">
      {/* Title block strip */}
      <div className="title-block">
        <div className="field">
          <span className="field-label">Drawing</span>
          <span className="field-value">News</span>
        </div>
        <div className="field hidden md:flex">
          <span className="field-label">Title</span>
          <span className="field-value truncate max-w-[320px]">{article.title}</span>
        </div>
        <div className="field">
          <span className="field-label">Source</span>
          <span className="field-value truncate max-w-[160px]">{article.source_domain}</span>
        </div>
        <div className="field">
          <span className="field-label">Rev</span>
          <span className="field-value" suppressHydrationWarning>{fullTimestamp}</span>
        </div>
        <div className="field">
          <span className="field-label">Replies</span>
          <span className="field-value tabular-nums">{article.comment_count}</span>
        </div>
        <div className="spacer" />
        <div className="field">
          <span className="field-label">Drawn by</span>
          <span className="field-value">R.H.</span>
        </div>
      </div>

      {/* Back strip */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-16 pt-5 max-w-[880px]">
        <Link
          href={ROUTES.NEWS}
          className="font-mono text-[11px] uppercase tracking-[1.2px] text-muted-foreground hover:text-accent transition-colors"
        >
          <span className="text-accent mr-1.5">←</span>
          Back to the news feed
        </Link>
      </div>

      {/* Article summary block */}
      <article className="container mx-auto px-4 sm:px-6 lg:px-16 pt-8 pb-12 max-w-[880px]">
        {/* Source row */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 border border-border rounded-sm bg-card flex items-center justify-center overflow-hidden shrink-0">
            {!faviconError ? (
              <Image
                src={faviconSrc}
                alt={article.source_domain}
                width={22}
                height={22}
                className="w-[22px] h-[22px] object-contain"
                onError={() => setFaviconError(true)}
                unoptimized
              />
            ) : (
              <ArrowSquareOut className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
          <div className="font-mono text-[11px] uppercase tracking-[1.3px] text-muted-foreground">
            {article.source_domain}
            <span className="text-accent mx-2">·</span>
            <span suppressHydrationWarning>{fullTimestamp}</span>
            {article.submitter?.display_name && (
              <>
                <span className="text-accent mx-2">·</span>
                <span>Submitted by {article.submitter.display_name}</span>
              </>
            )}
          </div>
        </div>

        {/* Headline */}
        <h1 className="font-heading font-semibold text-[32px] md:text-[38px] leading-[1.1] tracking-[-0.015em] text-foreground mb-7 max-w-[760px]">
          {article.title}
        </h1>

        {/* Summary block */}
        <div className="max-w-[680px]">
          <div className="font-mono text-[10px] uppercase tracking-[1.4px] text-muted-foreground mb-3.5 pb-2.5 border-b border-foreground">
            <span className="text-accent mr-1.5">01 /</span>
            Summary
          </div>
          {article.summary ? (
            <p className="text-[15px] md:text-[16px] leading-[1.7] text-foreground mb-4">
              {article.summary}
            </p>
          ) : (
            <p className="italic text-[16px] text-muted-foreground mb-4">
              No summary yet — read the original on {article.source_domain}.
            </p>
          )}
        </div>

        {/* Read original callout */}
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 flex items-center gap-5 max-w-[760px] border-[1.5px] border-foreground rounded-md bg-card px-7 py-6 hover:border-accent transition-colors group"
        >
          <div className="w-12 h-12 border border-border rounded-sm bg-background flex items-center justify-center overflow-hidden shrink-0">
            {!faviconError ? (
              <Image
                src={faviconSrc}
                alt=""
                width={34}
                height={34}
                className="w-[34px] h-[34px] object-contain"
                onError={() => setFaviconError(true)}
                unoptimized
              />
            ) : (
              <ArrowSquareOut className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-mono text-[10px] uppercase tracking-[1.3px] text-muted-foreground mb-1">
              Read the full article
            </div>
            <div className="font-heading font-semibold text-[18px] leading-tight text-foreground group-hover:text-accent transition-colors">
              {article.source_domain}
            </div>
            <div className="font-mono text-[10px] text-muted-foreground mt-1 truncate">
              {urlPath}
            </div>
          </div>
          <span className="bg-primary text-primary-foreground px-5 py-3 rounded-md text-[13px] font-semibold shrink-0 flex items-center gap-2">
            Open original
            <ArrowSquareOut className="w-3.5 h-3.5" />
          </span>
        </a>

        {/* Byline */}
        <p className="mt-10 pt-6 border-t border-border italic text-[14px] text-muted-foreground max-w-[680px] leading-[1.55]">
          — Summary drawn by the BASidekick news script and reviewed by Rob. This is a paraphrase, not the full article. Corrections welcome below.
        </p>

        {/* Tags + engagement */}
        <div className="mt-6 flex items-center gap-5 max-w-[680px] font-mono text-[11px] uppercase tracking-[1.2px] text-muted-foreground">
          <button
            onClick={() => user && voteArticle(article.id, article.user_vote === 1 ? -1 : 1)}
            disabled={!user}
            className={cn(
              "flex items-center gap-1.5 transition-colors tabular-nums",
              article.user_vote === 1 ? "text-accent" : "hover:text-accent disabled:hover:text-muted-foreground",
            )}
          >
            <Heart className="w-3.5 h-3.5" weight={article.user_vote === 1 ? "fill" : "regular"} />
            {article.upvote_count}
          </button>
          <button
            onClick={handleShare}
            className={cn(
              "flex items-center gap-1.5 transition-colors",
              shareSuccess ? "text-accent" : "hover:text-accent",
            )}
          >
            {shareSuccess ? <CheckCircle className="w-3.5 h-3.5" weight="fill" /> : <Share className="w-3.5 h-3.5" />}
            {shareSuccess ? "Copied" : "Share"}
          </button>
          <span className="flex-1" />
          {article.tags.length > 0 && (
            <span className="normal-case tracking-normal text-[11px] text-muted-foreground">
              {article.tags.join(" · ")}
            </span>
          )}
          <time dateTime={article.created_at} suppressHydrationWarning>{relativeTime}</time>
        </div>
      </article>

      {/* Discussion section */}
      <section className="bg-secondary border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-16 py-16 max-w-[880px]">
          <div className="flex items-baseline gap-3.5 mb-7 pb-3.5 border-b border-foreground">
            <span className="font-mono text-[11px] text-accent tracking-[1px]">02 /</span>
            <span className="font-heading font-semibold text-[22px] leading-none text-foreground">
              Discussion
            </span>
            <span className="ml-auto font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground tabular-nums">
              {article.comment_count} {article.comment_count === 1 ? "reply" : "replies"}
            </span>
          </div>
          <CommentSection articleId={article.id} />
        </div>
      </section>

      {/* Colophon */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-16 py-14 max-w-[1100px]">
          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr_220px] gap-10 font-mono text-[12px] text-muted-foreground leading-relaxed">
            <div>
              <strong className="text-foreground font-bold">News</strong>
              <br />
              Curated daily-ish by Rob
              <br />
              and an AI first-pass
            </div>
            <div>
              No hot takes. This is a paraphrase, not the full article — always verify against the source.
            </div>
            <div className="md:text-right" suppressHydrationWarning>
              Last updated · {lastUpdated}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
