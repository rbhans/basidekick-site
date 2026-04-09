"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { WikiFilterBar, WikiSidebar, SortOption } from "@/components/wiki";
import { WikiCategoryBlock } from "@/components/wiki/wiki-category-block";
import { WikiCollectionCard } from "@/components/wiki/wiki-collection-card";
import { WikiArticleRow } from "@/components/wiki/wiki-article-row";
import { createClient } from "@/lib/supabase/client";
import { WikiCategory, WikiArticle, WikiFacetGroup, WikiCollection } from "@/lib/types";
import { sanitizeSearchInput } from "@/lib/security";
import { getWikiCategoryColor } from "@/lib/wiki-colors";
import { ROUTES } from "@/lib/routes";
import {
  parseWikiFilters,
  serializeWikiFilters,
  hasActiveFilters,
  WikiFilterState,
  PARAM_TO_GROUP_SLUG,
} from "@/lib/wiki-filters";
import {
  BookOpen,
  ArrowLeft,
  List,
  X,
  Clock,
} from "@phosphor-icons/react";

const ARTICLES_PER_PAGE = 20;

export function WikiView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse filter state from URL
  const filters = useMemo(() => parseWikiFilters(searchParams), [searchParams]);

  // Draft search: null means "use filters.q", non-null means user is typing
  const [draftSearch, setDraftSearch] = useState<string | null>(null);
  const searchQuery = draftSearch ?? filters.q;

  // Data
  const [categories, setCategories] = useState<WikiCategory[]>([]);
  const [facetGroups, setFacetGroups] = useState<WikiFacetGroup[]>([]);
  const [featuredCollections, setFeaturedCollections] = useState<WikiCollection[]>([]);
  const [articles, setArticles] = useState<WikiArticle[]>([]);
  const [recentArticles, setRecentArticles] = useState<WikiArticle[]>([]);
  const [totalArticles, setTotalArticles] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  // Update URL params without navigation
  const updateFilters = useCallback(
    (updates: Partial<WikiFilterState>) => {
      const newState = { ...filters, ...updates };
      // Reset page when changing filters (unless page itself is being set)
      if (!("page" in updates)) {
        newState.page = 1;
      }
      const params = serializeWikiFilters(newState);
      const queryString = params.toString();
      router.replace(`/wiki${queryString ? `?${queryString}` : ""}`, { scroll: false });
    },
    [filters, router]
  );

  // Build selectedFacets map for sidebar/filter bar
  const selectedFacets = useMemo(() => {
    const result: Record<string, string[]> = {};
    if (filters.platform.length) result.platform = filters.platform;
    if (filters.protocol.length) result.protocol = filters.protocol;
    if (filters.domain.length) result.domain = filters.domain;
    if (filters.topic.length) result.topic = filters.topic;
    if (filters.format.length) result.format = filters.format;
    return result;
  }, [filters]);

  const activeFilterCount = useMemo(() => {
    return (
      filters.platform.length +
      filters.protocol.length +
      filters.domain.length +
      filters.topic.length +
      filters.format.length
    );
  }, [filters]);

  const isLanding = !hasActiveFilters(filters);

  // Sort config for Supabase
  const getSortConfig = (sort: SortOption): { column: string; ascending: boolean } => {
    switch (sort) {
      case "oldest":
        return { column: "created_at", ascending: true };
      case "popular":
        return { column: "view_count", ascending: false };
      case "alphabetical":
        return { column: "title", ascending: true };
      case "newest":
      default:
        return { column: "created_at", ascending: false };
    }
  };

  // Fetch categories, facet groups, collections on mount
  useEffect(() => {
    async function fetchInitialData() {
      const supabase = createClient();
      if (!supabase) return;

      const [catsRes, groupsRes, collectionsRes, recentRes] = await Promise.all([
        supabase.from("wiki_categories").select("*").order("display_order"),
        supabase
          .from("wiki_facet_groups")
          .select("*, facets:wiki_facets(*)")
          .order("display_order"),
        supabase
          .from("wiki_collections")
          .select("*, article_count:wiki_collection_articles(count)")
          .eq("is_featured", true)
          .order("display_order"),
        supabase
          .from("wiki_articles")
          .select(
            `*, author:profiles!wiki_articles_author_id_fkey(display_name), category:wiki_categories!wiki_articles_category_id_fkey(name, slug)`
          )
          .eq("is_published", true)
          .order("updated_at", { ascending: false })
          .limit(4),
      ]);

      if (catsRes.data) {
        setCategories(
          [...(catsRes.data as WikiCategory[])].sort((a, b) => a.display_order - b.display_order)
        );
      }

      if (groupsRes.data) {
        const groups = (groupsRes.data as WikiFacetGroup[]).map((g) => ({
          ...g,
          facets: (g.facets || []).sort(
            (a, b) => a.display_order - b.display_order
          ),
        }));
        setFacetGroups(groups);
      }

      if (collectionsRes.data) {
        const cols = (collectionsRes.data as (WikiCollection & { article_count: { count: number }[] })[]).map((c) => ({
          ...c,
          article_count: c.article_count?.[0]?.count ?? 0,
        }));
        setFeaturedCollections(cols as WikiCollection[]);
      }

      if (recentRes.data) {
        setRecentArticles(recentRes.data as WikiArticle[]);
      }

      setInitialDataLoaded(true);
    }

    fetchInitialData();
  }, []);

  // Fetch articles for filtered view
  useEffect(() => {
    if (!initialDataLoaded) return;

    async function fetchArticles() {
      setLoading(true);
      const supabase = createClient();
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { column, ascending } = getSortConfig(filters.sort);
      const offset = (filters.page - 1) * ARTICLES_PER_PAGE;

      // Build the query
      let query = supabase
        .from("wiki_articles")
        .select(
          `
          *,
          author:profiles!wiki_articles_author_id_fkey(display_name),
          category:wiki_categories!wiki_articles_category_id_fkey(name, slug)
        `,
          { count: "exact" }
        )
        .eq("is_published", true);

      // Filter by category slug
      if (filters.category) {
        const cat = categories.find((c) => c.slug === filters.category);
        if (cat) {
          query = query.eq("category_id", cat.id);
        }
      }

      // Collect facet slugs for filtering (AND semantics: article must match every selected facet)
      const allFacetSlugs: string[] = [
        ...filters.platform,
        ...filters.protocol,
        ...filters.domain,
        ...filters.topic,
        ...filters.format,
      ];

      if (allFacetSlugs.length > 0) {
        // Resolve slugs → IDs
        const { data: facetData } = await supabase
          .from("wiki_facets")
          .select("id, slug")
          .in("slug", allFacetSlugs);

        if (facetData && facetData.length > 0) {
          const facetIds = facetData.map((f: { id: string }) => f.id);

          // For AND semantics: fetch all article_id/facet_id pairs, then keep
          // only articles that appear for every selected facet.
          const { data: articleFacetsData } = await supabase
            .from("wiki_article_facets")
            .select("article_id, facet_id")
            .in("facet_id", facetIds);

          if (articleFacetsData && articleFacetsData.length > 0) {
            // Count how many of the selected facets each article matches
            const countByArticle: Record<string, number> = {};
            for (const { article_id } of articleFacetsData) {
              countByArticle[article_id] = (countByArticle[article_id] || 0) + 1;
            }
            // Only keep articles matching ALL selected facets
            const articleIds = Object.entries(countByArticle)
              .filter(([, count]) => count >= facetIds.length)
              .map(([id]) => id);

            if (articleIds.length > 0) {
              query = query.in("id", articleIds);
            } else {
              setArticles([]);
              setTotalArticles(0);
              setLoading(false);
              return;
            }
          } else {
            setArticles([]);
            setTotalArticles(0);
            setLoading(false);
            return;
          }
        }
      }

      // Apply full-text search
      if (filters.q) {
        const sanitized = sanitizeSearchInput(filters.q);
        if (sanitized) {
          // Use textSearch for full-text search with websearch config
          query = query.textSearch("search_vector", sanitized, {
            type: "websearch",
            config: "english",
          });
        }
      }

      // Apply sorting and pagination
      query = query.order(column, { ascending }).range(offset, offset + ARTICLES_PER_PAGE - 1);

      const { data, count, error } = await query;

      if (data && !error) {
        setArticles(data as WikiArticle[]);
        setTotalArticles(count || 0);
      }

      setLoading(false);
    }

    fetchArticles();
  }, [initialDataLoaded, filters, categories]);

  // Handlers
  const handleSearch = () => {
    updateFilters({ q: searchQuery });
    setDraftSearch(null); // Reset draft — URL is now the source of truth
  };

  const handleCategorySelect = (slug: string | null) => {
    updateFilters({ category: slug || undefined } as Partial<WikiFilterState>);
  };

  const handleFacetToggle = (paramName: string, slug: string) => {
    const key = paramName as keyof Pick<WikiFilterState, "platform" | "protocol" | "domain" | "topic" | "format">;
    const current = filters[key] || [];
    const next = current.includes(slug)
      ? current.filter((s) => s !== slug)
      : [...current, slug];
    updateFilters({ [key]: next });
  };

  const handleClearAll = () => {
    setDraftSearch(null);
    router.replace("/wiki", { scroll: false });
  };

  const totalPages = Math.ceil(totalArticles / ARTICLES_PER_PAGE);

  return (
    <div className="min-h-full">
      {/* Title block strip */}
      <div className="title-block">
        <div className="field">
          <span className="field-label">Drawing</span>
          <span className="field-value">Wiki</span>
        </div>
        <div className="field">
          <span className="field-label">Title</span>
          <span className="field-value">Field Guide &amp; Reference</span>
        </div>
        <div className="field">
          <span className="field-label">Articles</span>
          <span className="field-value tabular-nums">{totalArticles}</span>
        </div>
        <div className="field hidden md:flex">
          <span className="field-label">Categories</span>
          <span className="field-value tabular-nums">{categories.length}</span>
        </div>
        <div className="spacer" />
        <div className="field">
          <span className="field-label">Drawn by</span>
          <span className="field-value">R.H.</span>
        </div>
      </div>

      {/* Tagline */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-16 pt-14 pb-4 max-w-[1100px]">
        <p className="font-heading italic text-[17px] text-muted-foreground text-center leading-[1.5]">
          Field-tested guides on grounding, sequencing, commissioning, and the things nobody writes down.
        </p>
      </div>

      {/* Landing Sections — shown only when no filters are active */}
      {isLanding && initialDataLoaded && (
        <section className="py-10 pb-2">
          <div className="container mx-auto px-4 sm:px-6 lg:px-16 max-w-[1100px] space-y-12">
            {/* Browse by Category */}
            {categories.length > 0 && (
              <div>
                <div className="flex items-baseline gap-3.5 pb-3.5 border-b border-foreground mb-5">
                  <span className="font-mono text-[11px] text-accent tracking-[1px]">01 /</span>
                  <h2 className="font-heading font-semibold text-[22px] leading-none text-foreground">
                    Browse by category
                  </h2>
                  <span className="ml-auto font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground tabular-nums">
                    {categories.length} {categories.length === 1 ? "category" : "categories"}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {categories.map((cat) => (
                    <WikiCategoryBlock
                      key={cat.id}
                      name={cat.name}
                      slug={cat.slug}
                      count={cat.article_count}
                      onClick={() => handleCategorySelect(cat.slug)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Featured Collections */}
            {featuredCollections.length > 0 && (
              <div>
                <div className="flex items-baseline gap-3.5 pb-3.5 border-b border-foreground mb-5">
                  <span className="font-mono text-[11px] text-accent tracking-[1px]">02 /</span>
                  <h2 className="font-heading font-semibold text-[22px] leading-none text-foreground">
                    Featured collections
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {featuredCollections.map((col) => (
                    <WikiCollectionCard key={col.id} collection={col} />
                  ))}
                </div>
              </div>
            )}

            {/* Popular Platforms */}
            {(() => {
              const platformGroup = facetGroups.find((g) => g.slug === "platform_vendor");
              const platforms = platformGroup?.facets?.filter((f) => f.article_count > 0) || [];
              if (platforms.length === 0) return null;
              return (
                <div>
                  <div className="flex items-baseline gap-3.5 pb-3.5 border-b border-foreground mb-5">
                    <span className="font-mono text-[11px] text-accent tracking-[1px]">03 /</span>
                    <h2 className="font-heading font-semibold text-[22px] leading-none text-foreground">
                      Popular platforms
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {platforms.map((facet) => (
                      <button
                        key={facet.id}
                        onClick={() => updateFilters({ platform: [facet.slug] })}
                        className="font-mono text-[11px] uppercase tracking-[1.2px] text-muted-foreground border border-border bg-card px-3 py-1.5 rounded-sm hover:border-foreground hover:text-foreground transition-colors"
                      >
                        {facet.name}
                        <span className="ml-2 text-accent tabular-nums">{facet.article_count}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Recently Updated */}
            {recentArticles.length > 0 && (
              <div>
                <div className="flex items-baseline gap-3.5 pb-3.5 border-b border-foreground mb-0">
                  <span className="font-mono text-[11px] text-accent tracking-[1px]">04 /</span>
                  <h2 className="font-heading font-semibold text-[22px] leading-none text-foreground">
                    Recently updated
                  </h2>
                  <span className="ml-auto font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Latest
                  </span>
                </div>
                <div>
                  {recentArticles.map((article) => (
                    <WikiArticleRow key={article.id} article={article} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Main Content — Sidebar + Filter Bar + Results */}
      <section className="py-8 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-20">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar - Desktop */}
            <div className="hidden lg:block">
              <WikiSidebar
                categories={categories}
                facetGroups={facetGroups}
                selectedCategorySlug={filters.category}
                selectedFacets={selectedFacets}
                onCategorySelect={handleCategorySelect}
                onFacetToggle={handleFacetToggle}
                onClearFacets={handleClearAll}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Mobile Category Info */}
              {filters.category && (
                <div className="lg:hidden mb-4 flex items-center gap-2">
                  <button
                    onClick={() => handleCategorySelect(null)}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="size-4 inline mr-1" />
                    All Articles
                  </button>
                </div>
              )}

              {/* Filter Bar */}
              <WikiFilterBar
                searchQuery={searchQuery}
                onSearchChange={setDraftSearch}
                sortBy={filters.sort}
                onSortChange={(sort) => updateFilters({ sort })}
                facetGroups={facetGroups}
                selectedFacets={selectedFacets}
                onFacetToggle={handleFacetToggle}
                onClearFacets={handleClearAll}
                onSearch={handleSearch}
                activeFilterCount={activeFilterCount}
              />

              {/* Active Filters */}
              {(filters.q || activeFilterCount > 0) && (
                <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[1.1px]">
                  {filters.q && (
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground border border-border bg-card px-2 py-1 rounded-sm">
                      <span className="text-accent">Search:</span>
                      <span className="text-foreground normal-case tracking-normal text-[11px]">{filters.q}</span>
                      <button
                        onClick={() => {
                          setDraftSearch(null);
                          updateFilters({ q: "" });
                        }}
                        className="ml-0.5 hover:text-accent"
                        aria-label="Clear search"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {Object.entries(selectedFacets).flatMap(([paramName, slugs]) =>
                    slugs.map((slug) => {
                      const groupSlug = PARAM_TO_GROUP_SLUG[paramName];
                      const group = facetGroups.find((g) => g.slug === groupSlug);
                      const facet = group?.facets?.find((f) => f.slug === slug);
                      return (
                        <span
                          key={`${paramName}-${slug}`}
                          className="inline-flex items-center gap-1.5 text-foreground border border-border bg-card px-2 py-1 rounded-sm"
                        >
                          {facet?.name || slug}
                          <button
                            onClick={() => handleFacetToggle(paramName, slug)}
                            className="ml-0.5 hover:text-accent"
                            aria-label="Remove filter"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })
                  )}
                  <button
                    onClick={handleClearAll}
                    className="text-muted-foreground hover:text-accent transition-colors"
                  >
                    Clear all
                  </button>
                </div>
              )}

              {/* Section heading with count */}
              <div className="flex items-baseline gap-3.5 pb-3.5 border-b border-foreground mt-6 mb-0">
                <span className="font-mono text-[11px] text-accent tracking-[1px]">A /</span>
                <h3 className="font-heading font-semibold text-[20px] leading-none text-foreground">
                  Articles
                </h3>
                <span className="ml-auto font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground tabular-nums">
                  {totalArticles} total · showing {articles.length}
                </span>
              </div>

              {/* Article list */}
              <div>
                {loading ? (
                  <div className="py-16 text-center font-heading italic text-[18px] text-muted-foreground">
                    Loading articles…
                  </div>
                ) : articles.length === 0 ? (
                  <div className="py-20 text-center font-heading italic text-[18px] text-muted-foreground">
                    <List className="w-7 h-7 text-muted-foreground/50 mx-auto mb-3" />
                    Nothing matches these filters.
                    {(filters.q || activeFilterCount > 0) && (
                      <p className="text-[13px] not-italic font-sans mt-2">
                        Try loosening your search.
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    {articles.map((article) => (
                      <WikiArticleRow key={article.id} article={article} />
                    ))}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={filters.page}
                    totalPages={totalPages}
                    totalItems={totalArticles}
                    itemsPerPage={ARTICLES_PER_PAGE}
                    itemLabel="articles"
                    onPageChange={(page) => updateFilters({ page })}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed bottom-4 right-4 z-40">
        <Button
          size="lg"
          className="shadow-lg rounded-md"
          onClick={() => setIsMobileOpen(true)}
        >
          <BookOpen className="size-5 mr-2" />
          Filters
        </Button>
      </div>

      {/* Mobile Sidebar Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-foreground/50"
            onClick={() => setIsMobileOpen(false)}
          />
          {/* Panel */}
          <div className="fixed right-0 top-0 h-full w-80 z-50 bg-background border-l border-border overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-semibold">Filters</h2>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-1 hover:bg-muted rounded-md"
                aria-label="Close filters"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="p-4">
              <WikiSidebar
                categories={categories}
                facetGroups={facetGroups}
                selectedCategorySlug={filters.category}
                selectedFacets={selectedFacets}
                onCategorySelect={(slug) => {
                  handleCategorySelect(slug);
                  setIsMobileOpen(false);
                }}
                onFacetToggle={(paramName, slug) => {
                  handleFacetToggle(paramName, slug);
                }}
                onClearFacets={() => {
                  handleClearAll();
                  setIsMobileOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
