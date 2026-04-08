"use client";

import { useEffect, useMemo, useState } from "react";
import { MagnifyingGlass, Spinner, WarningCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useNewsStore } from "./news-store";
import { NewsCard } from "./news-card";
import { SubmitArticleDialog } from "./submit-article-dialog";
import { useAuth } from "@/hooks/use-auth";
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

  const lastUpdated = useMemo(
    () =>
      new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    [],
  );

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

  // Count unique sources (for the title block strip)
  const uniqueSources = useMemo(() => {
    const set = new Set<string>();
    for (const a of articles) set.add(a.source_domain);
    return set.size;
  }, [articles]);

  return (
    <div className="min-h-full flex-1">
      {/* Title block strip */}
      <div className="title-block">
        <div className="field">
          <span className="field-label">Drawing</span>
          <span className="field-value">News</span>
        </div>
        <div className="field">
          <span className="field-label">Title</span>
          <span className="field-value">Industry Feed</span>
        </div>
        <div className="field">
          <span className="field-label">Rev</span>
          <span className="field-value">{lastUpdated}</span>
        </div>
        <div className="field">
          <span className="field-label">Articles</span>
          <span className="field-value tabular-nums">{articles.length}</span>
        </div>
        <div className="field hidden md:flex">
          <span className="field-label">Sources</span>
          <span className="field-value tabular-nums">{uniqueSources}</span>
        </div>
        <div className="spacer" />
        <div className="field">
          <span className="field-label">Drawn by</span>
          <span className="field-value">R.H.</span>
        </div>
      </div>

      {/* Main body */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-16 pt-16 pb-16 max-w-[900px]">
        {/* Tagline */}
        <p className="font-heading italic text-[17px] text-muted-foreground text-center mb-8 leading-[1.5]">
          A daily-ish feed of what&apos;s moving in the industry. Read the summary here, read the original there.
        </p>

        {/* Submit box (for authenticated users) */}
        {user && (
          <div className="flex items-center justify-between border border-border rounded-md bg-card p-4 mb-6">
            <p className="text-[13px] text-muted-foreground">
              Know a good article? Share it with the community.
            </p>
            <SubmitArticleDialog />
          </div>
        )}

        {/* Search */}
        <div className="relative border-[1.5px] border-foreground rounded-md bg-card focus-within:border-accent transition-colors mb-5">
          <MagnifyingGlass className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, source, or tag…"
            className="w-full bg-transparent border-none outline-none font-sans text-[15px] text-foreground placeholder:text-muted-foreground/60 placeholder:italic py-3.5 pl-[46px] pr-5"
            aria-label="Search news"
          />
        </div>

        {/* Sort chips */}
        <div className="flex items-center gap-3 mb-10 font-mono text-[11px] uppercase tracking-[1.2px] text-muted-foreground">
          <span>Sort</span>
          {SORT_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFeedFilter({ ...feedFilter, sortBy: tab.key })}
              className={`px-3 py-1.5 border rounded-sm font-mono text-[11px] uppercase tracking-[1.2px] transition-colors ${
                currentSort === tab.key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
          <span className="flex-1" />
          <span className="font-mono text-[11px] text-muted-foreground">
            <strong className="text-foreground tabular-nums">{filteredArticles.length}</strong> shown
          </span>
        </div>

        {/* Error state */}
        {feedError && (
          <div className="flex flex-col items-center gap-3 p-6 mb-6 border border-border rounded-md bg-card text-center">
            <WarningCircle className="w-8 h-8 text-destructive" />
            <div>
              <p className="font-heading italic text-[16px] mb-1">Something went wrong.</p>
              <p className="text-sm text-muted-foreground">{feedError}</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => fetchFeed()}>
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Loading state */}
        {feedLoading && articles.length === 0 && (
          <div className="flex justify-center py-16">
            <Spinner className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Article list */}
        {filteredArticles.length > 0 && (
          <div className="space-y-3">
            {filteredArticles.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        )}

        {/* Empty state (no articles) */}
        {!feedLoading && !feedError && filteredArticles.length === 0 && articles.length === 0 && (
          <div className="py-20 text-center font-heading italic text-[18px] text-muted-foreground">
            No articles yet. Check back soon or submit one.
          </div>
        )}

        {/* No search results */}
        {!feedLoading && searchQuery && filteredArticles.length === 0 && articles.length > 0 && (
          <div className="py-20 text-center font-heading italic text-[18px] text-muted-foreground">
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
      </section>

      {/* Colophon */}
      <div className="border-t border-border bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-16 py-14 max-w-[1100px]">
          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr_220px] gap-10 font-mono text-[12px] text-muted-foreground leading-relaxed">
            <div>
              <strong className="text-foreground font-bold">News</strong>
              <br />
              Curated daily-ish by Rob
              <br />
              and an AI first-pass
            </div>
            <div>
              No hot takes. Sources include standards bodies, vendor blogs, CISA advisories, and community submissions.
            </div>
            <div className="md:text-right">
              Last updated · {lastUpdated}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
