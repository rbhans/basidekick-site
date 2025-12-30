"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SectionLabel } from "@/components/section-label";
import { CircuitBackground } from "@/components/circuit-background";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { ForumCategory, ForumThread } from "@/lib/types";
import { ROUTES } from "@/lib/routes";
import { validateTitle, validateContent, MAX_LENGTHS, checkRateLimit, getRateLimitReset } from "@/lib/security";
import {
  ChatCircle,
  Eye,
  PushPin,
  Lock,
  Plus,
  ArrowLeft,
  SignIn,
} from "@phosphor-icons/react";

interface ForumCategoryViewProps {
  category: ForumCategory;
  threads: ForumThread[];
}

export function ForumCategoryView({ category, threads: initialThreads }: ForumCategoryViewProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [threads, setThreads] = useState(initialThreads);
  const [showNewThreadForm, setShowNewThreadForm] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [newThreadContent, setNewThreadContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    });
  };

  const handleCreateThread = async () => {
    if (!user) return;
    if (!newThreadTitle.trim() || !newThreadContent.trim()) return;

    // Validate title
    const titleValidation = validateTitle(newThreadTitle, MAX_LENGTHS.THREAD_TITLE);
    if (!titleValidation.valid) {
      setError(titleValidation.error || "Invalid title");
      return;
    }

    // Validate content
    const contentValidation = validateContent(newThreadContent, MAX_LENGTHS.POST_CONTENT);
    if (!contentValidation.valid) {
      setError(contentValidation.error || "Invalid content");
      return;
    }

    // Check rate limit (3 threads per 5 minutes)
    if (!checkRateLimit("forum_thread", 3, 300000)) {
      const resetIn = getRateLimitReset("forum_thread", 300000);
      setError(`Too many threads created. Please wait ${resetIn} seconds.`);
      return;
    }

    setSubmitting(true);
    setError("");
    const supabase = createClient();
    if (!supabase) {
      setSubmitting(false);
      return;
    }

    // Generate slug from title
    const slug = titleValidation.sanitized
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 100);

    // Create the thread
    const { data: threadData, error: threadError } = await supabase
      .from("forum_threads")
      .insert({
        category_id: category.id,
        user_id: user.id,
        title: titleValidation.sanitized,
        slug: `${slug}-${Date.now().toString(36)}`,
      })
      .select(`
        *,
        author:profiles!forum_threads_user_id_fkey(display_name)
      `)
      .single();

    if (threadError || !threadData) {
      setError("Failed to create thread. Please try again.");
      setSubmitting(false);
      return;
    }

    // Create the first post
    await supabase.from("forum_posts").insert({
      thread_id: threadData.id,
      user_id: user.id,
      content: contentValidation.sanitized,
    });

    // Add to list and navigate
    setThreads((prev) => [threadData as ForumThread, ...prev]);
    setNewThreadTitle("");
    setNewThreadContent("");
    setShowNewThreadForm(false);
    setSubmitting(false);

    // Navigate to the new thread
    router.push(ROUTES.FORUM_THREAD(category.slug, threadData.slug));
  };

  return (
    <div className="min-h-full">
      <section className="relative py-12 overflow-hidden">
        <CircuitBackground opacity={0.15} />
        <div className="container mx-auto px-4 relative z-10">
          <Link
            href={ROUTES.FORUM}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="size-4" />
            Back to categories
          </Link>

          <SectionLabel>{category.name.toLowerCase()}</SectionLabel>

          <div className="mt-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                {category.name}
              </h1>
              {category.description && (
                <p className="mt-2 text-muted-foreground">{category.description}</p>
              )}
            </div>
            {user ? (
              <Button onClick={() => setShowNewThreadForm(true)}>
                <Plus className="size-4 mr-2" />
                New Thread
              </Button>
            ) : (
              <Button asChild>
                <Link href={ROUTES.SIGNIN}>
                  <SignIn className="size-4 mr-2" />
                  Sign in to Post
                </Link>
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
                    onChange={(e) => {
                      setNewThreadTitle(e.target.value);
                      if (error) setError("");
                    }}
                    maxLength={MAX_LENGTHS.THREAD_TITLE}
                    placeholder="Thread title..."
                    className="w-full px-4 py-2 bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <div className="mt-1 text-xs text-muted-foreground text-right">
                    {newThreadTitle.length}/{MAX_LENGTHS.THREAD_TITLE}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Content</label>
                  <textarea
                    value={newThreadContent}
                    onChange={(e) => {
                      setNewThreadContent(e.target.value);
                      if (error) setError("");
                    }}
                    maxLength={MAX_LENGTHS.POST_CONTENT}
                    placeholder="Write your post..."
                    className="w-full min-h-[150px] p-4 bg-background border border-border resize-y focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <div className="mt-1 text-xs text-muted-foreground text-right">
                    {newThreadContent.length}/{MAX_LENGTHS.POST_CONTENT}
                  </div>
                </div>
                {error && (
                  <div className="text-sm text-destructive">{error}</div>
                )}
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowNewThreadForm(false);
                      setNewThreadTitle("");
                      setNewThreadContent("");
                      setError("");
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
          {threads.length === 0 ? (
            <div className="border border-dashed border-border p-8 text-center">
              <ChatCircle className="size-10 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                No threads in this category yet.
              </p>
              {user && (
                <Button onClick={() => setShowNewThreadForm(true)}>
                  <Plus className="size-4 mr-2" />
                  Start a Thread
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {threads.map((thread) => (
                <Link
                  key={thread.id}
                  href={ROUTES.FORUM_THREAD(category.slug, thread.slug)}
                  className="block w-full text-left border border-border bg-card p-4 hover:bg-accent/50 transition-colors group"
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
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
