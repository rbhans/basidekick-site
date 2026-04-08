"use client";

import Link from "next/link";
import { WikiArticle, WikiTag } from "@/lib/types";
import { ROUTES } from "@/lib/routes";
import { YoutubeLogo } from "@phosphor-icons/react";
import { BookmarkButton } from "@/components/bookmark-button";

/**
 * Check if content contains YouTube video links
 */
function hasYouTubeVideo(content: string): boolean {
  const youtubePattern = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)[a-zA-Z0-9_-]{11}/i;
  return youtubePattern.test(content);
}

interface WikiArticleRowProps {
  article: WikiArticle;
  tags?: WikiTag[];
  onClick?: () => void;
  href?: string;
}

/**
 * Derive a single-letter glyph for the category (per spec §1.4).
 * Maps known category names to specific letters; otherwise uses first letter.
 */
function categoryGlyph(categoryName?: string): string {
  if (!categoryName) return "·";
  const trimmed = categoryName.trim();
  if (!trimmed) return "·";
  return trimmed[0].toUpperCase();
}

export function WikiArticleRow({ article, tags, onClick, href }: WikiArticleRowProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const linkHref = href || ROUTES.WIKI_ARTICLE(article.slug);
  const hasVideo = article.content ? hasYouTubeVideo(article.content) : false;
  const glyph = categoryGlyph(article.category?.name);

  const content = (
    <div className="grid grid-cols-[32px_1fr_auto] gap-4 items-start py-4 px-2">
      {/* Glyph tile */}
      <div className="w-8 h-8 bg-muted flex items-center justify-center rounded-sm font-mono text-[14px] font-bold text-foreground shrink-0">
        {glyph}
      </div>

      {/* Body */}
      <div className="min-w-0">
        {article.category && (
          <div className="font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground mb-0.5">
            {article.category.name}
          </div>
        )}
        <div className="flex items-center gap-2">
          <h3 className="font-heading font-semibold text-[16px] leading-[1.3] text-foreground group-hover:text-accent transition-colors truncate">
            {article.title}
          </h3>
          {hasVideo && (
            <span
              className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-[1px] text-accent border border-accent px-1.5 py-0.5 rounded-sm shrink-0"
              title="Includes video tutorial"
            >
              <YoutubeLogo className="w-2.5 h-2.5" weight="fill" />
              <span className="hidden sm:inline">Video</span>
            </span>
          )}
        </div>
        {article.summary && (
          <p className="mt-1 text-[13px] text-muted-foreground leading-[1.5] line-clamp-1 max-w-[640px]">
            {article.summary}
          </p>
        )}
        <div className="mt-2 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground">
          <span>{formatDate(article.created_at)}</span>
          <span className="tabular-nums">{article.view_count} views</span>
          {tags && tags.length > 0 && (
            <span className="normal-case tracking-normal text-[11px] text-muted-foreground truncate">
              {tags.slice(0, 3).map((t) => t.name).join(" · ")}
              {tags.length > 3 && ` · +${tags.length - 3}`}
            </span>
          )}
        </div>
      </div>

      {/* Bookmark */}
      <BookmarkButton
        item={{
          id: article.id,
          type: "wiki",
          title: article.title,
          slug: article.slug,
          category: article.category?.name,
        }}
        variant="icon"
        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
      />
    </div>
  );

  const rowClassName =
    "group block w-full text-left border-b border-muted hover:bg-muted/40 transition-colors";

  if (onClick) {
    return (
      <button onClick={onClick} className={rowClassName}>
        {content}
      </button>
    );
  }

  return (
    <Link href={linkHref} className={rowClassName}>
      {content}
    </Link>
  );
}
