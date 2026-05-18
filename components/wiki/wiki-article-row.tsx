"use client";

import Link from "next/link";
import { WikiArticle, WikiTag } from "@/lib/types";
import { ROUTES } from "@/lib/routes";

interface WikiArticleRowProps {
  article: WikiArticle;
  tags?: WikiTag[];
  onClick?: () => void;
  href?: string;
}

function categoryGlyph(categoryName?: string): string {
  if (!categoryName) return "·";
  const trimmed = categoryName.trim();
  if (!trimmed) return "·";
  return trimmed[0].toUpperCase();
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function WikiArticleRow({ article, tags, onClick, href }: WikiArticleRowProps) {
  const linkHref = href || ROUTES.WIKI_ARTICLE(article.slug);
  const glyph = categoryGlyph(article.category?.name);

  const content = (
    <>
      <div className="cat-cell">
        <span className="cat-glyph">{glyph}</span>
        {article.category?.name && (
          <span className="cat-label">{article.category.name}</span>
        )}
      </div>
      <div className="main">
        <h4>{article.title}</h4>
        {article.summary && <p className="snippet">{article.summary}</p>}
        {tags && tags.length > 0 && (
          <div className="facets">
            {tags.slice(0, 4).map((t) => (
              <span key={t.id} className="facet">{t.name}</span>
            ))}
          </div>
        )}
      </div>
      <div className="meta-cell">
        <span className="views tabular-nums">{article.view_count}</span>
        <span>views · {formatDate(article.created_at)}</span>
      </div>
    </>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="wk-article w-full text-left" type="button">
        {content}
      </button>
    );
  }

  return (
    <Link href={linkHref} className="wk-article">
      {content}
    </Link>
  );
}
