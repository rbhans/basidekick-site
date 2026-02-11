"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ChatCircle, Eye, Share, DotsThree } from "@phosphor-icons/react";
import { PointStackPost, PointStackPostType } from "@/lib/types";
import { ROUTES, getPointStackPostRoute } from "@/lib/routes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "../shared/user-avatar";
import { VoteButton } from "../shared/vote-button";
import { usePointStackStore } from "../pointstack-store";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface FeedCardProps {
  post: PointStackPost;
  equipmentLinks?: { id: string; name: string; href: string }[];
}

const POST_TYPE_LABELS: Record<PointStackPostType, { label: string; color: string }> = {
  discussion: { label: "Discussion", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  question: { label: "Question", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  project: { label: "Project", color: "bg-green-500/10 text-green-600 border-green-500/20" },
  job: { label: "Job", color: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  tip: { label: "Tip", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
};

export function FeedCard({ post, equipmentLinks = [] }: FeedCardProps) {
  const { user } = useAuth();
  const { votePost, deletePost } = usePointStackStore();
  const typeInfo = POST_TYPE_LABELS[post.post_type];
  const postHref = getPointStackPostRoute(post.post_type, post.slug);
  const postTags = post.tags || [];
  const postContent = post.content || "";

  const handleShare = async () => {
    const url = `${window.location.origin}${postHref}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: post.title, url });
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      // User cancelled share or clipboard access denied - silently ignore
    }
  };

  const isAuthor = user?.id === post.author_id;
  // Use author_id for profile link if display_name is missing
  const profileLink = post.author?.display_name
    ? ROUTES.POINTSTACK_PROFILE(post.author.display_name)
    : ROUTES.POINTSTACK;

  return (
    <article className="p-5 border border-border rounded-lg bg-card hover:border-primary/30 transition-colors">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <Link href={profileLink}>
          <UserAvatar
            displayName={post.author?.display_name || null}
            avatarUrl={post.author?.avatar_url}
            size="lg"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Link
            href={profileLink}
            className="font-medium hover:underline"
          >
            {post.author?.display_name || "Anonymous"}
          </Link>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </p>
        </div>
        <Badge variant="outline" className={cn("text-xs", typeInfo.color)}>
          {typeInfo.label}
        </Badge>
        {isAuthor && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <DotsThree className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`${postHref}?edit=true`}>Edit</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  if (confirm("Are you sure you want to delete this post?")) {
                    deletePost(post.id);
                  }
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Content */}
      <Link href={postHref} className="block">
        <h3 className="text-lg font-semibold mb-2 hover:text-primary transition-colors">
          {post.title}
        </h3>
        <p className="text-muted-foreground text-sm line-clamp-3 mb-3">
          {postContent.slice(0, 250)}
          {postContent.length > 250 && "..."}
        </p>
      </Link>

      {/* Tags */}
      {postTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {postTags.slice(0, 5).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {postTags.length > 5 && (
            <Badge variant="secondary" className="text-xs">
              +{postTags.length - 5}
            </Badge>
          )}
        </div>
      )}

      {equipmentLinks.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {equipmentLinks.map((item) => (
            <Link key={item.id} href={item.href}>
              <Badge variant="secondary" className="text-xs">
                {item.name}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2 border-t border-border">
        <VoteButton
          count={post.upvote_count}
          userVote={post.user_vote}
          onVote={(type) => votePost(post.id, type)}
          disabled={!user}
          size="sm"
        />

        <Link
          href={postHref}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChatCircle className="w-4 h-4" />
          <span>{post.comment_count}</span>
        </Link>

        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Eye className="w-4 h-4" />
          <span>{post.view_count}</span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="ml-auto h-8 px-2 text-muted-foreground hover:text-foreground"
          onClick={handleShare}
        >
          <Share className="w-4 h-4" />
        </Button>
      </div>
    </article>
  );
}
