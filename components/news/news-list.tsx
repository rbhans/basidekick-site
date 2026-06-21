"use client";

import { useEffect, useMemo, useState } from "react";
import { Spinner, WarningCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useNewsStore } from "./news-store";
import { NewsCard } from "./news-card";
import { SubmitArticleDialog } from "./submit-article-dialog";
import { useAuth } from "@/hooks/use-auth";
import type { NewsArticle, NewsSortBy } from "@/lib/types";

const SORT_TABS: { key: NewsSortBy; label: string }[] = [
  { key: "top", label: "Top" },
  { key: "recent", label: "New" },
  { key: "commented", label: "Discussed" },
];

interface NewsListProps {
  initialArticles?: NewsArticle[];
}

export function NewsList({ initialArticles = [] }: NewsListProps) {
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
  const displayedArticles = articles.length > 0 ? articles : initialArticles;

  useEffect(() => {
    fetchFeed({ sortBy: "recent" });
  }, [fetchFeed]);

  const currentSort = feedFilter.sortBy || "recent";

  // Client-side search filtering
  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return displayedArticles;
    const q = searchQuery.toLowerCase();
    return displayedArticles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        (a.summary || "").toLowerCase().includes(q) ||
        a.source_domain.toLowerCase().includes(q) ||
        (a.tags || []).some((tag) => tag.toLowerCase().includes(q))
    );
  }, [displayedArticles, searchQuery]);

  // Count unique sources (for the title block strip)
  const uniqueSources = useMemo(() => {
    const set = new Set<string>();
    for (const a of displayedArticles) set.add(a.source_domain);
    return set.size;
  }, [displayedArticles]);

  return (
    <section className="sand-section">
      <div className="nw-page">
        <div className="nw-head" style={{ padding: "0 0 14px", margin: "0 0 28px" }}>
          <span className="num">.04</span>
          <h1>News / Industry Feed</h1>
          <span className="id">
            <span className="live-dot" /> LIVE · <b>{displayedArticles.length}</b> articles · <b>{uniqueSources}</b> sources
          </span>
        </div>

        <p className="nw-tagline">
          A daily-ish feed of what&apos;s moving in the industry. <em>Read the summary here</em>, read the original there.
        </p>
        <section
          aria-labelledby="news-answer-summary"
          className="mb-6 border-y border-foreground py-4"
        >
          <div className="grid gap-4 md:grid-cols-[1.2fr_1fr_1fr]">
            <div>
              <h2
                id="news-answer-summary"
                className="font-mono text-[10px] uppercase tracking-[1.4px] text-accent"
              >
                What this feed answers
              </h2>
              <p className="mt-2 text-[14px] leading-[1.55] text-foreground">
                BASidekick News tracks building automation, controls, facility operations,
                Niagara, cybersecurity, and industry source updates worth reading.
              </p>
            </div>
            <p className="text-[13px] leading-[1.5] text-muted-foreground">
              Each article keeps the original source link attached so summaries point back
              to the publication, advisory, vendor note, or community submission behind it.
            </p>
            <p className="text-[13px] leading-[1.5] text-muted-foreground">
              Use the search and sort controls to find recent BAS industry news by source,
              topic tag, article title, or discussion activity.
            </p>
          </div>
        </section>

        {/* Submit box */}
        {user && (
          <div className="nw-submit">
            <span className="icon" aria-hidden="true">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3v10M3 8h10" />
              </svg>
            </span>
            <p>Know a good article? <b>Share it with the community.</b></p>
            <SubmitArticleDialog />
          </div>
        )}

        {/* Search */}
        <div className="nw-search">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="7" cy="7" r="4.5" />
            <path d="m13 13-2.8-2.8" />
          </svg>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, source, or tag…"
            aria-label="Search news"
          />
        </div>

        {/* Sort row */}
        <div className="nw-sortrow">
          <span className="label">Sort</span>
          {SORT_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFeedFilter({ ...feedFilter, sortBy: tab.key })}
              aria-pressed={currentSort === tab.key}
              className="nw-pill"
            >
              {tab.label}
            </button>
          ))}
          <span className="count">
            <b>{filteredArticles.length}</b>shown
          </span>
        </div>

        {/* Error state */}
        {feedError && (
          <div className="flex flex-col items-center gap-3 p-6 mb-6 border border-border rounded-md bg-card text-center">
            <WarningCircle className="w-8 h-8 text-destructive" />
            <div>
              <p className="italic text-[16px] mb-1">Something went wrong.</p>
              <p className="text-sm text-muted-foreground">{feedError}</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => fetchFeed()}>
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Loading state */}
        {feedLoading && displayedArticles.length === 0 && (
          <div className="flex justify-center py-16">
            <Spinner className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Article list */}
        {filteredArticles.length > 0 && (
          <div className="nw-list">
            {filteredArticles.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        )}

        {/* Empty state (no articles) */}
        {!feedLoading && !feedError && filteredArticles.length === 0 && displayedArticles.length === 0 && (
          <div className="py-20 text-center italic text-[18px] text-muted-foreground">
            No articles yet. Check back soon or submit one.
          </div>
        )}

        {/* No search results */}
        {!feedLoading && searchQuery && filteredArticles.length === 0 && displayedArticles.length > 0 && (
          <div className="py-20 text-center italic text-[18px] text-muted-foreground">
            <span className="block font-mono not-italic text-[28px] mb-3">⌕</span>
            Nothing matches &ldquo;{searchQuery}&rdquo;. Try a different term.
          </div>
        )}

        {/* Load more */}
        {!feedLoading && hasMore && articles.length > 0 && !searchQuery && (
          <div className="flex justify-center pt-8">
            <Button variant="outline" size="sm" onClick={loadMore}>
              Load more
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
    </section>
  );
}
