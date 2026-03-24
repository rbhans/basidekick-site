"use client";

import { useEffect } from "react";
import { Spinner } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useNewsStore } from "./news-store";
import { NewsCard } from "./news-card";
import { SubmitArticleDialog } from "./submit-article-dialog";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import type { NewsSortBy } from "@/lib/types";

const SORT_TABS: { key: NewsSortBy; label: string }[] = [
  { key: "top", label: "Top" },
  { key: "recent", label: "New" },
  { key: "commented", label: "Discussed" },
];

export function NewsList() {
  const { user } = useAuth();
  const {
    articles,
    feedFilter,
    feedLoading,
    feedError,
    hasMore,
    fetchFeed,
    loadMore,
    setFeedFilter,
  } = useNewsStore();

  useEffect(() => {
    fetchFeed({ sortBy: "top" });
  }, [fetchFeed]);

  const currentSort = feedFilter.sortBy || "top";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        {/* Sort tabs */}
        <div className="flex items-center gap-1">
          {SORT_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFeedFilter({ ...feedFilter, sortBy: tab.key })}
              className={cn(
                "px-3 py-1.5 text-[13px] font-semibold rounded-md transition-colors",
                currentSort === tab.key
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground/70 hover:bg-muted/50"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Submit button */}
        {user && <SubmitArticleDialog />}
      </div>

      {/* Error state */}
      {feedError && (
        <div className="text-center py-12">
          <p className="text-sm text-destructive mb-3">{feedError}</p>
          <Button variant="outline" size="sm" onClick={() => fetchFeed()}>
            Try Again
          </Button>
        </div>
      )}

      {/* Article list */}
      {articles.length > 0 && (
        <div className="divide-y divide-border/50">
          {articles.map((article, index) => (
            <NewsCard key={article.id} article={article} rank={index + 1} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!feedLoading && !feedError && articles.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground/60 text-sm">
            No articles yet. Check back soon or submit one!
          </p>
        </div>
      )}

      {/* Loading */}
      {feedLoading && (
        <div className="flex justify-center py-8">
          <Spinner className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Load more */}
      {!feedLoading && hasMore && articles.length > 0 && (
        <div className="flex justify-center pt-6">
          <Button variant="outline" size="sm" onClick={loadMore}>
            More
          </Button>
        </div>
      )}
    </div>
  );
}
