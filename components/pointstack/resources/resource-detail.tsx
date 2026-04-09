"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, DownloadSimple, Link as LinkIcon, Heart, ChatCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "../shared/user-avatar";
import { useAuth } from "@/hooks/use-auth";
import { ROUTES } from "@/lib/routes";
import { PointStackResourceListing, PointStackResourceCategory, PointStackResourceComment } from "@/lib/types";
import { validateContent } from "@/lib/security";
import * as api from "../pointstack-api";
import { cn } from "@/lib/utils";

interface ResourceDetailProps {
  slug: string;
}

const CATEGORY_LABELS: Record<PointStackResourceCategory, string> = {
  template: "Template",
  script: "Script",
  document: "Document",
  guide: "Guide",
  tool: "Tool",
  other: "Other",
};

export function PointStackResourceDetail({ slug }: ResourceDetailProps) {
  const { user } = useAuth();
  const [resource, setResource] = useState<PointStackResourceListing | null>(null);
  const [comments, setComments] = useState<PointStackResourceComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.fetchResourceBySlug(slug);
      if (data) {
        const [enriched] = await api.enrichResourcesWithVotes([data], user ?? null);
        setResource(enriched);
        const resourceComments = await api.fetchResourceComments(data.id);
        setComments(resourceComments);
      } else {
        setResource(null);
      }
    } catch (error) {
      console.error("Error fetching resource:", error);
    } finally {
      setLoading(false);
    }
  }, [slug, user]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleDownload = async () => {
    if (!resource) return;
    if (resource.file_url) {
      await api.incrementResourceDownloadCount(resource.id);
      window.open(resource.file_url, "_blank");
    } else if (resource.external_link) {
      await api.incrementResourceDownloadCount(resource.id);
      window.open(resource.external_link, "_blank");
    }
  };

  const handleVote = async () => {
    if (!resource || !user) return;
    const newVoteType = resource.user_vote === 1 ? -1 : 1;
    // Optimistic update
    setResource((prev) =>
      prev
        ? {
            ...prev,
            user_vote: prev.user_vote === 1 ? null : 1,
            upvote_count:
              prev.user_vote === 1
                ? prev.upvote_count - 1
                : prev.upvote_count + 1,
          }
        : prev
    );
    try {
      await api.voteResource(resource.id, newVoteType);
    } catch (error) {
      console.error("Error voting:", error);
      void fetchData(); // Revert on error
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resource || !user) return;
    setCommentError(null);

    const validation = validateContent(commentContent);
    if (!validation.valid) {
      setCommentError(validation.error || "Invalid content");
      return;
    }

    setCommentLoading(true);
    try {
      const newComment = await api.createResourceComment({
        resource_id: resource.id,
        content: commentContent.trim(),
      });
      setComments((prev) => [...prev, newComment]);
      setCommentContent("");
      setResource((prev) =>
        prev ? { ...prev, comment_count: prev.comment_count + 1 } : prev
      );
    } catch (err) {
      console.error("Error creating comment:", err);
      setCommentError(err instanceof Error ? err.message : "Failed to post. Please try again.");
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Skeleton className="h-4 w-24 mb-6" />
        <Skeleton className="h-64 rounded-lg mb-6" />
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Resource not found</h2>
          <p className="text-muted-foreground mb-4">This resource doesn&apos;t exist.</p>
          <Button asChild>
            <Link href={`${ROUTES.POINTSTACK}/resources`}>Back to Resources</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <Link
        href={`${ROUTES.POINTSTACK}/resources`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Resources
      </Link>

      {/* Preview images */}
      {resource.preview_images && resource.preview_images.length > 0 && (
        <div className="aspect-video rounded-lg overflow-hidden mb-6">
          <img
            src={resource.preview_images[0]}
            alt={resource.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="border border-border rounded-md bg-card p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">{resource.title}</h1>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {CATEGORY_LABELS[resource.category]}
              </Badge>
              {resource.is_free ? (
                <Badge variant="secondary">Free</Badge>
              ) : (
                <Badge>Premium</Badge>
              )}
            </div>
          </div>

          <Button onClick={handleDownload}>
            {resource.external_link ? (
              <>
                <LinkIcon className="w-4 h-4 mr-2" />
                Visit Link
              </>
            ) : (
              <>
                <DownloadSimple className="w-4 h-4 mr-2" />
                Download
              </>
            )}
          </Button>
        </div>

        {/* Author */}
        <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-md mb-6">
          <Link href={ROUTES.POINTSTACK_PROFILE(resource.author?.display_name || "")}>
            <UserAvatar
              displayName={resource.author?.display_name || null}
              avatarUrl={resource.author?.avatar_url}
              size="md"
            />
          </Link>
          <div>
            <Link
              href={ROUTES.POINTSTACK_PROFILE(resource.author?.display_name || "")}
              className="font-medium hover:underline"
            >
              {resource.author?.display_name || "Anonymous"}
            </Link>
            <p className="text-sm text-muted-foreground">
              Shared {formatDistanceToNow(new Date(resource.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>

        {/* Description */}
        {resource.description && (
          <div className="prose prose-sm dark:prose-invert max-w-none mb-6">
            {resource.description.split("\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        )}

        {/* Stats & Like */}
        <div className="flex items-center gap-4 pt-4 border-t border-border text-sm text-muted-foreground">
          <button
            onClick={handleVote}
            disabled={!user}
            className={cn(
              "flex items-center gap-1.5 transition-colors",
              resource.user_vote === 1
                ? "text-primary"
                : "text-muted-foreground hover:text-accent"
            )}
          >
            <Heart className="w-4 h-4" weight={resource.user_vote === 1 ? "fill" : "regular"} />
            <span>{resource.upvote_count}</span>
          </button>
          <div className="flex items-center gap-1.5">
            <ChatCircle className="w-4 h-4" />
            <span>{resource.comment_count} comments</span>
          </div>
          <div className="flex items-center gap-1.5">
            <DownloadSimple className="w-4 h-4" />
            <span>{resource.download_count} downloads</span>
          </div>
        </div>
      </div>

      {/* More preview images */}
      {resource.preview_images && resource.preview_images.length > 1 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Preview</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {resource.preview_images.slice(1).map((image, i) => (
              <img
                key={i}
                src={image}
                alt={`${resource.title} preview ${i + 2}`}
                className="rounded-lg"
              />
            ))}
          </div>
        </div>
      )}

      {/* Comments section */}
      <div className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold">Comments ({comments.length})</h2>

        {/* Comment form */}
        {user && (
          <form onSubmit={handleSubmitComment} className="space-y-3">
            <Textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Write a comment..."
              rows={4}
              maxLength={10000}
            />
            {commentError && <p className="text-sm text-destructive">{commentError}</p>}
            <div className="flex justify-end">
              <Button type="submit" disabled={commentLoading || !commentContent.trim()}>
                {commentLoading ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </form>
        )}

        {/* Comments list */}
        {comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="border border-border rounded-md bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Link
                    href={ROUTES.POINTSTACK_PROFILE(comment.author?.display_name || "")}
                    className="flex items-center gap-2"
                  >
                    <UserAvatar
                      displayName={comment.author?.display_name || null}
                      avatarUrl={comment.author?.avatar_url}
                      size="sm"
                    />
                    <span className="text-sm font-medium hover:underline">
                      {comment.author?.display_name || "Anonymous"}
                    </span>
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {comment.content.split("\n").map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-4">
            No comments yet. {user ? "Be the first to comment!" : "Sign in to comment."}
          </p>
        )}
      </div>
    </div>
  );
}
