"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircuitBackground } from "@/components/circuit-background";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { ForumCategory, ForumThread, ForumPost } from "@/lib/types";
import { ROUTES } from "@/lib/routes";
import { validateContent, MAX_LENGTHS, checkRateLimit, getRateLimitReset } from "@/lib/security";
import { PostActionsMenu } from "@/components/forum/post-actions-menu";
import { DeletePostDialog } from "@/components/forum/delete-post-dialog";
import { ForumImageUpload } from "@/components/forum/forum-image-upload";
import { MarkdownContent } from "@/components/markdown-content";
import {
  Eye,
  PushPin,
  Lock,
  ArrowLeft,
  SignIn,
  BookBookmark,
  Check,
  X,
} from "@phosphor-icons/react";
import { UserAvatar } from "@/components/user-avatar";

interface ForumThreadDetailProps {
  thread: ForumThread;
  category: ForumCategory;
  posts: ForumPost[];
}

export function ForumThreadDetail({ thread, category, posts: initialPosts }: ForumThreadDetailProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [posts, setPosts] = useState(initialPosts);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  // Use server-rendered view count - don't update optimistically to avoid race conditions
  const viewCount = thread.view_count || 0;
  const hasIncrementedRef = useRef(false);

  // Wiki suggestion state
  const [hasSuggested, setHasSuggested] = useState(false);
  const [suggestingWiki, setSuggestingWiki] = useState(false);
  const [suggestionError, setSuggestionError] = useState("");

  // Edit/delete state
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editError, setEditError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [deletePostIndex, setDeletePostIndex] = useState<number>(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Increment view count on mount (with session deduplication)
  useEffect(() => {
    async function incrementViews() {
      // Prevent double-counting in strict mode or re-renders
      if (hasIncrementedRef.current) return;
      hasIncrementedRef.current = true;

      // Session-based deduplication - only count once per thread per session
      const viewedKey = `viewed_forum_${thread.id}`;
      if (typeof window !== "undefined" && sessionStorage.getItem(viewedKey)) {
        return;
      }

      const supabase = createClient();
      if (!supabase) return;

      // Use server-rendered value for the increment to minimize race condition window
      await supabase
        .from("forum_threads")
        .update({ view_count: (thread.view_count || 0) + 1 })
        .eq("id", thread.id);

      // Mark as viewed for this session
      if (typeof window !== "undefined") {
        sessionStorage.setItem(viewedKey, "1");
      }
    }

    incrementViews();
  }, [thread.id, thread.view_count]);

  // Check if user has already suggested this thread as wiki
  useEffect(() => {
    async function checkExistingSuggestion() {
      if (!user) return;

      const supabase = createClient();
      if (!supabase) return;

      const { data } = await supabase
        .from("wiki_suggestions")
        .select("id")
        .eq("thread_id", thread.id)
        .eq("suggested_by", user.id)
        .single();

      if (data) {
        setHasSuggested(true);
      }
    }

    checkExistingSuggestion();
  }, [thread.id, user]);

  const handleSuggestWiki = async () => {
    if (!user) return;

    // Rate limit: 5 suggestions per hour
    if (!checkRateLimit("wiki_suggest", 5, 3600000)) {
      const resetIn = Math.ceil(getRateLimitReset("wiki_suggest", 3600000) / 60);
      setSuggestionError(`Too many suggestions. Please wait ${resetIn} minutes.`);
      return;
    }

    setSuggestingWiki(true);
    setSuggestionError("");

    const supabase = createClient();
    if (!supabase) {
      setSuggestingWiki(false);
      setSuggestionError("Failed to suggest. Please try again.");
      return;
    }

    const { error: insertError } = await supabase
      .from("wiki_suggestions")
      .insert({
        thread_id: thread.id,
        suggested_by: user.id,
      });

    if (insertError) {
      setSuggestingWiki(false);
      // Handle unique constraint violation gracefully
      if (insertError.code === "23505") {
        setHasSuggested(true);
        return;
      }
      setSuggestionError("Failed to suggest. Please try again.");
      return;
    }

    setHasSuggested(true);
    setSuggestingWiki(false);
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

  const handlePostReply = async () => {
    if (!user || !replyContent.trim()) return;

    // Validate content
    const validation = validateContent(replyContent, MAX_LENGTHS.POST_CONTENT);
    if (!validation.valid) {
      setError(validation.error || "Invalid reply");
      return;
    }

    // Check rate limit (10 posts per minute)
    if (!checkRateLimit("forum_post", 10, 60000)) {
      const resetIn = getRateLimitReset("forum_post", 60000);
      setError(`Too many posts. Please wait ${resetIn} seconds.`);
      return;
    }

    setSubmitting(true);
    setError("");
    const supabase = createClient();
    if (!supabase) {
      setSubmitting(false);
      return;
    }

    const { data, error: insertError } = await supabase
      .from("forum_posts")
      .insert({
        thread_id: thread.id,
        author_id: user.id,
        content: validation.sanitized,
      })
      .select(`
        *,
        author:profiles!forum_posts_author_id_fkey(display_name)
      `)
      .single();

    if (insertError || !data) {
      setError("Failed to post reply. Please try again.");
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

  // Start editing a post
  const handleStartEdit = (post: ForumPost) => {
    setEditingPostId(post.id);
    setEditContent(post.content);
    setEditError("");
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditContent("");
    setEditError("");
  };

  // Save edited post
  const handleSaveEdit = async () => {
    if (!user || !editingPostId) return;

    // Validate content
    const validation = validateContent(editContent, MAX_LENGTHS.POST_CONTENT);
    if (!validation.valid) {
      setEditError(validation.error || "Invalid content");
      return;
    }

    // Rate limit (20 edits per 10 minutes)
    if (!checkRateLimit("forum_edit", 20, 600000)) {
      const resetIn = getRateLimitReset("forum_edit", 600000);
      setEditError(`Too many edits. Please wait ${resetIn} seconds.`);
      return;
    }

    setIsEditing(true);
    setEditError("");

    const supabase = createClient();
    if (!supabase) {
      setIsEditing(false);
      setEditError("Failed to save. Please try again.");
      return;
    }

    const { error: updateError } = await supabase
      .from("forum_posts")
      .update({
        content: validation.sanitized,
        is_edited: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editingPostId)
      .eq("author_id", user.id); // Ensure user owns the post

    if (updateError) {
      setIsEditing(false);
      setEditError("Failed to save. Please try again.");
      return;
    }

    // Update local state
    setPosts((prev) =>
      prev.map((p) =>
        p.id === editingPostId
          ? { ...p, content: validation.sanitized, is_edited: true }
          : p
      )
    );

    setEditingPostId(null);
    setEditContent("");
    setIsEditing(false);
  };

  // Open delete dialog
  const handleOpenDelete = (postId: string, postIndex: number) => {
    setDeletePostId(postId);
    setDeletePostIndex(postIndex);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!user || !deletePostId) return;

    // Rate limit (5 deletes per 10 minutes)
    if (!checkRateLimit("forum_delete", 5, 600000)) {
      setIsDeleting(false);
      return;
    }

    setIsDeleting(true);

    const supabase = createClient();
    if (!supabase) {
      setIsDeleting(false);
      return;
    }

    // If first post, delete the entire thread
    if (deletePostIndex === 0) {
      const { error: deleteError } = await supabase
        .from("forum_threads")
        .delete()
        .eq("id", thread.id)
        .eq("author_id", user.id);

      if (!deleteError) {
        // Redirect to category page
        router.push(ROUTES.FORUM_CATEGORY(category.slug));
        return;
      }
    } else {
      // Delete just the post
      const { error: deleteError } = await supabase
        .from("forum_posts")
        .delete()
        .eq("id", deletePostId)
        .eq("author_id", user.id);

      if (!deleteError) {
        setPosts((prev) => prev.filter((p) => p.id !== deletePostId));
      }
    }

    setDeletePostId(null);
    setIsDeleting(false);
  };

  // Handle image upload - insert markdown at cursor or append
  const handleImageUploaded = (markdownImage: string) => {
    setReplyContent((prev) => prev + (prev ? "\n" : "") + markdownImage);
  };

  // Handle image upload for edit mode
  const handleEditImageUploaded = (markdownImage: string) => {
    setEditContent((prev) => prev + (prev ? "\n" : "") + markdownImage);
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

          {/* Wiki Suggestion Button */}
          {user && (
            <div className="mt-4">
              {hasSuggested ? (
                <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                  <Check className="size-4 text-emerald-500" />
                  Suggested for wiki
                </span>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSuggestWiki}
                  disabled={suggestingWiki}
                >
                  <BookBookmark className="size-4 mr-2" />
                  {suggestingWiki ? "Suggesting..." : "Suggest as Wiki Article"}
                </Button>
              )}
              {suggestionError && (
                <p className="mt-2 text-xs text-destructive">{suggestionError}</p>
              )}
            </div>
          )}
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
                      <UserAvatar name={post.author?.display_name || null} size="lg" />
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
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-mono">
                        #{index + 1}
                      </span>
                      {!thread.is_locked && (
                        <PostActionsMenu
                          postAuthorId={post.author_id || ""}
                          currentUserId={user?.id}
                          onEdit={() => handleStartEdit(post)}
                          onDelete={() => handleOpenDelete(post.id, index)}
                        />
                      )}
                    </div>
                  </div>

                  {/* Edit mode */}
                  {editingPostId === post.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={editContent}
                        onChange={(e) => {
                          setEditContent(e.target.value);
                          if (editError) setEditError("");
                        }}
                        maxLength={MAX_LENGTHS.POST_CONTENT}
                        className="w-full min-h-[150px] p-4 bg-background border border-border resize-y focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={isEditing}
                      />
                      <div className="flex items-center gap-2">
                        <ForumImageUpload
                          onImageUploaded={handleEditImageUploaded}
                          disabled={isEditing}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {editContent.length}/{MAX_LENGTHS.POST_CONTENT}
                        </span>
                        {editError && (
                          <span className="text-xs text-destructive">{editError}</span>
                        )}
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCancelEdit}
                          disabled={isEditing}
                        >
                          <X className="size-4 mr-1" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveEdit}
                          disabled={isEditing || !editContent.trim()}
                        >
                          {isEditing ? "Saving..." : "Save"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Display mode - use MarkdownContent for image support */
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <MarkdownContent content={post.content} />
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}

          {/* Delete confirmation dialog */}
          <DeletePostDialog
            open={deletePostId !== null}
            onOpenChange={(open) => !open && setDeletePostId(null)}
            onConfirm={handleConfirmDelete}
            isDeleting={isDeleting}
            isFirstPost={deletePostIndex === 0}
          />

          {/* Reply form */}
          {!thread.is_locked && (
            <div className="mt-8 pt-8 border-t border-border">
              {user ? (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Reply</h3>
                  <textarea
                    value={replyContent}
                    onChange={(e) => {
                      setReplyContent(e.target.value);
                      if (error) setError("");
                    }}
                    maxLength={MAX_LENGTHS.POST_CONTENT}
                    className="w-full min-h-[150px] p-4 bg-background border border-border resize-y focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Write your reply..."
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <ForumImageUpload
                      onImageUploaded={handleImageUploaded}
                      disabled={submitting}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {replyContent.length}/{MAX_LENGTHS.POST_CONTENT}
                    </span>
                    {error && (
                      <span className="text-xs text-destructive">{error}</span>
                    )}
                  </div>
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
