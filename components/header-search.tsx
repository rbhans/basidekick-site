"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MagnifyingGlass, Command, X, Spinner, Article, ChatCircle, Translate, WarningCircle, Gauge } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { ROUTES } from "@/lib/routes";
import type { BabelData, AtlasData } from "@/lib/types";

// Babel data URL
const BABEL_DATA_URL = process.env.NODE_ENV === "development"
  ? "/data/babel/index.json"
  : "https://raw.githubusercontent.com/rbhans/bas-babel/main/dist/index.json";

// Cache babel data to avoid refetching on every search
let babelDataCache: BabelData | null = null;

// Atlas data URL
const ATLAS_DATA_URL = process.env.NODE_ENV === "development"
  ? "/data/atlas/index.json"
  : "https://raw.githubusercontent.com/rbhans/bas-atlas/main/dist/index.json";

// Cache atlas data to avoid refetching on every search
let atlasDataCache: AtlasData | null = null;

interface SearchResult {
  id: string;
  title: string;
  type: "babel" | "atlas" | "article" | "thread";
  href: string;
  subtitle?: string;
}

export function HeaderSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchError, setSearchError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    const currentQuery = query.trim();
    if (!currentQuery) {
      setResults([]);
      setIsLoading(false);
      setSearchError(null);
      return;
    }

    setIsLoading(true);
    setSearchError(null);

    const timer = setTimeout(async () => {
      // Capture query at start to detect staleness
      const searchQuery = currentQuery;
      const supabase = createClient();
      const searchResults: SearchResult[] = [];
      const lowerQuery = searchQuery.toLowerCase();
      let hasError = false;

      try {
        // Search Babel entries (from external JSON)
        if (!babelDataCache) {
          try {
            const response = await fetch(BABEL_DATA_URL);
            if (response.ok) {
              babelDataCache = await response.json();
            }
          } catch (e) {
            console.error("[Search] Failed to fetch Babel data:", e);
          }
        }

        if (babelDataCache) {
          // Search equipment entries
          const matchingEquipment = babelDataCache.equipment
            .filter(e =>
              e.name.toLowerCase().includes(lowerQuery) ||
              e.abbreviation?.toLowerCase().includes(lowerQuery) ||
              e.full_name?.toLowerCase().includes(lowerQuery) ||
              e.aliases?.common?.some(a => a.toLowerCase().includes(lowerQuery)) ||
              e.aliases?.abbreviated?.some(a => a.toLowerCase().includes(lowerQuery)) ||
              e.aliases?.verbose?.some(a => a.toLowerCase().includes(lowerQuery))
            )
            .slice(0, 3);

          searchResults.push(
            ...matchingEquipment.map(e => ({
              id: `equipment-${e.id}`,
              title: e.abbreviation ? `${e.abbreviation} - ${e.name}` : e.name,
              type: "babel" as const,
              href: ROUTES.BABEL_ENTRY(e.id),
              subtitle: e.category,
            }))
          );

          // Search point entries
          const matchingPoints = babelDataCache.points
            .filter(p =>
              p.concept.id?.toLowerCase().includes(lowerQuery) ||
              p.concept.name?.toLowerCase().includes(lowerQuery) ||
              p.aliases?.common?.some(a => a.toLowerCase().includes(lowerQuery)) ||
              p.aliases?.abbreviated?.some(a => a.toLowerCase().includes(lowerQuery)) ||
              p.aliases?.verbose?.some(a => a.toLowerCase().includes(lowerQuery))
            )
            .slice(0, 3);

          searchResults.push(
            ...matchingPoints.map(p => ({
              id: `point-${p.concept.id}`,
              title: `${p.concept.id} - ${p.concept.name}`,
              type: "babel" as const,
              href: `${ROUTES.BABEL}?q=${encodeURIComponent(p.concept.id)}`,
              subtitle: p.concept.category,
            }))
          );

        }

        // Search Atlas entries (equipment database)
        if (!atlasDataCache) {
          try {
            const response = await fetch(ATLAS_DATA_URL);
            if (response.ok) {
              atlasDataCache = await response.json();
            }
          } catch (e) {
            console.error("[Search] Failed to fetch Atlas data:", e);
          }
        }

        if (atlasDataCache) {
          const brandById = new Map(atlasDataCache.brands.map(b => [b.id, b]));
          const typeById = new Map(atlasDataCache.types.map(t => [t.id, t]));

          const matchingModels = atlasDataCache.models
            .filter(m => {
              const brandName = brandById.get(m.brand)?.name || "";
              const typeName = typeById.get(m.type)?.name || "";
              const inModel = m.name.toLowerCase().includes(lowerQuery) || m.id.toLowerCase().includes(lowerQuery) || m.slug?.toLowerCase().includes(lowerQuery);
              const inNumbers = (m.model_numbers || []).some(n => n.toLowerCase().includes(lowerQuery));
              const inBrand = brandName.toLowerCase().includes(lowerQuery);
              const inType = typeName.toLowerCase().includes(lowerQuery);
              return inModel || inNumbers || inBrand || inType;
            })
            .slice(0, 3);

          searchResults.push(
            ...matchingModels.map(m => {
              const brand = brandById.get(m.brand);
              const type = typeById.get(m.type);
              const brandSlug = brand?.slug || brand?.id || m.brand;
              const typeSlug = type?.slug || type?.id || m.type;
              return {
                id: `atlas-model-${m.id}`,
                title: m.name,
                type: "atlas" as const,
                href: ROUTES.EQUIPMENT_MODEL(brandSlug, typeSlug, m.slug || m.id),
                subtitle: brand?.name || "",
              };
            })
          );

          const matchingBrands = atlasDataCache.brands
            .filter(b =>
              b.name.toLowerCase().includes(lowerQuery) ||
              b.id.toLowerCase().includes(lowerQuery) ||
              b.slug?.toLowerCase().includes(lowerQuery)
            )
            .slice(0, 2);

          searchResults.push(
            ...matchingBrands.map(b => ({
              id: `atlas-brand-${b.id}`,
              title: b.name,
              type: "atlas" as const,
              href: ROUTES.EQUIPMENT_BRAND(b.slug || b.id),
              subtitle: "Brand",
            }))
          );
        }

        // Search wiki articles (using is_published boolean)
        const { data: articles, error: articlesError } = await supabase
          .from("wiki_articles")
          .select("id, title, slug, summary, category:wiki_categories(name)")
          .ilike("title", `%${searchQuery}%`)
          .eq("is_published", true)
          .limit(5);

        if (articlesError) {
          console.error("[Search] Wiki articles error:", articlesError);
          hasError = true;
        } else if (articles) {
          searchResults.push(
            ...articles.map((a: { id: string; title: string; slug: string; summary: string | null; category: { name: string } | null }) => ({
              id: a.id,
              title: a.title,
              type: "article" as const,
              href: ROUTES.WIKI_ARTICLE(a.slug),
              subtitle: a.category?.name || (a.summary ? a.summary.slice(0, 50) + (a.summary.length > 50 ? "..." : "") : undefined),
            }))
          );
        }

        // Search forum threads
        const { data: threads, error: threadsError } = await supabase
          .from("forum_threads")
          .select("id, title, slug, category:forum_categories(name, slug)")
          .ilike("title", `%${searchQuery}%`)
          .limit(5);

        if (threadsError) {
          console.error("[Search] Forum threads error:", threadsError);
          hasError = true;
        } else if (threads) {
          searchResults.push(
            ...threads.map((t: { id: string; title: string; slug: string; category: { name: string; slug: string } | null }) => ({
              id: t.id,
              title: t.title,
              type: "thread" as const,
              href: ROUTES.FORUM_THREAD(t.category?.slug || "general", t.slug),
              subtitle: t.category?.name || "Forum",
            }))
          );
        }

        // Only update if query hasn't changed (prevent race condition)
        if (query.trim() === searchQuery) {
          setResults(searchResults);
          setSearchError(hasError ? "Some results may be incomplete" : null);
        }
      } catch (error) {
        console.error("[Search] Search error:", error);
        if (query.trim() === searchQuery) {
          setSearchError("Search failed. Please try again.");
        }
      } finally {
        if (query.trim() === searchQuery) {
          setIsLoading(false);
        }
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" && results.length > 0) {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp" && results.length > 0) {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      router.push(results[selectedIndex].href);
      setIsOpen(false);
      setQuery("");
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Cmd+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const getIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "babel":
        return <Translate className="size-4 text-amber-500" />;
      case "atlas":
        return <Gauge className="size-4 text-sky-500" />;
      case "article":
        return <Article className="size-4 text-blue-500" />;
      case "thread":
        return <ChatCircle className="size-4 text-emerald-500" />;
    }
  };

  const activeResultId = results[selectedIndex] ? `search-result-${results[selectedIndex].id}` : undefined;

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-expanded={isOpen && !!query.trim()}
          aria-controls="search-results"
          aria-autocomplete="list"
          aria-activedescendant={activeResultId}
          className="w-[180px] md:w-[240px] h-8 pl-9 pr-16 bg-background border border-border rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary transition-all"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-muted-foreground">
          {query && (
            <button
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="p-0.5 hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="size-3" />
            </button>
          )}
          <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 bg-muted rounded text-[10px]">
            <Command className="size-2.5" />K
          </kbd>
        </div>
      </div>

      {/* Results dropdown */}
      {isOpen && query.trim() && (
        <div
          id="search-results"
          role="listbox"
          className="absolute top-full mt-2 left-0 right-0 md:w-[320px] bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50"
        >
          {isLoading ? (
            <div className="p-4 flex items-center justify-center text-muted-foreground">
              <Spinner className="size-4 animate-spin mr-2" />
              <span className="text-sm">Searching...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="py-1">
              {/* Error banner if partial failure */}
              {searchError && (
                <div className="px-3 py-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 flex items-center gap-2">
                  <WarningCircle className="size-3.5" />
                  {searchError}
                </div>
              )}

              {/* Babel Terms Section */}

              {/* Atlas Equipment Section */}
              {results.filter(r => r.type === "atlas").length > 0 && (
                <>
                  <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-medium bg-muted/30 border-b border-border">
                    BAS Atlas
                  </div>
                  {results.filter(r => r.type === "atlas").map((result) => {
                    const globalIndex = results.findIndex(r => r.id === result.id);
                    return (
                      <Link
                        key={`${result.type}-${result.id}`}
                        id={`search-result-${result.id}`}
                        role="option"
                        aria-selected={globalIndex === selectedIndex}
                        href={result.href}
                        onClick={() => {
                          setIsOpen(false);
                          setQuery("");
                        }}
                        className={cn(
                          "flex items-start gap-3 px-3 py-2 hover:bg-muted/50 transition-colors",
                          globalIndex === selectedIndex && "bg-muted/50"
                        )}
                      >
                        <div className="mt-0.5">{getIcon(result.type)}</div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium truncate block">{result.title}</span>
                          {result.subtitle && (
                            <p className="text-xs text-muted-foreground truncate mt-0.5">{result.subtitle}</p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </>
              )}

              {results.filter(r => r.type === "babel").length > 0 && (
                <>
                  <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-medium bg-muted/30 border-b border-border">
                    Babel Terms
                  </div>
                  {results.filter(r => r.type === "babel").map((result) => {
                    const globalIndex = results.findIndex(r => r.id === result.id);
                    return (
                      <Link
                        key={`${result.type}-${result.id}`}
                        id={`search-result-${result.id}`}
                        role="option"
                        aria-selected={globalIndex === selectedIndex}
                        href={result.href}
                        onClick={() => {
                          setIsOpen(false);
                          setQuery("");
                        }}
                        className={cn(
                          "flex items-start gap-3 px-3 py-2 hover:bg-muted/50 transition-colors",
                          globalIndex === selectedIndex && "bg-muted/50"
                        )}
                      >
                        <div className="mt-0.5">{getIcon(result.type)}</div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium truncate block">{result.title}</span>
                          {result.subtitle && (
                            <p className="text-xs text-muted-foreground truncate mt-0.5">{result.subtitle}</p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </>
              )}

              {/* Wiki Articles Section */}
              {results.filter(r => r.type === "article").length > 0 && (
                <>
                  <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-medium bg-muted/30 border-b border-border">
                    Wiki Articles
                  </div>
                  {results.filter(r => r.type === "article").map((result) => {
                    const globalIndex = results.findIndex(r => r.id === result.id);
                    return (
                      <Link
                        key={`${result.type}-${result.id}`}
                        id={`search-result-${result.id}`}
                        role="option"
                        aria-selected={globalIndex === selectedIndex}
                        href={result.href}
                        onClick={() => {
                          setIsOpen(false);
                          setQuery("");
                        }}
                        className={cn(
                          "flex items-start gap-3 px-3 py-2 hover:bg-muted/50 transition-colors",
                          globalIndex === selectedIndex && "bg-muted/50"
                        )}
                      >
                        <div className="mt-0.5">{getIcon(result.type)}</div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium truncate block">{result.title}</span>
                          {result.subtitle && (
                            <p className="text-xs text-muted-foreground truncate mt-0.5">{result.subtitle}</p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </>
              )}

              {/* Forum Threads Section */}
              {results.filter(r => r.type === "thread").length > 0 && (
                <>
                  <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-medium bg-muted/30 border-b border-border">
                    Forum Discussions
                  </div>
                  {results.filter(r => r.type === "thread").map((result) => {
                    const globalIndex = results.findIndex(r => r.id === result.id);
                    return (
                      <Link
                        key={`${result.type}-${result.id}`}
                        id={`search-result-${result.id}`}
                        role="option"
                        aria-selected={globalIndex === selectedIndex}
                        href={result.href}
                        onClick={() => {
                          setIsOpen(false);
                          setQuery("");
                        }}
                        className={cn(
                          "flex items-start gap-3 px-3 py-2 hover:bg-muted/50 transition-colors",
                          globalIndex === selectedIndex && "bg-muted/50"
                        )}
                      >
                        <div className="mt-0.5">{getIcon(result.type)}</div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium truncate block">{result.title}</span>
                          {result.subtitle && (
                            <p className="text-xs text-muted-foreground truncate mt-0.5">{result.subtitle}</p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </>
              )}
            </div>
          ) : searchError ? (
            <div className="p-4 text-center">
              <WarningCircle className="size-5 text-destructive mx-auto mb-2" />
              <p className="text-sm text-destructive">{searchError}</p>
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No results found for &quot;{query}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
