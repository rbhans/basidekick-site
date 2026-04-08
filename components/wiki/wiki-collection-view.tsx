"use client";

import Link from "next/link";
import { WikiArticle, WikiCollection } from "@/lib/types";
import { WikiArticleRow } from "@/components/wiki";
import { ROUTES } from "@/lib/routes";
import { ArrowLeft } from "@phosphor-icons/react";

interface WikiCollectionViewProps {
  collection: WikiCollection;
  articles: WikiArticle[];
}

export function WikiCollectionView({ collection, articles }: WikiCollectionViewProps) {
  return (
    <div className="min-h-full">
      {/* Title block strip */}
      <div className="title-block">
        <div className="field">
          <span className="field-label">Drawing</span>
          <span className="field-value">Wiki</span>
        </div>
        <div className="field">
          <span className="field-label">Collection</span>
          <span className="field-value truncate max-w-[260px]">{collection.name}</span>
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
          {collection.name}
        </h1>
        {collection.description && (
          <p className="mt-4 text-[16px] text-muted-foreground max-w-[680px] leading-[1.55]">
            {collection.description}
          </p>
        )}

        <div className="mt-10 space-y-2">
          {articles.length === 0 ? (
            <p className="font-heading italic text-[18px] text-muted-foreground py-12 text-center">
              No articles in this collection yet.
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
