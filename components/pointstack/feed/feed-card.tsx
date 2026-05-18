"use client";

import { useState } from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import {
  Heart,
  ChatCircle,
  Share,
  DotsThree,
  Trash,
  PencilSimple,
  LinkSimple,
  CheckCircle,
} from "@phosphor-icons/react";
import { PointStackPost, PointStackPostType } from "@/lib/types";
import { ROUTES, getPointStackPostRoute } from "@/lib/routes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UserAvatar } from "../shared/user-avatar";
import { usePointStackStore } from "../pointstack-store";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FeedCardProps {
  post: PointStackPost;
  equipmentLinks?: { id: string; name: string; href: string }[];
  onTagClick?: (tag: string) => void;
}

const POST_TYPE_LABEL: Record<PointStackPostType, string> = {
  discussion: "Discussion",
  question: "Question",
  project: "Project",
  job: "Job",
  tip: "Tip",
};

export function FeedCard({ post, equipmentLinks = [], onTagClick }: FeedCardProps) {
  const { user } = useAuth();
  const { votePost, deletePost } = usePointStackStore();
  const postHref = getPointStackPostRoute(post.post_type, post.slug);
  const postTags = post.tags || [];
  const postContent = post.content || "";
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const createdDate = new Date(post.created_at);
  const fullTimestamp = format(createdDate, "MMM d, yyyy 'at' h:mm a");
  const relativeTime = formatDistanceToNow(createdDate, { addSuffix: true });

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}${postHref}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: post.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShareSuccess(true);
        toast.success("Link copied");
        setTimeout(() => setShareSuccess(false), 2000);
      }
    } catch {
      // User cancelled
    }
  };

  const handleVote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (user) votePost(post.id, post.user_vote === 1 ? -1 : 1);
  };

  const handleDelete = async () => {
    await deletePost(post.id);
    setDeleteDialogOpen(false);
  };

  const isAuthor = user?.id === post.author_id;
  const profileLink = post.author?.display_name
    ? ROUTES.POINTSTACK_PROFILE(post.author.display_name)
    : ROUTES.POINTSTACK;

  const isQuestion = post.post_type === "question";

  const liked = post.user_vote === 1;

  return (
    <>
      <article className="post">
        <div className="meta-row">
          <span className="kind">
            {isQuestion && <span className="q-mark">?</span>}
            {POST_TYPE_LABEL[post.post_type]}
          </span>
          <span className="meta-sep">·</span>
          <Link href={profileLink} onClick={(e) => e.stopPropagation()} className="author">
            <UserAvatar
              displayName={post.author?.display_name || null}
              avatarUrl={post.author?.avatar_url}
              size="sm"
            />
            <span className="truncate">@{post.author?.display_name || "anonymous"}</span>
          </Link>
          <span className="meta-sep">·</span>
          <time
            dateTime={post.created_at}
            title={fullTimestamp}
            className="ts"
          >
            {relativeTime}
          </time>

          {isAuthor && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opts ml-auto"
                  aria-label="Post options"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DotsThree className="w-4 h-4" weight="bold" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`${postHref}?edit=true`} className="gap-2">
                    <PencilSimple className="w-3.5 h-3.5" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive gap-2"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash className="w-3.5 h-3.5" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <Link href={postHref} className="block">
          <h3>{post.title}</h3>
          {postContent && (
            <p className="body">
              {postContent.slice(0, 280)}
              {postContent.length > 280 && "…"}
            </p>
          )}
        </Link>

        {(postTags.length > 0 || equipmentLinks.length > 0) && (
          <div className="chip-row">
            {postTags.slice(0, 5).map((tag) => (
              <button
                key={tag}
                onClick={(e) => {
                  e.stopPropagation();
                  onTagClick?.(tag);
                }}
                className="tag"
              >
                {tag}
              </button>
            ))}
            {postTags.length > 5 && (
              <span className="tag">+{postTags.length - 5}</span>
            )}
            {equipmentLinks.slice(0, 3).map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={(e) => e.stopPropagation()}
                className="eqp"
              >
                <LinkSimple className="w-2.5 h-2.5" />
                {item.name}
              </Link>
            ))}
          </div>
        )}

        <div className="actions">
          <button
            type="button"
            onClick={handleVote}
            disabled={!user}
            className={cn("act", liked && "liked")}
            aria-label="Upvote"
          >
            <Heart weight={liked ? "fill" : "regular"} />
            {post.upvote_count}
          </button>
          <Link
            href={postHref}
            className="act"
            onClick={(e) => e.stopPropagation()}
          >
            <ChatCircle weight="regular" />
            {post.comment_count}
          </Link>
          <button
            type="button"
            onClick={handleShare}
            className={cn("act share", shareSuccess && "liked")}
            aria-label="Share"
          >
            {shareSuccess ? (
              <>
                <CheckCircle weight="fill" />
                Copied
              </>
            ) : (
              <>
                <Share weight="regular" />
                Share
              </>
            )}
          </button>
        </div>
      </article>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove &ldquo;{post.title}&rdquo; and all
              its comments. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
