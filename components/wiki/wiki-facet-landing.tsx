"use client";

import Link from "next/link";
import { WikiArticle, WikiFacet } from "@/lib/types";
import { WikiArticleRow } from "@/components/wiki";
import { ROUTES } from "@/lib/routes";
import { ArrowLeft, Tag } from "@phosphor-icons/react";
import { PageHero } from "@/components/page-hero";

interface WikiFacetLandingProps {
  facet: WikiFacet;
  groupName: string;
  articles: WikiArticle[];
}

export function WikiFacetLanding({ facet, groupName, articles }: WikiFacetLandingProps) {
  return (
    <div className="min-h-full">
      <PageHero>
        <Link
          href={ROUTES.WIKI}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="size-4" />
          Back to Wiki
        </Link>

        <div className="flex items-center gap-2 mt-6">
          <Tag className="size-6 text-primary" />
          <h1 className="text-3xl md:text-4xl font-heading font-bold tracking-tight">
            {facet.name}
          </h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          <span className="font-mono text-[11px] uppercase tracking-wider">{groupName}</span>
          {" · "}
          {articles.length} {articles.length === 1 ? "article" : "articles"}
        </p>
        {facet.description && (
          <p className="mt-3 text-muted-foreground max-w-[600px]">{facet.description}</p>
        )}
      </PageHero>

      <section className="py-8">
        <div className="container mx-auto px-4">
          {articles.length === 0 ? (
            <p className="text-muted-foreground">No articles with this facet.</p>
          ) : (
            <div className="space-y-2">
              {articles.map((article) => (
                <WikiArticleRow
                  key={article.id}
                  article={article}
                  onClick={() => {}}
                  href={ROUTES.WIKI_ARTICLE(article.slug)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
