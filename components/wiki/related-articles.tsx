"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ROUTES } from "@/lib/routes";

interface RelatedArticle {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  category?: { name: string } | null;
}

interface RelatedArticlesProps {
  currentArticleId: string;
  categoryId: string | null;
  tagIds: string[];
  facetIds?: string[];
}

export function RelatedArticles({
  currentArticleId,
  categoryId,
  tagIds,
  facetIds = [],
}: RelatedArticlesProps) {
  const [articles, setArticles] = useState<RelatedArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRelatedArticles() {
      const supabase = createClient();
      if (!supabase) {
        setLoading(false);
        return;
      }

      let relatedArticles: RelatedArticle[] = [];

      // Strategy 1: Find articles with shared facets (preferred) or tags (fallback)
      const useFacets = facetIds.length > 0;
      const lookupIds = useFacets ? facetIds : tagIds;
      const junctionTable = useFacets ? "wiki_article_facets" : "wiki_article_tags";
      const junctionColumn = useFacets ? "facet_id" : "tag_id";

      if (lookupIds.length > 0) {
        const { data: relatedArticleIds } = await supabase
          .from(junctionTable)
          .select("article_id")
          .in(junctionColumn, lookupIds)
          .neq("article_id", currentArticleId);

        if (relatedArticleIds && relatedArticleIds.length > 0) {
          // Count occurrences to rank by most shared facets/tags
          const articleIdCounts: Record<string, number> = {};
          for (const { article_id } of relatedArticleIds) {
            articleIdCounts[article_id] = (articleIdCounts[article_id] || 0) + 1;
          }

          // Sort by count and take top IDs
          const sortedIds = Object.entries(articleIdCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([id]) => id);

          if (sortedIds.length > 0) {
            const { data: facetRelated } = await supabase
              .from("wiki_articles")
              .select(
                "id, title, slug, summary, category:wiki_categories!wiki_articles_category_id_fkey(name)"
              )
              .in("id", sortedIds)
              .eq("is_published", true);

            if (facetRelated) {
              relatedArticles = sortedIds
                .map((id) => facetRelated.find((a: RelatedArticle) => a.id === id))
                .filter(Boolean) as RelatedArticle[];
            }
          }
        }
      }

      // Strategy 2: Fill remaining slots with same-category articles
      if (relatedArticles.length < 5 && categoryId) {
        const existingIds = [
          currentArticleId,
          ...relatedArticles.map((a) => a.id),
        ];
        const needed = 5 - relatedArticles.length;

        const { data: categoryRelated } = await supabase
          .from("wiki_articles")
          .select(
            "id, title, slug, summary, category:wiki_categories!wiki_articles_category_id_fkey(name)"
          )
          .eq("category_id", categoryId)
          .eq("is_published", true)
          .not("id", "in", `(${existingIds.join(",")})`)
          .order("view_count", { ascending: false })
          .limit(needed);

        if (categoryRelated) {
          relatedArticles = [...relatedArticles, ...categoryRelated];
        }
      }

      // Strategy 3: Fill with popular articles if still not enough
      if (relatedArticles.length < 4) {
        const existingIds = [
          currentArticleId,
          ...relatedArticles.map((a) => a.id),
        ];
        const needed = 4 - relatedArticles.length;

        const { data: popularArticles } = await supabase
          .from("wiki_articles")
          .select(
            "id, title, slug, summary, category:wiki_categories!wiki_articles_category_id_fkey(name)"
          )
          .eq("is_published", true)
          .not("id", "in", `(${existingIds.join(",")})`)
          .order("view_count", { ascending: false })
          .limit(needed);

        if (popularArticles) {
          relatedArticles = [...relatedArticles, ...popularArticles];
        }
      }

      setArticles(relatedArticles.slice(0, 5));
      setLoading(false);
    }

    fetchRelatedArticles();
  }, [currentArticleId, categoryId, tagIds, facetIds]);

  if (loading) {
    return null;
  }

  if (articles.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto max-w-[880px] px-4 sm:px-6 lg:px-16 py-10 border-t border-border">
      <div className="flex items-baseline gap-3.5 pb-3.5 border-b border-foreground mb-5">
        <span className="font-mono text-[11px] text-accent tracking-[1px]">03 /</span>
        <h2 className="font-heading font-semibold text-[22px] leading-none text-foreground">
          Related articles
        </h2>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground tabular-nums">
          {articles.length} {articles.length === 1 ? "article" : "articles"}
        </span>
      </div>

      <div className="space-y-0">
        {articles.map((article, idx) => {
          const category = Array.isArray(article.category)
            ? article.category[0]
            : article.category;

          return (
            <Link
              key={article.id}
              href={ROUTES.WIKI_ARTICLE(article.slug)}
              className="group grid grid-cols-[28px_1fr_60px] gap-4 items-start py-4 px-2 border-b border-muted hover:bg-muted/40 transition-colors"
            >
              <span className="font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground tabular-nums mt-1">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                {category?.name && (
                  <div className="font-mono text-[9px] uppercase tracking-[1.2px] text-accent mb-1">
                    {category.name}
                  </div>
                )}
                <div className="font-heading font-semibold text-[16px] leading-[1.3] text-foreground group-hover:text-accent transition-colors">
                  {article.title}
                </div>
                {article.summary && (
                  <p className="font-heading italic text-[13px] text-muted-foreground mt-1 leading-[1.5] line-clamp-2">
                    {article.summary}
                  </p>
                )}
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground group-hover:text-accent transition-colors text-right self-center">
                Read →
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
