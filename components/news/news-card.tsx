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
} from "@phosphor-icons/react";
import { NewsArticle } from "@/lib/types";
import { ROUTES } from "@/lib/routes";
import { useNewsStore } from "./news-store";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

interface NewsCardProps {
  article: NewsArticle;
}

function getFaviconUrl(domain: string, size = 64) {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size}`;
}

function faviconFallback(domain: string) {
  const stem = domain.replace(/^www\./, "").split(".")[0] ?? domain;
  return stem.slice(0, 3).toUpperCase();
}

export function NewsCard({ article }: NewsCardProps) {
  const { user } = useAuth();
  const { voteArticle } = useNewsStore();
  const detailHref = ROUTES.NEWS_ARTICLE(article.slug);
  const [faviconError, setFaviconError] = useState(false);

  const createdDate = new Date(article.created_at);
  const relativeTime = formatDistanceToNow(createdDate, { addSuffix: false });
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
        toast.success("Link copied to clipboard");
      }
    } catch {
      // user cancelled
    }
  };

  const handleVote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (user) voteArticle(article.id, article.user_vote === 1 ? -1 : 1);
  };

  const liked = article.user_vote === 1;
  const previewTags = article.tags.slice(0, 3);
  const extraTagCount = article.tags.length - previewTags.length;

  return (
    <article className="nw-card" data-tags={article.tags.join(" ")}>
      <span className="fav" aria-hidden="true">
        {!faviconError ? (
          <Image
            src={faviconSrc}
            alt={article.source_domain}
            width={26}
            height={26}
            onError={() => setFaviconError(true)}
            unoptimized
          />
        ) : (
          <span>{faviconFallback(article.source_domain)}</span>
        )}
      </span>
      <div className="body">
        <div className="src">
          <span className="dom">{article.source_domain}</span>
          {article.submitter?.display_name && (
            <>
              <span className="sep">·</span>
              <span className="by">by {article.submitter.display_name}</span>
            </>
          )}
        </div>
        <Link href={detailHref}>
          <h3>{article.title}</h3>
        </Link>
        {article.summary && <p className="summary">{article.summary}</p>}
        <div className="meta-row">
          <time className="ts" dateTime={article.created_at}>{relativeTime} ago</time>
          {previewTags.length > 0 && <span className="sep">·</span>}
          {previewTags.map((tag) => (
            <Link key={tag} className="tag" href={`/news?tag=${encodeURIComponent(tag)}`}>
              {tag}
            </Link>
          ))}
          {extraTagCount > 0 && <span className="tag">+{extraTagCount}</span>}
        </div>
      </div>
      <div className="right">
        <a
          className="read-orig"
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          Read original
          <ArrowSquareOut weight="regular" />
        </a>
        <div className="acts">
          <button
            type="button"
            className={`act ${liked ? "liked" : ""}`}
            onClick={handleVote}
            disabled={!user}
            aria-label="Upvote"
          >
            <Heart weight={liked ? "fill" : "regular"} />
            <span className="count">{article.upvote_count}</span>
          </button>
          <Link
            href={detailHref}
            className="act"
            onClick={(e) => e.stopPropagation()}
            aria-label="Comments"
          >
            <ChatCircle weight="regular" />
            <span>{article.comment_count}</span>
          </Link>
          <button type="button" className="act" onClick={handleShare} aria-label="Share">
            <Share weight="regular" />
          </button>
        </div>
      </div>
    </article>
  );
}
