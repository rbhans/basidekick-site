"use client";

import { useEffect, useState } from "react";
import { SectionLabel } from "@/components/section-label";
import { CircuitBackground } from "@/components/circuit-background";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { WikiCategory, WikiArticle, WikiTag, WikiComment, VIEW_IDS } from "@/lib/types";
import { getIcon } from "@/lib/icons";
import {
  BookOpen,
  MagnifyingGlass,
  CaretRight,
  ArrowLeft,
  Tag,
  Eye,
  Calendar,
  User,
  ChatCircle,
  SignIn,
} from "@phosphor-icons/react";

interface WikiViewProps {
  onNavigate: (viewId: string) => void;
}

type WikiViewState =
  | { view: "home" }
  | { view: "category"; categoryId: string; categoryName: string; categorySlug: string }
  | { view: "article"; articleId: string; articleSlug: string }
  | { view: "tag"; tagSlug: string; tagName: string }
  | { view: "search"; query: string };

export function WikiView({ onNavigate }: WikiViewProps) {
  const { user } = useAuth();
  const [viewState, setViewState] = useState<WikiViewState>({ view: "home" });
  const [categories, setCategories] = useState<WikiCategory[]>([]);
  const [articles, setArticles] = useState<WikiArticle[]>([]);
  const [currentArticle, setCurrentArticle] = useState<WikiArticle | null>(null);
  const [articleTags, setArticleTags] = useState<WikiTag[]>([]);
  const [comments, setComments] = useState<WikiComment[]>([]);
  const [popularTags, setPopularTags] = useState<WikiTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Comment form state
  const [commentContent, setCommentContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  // Fetch categories and popular tags for home view
  useEffect(() => {
    async function fetchHomeData() {
      const supabase = createClient();
      if (!supabase) return;

      const [catsRes, tagsRes] = await Promise.all([
        supabase.from("wiki_categories").select("*").order("display_order"),
        supabase.from("wiki_tags").select("*").limit(15),
      ]);

      if (catsRes.data) {
        const tree = buildCategoryTree(catsRes.data as WikiCategory[]);
        setCategories(tree);
      }

      if (tagsRes.data) {
        setPopularTags(tagsRes.data as WikiTag[]);
      }

      setLoading(false);
    }

    if (viewState.view === "home") {
      fetchHomeData();
    }
  }, [viewState.view]);

  // Fetch articles for category
  useEffect(() => {
    async function fetchCategoryArticles() {
      if (viewState.view !== "category") return;

      setLoading(true);
      const supabase = createClient();
      if (!supabase) return;

      // Get all subcategory IDs too
      const { data: allCats } = await supabase
        .from("wiki_categories")
        .select("id, parent_id");

      const categoryIds = [viewState.categoryId];
      if (allCats) {
        // Find direct children
        allCats.forEach((cat: { id: string; parent_id: string | null }) => {
          if (cat.parent_id === viewState.categoryId) {
            categoryIds.push(cat.id);
          }
        });
      }

      const { data, error } = await supabase
        .from("wiki_articles")
        .select(`
          *,
          author:profiles!wiki_articles_author_id_fkey(display_name),
          category:wiki_categories!wiki_articles_category_id_fkey(name, slug)
        `)
        .in("category_id", categoryIds)
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (data && !error) {
        setArticles(data as WikiArticle[]);
      }
      setLoading(false);
    }

    fetchCategoryArticles();
  }, [viewState]);

  // Fetch article detail
  useEffect(() => {
    async function fetchArticle() {
      if (viewState.view !== "article") return;

      setLoading(true);
      const supabase = createClient();
      if (!supabase) return;

      // Fetch article
      const { data: articleData } = await supabase
        .from("wiki_articles")
        .select(`
          *,
          author:profiles!wiki_articles_author_id_fkey(display_name),
          category:wiki_categories!wiki_articles_category_id_fkey(name, slug)
        `)
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
          setArticleTags(tags);
        }

        // Fetch comments
        const { data: commentsData } = await supabase
          .from("wiki_comments")
          .select(`
            *,
            author:profiles!wiki_comments_user_id_fkey(display_name)
          `)
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

      // Get tag ID
      const { data: tagData } = await supabase
        .from("wiki_tags")
        .select("id")
        .eq("slug", viewState.tagSlug)
        .single();

      if (!tagData) {
        setLoading(false);
        return;
      }

      // Get article IDs with this tag
      const { data: articleTagsData } = await supabase
        .from("wiki_article_tags")
        .select("article_id")
        .eq("tag_id", tagData.id);

      if (!articleTagsData || articleTagsData.length === 0) {
        setArticles([]);
        setLoading(false);
        return;
      }

      const articleIds = articleTagsData.map((at: { article_id: string }) => at.article_id);

      const { data } = await supabase
        .from("wiki_articles")
        .select(`
          *,
          author:profiles!wiki_articles_author_id_fkey(display_name),
          category:wiki_categories!wiki_articles_category_id_fkey(name, slug)
        `)
        .in("id", articleIds)
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (data) {
        setArticles(data as WikiArticle[]);
      }
      setLoading(false);
    }

    fetchTagArticles();
  }, [viewState]);

  // Search articles
  useEffect(() => {
    async function searchArticles() {
      if (viewState.view !== "search") return;

      setLoading(true);
      const supabase = createClient();
      if (!supabase) return;

      const { data } = await supabase
        .from("wiki_articles")
        .select(`
          *,
          author:profiles!wiki_articles_author_id_fkey(display_name),
          category:wiki_categories!wiki_articles_category_id_fkey(name, slug)
        `)
        .eq("is_published", true)
        .or(`title.ilike.%${viewState.query}%,content.ilike.%${viewState.query}%,summary.ilike.%${viewState.query}%`)
        .order("view_count", { ascending: false })
        .limit(50);

      if (data) {
        setArticles(data as WikiArticle[]);
      }
      setLoading(false);
    }

    searchArticles();
  }, [viewState]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setViewState({ view: "search", query: searchQuery.trim() });
    }
  };

  const navigateToCategory = (cat: WikiCategory) => {
    setViewState({
      view: "category",
      categoryId: cat.id,
      categoryName: cat.name,
      categorySlug: cat.slug,
    });
  };

  const navigateToArticle = (article: WikiArticle) => {
    setViewState({
      view: "article",
      articleId: article.id,
      articleSlug: article.slug,
    });
  };

  const navigateToTag = (tag: WikiTag) => {
    setViewState({
      view: "tag",
      tagSlug: tag.slug,
      tagName: tag.name,
    });
  };

  const goHome = () => {
    setViewState({ view: "home" });
    setSearchQuery("");
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
      .select(`
        *,
        author:profiles!wiki_comments_user_id_fkey(display_name)
      `)
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

  // Render category card
  const renderCategoryCard = (cat: WikiCategory, isChild = false) => (
    <button
      key={cat.id}
      onClick={() => navigateToCategory(cat)}
      className={`w-full text-left border border-border bg-card p-5 hover:bg-accent/50 transition-colors group ${
        isChild ? "ml-6" : ""
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="size-10 bg-primary/10 flex items-center justify-center shrink-0">
          {cat.icon_name ? (
            getIcon(cat.icon_name, "size-5 text-primary")
          ) : (
            <BookOpen className="size-5 text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold group-hover:text-primary transition-colors">
            {cat.name}
          </h3>
          {cat.description && (
            <p className="text-sm text-muted-foreground truncate">
              {cat.description}
            </p>
          )}
        </div>
        <CaretRight className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </button>
  );

  // Render article card
  const renderArticleCard = (article: WikiArticle) => (
    <button
      key={article.id}
      onClick={() => navigateToArticle(article)}
      className="w-full text-left border border-border bg-card p-5 hover:bg-accent/50 transition-colors group"
    >
      <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
        {article.title}
      </h3>
      {article.summary && (
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
          {article.summary}
        </p>
      )}
      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
        {article.category && (
          <span className="flex items-center gap-1">
            <BookOpen className="size-3" />
            {article.category.name}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Calendar className="size-3" />
          {formatDate(article.created_at)}
        </span>
        <span className="flex items-center gap-1">
          <Eye className="size-3" />
          {article.view_count}
        </span>
      </div>
    </button>
  );

  // Home view
  if (viewState.view === "home") {
    return (
      <div className="min-h-full">
        <section className="relative py-12 overflow-hidden">
          <CircuitBackground opacity={0.15} />
          <div className="container mx-auto px-4 relative z-10">
            <SectionLabel>wiki</SectionLabel>

            <h1 className="mt-6 text-3xl md:text-4xl font-semibold tracking-tight">
              Knowledge Base
            </h1>
            <p className="mt-2 text-muted-foreground max-w-xl">
              Browse guides, troubleshooting articles, and best practices for building automation systems.
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} className="mt-6 max-w-lg">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search articles..."
                    className="w-full pl-10 pr-4 py-2 bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <Button type="submit">Search</Button>
              </div>
            </form>
          </div>
        </section>

        {/* Categories */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-semibold mb-4">Categories</h2>

            {loading ? (
              <p className="text-muted-foreground font-mono">Loading...</p>
            ) : categories.length === 0 ? (
              <p className="text-muted-foreground">No categories yet.</p>
            ) : (
              <div className="space-y-3">
                {categories.map((cat) => (
                  <div key={cat.id}>
                    {renderCategoryCard(cat)}
                    {cat.children && cat.children.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {cat.children
                          .sort((a, b) => a.display_order - b.display_order)
                          .map((child) => renderCategoryCard(child, true))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Popular Tags */}
        {popularTags.length > 0 && (
          <section className="py-8 bg-card/30">
            <div className="container mx-auto px-4">
              <h2 className="text-xl font-semibold mb-4">Popular Tags</h2>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => navigateToTag(tag)}
                    className="px-3 py-1 text-sm border border-border hover:bg-accent transition-colors"
                  >
                    <Tag className="size-3 inline mr-1" />
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    );
  }

  // Category view
  if (viewState.view === "category") {
    return (
      <div className="min-h-full">
        <section className="relative py-12 overflow-hidden">
          <CircuitBackground opacity={0.15} />
          <div className="container mx-auto px-4 relative z-10">
            <button
              onClick={goHome}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="size-4" />
              Back to Wiki
            </button>

            <SectionLabel>{viewState.categorySlug}</SectionLabel>

            <h1 className="mt-6 text-3xl md:text-4xl font-semibold tracking-tight">
              {viewState.categoryName}
            </h1>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4">
            {loading ? (
              <p className="text-muted-foreground font-mono">Loading articles...</p>
            ) : articles.length === 0 ? (
              <div className="border border-dashed border-border p-8 text-center">
                <BookOpen className="size-10 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No articles in this category yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {articles.map(renderArticleCard)}
              </div>
            )}
          </div>
        </section>
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
              onClick={goHome}
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
            ) : articles.length === 0 ? (
              <p className="text-muted-foreground">No articles with this tag.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {articles.map(renderArticleCard)}
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }

  // Search view
  if (viewState.view === "search") {
    return (
      <div className="min-h-full">
        <section className="relative py-12 overflow-hidden">
          <CircuitBackground opacity={0.15} />
          <div className="container mx-auto px-4 relative z-10">
            <button
              onClick={goHome}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="size-4" />
              Back to Wiki
            </button>

            <h1 className="mt-6 text-3xl md:text-4xl font-semibold tracking-tight">
              Search: &quot;{viewState.query}&quot;
            </h1>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4">
            {loading ? (
              <p className="text-muted-foreground font-mono">Searching...</p>
            ) : articles.length === 0 ? (
              <p className="text-muted-foreground">No articles found.</p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  {articles.length} result{articles.length !== 1 ? "s" : ""} found
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {articles.map(renderArticleCard)}
                </div>
              </>
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
            onClick={goHome}
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

              {articleTags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {articleTags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => navigateToTag(tag)}
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
              <h2 className="text-xl font-semibold">
                Comments ({comments.length})
              </h2>
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
                <p className="text-muted-foreground mb-4">
                  Sign in to leave a comment.
                </p>
                <Button onClick={() => onNavigate(VIEW_IDS.SIGNIN)}>
                  <SignIn className="size-4 mr-2" />
                  Sign In
                </Button>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
