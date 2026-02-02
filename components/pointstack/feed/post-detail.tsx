"use client";

import { useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, ChatCircle, Eye, Share, Check } from "@phosphor-icons/react";
import { useAuth } from "@/hooks/use-auth";
import { usePointStackStore } from "../pointstack-store";
import { UserAvatar } from "../shared/user-avatar";
import { VoteButton } from "../shared/vote-button";
import { CommentForm } from "./comment-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/lib/routes";
import { PointStackPostType } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PostDetailProps {
  slug: string;
}

const POST_TYPE_LABELS: Record<PointStackPostType, { label: string; color: string }> = {
  discussion: { label: "Discussion", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  question: { label: "Question", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  project: { label: "Project", color: "bg-green-500/10 text-green-600 border-green-500/20" },
  job: { label: "Job", color: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  tip: { label: "Tip", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
};

export function PointStackPostDetail({ slug }: PostDetailProps) {
  const { user } = useAuth();
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
      // User cancelled share or clipboard access denied - silently ignore
    }
  };

  // Helper to get safe profile link
  const getProfileLink = (displayName: string | null | undefined) =>
    displayName ? ROUTES.POINTSTACK_PROFILE(displayName) : ROUTES.POINTSTACK;

  if (loading) {
    return <PostDetailSkeleton />;
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Post not found</h2>
          <p className="text-muted-foreground mb-4">This post may have been deleted or moved.</p>
          <Button asChild>
            <Link href={ROUTES.POINTSTACK}>Back to Feed</Link>
          </Button>
        </div>
      </div>
    );
  }

  const typeInfo = POST_TYPE_LABELS[post.post_type];
  const isAuthor = user?.id === post.author_id;
  const isQuestion = post.post_type === "question";

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      {/* Back link */}
      <Link
        href={ROUTES.POINTSTACK}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Feed
      </Link>

      {/* Post */}
      <article className="border border-border rounded-lg bg-card p-6 mb-6">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <VoteButton
            count={post.upvote_count}
            userVote={post.user_vote}
            onVote={(type) => votePost(post.id, type)}
            disabled={!user}
            vertical
          />

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className={cn("text-xs", typeInfo.color)}>
                {typeInfo.label}
              </Badge>
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            <h1 className="text-2xl font-bold mb-3">{post.title}</h1>

            <div className="flex items-center gap-3">
              <Link
                href={getProfileLink(post.author?.display_name)}
                className="flex items-center gap-2"
              >
                <UserAvatar
                  displayName={post.author?.display_name || null}
                  avatarUrl={post.author?.avatar_url}
                  size="sm"
                />
                <span className="text-sm font-medium hover:underline">
                  {post.author?.display_name || "Anonymous"}
                </span>
              </Link>
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-sm dark:prose-invert max-w-none mb-6">
          {post.content.split("\n").map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 pt-4 border-t border-border text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Eye className="w-4 h-4" />
            <span>{post.view_count} views</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ChatCircle className="w-4 h-4" />
            <span>{post.comment_count} comments</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-8 px-2"
            onClick={handleShare}
          >
            <Share className="w-4 h-4 mr-1.5" />
            Share
          </Button>
        </div>
      </article>

      {/* Comments section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          {isQuestion ? "Answers" : "Comments"} ({comments.length})
        </h2>

        {/* Comment form */}
        {user && <CommentForm postId={post.id} isQuestion={isQuestion} />}

        {/* Comments list */}
        {comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className={cn(
                  "border border-border rounded-lg p-4",
                  comment.is_accepted && "border-green-500/50 bg-green-500/5"
                )}
              >
                <div className="flex gap-3">
                  <VoteButton
                    count={comment.upvote_count}
                    userVote={comment.user_vote}
                    onVote={(type) => voteComment(comment.id, type)}
                    disabled={!user}
                    size="sm"
                    vertical
                  />

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Link
                        href={getProfileLink(comment.author?.display_name)}
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
                      {comment.is_accepted && (
                        <Badge className="gap-1 bg-green-500/10 text-green-600 border-green-500/20">
                          <Check className="w-3 h-3" />
                          Accepted
                        </Badge>
                      )}
                    </div>

                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {comment.content.split("\n").map((paragraph, i) => (
                        <p key={i}>{paragraph}</p>
                      ))}
                    </div>

                    {/* Accept answer button */}
                    {isQuestion && isAuthor && !comment.is_accepted && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => acceptAnswer(comment.id)}
                      >
                        <Check className="w-4 h-4 mr-1.5" />
                        Accept Answer
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {isQuestion
              ? "No answers yet. Be the first to help!"
              : "No comments yet. Start the conversation!"}
          </div>
        )}
      </div>
    </div>
  );
}

function PostDetailSkeleton() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <Skeleton className="h-4 w-24 mb-6" />
      <div className="border border-border rounded-lg p-6">
        <div className="flex gap-3">
          <div className="flex flex-col items-center gap-1">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-4 w-6" />
            <Skeleton className="h-8 w-8" />
          </div>
          <div className="flex-1">
            <Skeleton className="h-6 w-20 mb-2" />
            <Skeleton className="h-8 w-3/4 mb-3" />
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    </div>
  );
}
