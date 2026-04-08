"use client";

import Link from "next/link";
import { WikiArticleRow } from "@/components/wiki";
import { WikiArticle, WikiTag } from "@/lib/types";
import { ROUTES } from "@/lib/routes";
import { ArrowLeft } from "@phosphor-icons/react";

interface WikiTagViewProps {
  tag: WikiTag;
  articles: WikiArticle[];
}

export function WikiTagView({ tag, articles }: WikiTagViewProps) {
  return (
    <div className="min-h-full">
      {/* Title block strip */}
      <div className="title-block">
        <div className="field">
          <span className="field-label">Drawing</span>
          <span className="field-value">Wiki</span>
        </div>
        <div className="field">
          <span className="field-label">Tag</span>
          <span className="field-value">{tag.name}</span>
        </div>
        <div className="field">
          <span className="field-label">Articles</span>
          <span className="field-value tabular-nums">{articles.length}</span>
        </div>
        <div className="spacer" />
        <div className="field">
          <span className="field-label">Drawn by</span>
          <span className="field-value">R.H.</span>
        </div>
      </div>

      <section className="container mx-auto px-4 sm:px-6 lg:px-16 pt-6 pb-16 max-w-[1100px]">
        <Link
          href={ROUTES.WIKI}
          className="font-mono text-[11px] uppercase tracking-[1.2px] text-muted-foreground hover:text-accent transition-colors inline-flex items-center gap-1.5 mb-6"
        >
          <ArrowLeft className="w-3 h-3 text-accent" />
          Back to wiki
        </Link>

        <h1 className="font-heading font-semibold text-[32px] md:text-[38px] leading-[1.1] tracking-[-0.015em] text-foreground">
          Articles tagged <em className="italic text-accent font-medium">{tag.name}</em>
        </h1>

        <div className="mt-10 space-y-2">
          {articles.length === 0 ? (
            <p className="font-heading italic text-[18px] text-muted-foreground py-12 text-center">
              No articles with this tag yet.
            </p>
          ) : (
            articles.map((article) => (
              <WikiArticleRow
                key={article.id}
                article={article}
                onClick={() => {}}
                href={ROUTES.WIKI_ARTICLE(article.slug)}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
