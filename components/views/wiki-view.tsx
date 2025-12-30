"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { SectionLabel } from "@/components/section-label";
import { CircuitBackground } from "@/components/circuit-background";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { WikiArticleRow, WikiFilterBar, WikiSidebar, SortOption } from "@/components/wiki";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { WikiCategory, WikiArticle, WikiTag, WikiComment } from "@/lib/types";
import { ROUTES } from "@/lib/routes";
import {
  BookOpen,
  ArrowLeft,
  Tag,
  Eye,
  Calendar,
  User,
  ChatCircle,
  SignIn,
  List,
} from "@phosphor-icons/react";

type WikiViewState =
  | { view: "browse" }
  | { view: "article"; articleId: string; articleSlug: string }
  | { view: "tag"; tagSlug: string; tagName: string };

const ARTICLES_PER_PAGE = 20;

export function WikiView() {
  const { user } = useAuth();
  const [viewState, setViewState] = useState<WikiViewState>({ view: "browse" });

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

  // Article detail state
  const [currentArticle, setCurrentArticle] = useState<WikiArticle | null>(null);
  const [currentArticleTags, setCurrentArticleTags] = useState<WikiTag[]>([]);
  const [comments, setComments] = useState<WikiComment[]>([]);
  const [commentContent, setCommentContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Tag view state (when clicking a specific tag)
  const [tagViewArticles, setTagViewArticles] = useState<WikiArticle[]>([]);

  const [loading, setLoading] = useState(true);

  // Build category tree from flat list
  const buildCategoryTree = (cats: WikiCategory[]): WikiCategory[] => {
    const map = new Map<string, WikiCategory>();
    const roots: WikiCategory[] = [];

    cats.forEach((cat) => {
      map.set(cat.id, { ...cat, children: [] });
    });

    cats.forEach((cat) => {
      const node = map.get(cat.id)!;
      if (cat.parent_id && map.has(cat.parent_id)) {
        map.get(cat.parent_id)!.children!.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots.sort((a, b) => a.display_order - b.display_order);
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
        const tree = buildCategoryTree(catsRes.data as WikiCategory[]);
        setCategories(tree);
      }

      if (tagsRes.data) {
        setAvailableTags(tagsRes.data as WikiTag[]);
      }
    }

    fetchInitialData();
  }, []);

  // Fetch articles for browse view
  const fetchArticles = useCallback(async () => {
    if (viewState.view !== "browse") return;

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
      // Get category and its children
      const { data: allCats } = await supabase
        .from("wiki_categories")
        .select("id, parent_id");

      const categoryIds = [selectedCategoryId];
      if (allCats) {
        allCats.forEach((cat: { id: string; parent_id: string | null }) => {
          if (cat.parent_id === selectedCategoryId) {
            categoryIds.push(cat.id);
          }
        });
      }
      query = query.in("category_id", categoryIds);
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

    // Apply search
    if (activeSearch) {
      query = query.or(
        `title.ilike.%${activeSearch}%,content.ilike.%${activeSearch}%,summary.ilike.%${activeSearch}%`
      );
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
  }, [viewState.view, selectedCategoryId, selectedTagIds, activeSearch, sortBy, currentPage]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // Fetch article detail
  useEffect(() => {
    async function fetchArticle() {
      if (viewState.view !== "article") return;

      setLoading(true);
      const supabase = createClient();
      if (!supabase) return;

      const { data: articleData } = await supabase
        .from("wiki_articles")
        .select(
          `
          *,
          author:profiles!wiki_articles_author_id_fkey(display_name),
          category:wiki_categories!wiki_articles_category_id_fkey(name, slug)
        `
        )
        .eq("id", viewState.articleId)
        .single();

      if (articleData) {
        setCurrentArticle(articleData as WikiArticle);

        // Increment view count
        await supabase
          .from("wiki_articles")
          .update({ view_count: (articleData.view_count || 0) + 1 })
          .eq("id", viewState.articleId);

        // Fetch tags
        const { data: tagData } = await supabase
          .from("wiki_article_tags")
          .select("tag_id, wiki_tags(*)")
          .eq("article_id", viewState.articleId);

        if (tagData) {
          const tags = tagData.map((t: { wiki_tags: WikiTag }) => t.wiki_tags);
          setCurrentArticleTags(tags);
        }

        // Fetch comments
        const { data: commentsData } = await supabase
          .from("wiki_comments")
          .select(
            `
            *,
            author:profiles!wiki_comments_user_id_fkey(display_name)
          `
          )
          .eq("article_id", viewState.articleId)
          .order("created_at");

        if (commentsData) {
          setComments(commentsData as WikiComment[]);
        }
      }

      setLoading(false);
    }

    fetchArticle();
  }, [viewState]);

  // Fetch articles by tag
  useEffect(() => {
    async function fetchTagArticles() {
      if (viewState.view !== "tag") return;

      setLoading(true);
      const supabase = createClient();
      if (!supabase) return;

      const { data: tagData } = await supabase
        .from("wiki_tags")
        .select("id")
        .eq("slug", viewState.tagSlug)
        .single();

      if (!tagData) {
        setLoading(false);
        return;
      }

      const { data: articleTagsData } = await supabase
        .from("wiki_article_tags")
        .select("article_id")
        .eq("tag_id", tagData.id);

      if (!articleTagsData || articleTagsData.length === 0) {
        setTagViewArticles([]);
        setLoading(false);
        return;
      }

      const articleIds = articleTagsData.map((at: { article_id: string }) => at.article_id);

      const { data } = await supabase
        .from("wiki_articles")
        .select(
          `
          *,
          author:profiles!wiki_articles_author_id_fkey(display_name),
          category:wiki_categories!wiki_articles_category_id_fkey(name, slug)
        `
        )
        .in("id", articleIds)
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (data) {
        setTagViewArticles(data as WikiArticle[]);
      }
      setLoading(false);
    }

    fetchTagArticles();
  }, [viewState]);

  const handleSearch = () => {
    setActiveSearch(searchQuery);
    setCurrentPage(1);
  };

  const handleCategorySelect = (category: WikiCategory | null) => {
    setSelectedCategoryId(category?.id || null);
    setCurrentPage(1);
  };

  const handleTagSelect = (tag: WikiTag) => {
    setViewState({ view: "tag", tagSlug: tag.slug, tagName: tag.name });
  };

  const navigateToArticle = (article: WikiArticle) => {
    setViewState({
      view: "article",
      articleId: article.id,
      articleSlug: article.slug,
    });
  };

  const goBack = () => {
    setViewState({ view: "browse" });
    setSearchQuery("");
    setActiveSearch("");
  };

  const handlePostComment = async () => {
    if (!user || viewState.view !== "article" || !commentContent.trim()) return;

    setSubmitting(true);
    const supabase = createClient();
    if (!supabase) {
      setSubmitting(false);
      return;
    }

    const { data, error } = await supabase
      .from("wiki_comments")
      .insert({
        article_id: viewState.articleId,
        user_id: user.id,
        content: commentContent.trim(),
      })
      .select(
        `
        *,
        author:profiles!wiki_comments_user_id_fkey(display_name)
      `
      )
      .single();

    if (data && !error) {
      setComments((prev) => [...prev, data as WikiComment]);
      setCommentContent("");
    }
    setSubmitting(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const totalPages = Math.ceil(totalArticles / ARTICLES_PER_PAGE);

  // Browse view (main wiki page)
  if (viewState.view === "browse") {
    return (
      <div className="min-h-full">
        {/* Header */}
        <section className="relative py-12 overflow-hidden">
          <CircuitBackground opacity={0.15} />
          <div className="container mx-auto px-4 relative z-10">
            <SectionLabel>wiki</SectionLabel>
            <h1 className="mt-6 text-3xl md:text-4xl font-semibold tracking-tight">
              Knowledge Base
            </h1>
            <p className="mt-2 text-muted-foreground max-w-xl">
              Browse guides, troubleshooting articles, and best practices for building
              automation systems.
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Sidebar - Desktop */}
              <div className="hidden lg:block">
                <WikiSidebar
                  categories={categories}
                  popularTags={availableTags.slice(0, 15)}
                  selectedCategoryId={selectedCategoryId}
                  onCategorySelect={handleCategorySelect}
                  onTagSelect={handleTagSelect}
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

                {/* Article List */}
                <div className="mt-4">
                  {loading ? (
                    <div className="p-8 text-center">
                      <p className="text-muted-foreground font-mono">Loading articles...</p>
                    </div>
                  ) : articles.length === 0 ? (
                    <div className="border border-dashed border-border p-8 text-center">
                      <List className="size-10 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No articles found.</p>
                      {(activeSearch || selectedTagIds.length > 0) && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Try adjusting your search or filters.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {articles.map((article) => (
                        <WikiArticleRow
                          key={article.id}
                          article={article}
                          tags={articleTags.get(article.id)}
                          onClick={() => navigateToArticle(article)}
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
            className="shadow-lg"
            onClick={() => {
              // Could implement a mobile drawer here
              // For now, just show categories in a simple way
            }}
          >
            <BookOpen className="size-5 mr-2" />
            Categories
          </Button>
        </div>
      </div>
    );
  }

  // Tag view
  if (viewState.view === "tag") {
    return (
      <div className="min-h-full">
        <section className="relative py-12 overflow-hidden">
          <CircuitBackground opacity={0.15} />
          <div className="container mx-auto px-4 relative z-10">
            <button
              onClick={goBack}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="size-4" />
              Back to Wiki
            </button>

            <div className="flex items-center gap-2 mt-6">
              <Tag className="size-6 text-primary" />
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                {viewState.tagName}
              </h1>
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4">
            {loading ? (
              <p className="text-muted-foreground font-mono">Loading articles...</p>
            ) : tagViewArticles.length === 0 ? (
              <p className="text-muted-foreground">No articles with this tag.</p>
            ) : (
              <div className="space-y-2">
                {tagViewArticles.map((article) => (
                  <WikiArticleRow
                    key={article.id}
                    article={article}
                    onClick={() => navigateToArticle(article)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }

  // Article detail view
  return (
    <div className="min-h-full">
      <section className="relative py-12 overflow-hidden">
        <CircuitBackground opacity={0.15} />
        <div className="container mx-auto px-4 relative z-10">
          <button
            onClick={goBack}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="size-4" />
            Back to Wiki
          </button>

          {currentArticle && (
            <>
              {currentArticle.category && (
                <Badge variant="outline" className="mb-4">
                  {currentArticle.category.name}
                </Badge>
              )}

              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                {currentArticle.title}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="size-4" />
                  {currentArticle.author?.display_name || "Anonymous"}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="size-4" />
                  {formatDate(currentArticle.created_at)}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="size-4" />
                  {currentArticle.view_count} views
                </span>
              </div>

              {currentArticleTags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {currentArticleTags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleTagSelect(tag)}
                      className="px-2 py-0.5 text-xs border border-border hover:bg-accent transition-colors"
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Article Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {loading ? (
            <p className="text-muted-foreground font-mono">Loading...</p>
          ) : currentArticle ? (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div className="whitespace-pre-wrap">{currentArticle.content}</div>
            </div>
          ) : (
            <p className="text-muted-foreground">Article not found.</p>
          )}
        </div>
      </section>

      {/* Comments */}
      {currentArticle && (
        <section className="py-8 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-6">
              <ChatCircle className="size-5 text-primary" />
              <h2 className="text-xl font-semibold">Comments ({comments.length})</h2>
            </div>

            {comments.length === 0 ? (
              <p className="text-muted-foreground mb-6">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              <div className="space-y-4 mb-8">
                {comments.map((comment) => (
                  <div key={comment.id} className="border border-border bg-card p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="size-8 bg-primary/10 flex items-center justify-center text-sm font-mono text-primary">
                        {(comment.author?.display_name || "A")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">
                          {comment.author?.display_name || "Anonymous"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(comment.created_at)}
                          {comment.is_edited && " (edited)"}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Comment form */}
            {user ? (
              <div>
                <h3 className="text-lg font-semibold mb-3">Add a Comment</h3>
                <textarea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="Write your comment..."
                  className="w-full min-h-[100px] p-4 bg-background border border-border resize-y focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="mt-3 flex justify-end">
                  <Button
                    onClick={handlePostComment}
                    disabled={submitting || !commentContent.trim()}
                  >
                    {submitting ? "Posting..." : "Post Comment"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-border">
                <p className="text-muted-foreground mb-4">Sign in to leave a comment.</p>
                <Button asChild>
                  <Link href={ROUTES.SIGNIN}>
                    <SignIn className="size-4 mr-2" />
                    Sign In
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
