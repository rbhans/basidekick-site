"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ROUTES } from "@/lib/routes";
import { ArticleNyTimes, ArrowRight } from "@phosphor-icons/react";

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
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 bg-muted rounded" />
        ))}
      </div>
    );
  }

  if (articles.length === 0) {
    return null;
  }

  return (
    <section className="py-8 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 mb-6">
          <ArticleNyTimes className="size-5 text-primary" />
          <h2 className="text-xl font-semibold">Related Articles</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {articles.map((article) => {
            const category = Array.isArray(article.category)
              ? article.category[0]
              : article.category;

            return (
              <Link
                key={article.id}
                href={ROUTES.WIKI_ARTICLE(article.slug)}
                className="group block p-4 border border-border bg-card shadow-sm hover:bg-accent/50 transition-colors"
              >
                {category?.name && (
                  <span className="text-xs text-muted-foreground mb-1 block">
                    {category.name}
                  </span>
                )}
                <h3 className="font-medium text-sm leading-snug group-hover:text-accent transition-colors line-clamp-2">
                  {article.title}
                </h3>
                {article.summary && (
                  <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                    {article.summary}
                  </p>
                )}
                <span className="mt-3 inline-flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Read more <ArrowRight className="size-3" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
