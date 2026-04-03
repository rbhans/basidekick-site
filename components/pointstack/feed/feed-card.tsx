"use client";

import { useState } from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { getPostTypeClasses } from "@/lib/tag-colors";
import {
  Heart,
  ChatCircle,
  Share,
  DotsThree,
  Chats,
  Question,
  Lightbulb,
  Wrench,
  Briefcase,
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

const POST_TYPE_CONFIG: Record<
  PointStackPostType,
  { label: string; icon: typeof Chats }
> = {
  discussion: { label: "Discussion", icon: Chats },
  question: { label: "Question", icon: Question },
  project: { label: "Project", icon: Wrench },
  job: { label: "Job", icon: Briefcase },
  tip: { label: "Tip", icon: Lightbulb },
};

export function FeedCard({ post, equipmentLinks = [], onTagClick }: FeedCardProps) {
  const { user } = useAuth();
  const { votePost, deletePost } = usePointStackStore();
  const typeConfig = POST_TYPE_CONFIG[post.post_type];
  const postHref = getPointStackPostRoute(post.post_type, post.slug);
  const postTags = post.tags || [];
  const postContent = post.content || "";
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const createdDate = new Date(post.created_at);
  const fullTimestamp = format(createdDate, "MMM d, yyyy 'at' h:mm a");
  const relativeTime = formatDistanceToNow(createdDate, { addSuffix: true });

  const handleShare = async () => {
    const url = `${window.location.origin}${postHref}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: post.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShareSuccess(true);
        toast.success("Link copied to clipboard");
        setTimeout(() => setShareSuccess(false), 2000);
      }
    } catch {
      // User cancelled share - silently ignore
    }
  };

  const handleDelete = async () => {
    await deletePost(post.id);
    setDeleteDialogOpen(false);
  };

  const isAuthor = user?.id === post.author_id;
  const profileLink = post.author?.display_name
    ? ROUTES.POINTSTACK_PROFILE(post.author.display_name)
    : ROUTES.POINTSTACK;

  return (
    <>
      <article className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-colors group/card">
        {/* Author Row */}
        <div className="flex items-center gap-3 mb-4">
          <Link href={profileLink} className="shrink-0">
            <UserAvatar
              displayName={post.author?.display_name || null}
              avatarUrl={post.author?.avatar_url}
              size="lg"
            />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link
                href={profileLink}
                className="text-[14px] font-semibold text-foreground hover:underline truncate"
              >
                {post.author?.display_name || "Anonymous"}
              </Link>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono ${getPostTypeClasses(post.post_type)}`}>
                {typeConfig.label}
              </span>
            </div>
            <time
              dateTime={post.created_at}
              title={fullTimestamp}
              className="text-[12px] text-muted-foreground/60"
            >
              About {relativeTime}
            </time>
          </div>
          {isAuthor && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-100 sm:opacity-0 sm:group-hover/card:opacity-100 sm:group-focus-within/card:opacity-100 focus-visible:opacity-100 transition-opacity text-muted-foreground"
                  aria-label="Post options"
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

        {/* Title */}
        <Link href={postHref} className="block group/link">
          <h3 className="font-heading text-[16px] font-bold text-foreground mb-2 group-hover/link:text-primary transition-colors leading-snug">
            {post.title}
          </h3>
        </Link>

        {/* Body */}
        <Link href={postHref} className="block">
          <p className="text-[14px] text-muted-foreground leading-relaxed mb-4 line-clamp-3">
            {postContent.slice(0, 300)}
            {postContent.length > 300 && "..."}
          </p>
        </Link>

        {/* Tags */}
        {postTags.length > 0 && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {postTags.slice(0, 5).map((tag) => (
              <button
                key={tag}
                onClick={() => onTagClick?.(tag)}
                className="px-3 py-1 rounded-full border border-border text-[11px] font-mono text-muted-foreground hover:border-primary/30 transition-colors cursor-pointer"
              >
                {tag}
              </button>
            ))}
            {postTags.length > 5 && (
              <span className="px-3 py-1 rounded-full border border-border text-[11px] font-mono text-muted-foreground">
                +{postTags.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Equipment links */}
        {equipmentLinks.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {equipmentLinks.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-border text-[11px] font-mono text-muted-foreground hover:border-primary/30 transition-colors"
              >
                <LinkSimple className="w-3 h-3" />
                {item.name}
              </Link>
            ))}
          </div>
        )}

        {/* Engagement */}
        <div className="flex items-center gap-6 pt-3 border-t border-border">
          <button
            onClick={() => user && votePost(post.id, post.user_vote === 1 ? -1 : 1)}
            disabled={!user}
            className={cn(
              "flex items-center gap-2 transition-colors",
              post.user_vote === 1
                ? "text-primary"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            <Heart className="w-4 h-4" weight={post.user_vote === 1 ? "fill" : "regular"} />
            <span className="text-[13px]">{post.upvote_count}</span>
          </button>
          <Link
            href={postHref}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ChatCircle className="w-4 h-4" />
            <span className="text-[13px]">{post.comment_count}</span>
          </Link>
          <button
            onClick={handleShare}
            className={cn(
              "flex items-center gap-2 transition-colors",
              shareSuccess
                ? "text-green-500"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            {shareSuccess ? (
              <CheckCircle className="w-4 h-4" weight="fill" />
            ) : (
              <Share className="w-4 h-4" />
            )}
            <span className="text-[13px]">Share</span>
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
