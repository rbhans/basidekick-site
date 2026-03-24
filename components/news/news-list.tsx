"use client";

import { useEffect, useMemo, useState } from "react";
import { MagnifyingGlass, Spinner, WarningCircle } from "@phosphor-icons/react";
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

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchFeed({ sortBy: "top" });
  }, [fetchFeed]);

  const currentSort = feedFilter.sortBy || "top";

  // Client-side search filtering
  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return articles;
    const q = searchQuery.toLowerCase();
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        (a.summary || "").toLowerCase().includes(q) ||
        a.source_domain.toLowerCase().includes(q) ||
        (a.tags || []).some((tag) => tag.toLowerCase().includes(q))
    );
  }, [articles, searchQuery]);

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      {/* Submit box (for authenticated users) */}
      {user && (
        <div className="bg-card border border-border rounded-xl p-5 mb-4 flex items-center justify-between">
          <p className="text-[15px] text-muted-foreground/50">
            Know a good article? Share it with the community.
          </p>
          <SubmitArticleDialog />
        </div>
      )}

      {/* Search */}
      <div className="relative mb-6">
        <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search articles by title, source, or tag..."
          className="w-full h-11 bg-card border border-border rounded-xl pl-11 pr-4 text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-[#3F3F46] transition-colors"
        />
      </div>

      {/* Sort tabs */}
      <div className="flex items-center gap-1 mb-8">
        {SORT_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFeedFilter({ ...feedFilter, sortBy: tab.key })}
            className={cn(
              "px-4 py-2 text-[13px] font-semibold rounded-lg transition-colors",
              currentSort === tab.key
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground/70 hover:bg-muted/50"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error state */}
      {feedError && (
        <div className="flex flex-col items-center gap-3 p-6 mb-6 border border-border rounded-xl bg-card text-center">
          <WarningCircle className="w-8 h-8 text-destructive" />
          <div>
            <p className="font-medium mb-1">Something went wrong</p>
            <p className="text-sm text-muted-foreground">{feedError}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => fetchFeed()}>
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {feedLoading && articles.length === 0 && (
        <div className="flex justify-center py-12">
          <Spinner className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Article cards */}
      {filteredArticles.length > 0 && (
        <div className="space-y-4">
          {filteredArticles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!feedLoading && !feedError && filteredArticles.length === 0 && articles.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-muted-foreground/60 text-sm">
            No articles yet. Check back soon or submit one!
          </p>
        </div>
      )}

      {/* No search results */}
      {!feedLoading && searchQuery && filteredArticles.length === 0 && articles.length > 0 && (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <MagnifyingGlass className="w-8 h-8 text-muted-foreground/30" />
          <p className="text-muted-foreground/60 text-sm">
            No articles matching &ldquo;{searchQuery}&rdquo;
          </p>
        </div>
      )}

      {/* Load more */}
      {!feedLoading && hasMore && articles.length > 0 && !searchQuery && (
        <div className="flex flex-col items-center gap-2 pt-6">
          <Button variant="outline" size="sm" onClick={loadMore}>
            Load More
          </Button>
        </div>
      )}

      {/* Loading more indicator */}
      {feedLoading && articles.length > 0 && (
        <div className="flex justify-center py-6">
          <Spinner className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
