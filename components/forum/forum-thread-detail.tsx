"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CircuitBackground } from "@/components/circuit-background";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { ForumCategory, ForumThread, ForumPost } from "@/lib/types";
import { ROUTES } from "@/lib/routes";
import {
  Eye,
  PushPin,
  Lock,
  ArrowLeft,
  SignIn,
} from "@phosphor-icons/react";

interface ForumThreadDetailProps {
  thread: ForumThread;
  category: ForumCategory;
  posts: ForumPost[];
}

export function ForumThreadDetail({ thread, category, posts: initialPosts }: ForumThreadDetailProps) {
  const { user } = useAuth();
  const [posts, setPosts] = useState(initialPosts);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [viewCount, setViewCount] = useState(thread.view_count || 0);

  // Increment view count on mount
  useEffect(() => {
    async function incrementViews() {
      const supabase = createClient();
      if (!supabase) return;

      await supabase
        .from("forum_threads")
        .update({ view_count: viewCount + 1 })
        .eq("id", thread.id);

      setViewCount((prev) => prev + 1);
    }

    incrementViews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thread.id]);

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

  const handlePostReply = async () => {
    if (!user || !replyContent.trim()) return;

    setSubmitting(true);
    const supabase = createClient();
    if (!supabase) {
      setSubmitting(false);
      return;
    }

    const { data, error } = await supabase
      .from("forum_posts")
      .insert({
        thread_id: thread.id,
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
      .eq("id", thread.id);

    setPosts((prev) => [...prev, data as ForumPost]);
    setReplyContent("");
    setSubmitting(false);
  };

  return (
    <div className="min-h-full">
      <section className="relative py-12 overflow-hidden">
        <CircuitBackground opacity={0.15} />
        <div className="container mx-auto px-4 relative z-10">
          <Link
            href={ROUTES.FORUM_CATEGORY(category.slug)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="size-4" />
            Back to {category.name}
          </Link>

          <div className="flex items-center gap-2 mb-4">
            {thread.is_pinned && (
              <span className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1">
                <PushPin className="size-3" />
                Pinned
              </span>
            )}
            {thread.is_locked && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1">
                <Lock className="size-3" />
                Locked
              </span>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            {thread.title}
          </h1>

          <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
            <span>Started by {thread.author?.display_name || "Anonymous"}</span>
            <span>&middot;</span>
            <span>{formatDate(thread.created_at)}</span>
            <span>&middot;</span>
            <span className="flex items-center gap-1">
              <Eye className="size-4" />
              {viewCount} views
            </span>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          {posts.length === 0 ? (
            <p className="text-muted-foreground">No posts in this thread.</p>
          ) : (
            <div className="space-y-4">
              {posts.map((post, index) => (
                <article
                  key={post.id}
                  className="border border-border bg-card p-6"
                  id={`post-${index + 1}`}
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
                </article>
              ))}
            </div>
          )}

          {/* Reply form */}
          {!thread.is_locked && (
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
                  <Button asChild>
                    <Link href={ROUTES.SIGNIN}>
                      <SignIn className="size-4 mr-2" />
                      Sign In
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}

          {thread.is_locked && (
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
