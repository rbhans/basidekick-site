"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, DownloadSimple, Link as LinkIcon, Heart } from "@phosphor-icons/react";
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
        : prev,
    );
    try {
      await api.voteResource(resource.id, newVoteType);
    } catch (error) {
      console.error("Error voting:", error);
      void fetchData();
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
        prev ? { ...prev, comment_count: prev.comment_count + 1 } : prev,
      );
    } catch (err) {
      console.error("Error creating comment:", err);
      setCommentError(err instanceof Error ? err.message : "Failed to post.");
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="container mx-auto max-w-[880px] px-4 sm:px-6 lg:px-16 py-10">
        <Skeleton className="h-4 w-24 mb-6" />
        <Skeleton className="h-10 w-3/4 mb-3" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6" />
      </section>
    );
  }

  if (!resource) {
    return (
      <section className="container mx-auto max-w-[880px] px-4 sm:px-6 lg:px-16 py-16 text-center">
        <p className="italic text-[20px] text-muted-foreground mb-5">
          This resource isn&apos;t in the set.
        </p>
        <Link
          href={`${ROUTES.POINTSTACK}/resources`}
          className="font-mono text-[11px] uppercase tracking-[1.2px] text-foreground hover:text-accent transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3 h-3 text-accent" />
          Back to resources
        </Link>
      </section>
    );
  }

  return (
    <section className="container mx-auto max-w-[880px] px-4 sm:px-6 lg:px-16 py-10">
      <Link
        href={`${ROUTES.POINTSTACK}/resources`}
        className="font-mono text-[11px] uppercase tracking-[1.2px] text-muted-foreground hover:text-accent transition-colors inline-flex items-center gap-1.5 mb-6"
      >
        <ArrowLeft className="w-3 h-3 text-accent" />
        Back to resources
      </Link>

      {/* Kind label */}
      <div className="font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground mb-3 flex items-center gap-2.5 flex-wrap">
        <span className="text-accent">{CATEGORY_LABELS[resource.category]}</span>
        <span className="text-muted-foreground/40">·</span>
        <span>{resource.is_free ? "Free" : <span className="text-accent">Premium</span>}</span>
        <span className="text-muted-foreground/40">·</span>
        <Link
          href={ROUTES.POINTSTACK_PROFILE(resource.author?.display_name || "")}
          className="flex items-center gap-1.5"
        >
          <UserAvatar
            displayName={resource.author?.display_name || null}
            avatarUrl={resource.author?.avatar_url}
            size="sm"
          />
          <span className="text-foreground font-medium hover:text-accent transition-colors">
            @{resource.author?.display_name || "anonymous"}
          </span>
        </Link>
        <span className="text-muted-foreground/40">·</span>
        <span>Shared {formatDistanceToNow(new Date(resource.created_at), { addSuffix: true })}</span>
      </div>

      {/* Title + download */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <h1 className="font-heading font-semibold text-[32px] md:text-[38px] leading-[1.1] tracking-[-0.015em] text-foreground max-w-[680px]">
          {resource.title}
        </h1>
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-md font-mono text-[11px] uppercase tracking-[1.2px] font-medium hover:bg-primary/90 transition-colors shrink-0"
        >
          {resource.external_link ? (
            <>
              <LinkIcon className="w-3.5 h-3.5" />
              Visit link
            </>
          ) : (
            <>
              <DownloadSimple className="w-3.5 h-3.5" />
              Download
            </>
          )}
        </button>
      </div>

      {/* Preview image */}
      {resource.preview_images && resource.preview_images.length > 0 && (
        <div className="aspect-video rounded-md overflow-hidden mb-8 border border-border">
          <img
            src={resource.preview_images[0]}
            alt={resource.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Description */}
      {resource.description && (
        <div className="max-w-[680px] mb-8">
          <div className="font-mono text-[10px] uppercase tracking-[1.4px] text-muted-foreground mb-3.5 pb-2.5 border-b border-foreground">
            <span className="text-accent mr-1.5">01 /</span>
            About
          </div>
          <div className="text-[15px] md:text-[16px] leading-[1.7] text-foreground">
            {resource.description.split("\n").map((paragraph, i) =>
              paragraph.trim() ? (
                <p key={i} className="mb-4">
                  {paragraph}
                </p>
              ) : null,
            )}
          </div>
        </div>
      )}

      {/* Stats + vote row */}
      <div className="flex items-center gap-5 mb-10 pb-5 border-b border-border font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground">
        <button
          onClick={handleVote}
          disabled={!user}
          className={cn(
            "inline-flex items-center gap-1.5 tabular-nums transition-colors",
            resource.user_vote === 1
              ? "text-accent"
              : "hover:text-accent disabled:hover:text-muted-foreground",
          )}
        >
          <Heart
            className="w-3.5 h-3.5"
            weight={resource.user_vote === 1 ? "fill" : "regular"}
          />
          {resource.upvote_count}
        </button>
        <span className="tabular-nums">{resource.comment_count} comments</span>
        <span className="tabular-nums">{resource.download_count} downloads</span>
      </div>

      {/* More preview images */}
      {resource.preview_images && resource.preview_images.length > 1 && (
        <div className="mb-10">
          <div className="font-mono text-[10px] uppercase tracking-[1.4px] text-muted-foreground mb-3.5 pb-2.5 border-b border-foreground">
            <span className="text-accent mr-1.5">02 /</span>
            Preview
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {resource.preview_images.slice(1).map((image, i) => (
              <img
                key={i}
                src={image}
                alt={`${resource.title} preview ${i + 2}`}
                className="rounded-sm border border-border w-full"
              />
            ))}
          </div>
        </div>
      )}

      {/* Comments */}
      <div>
        <div className="flex items-baseline gap-3.5 pb-3.5 border-b border-foreground mb-6">
          <span className="font-mono text-[11px] text-accent tracking-[1px]">03 /</span>
          <h2 className="font-heading font-semibold text-[22px] leading-none text-foreground">
            Discussion
          </h2>
          <span className="ml-auto font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground tabular-nums">
            {comments.length} {comments.length === 1 ? "comment" : "comments"}
          </span>
        </div>

        {user && (
          <form onSubmit={handleSubmitComment} className="mb-8">
            <Textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Share what you know. Be kind."
              rows={4}
              maxLength={10000}
              className="font-sans text-[14px] placeholder:italic"
            />
            {commentError && (
              <p className="mt-2 font-mono text-[11px] text-destructive">{commentError}</p>
            )}
            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                disabled={commentLoading || !commentContent.trim()}
                className="bg-primary text-primary-foreground px-5 py-2.5 rounded-md font-mono text-[11px] uppercase tracking-[1.2px] font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {commentLoading ? "Posting…" : "Post comment"}
              </button>
            </div>
          </form>
        )}

        {comments.length > 0 ? (
          <div className="space-y-0">
            {comments.map((comment) => (
              <div key={comment.id} className="py-5 border-b border-muted">
                <div className="flex items-center gap-2.5 mb-2 font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground">
                  <Link
                    href={ROUTES.POINTSTACK_PROFILE(comment.author?.display_name || "")}
                    className="flex items-center gap-1.5"
                  >
                    <UserAvatar
                      displayName={comment.author?.display_name || null}
                      avatarUrl={comment.author?.avatar_url}
                      size="sm"
                    />
                    <span className="text-foreground font-medium hover:text-accent transition-colors">
                      @{comment.author?.display_name || "anonymous"}
                    </span>
                  </Link>
                  <span className="text-muted-foreground/40">·</span>
                  <span>
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                <div className="text-[14px] leading-[1.65] text-foreground">
                  {comment.content.split("\n").map((paragraph, i) =>
                    paragraph.trim() ? (
                      <p key={i} className="mb-2">
                        {paragraph}
                      </p>
                    ) : null,
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center italic text-[18px] text-muted-foreground">
            {user ? "No comments yet. Be the first." : "Sign in to comment."}
          </div>
        )}
      </div>
    </section>
  );
}
