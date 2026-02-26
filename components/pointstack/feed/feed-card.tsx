"use client";

import { useState } from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import {
  ChatCircle,
  Eye,
  Share,
  DotsThree,
  BookmarkSimple,
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
import { Badge } from "@/components/ui/badge";
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
import { VoteButton } from "../shared/vote-button";
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
  { label: string; color: string; icon: typeof Chats }
> = {
  discussion: {
    label: "Discussion",
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    icon: Chats,
  },
  question: {
    label: "Question",
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    icon: Question,
  },
  project: {
    label: "Project",
    color: "bg-green-500/10 text-green-600 border-green-500/20",
    icon: Wrench,
  },
  job: {
    label: "Job",
    color: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    icon: Briefcase,
  },
  tip: {
    label: "Tip",
    color: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
    icon: Lightbulb,
  },
};

export function FeedCard({ post, equipmentLinks = [], onTagClick }: FeedCardProps) {
  const { user } = useAuth();
  const { votePost, deletePost } = usePointStackStore();
  const typeConfig = POST_TYPE_CONFIG[post.post_type];
  const PostIcon = typeConfig.icon;
  const postHref = getPointStackPostRoute(post.post_type, post.slug);
  const postTags = post.tags || [];
  const postContent = post.content || "";
  const [bookmarked, setBookmarked] = useState(false);
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

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    toast(bookmarked ? "Removed from bookmarks" : "Saved to bookmarks");
  };

  const isAuthor = user?.id === post.author_id;
  const profileLink = post.author?.display_name
    ? ROUTES.POINTSTACK_PROFILE(post.author.display_name)
    : ROUTES.POINTSTACK;

  return (
    <>
      <article className="group/card p-5 border border-border/40 rounded-xl bg-card hover:border-primary/30 transition-all duration-200">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <Link href={profileLink} className="shrink-0">
            <UserAvatar
              displayName={post.author?.display_name || null}
              avatarUrl={post.author?.avatar_url}
              size="lg"
            />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={profileLink}
                className="font-medium hover:underline truncate"
              >
                {post.author?.display_name || "Anonymous"}
              </Link>
              <span className="text-muted-foreground/40 hidden sm:inline">
                &middot;
              </span>
              <time
                dateTime={post.created_at}
                title={fullTimestamp}
                className="text-xs text-muted-foreground cursor-default"
              >
                {relativeTime}
              </time>
            </div>
            {post.author?.display_name && (
              <p className="text-xs text-muted-foreground/60 truncate sm:hidden">
                {relativeTime}
              </p>
            )}
          </div>
          <Badge
            variant="outline"
            className={cn("text-xs shrink-0 gap-1", typeConfig.color)}
          >
            <PostIcon className="w-3 h-3" weight="fill" />
            <span className="hidden sm:inline">{typeConfig.label}</span>
          </Badge>
          {isAuthor && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-100 sm:opacity-0 sm:group-hover/card:opacity-100 sm:group-focus-within/card:opacity-100 focus-visible:opacity-100 transition-opacity"
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

        {/* Content */}
        <Link href={postHref} className="block group/link">
          <h3 className="text-lg font-semibold mb-2 group-hover/link:text-primary transition-colors leading-snug">
            {post.title}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-3 mb-3 leading-relaxed">
            {postContent.slice(0, 250)}
            {postContent.length > 250 && "..."}
          </p>
        </Link>

        {/* Tags */}
        {postTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {postTags.slice(0, 5).map((tag) => (
              <button
                key={tag}
                onClick={() => onTagClick?.(tag)}
                className="inline-flex"
              >
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs transition-colors",
                    onTagClick &&
                      "cursor-pointer hover:bg-primary/10 hover:text-primary hover:border-primary/20"
                  )}
                >
                  #{tag}
                </Badge>
              </button>
            ))}
            {postTags.length > 5 && (
              <Badge variant="secondary" className="text-xs">
                +{postTags.length - 5}
              </Badge>
            )}
          </div>
        )}

        {/* Equipment links */}
        {equipmentLinks.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {equipmentLinks.map((item) => (
              <Link key={item.id} href={item.href}>
                <Badge
                  variant="outline"
                  className="text-xs gap-1 hover:bg-muted transition-colors"
                >
                  <LinkSimple className="w-3 h-3" />
                  {item.name}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-3 pt-3 border-t border-border/40">
          <VoteButton
            count={post.upvote_count}
            userVote={post.user_vote}
            onVote={(type) => votePost(post.id, type)}
            disabled={!user}
            size="sm"
          />

          <Link
            href={postHref}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            aria-label={`${post.comment_count} comments`}
          >
            <ChatCircle className="w-4 h-4" />
            <span className="tabular-nums text-xs">{post.comment_count}</span>
          </Link>

          <div
            className="flex items-center gap-1.5 px-2 py-1 text-sm text-muted-foreground"
            aria-label={`${post.view_count} views`}
          >
            <Eye className="w-4 h-4" />
            <span className="tabular-nums text-xs">{post.view_count}</span>
          </div>

          <div className="flex-1" />

          {user && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 text-muted-foreground transition-colors",
                bookmarked
                  ? "text-primary hover:text-primary/80"
                  : "hover:text-foreground"
              )}
              onClick={handleBookmark}
              aria-label={bookmarked ? "Remove bookmark" : "Bookmark post"}
            >
              <BookmarkSimple
                className="w-4 h-4"
                weight={bookmarked ? "fill" : "regular"}
              />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 transition-colors",
              shareSuccess
                ? "text-green-600"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={handleShare}
            aria-label="Share post"
          >
            {shareSuccess ? (
              <CheckCircle className="w-4 h-4" weight="fill" />
            ) : (
              <Share className="w-4 h-4" />
            )}
          </Button>
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
