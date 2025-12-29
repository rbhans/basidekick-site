"use client";

import { useEffect, useState } from "react";
import { SectionLabel } from "@/components/section-label";
import { CircuitBackground } from "@/components/circuit-background";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { ForumCategory, ForumThread, ForumPost, VIEW_IDS } from "@/lib/types";
import { getIcon } from "@/lib/icons";
import {
  Chats,
  ChatCircle,
  Eye,
  PushPin,
  Lock,
  CaretRight,
  Plus,
  ArrowLeft,
  SignIn,
} from "@phosphor-icons/react";

interface ForumViewProps {
  onNavigate: (viewId: string) => void;
}

type ForumViewState =
  | { view: "categories" }
  | { view: "threads"; categoryId: string; categoryName: string }
  | { view: "thread"; threadId: string; threadTitle: string };

export function ForumView({ onNavigate }: ForumViewProps) {
  const { user, loading: authLoading } = useAuth();
  const [viewState, setViewState] = useState<ForumViewState>({ view: "categories" });
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [currentThread, setCurrentThread] = useState<ForumThread | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [showNewThreadForm, setShowNewThreadForm] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [newThreadContent, setNewThreadContent] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      const supabase = createClient();
      if (!supabase) return;

      const { data, error } = await supabase
        .from("forum_categories")
        .select("*")
        .order("display_order");

      if (data && !error) {
        setCategories(data as ForumCategory[]);
      }
      setLoading(false);
    }

    if (viewState.view === "categories") {
      fetchCategories();
    }
  }, [viewState.view]);

  // Fetch threads for a category
  useEffect(() => {
    async function fetchThreads() {
      if (viewState.view !== "threads") return;

      setLoading(true);
      const supabase = createClient();
      if (!supabase) return;

      const { data, error } = await supabase
        .from("forum_threads")
        .select(`
          *,
          author:profiles!forum_threads_user_id_fkey(display_name)
        `)
        .eq("category_id", viewState.categoryId)
        .order("is_pinned", { ascending: false })
        .order("last_post_at", { ascending: false, nullsFirst: false });

      if (data && !error) {
        setThreads(data as ForumThread[]);
      }
      setLoading(false);
    }

    fetchThreads();
  }, [viewState]);

  // Fetch posts for a thread
  useEffect(() => {
    async function fetchPosts() {
      if (viewState.view !== "thread") return;

      setLoading(true);
      const supabase = createClient();
      if (!supabase) return;

      // Fetch thread details
      const { data: threadData } = await supabase
        .from("forum_threads")
        .select(`
          *,
          author:profiles!forum_threads_user_id_fkey(display_name)
        `)
        .eq("id", viewState.threadId)
        .single();

      if (threadData) {
        setCurrentThread(threadData as ForumThread);

        // Increment view count
        await supabase
          .from("forum_threads")
          .update({ view_count: (threadData.view_count || 0) + 1 })
          .eq("id", viewState.threadId);
      }

      // Fetch posts
      const { data: postsData, error } = await supabase
        .from("forum_posts")
        .select(`
          *,
          author:profiles!forum_posts_user_id_fkey(display_name)
        `)
        .eq("thread_id", viewState.threadId)
        .order("created_at");

      if (postsData && !error) {
        setPosts(postsData as ForumPost[]);
      }
      setLoading(false);
    }

    fetchPosts();
  }, [viewState]);

  const navigateToCategory = (category: ForumCategory) => {
    setViewState({
      view: "threads",
      categoryId: category.id,
      categoryName: category.name
    });
  };

  const navigateToThread = (thread: ForumThread) => {
    setViewState({
      view: "thread",
      threadId: thread.id,
      threadTitle: thread.title
    });
  };

  const goBack = () => {
    if (viewState.view === "thread") {
      // Find which category this thread belongs to
      if (currentThread) {
        const category = categories.find(c => c.id === currentThread.category_id);
        if (category) {
          setViewState({
            view: "threads",
            categoryId: category.id,
            categoryName: category.name
          });
          return;
        }
      }
    }
    setViewState({ view: "categories" });
  };

  // Create a new thread
  const handleCreateThread = async () => {
    if (!user || viewState.view !== "threads") return;
    if (!newThreadTitle.trim() || !newThreadContent.trim()) return;

    setSubmitting(true);
    const supabase = createClient();
    if (!supabase) {
      setSubmitting(false);
      return;
    }

    // Generate slug from title
    const slug = newThreadTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 100);

    // Create the thread
    const { data: threadData, error: threadError } = await supabase
      .from("forum_threads")
      .insert({
        category_id: viewState.categoryId,
        user_id: user.id,
        title: newThreadTitle.trim(),
        slug: `${slug}-${Date.now().toString(36)}`,
      })
      .select()
      .single();

    if (threadError || !threadData) {
      console.error("Failed to create thread:", threadError);
      setSubmitting(false);
      return;
    }

    // Create the first post
    const { error: postError } = await supabase
      .from("forum_posts")
      .insert({
        thread_id: threadData.id,
        user_id: user.id,
        content: newThreadContent.trim(),
      });

    if (postError) {
      console.error("Failed to create post:", postError);
    }

    // Reset form and navigate to the new thread
    setNewThreadTitle("");
    setNewThreadContent("");
    setShowNewThreadForm(false);
    setSubmitting(false);

    setViewState({
      view: "thread",
      threadId: threadData.id,
      threadTitle: threadData.title,
    });
  };

  // Post a reply
  const handlePostReply = async () => {
    if (!user || viewState.view !== "thread") return;
    if (!replyContent.trim()) return;

    setSubmitting(true);
    const supabase = createClient();
    if (!supabase) {
      setSubmitting(false);
      return;
    }

    const { data, error } = await supabase
      .from("forum_posts")
      .insert({
        thread_id: viewState.threadId,
        user_id: user.id,
        content: replyContent.trim(),
      })
      .select(`
        *,
        author:profiles!forum_posts_user_id_fkey(display_name)
      `)
      .single();

    if (error || !data) {
      console.error("Failed to post reply:", error);
      setSubmitting(false);
      return;
    }

    // Update last_post_at on the thread
    await supabase
      .from("forum_threads")
      .update({ last_post_at: new Date().toISOString() })
      .eq("id", viewState.threadId);

    // Add the new post to the list
    setPosts((prev) => [...prev, data as ForumPost]);
    setReplyContent("");
    setSubmitting(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Categories view
  if (viewState.view === "categories") {
    return (
      <div className="min-h-full">
        <section className="relative py-12 overflow-hidden">
          <CircuitBackground opacity={0.15} />
          <div className="container mx-auto px-4 relative z-10">
            <SectionLabel>forum</SectionLabel>

            <div className="mt-6 flex items-start justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                  Community Forum
                </h1>
                <p className="mt-2 text-muted-foreground max-w-xl">
                  Discuss BAS automation, share tips, and get help from the community.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4">
            {loading ? (
              <p className="text-muted-foreground font-mono">Loading categories...</p>
            ) : categories.length === 0 ? (
              <div className="border border-dashed border-border p-8 text-center">
                <Chats className="size-10 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No forum categories yet. Check back soon!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => navigateToCategory(category)}
                    className="w-full text-left border border-border bg-card p-5 hover:bg-accent/50 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="size-10 bg-primary/10 flex items-center justify-center shrink-0">
                        {category.icon_name ? (
                          getIcon(category.icon_name, "size-5 text-primary")
                        ) : (
                          <ChatCircle className="size-5 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold group-hover:text-primary transition-colors">
                          {category.name}
                        </h3>
                        {category.description && (
                          <p className="text-sm text-muted-foreground truncate">
                            {category.description}
                          </p>
                        )}
                      </div>
                      <CaretRight className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }

  // Threads view
  if (viewState.view === "threads") {
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
              Back to categories
            </button>

            <SectionLabel>{viewState.categoryName.toLowerCase()}</SectionLabel>

            <div className="mt-6 flex items-start justify-between gap-4">
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                {viewState.categoryName}
              </h1>
              {user ? (
                <Button onClick={() => setShowNewThreadForm(true)}>
                  <Plus className="size-4 mr-2" />
                  New Thread
                </Button>
              ) : (
                <Button onClick={() => onNavigate(VIEW_IDS.SIGNIN)}>
                  <SignIn className="size-4 mr-2" />
                  Sign in to Post
                </Button>
              )}
            </div>

            {/* New Thread Form */}
            {showNewThreadForm && (
              <div className="mt-6 border border-border bg-card p-6">
                <h3 className="text-lg font-semibold mb-4">Start a New Thread</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">Title</label>
                    <input
                      type="text"
                      value={newThreadTitle}
                      onChange={(e) => setNewThreadTitle(e.target.value)}
                      placeholder="Thread title..."
                      className="w-full px-4 py-2 bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">Content</label>
                    <textarea
                      value={newThreadContent}
                      onChange={(e) => setNewThreadContent(e.target.value)}
                      placeholder="Write your post..."
                      className="w-full min-h-[150px] p-4 bg-background border border-border resize-y focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowNewThreadForm(false);
                        setNewThreadTitle("");
                        setNewThreadContent("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateThread}
                      disabled={submitting || !newThreadTitle.trim() || !newThreadContent.trim()}
                    >
                      {submitting ? "Creating..." : "Create Thread"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4">
            {loading ? (
              <p className="text-muted-foreground font-mono">Loading threads...</p>
            ) : threads.length === 0 ? (
              <div className="border border-dashed border-border p-8 text-center">
                <ChatCircle className="size-10 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  No threads in this category yet.
                </p>
                {user && (
                  <Button>
                    <Plus className="size-4 mr-2" />
                    Start a Thread
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {threads.map((thread) => (
                  <button
                    key={thread.id}
                    onClick={() => navigateToThread(thread)}
                    className="w-full text-left border border-border bg-card p-4 hover:bg-accent/50 transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center gap-1 pt-1 text-muted-foreground">
                        {thread.is_pinned && <PushPin className="size-4 text-primary" />}
                        {thread.is_locked && <Lock className="size-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold group-hover:text-primary transition-colors truncate">
                          {thread.title}
                        </h3>
                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{thread.author?.display_name || "Anonymous"}</span>
                          <span>&middot;</span>
                          <span>{formatDate(thread.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground shrink-0">
                        <div className="flex items-center gap-1">
                          <ChatCircle className="size-4" />
                          <span>{thread.reply_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="size-4" />
                          <span>{thread.view_count}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }

  // Thread detail view
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
            Back to threads
          </button>

          <div className="flex items-center gap-2 mb-4">
            {currentThread?.is_pinned && (
              <span className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1">
                <PushPin className="size-3" />
                Pinned
              </span>
            )}
            {currentThread?.is_locked && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1">
                <Lock className="size-3" />
                Locked
              </span>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            {viewState.threadTitle}
          </h1>

          {currentThread && (
            <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
              <span>Started by {currentThread.author?.display_name || "Anonymous"}</span>
              <span>&middot;</span>
              <span>{formatDate(currentThread.created_at)}</span>
              <span>&middot;</span>
              <span className="flex items-center gap-1">
                <Eye className="size-4" />
                {currentThread.view_count} views
              </span>
            </div>
          )}
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          {loading ? (
            <p className="text-muted-foreground font-mono">Loading posts...</p>
          ) : posts.length === 0 ? (
            <p className="text-muted-foreground">No posts in this thread.</p>
          ) : (
            <div className="space-y-4">
              {posts.map((post, index) => (
                <div
                  key={post.id}
                  className="border border-border bg-card p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 bg-primary/10 flex items-center justify-center font-mono text-sm text-primary">
                        {(post.author?.display_name || "A")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold">
                          {post.author?.display_name || "Anonymous"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(post.created_at)} at {formatTime(post.created_at)}
                          {post.is_edited && " (edited)"}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">
                      #{index + 1}
                    </span>
                  </div>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <p className="whitespace-pre-wrap">{post.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reply form */}
          {!currentThread?.is_locked && (
            <div className="mt-8 pt-8 border-t border-border">
              {user ? (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Reply</h3>
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="w-full min-h-[150px] p-4 bg-background border border-border resize-y focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Write your reply..."
                  />
                  <div className="mt-4 flex justify-end">
                    <Button
                      onClick={handlePostReply}
                      disabled={submitting || !replyContent.trim()}
                    >
                      {submitting ? "Posting..." : "Post Reply"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">
                    Sign in to reply to this thread.
                  </p>
                  <Button onClick={() => onNavigate(VIEW_IDS.SIGNIN)}>
                    <SignIn className="size-4 mr-2" />
                    Sign In
                  </Button>
                </div>
              )}
            </div>
          )}

          {currentThread?.is_locked && (
            <div className="mt-8 pt-8 border-t border-border text-center">
              <p className="text-muted-foreground flex items-center justify-center gap-2">
                <Lock className="size-4" />
                This thread is locked and cannot receive new replies.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
