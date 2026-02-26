"use client";

import { useEffect, useState, useCallback } from "react";
import { SiteBadge } from "@/components/site-badge";
import { ArticleCard } from "@/components/article-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { WikiFilterBar, WikiSidebar, SortOption } from "@/components/wiki";
import { createClient } from "@/lib/supabase/client";
import { WikiCategory, WikiArticle, WikiTag } from "@/lib/types";
import { ROUTES } from "@/lib/routes";
import { sanitizeSearchInput } from "@/lib/security";
import { getWikiCategoryColor } from "@/lib/wiki-colors";
import { PageHero } from "@/components/page-hero";
import {
  BookOpen,
  ArrowLeft,
  List,
} from "@phosphor-icons/react";

const ARTICLES_PER_PAGE = 20;

export function WikiView() {
  // Browse state
  const [categories, setCategories] = useState<WikiCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [articles, setArticles] = useState<WikiArticle[]>([]);
  const [articleTags, setArticleTags] = useState<Map<string, WikiTag[]>>(new Map());
  const [totalArticles, setTotalArticles] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [availableTags, setAvailableTags] = useState<WikiTag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const [loading, setLoading] = useState(true);

  // Sort categories by display order (flat list, no tree needed)
  const sortCategories = (cats: WikiCategory[]): WikiCategory[] => {
    return [...cats].sort((a, b) => a.display_order - b.display_order);
  };

  // Get sort order for Supabase query
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

  // Fetch categories and tags on mount
  useEffect(() => {
    async function fetchInitialData() {
      const supabase = createClient();
      if (!supabase) return;

      const [catsRes, tagsRes] = await Promise.all([
        supabase.from("wiki_categories").select("*").order("display_order"),
        supabase.from("wiki_tags").select("*").order("name"),
      ]);

      if (catsRes.data) {
        setCategories(sortCategories(catsRes.data as WikiCategory[]));
      }

      if (tagsRes.data) {
        setAvailableTags(tagsRes.data as WikiTag[]);
      }
    }

    fetchInitialData();
  }, []);

  // Fetch articles for browse view
  const fetchArticles = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    const { column, ascending } = getSortConfig(sortBy);
    const offset = (currentPage - 1) * ARTICLES_PER_PAGE;

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

    // Filter by category if selected
    if (selectedCategoryId) {
      query = query.eq("category_id", selectedCategoryId);
    }

    // Filter by tags if selected
    if (selectedTagIds.length > 0) {
      const { data: articleTagsData } = await supabase
        .from("wiki_article_tags")
        .select("article_id")
        .in("tag_id", selectedTagIds);

      if (articleTagsData && articleTagsData.length > 0) {
        const articleIds = [...new Set(articleTagsData.map((at: { article_id: string }) => at.article_id))];
        query = query.in("id", articleIds);
      } else {
        // No articles match the tags
        setArticles([]);
        setTotalArticles(0);
        setLoading(false);
        return;
      }
    }

    // Apply search (sanitized to prevent SQL injection)
    if (activeSearch) {
      const sanitized = sanitizeSearchInput(activeSearch);
      if (sanitized) {
        query = query.or(
          `title.ilike.%${sanitized}%,content.ilike.%${sanitized}%,summary.ilike.%${sanitized}%`
        );
      }
    }

    // Apply sorting and pagination
    query = query.order(column, { ascending }).range(offset, offset + ARTICLES_PER_PAGE - 1);

    const { data, count, error } = await query;

    if (data && !error) {
      setArticles(data as WikiArticle[]);
      setTotalArticles(count || 0);

      // Fetch tags for these articles
      const articleIds = data.map((a: WikiArticle) => a.id);
      if (articleIds.length > 0) {
        const { data: tagsData } = await supabase
          .from("wiki_article_tags")
          .select("article_id, wiki_tags(*)")
          .in("article_id", articleIds);

        if (tagsData) {
          const tagMap = new Map<string, WikiTag[]>();
          tagsData.forEach((item: { article_id: string; wiki_tags: WikiTag }) => {
            const existing = tagMap.get(item.article_id) || [];
            existing.push(item.wiki_tags);
            tagMap.set(item.article_id, existing);
          });
          setArticleTags(tagMap);
        }
      }
    }

    setLoading(false);
  }, [selectedCategoryId, selectedTagIds, activeSearch, sortBy, currentPage]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleSearch = () => {
    setActiveSearch(searchQuery);
    setCurrentPage(1);
  };

  const handleCategorySelect = (category: WikiCategory | null) => {
    setSelectedCategoryId(category?.id || null);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalArticles / ARTICLES_PER_PAGE);

  return (
      <div className="min-h-full">
        {/* Hero */}
                <PageHero centered>
            <div className="flex justify-center">
              <SiteBadge label="WIKI" icon={BookOpen} />
            </div>
            <h1 className="mt-6 text-3xl md:text-[42px] font-heading font-bold tracking-tight">
              Knowledge Base
            </h1>
            <p className="mt-3 text-muted-foreground max-w-[600px] mx-auto text-lg">
              Articles, guides, and references for building automation professionals.
              Learn from industry experts and community contributors.
            </p>
        </PageHero>

        {/* Main Content */}
        <section className="py-8 pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-20">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Sidebar - Desktop */}
              <div className="hidden lg:block">
                <WikiSidebar
                  categories={categories}
                  popularTags={availableTags.slice(0, 15)}
                  selectedCategoryId={selectedCategoryId}
                  onCategorySelect={handleCategorySelect}
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Mobile Category Info */}
                {selectedCategoryId && (
                  <div className="lg:hidden mb-4 flex items-center gap-2">
                    <button
                      onClick={() => setSelectedCategoryId(null)}
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
                  onSearchChange={setSearchQuery}
                  sortBy={sortBy}
                  onSortChange={(sort) => {
                    setSortBy(sort);
                    setCurrentPage(1);
                  }}
                  availableTags={availableTags}
                  selectedTagIds={selectedTagIds}
                  onTagsChange={(ids) => {
                    setSelectedTagIds(ids);
                    setCurrentPage(1);
                  }}
                  onSearch={handleSearch}
                />

                {/* Active Filters */}
                {(activeSearch || selectedTagIds.length > 0) && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {activeSearch && (
                      <Badge variant="secondary" className="gap-1">
                        Search: {activeSearch}
                        <button
                          onClick={() => {
                            setSearchQuery("");
                            setActiveSearch("");
                          }}
                          className="ml-1 hover:text-foreground"
                        >
                          ×
                        </button>
                      </Badge>
                    )}
                    {selectedTagIds.map((tagId) => {
                      const tag = availableTags.find((t) => t.id === tagId);
                      return tag ? (
                        <Badge key={tagId} variant="secondary" className="gap-1">
                          {tag.name}
                          <button
                            onClick={() =>
                              setSelectedTagIds(selectedTagIds.filter((id) => id !== tagId))
                            }
                            className="ml-1 hover:text-foreground"
                          >
                            ×
                          </button>
                        </Badge>
                      ) : null;
                    })}
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setActiveSearch("");
                        setSelectedTagIds([]);
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Clear all
                    </button>
                  </div>
                )}

                {/* Article Count */}
                <p className="mt-4 mb-4 text-sm text-muted-foreground">
                  {totalArticles} articles available
                </p>

                {/* Section Header */}
                <h3 className="font-mono text-[12px] font-bold text-muted-foreground tracking-[2px] uppercase mb-4">
                  ARTICLES ({totalArticles})
                </h3>

                {/* Article Grid */}
                <div>
                  {loading ? (
                    <div className="p-8 text-center">
                      <p className="text-muted-foreground font-mono">Loading articles...</p>
                    </div>
                  ) : articles.length === 0 ? (
                    <div className="border border-dashed border-border rounded-xl p-8 text-center">
                      <List className="size-10 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No articles found.</p>
                      {(activeSearch || selectedTagIds.length > 0) && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Try adjusting your search or filters.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {articles.map((article) => (
                        <ArticleCard
                          key={article.id}
                          slug={article.slug}
                          category={
                            (article as WikiArticle & { category?: { name: string; slug: string } | null }).category?.name
                          }
                          categorySlug={
                            (article as WikiArticle & { category?: { name: string; slug: string } | null }).category?.slug
                          }
                          title={article.title}
                          description={article.summary || ""}
                          accentColor={getWikiCategoryColor(
                            (article as WikiArticle & { category?: { name: string; slug: string } | null }).category?.name,
                            (article as WikiArticle & { category?: { name: string; slug: string } | null }).category?.slug
                          )}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={totalArticles}
                      itemsPerPage={ARTICLES_PER_PAGE}
                      itemLabel="articles"
                      onPageChange={setCurrentPage}
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
            className="shadow-lg rounded-xl"
            onClick={() => {
              // Could implement a mobile drawer here
            }}
          >
            <BookOpen className="size-5 mr-2" />
            Categories
          </Button>
        </div>
      </div>
  );
}
