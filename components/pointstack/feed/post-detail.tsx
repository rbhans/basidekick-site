"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, Eye, Share, Check } from "@phosphor-icons/react";
import { useAuth } from "@/hooks/use-auth";
import { useAtlasData } from "@/components/atlas/use-atlas-data";
import { usePointStackStore } from "../pointstack-store";
import { UserAvatar } from "../shared/user-avatar";
import { VoteButton } from "../shared/vote-button";
import { CommentForm } from "./comment-form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/lib/routes";
import { PointStackPostType } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PostDetailProps {
  slug: string;
}

const POST_TYPE_LABELS: Record<PointStackPostType, string> = {
  discussion: "Discussion",
  question: "Question",
  project: "Project",
  job: "Job",
  tip: "Tip",
};

export function PointStackPostDetail({ slug }: PostDetailProps) {
  const { user } = useAuth();
  const { data: atlasData } = useAtlasData();
  const {
    currentPost: post,
    currentPostComments: comments,
    currentPostLoading: loading,
    fetchPostBySlug,
    votePost,
    voteComment,
    acceptAnswer,
    clearCurrentPost,
  } = usePointStackStore();

  useEffect(() => {
    fetchPostBySlug(slug);
    return () => clearCurrentPost();
  }, [slug, fetchPostBySlug, clearCurrentPost]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: post?.title || "Post", url });
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      // User cancelled
    }
  };

  const getProfileLink = (displayName: string | null | undefined) =>
    displayName ? ROUTES.POINTSTACK_PROFILE(displayName) : ROUTES.POINTSTACK;

  const getDocumentName = (url: string) => {
    const clean = url.split("?")[0] || "";
    const name = clean.split("/").pop() || "Document";
    return decodeURIComponent(name);
  };

  const equipmentLinks = useMemo(() => {
    if (!atlasData || !post?.equipment_ids) return [];
    const brandById = new Map(atlasData.brands.map((b) => [b.id, b]));
    const typeById = new Map(atlasData.types.map((t) => [t.id, t]));
    const modelById = new Map(atlasData.models.map((m) => [m.id, m]));

    return post.equipment_ids
      .map((id) => {
        const model = modelById.get(id);
        if (!model) return null;
        const brand = brandById.get(model.brand);
        const type = typeById.get(model.type);
        if (!brand || !type) return null;
        return {
          id,
          name: model.name,
          href: ROUTES.ATLAS_EQUIPMENT_MODEL(
            brand.slug || brand.id,
            type.slug || type.id,
            model.slug || model.id,
          ),
        };
      })
      .filter(Boolean) as { id: string; name: string; href: string }[];
  }, [atlasData, post]);

  if (loading) {
    return <PostDetailSkeleton />;
  }

  if (!post) {
    return (
      <section className="container mx-auto max-w-[880px] px-4 sm:px-6 lg:px-16 py-16 text-center">
        <p className="italic text-[20px] text-muted-foreground mb-5">
          This post isn&apos;t in the set.
        </p>
        <Link
          href={ROUTES.POINTSTACK}
          className="font-mono text-[11px] uppercase tracking-[1.2px] text-foreground hover:text-accent transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3 h-3 text-accent" />
          Back to feed
        </Link>
      </section>
    );
  }

  const typeLabel = POST_TYPE_LABELS[post.post_type];
  const isAuthor = user?.id === post.author_id;
  const isQuestion = post.post_type === "question";

  return (
    <section className="container mx-auto max-w-[880px] px-4 sm:px-6 lg:px-16 py-10">
      {/* Back link */}
      <Link
        href={ROUTES.POINTSTACK}
        className="font-mono text-[11px] uppercase tracking-[1.2px] text-muted-foreground hover:text-accent transition-colors inline-flex items-center gap-1.5 mb-6"
      >
        <ArrowLeft className="w-3 h-3 text-accent" />
        Back to feed
      </Link>

      {/* Kind + author + time */}
      <div className="font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground mb-3 flex items-center gap-2.5 flex-wrap">
        <span>
          {isQuestion && <span className="text-accent mr-0.5">?</span>}
          {typeLabel}
        </span>
        <span className="text-muted-foreground/40">·</span>
        <Link
          href={getProfileLink(post.author?.display_name)}
          className="flex items-center gap-1.5"
        >
          <UserAvatar
            displayName={post.author?.display_name || null}
            avatarUrl={post.author?.avatar_url}
            size="sm"
          />
          <span className="text-foreground font-medium hover:text-accent transition-colors">
            @{post.author?.display_name || "anonymous"}
          </span>
        </Link>
        <span className="text-muted-foreground/40">·</span>
        <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
        <span className="text-muted-foreground/40">·</span>
        <span className="tabular-nums">{post.view_count} views</span>
      </div>

      {/* Title */}
      <h1 className="font-heading font-semibold text-[32px] md:text-[38px] leading-[1.1] tracking-[-0.015em] text-foreground mb-5 max-w-[760px]">
        {post.title}
      </h1>

      {/* Tags + equipment row */}
      {(post.tags.length > 0 || equipmentLinks.length > 0) && (
        <div className="flex flex-wrap gap-2 mb-6">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground border border-border px-2 py-0.5 rounded-sm"
            >
              {tag}
            </span>
          ))}
          {equipmentLinks.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground border border-border px-2 py-0.5 rounded-sm hover:border-accent hover:text-accent transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}

      {/* Vote + body */}
      <div className="flex gap-5 mb-8">
        <div className="shrink-0">
          <VoteButton
            count={post.upvote_count}
            userVote={post.user_vote}
            onVote={(type) => votePost(post.id, type)}
            disabled={!user}
            vertical
          />
        </div>
        <div className="flex-1 min-w-0">
          {/* Summary label */}
          <div className="font-mono text-[10px] uppercase tracking-[1.4px] text-muted-foreground mb-3.5 pb-2.5 border-b border-foreground">
            <span className="text-accent mr-1.5">01 /</span>
            Post
          </div>

          <div className="text-[15px] md:text-[16px] leading-[1.7] text-foreground max-w-[640px]">
            {post.content.split("\n").map((paragraph, i) =>
              paragraph.trim() ? (
                <p key={i} className="mb-4">
                  {paragraph}
                </p>
              ) : null,
            )}
          </div>

          {/* Images */}
          {post.images && post.images.length > 0 && (
            <div className="mt-8">
              <div className="font-mono text-[10px] uppercase tracking-[1.4px] text-muted-foreground mb-3">
                <span className="text-accent mr-1.5">·</span>
                Images
              </div>
              <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
                {post.images.map((image, i) => (
                  <img
                    key={i}
                    src={image}
                    alt={`${post.title} image ${i + 1}`}
                    className="w-full h-32 object-cover rounded-sm border border-border"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {post.documents && post.documents.length > 0 && (
            <div className="mt-8">
              <div className="font-mono text-[10px] uppercase tracking-[1.4px] text-muted-foreground mb-3">
                <span className="text-accent mr-1.5">·</span>
                Documents
              </div>
              <div className="space-y-1">
                {post.documents.map((doc) => (
                  <a
                    key={doc}
                    href={doc}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block font-mono text-[12px] text-foreground hover:text-accent transition-colors border-b border-accent/40 inline-block"
                  >
                    {getDocumentName(doc)}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Engagement row */}
          <div className="flex items-center gap-5 pt-5 mt-8 border-t border-border font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 tabular-nums">
              <Eye className="w-3.5 h-3.5" />
              {post.view_count} views
            </span>
            <span className="inline-flex items-center gap-1.5 tabular-nums">
              <Check className="w-3.5 h-3.5" />
              {post.comment_count} {isQuestion ? "answers" : "comments"}
            </span>
            <button
              onClick={handleShare}
              className="ml-auto inline-flex items-center gap-1.5 hover:text-accent transition-colors"
            >
              <Share className="w-3.5 h-3.5" />
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Comments / Discussion section */}
      <div>
        <div className="flex items-baseline gap-3.5 pb-3.5 border-b border-foreground mb-6">
          <span className="font-mono text-[11px] text-accent tracking-[1px]">02 /</span>
          <h2 className="font-heading font-semibold text-[22px] leading-none text-foreground">
            {isQuestion ? "Answers" : "Discussion"}
          </h2>
          <span className="ml-auto font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground tabular-nums">
            {comments.length} {comments.length === 1 ? (isQuestion ? "answer" : "reply") : isQuestion ? "answers" : "replies"}
          </span>
        </div>

        {/* Comment form */}
        {user && <CommentForm postId={post.id} isQuestion={isQuestion} />}

        {/* Comments list */}
        {comments.length > 0 ? (
          <div className="mt-6 space-y-0">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className={cn(
                  "py-5 border-b border-muted",
                  comment.is_accepted && "bg-muted/30 border-l-2 border-l-accent pl-4",
                )}
              >
                <div className="flex gap-4">
                  <VoteButton
                    count={comment.upvote_count}
                    userVote={comment.user_vote}
                    onVote={(type) => voteComment(comment.id, type)}
                    disabled={!user}
                    size="sm"
                    vertical
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-2 flex-wrap font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground">
                      <Link
                        href={getProfileLink(comment.author?.display_name)}
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
                      {comment.is_accepted && (
                        <span className="inline-flex items-center gap-1 text-accent border border-accent px-1.5 py-0.5 rounded-sm">
                          <Check className="w-2.5 h-2.5" weight="bold" />
                          Accepted
                        </span>
                      )}
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

                    {isQuestion && isAuthor && !comment.is_accepted && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 rounded-sm"
                        onClick={() => acceptAnswer(comment.id)}
                      >
                        <Check className="w-3.5 h-3.5 mr-1.5" />
                        Accept answer
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center italic text-[18px] text-muted-foreground">
            {isQuestion
              ? "No answers yet. Be the first to help."
              : "No comments yet. Start the conversation."}
          </div>
        )}
      </div>
    </section>
  );
}

function PostDetailSkeleton() {
  return (
    <section className="container mx-auto max-w-[880px] px-4 sm:px-6 lg:px-16 py-10">
      <Skeleton className="h-4 w-24 mb-6" />
      <Skeleton className="h-3 w-60 mb-4" />
      <Skeleton className="h-10 w-3/4 mb-5" />
      <div className="flex gap-5">
        <Skeleton className="h-16 w-8 shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </section>
  );
}
