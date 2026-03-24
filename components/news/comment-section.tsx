"use client";

import { useState, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { ArrowUp, Trash, CaretDown, CaretUp } from "@phosphor-icons/react";
import { NewsArticleComment } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useNewsStore } from "./news-store";
import { useAuth } from "@/hooks/use-auth";
import { NewsCommentForm } from "./comment-form";
import { cn } from "@/lib/utils";

interface CommentNodeProps {
  comment: NewsArticleComment;
  articleId: string;
  depth: number;
}

function CommentNode({ comment, articleId, depth }: CommentNodeProps) {
  const { user } = useAuth();
  const { voteComment, deleteComment } = useNewsStore();
  const [showReply, setShowReply] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const isAuthor = user?.id === comment.author_id;

  return (
    <div className={cn("relative", depth > 0 && "ml-6 pl-4 border-l border-border/50")}>
      {/* Comment header */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hover:text-muted-foreground transition-colors"
        >
          {collapsed ? <CaretDown className="w-3 h-3" /> : <CaretUp className="w-3 h-3" />}
        </button>
        <span className="font-medium text-muted-foreground/80">
          {comment.author?.display_name || "Anonymous"}
        </span>
        <span>·</span>
        <span>{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
        {comment.upvote_count !== 0 && (
          <>
            <span>·</span>
            <span className={cn(comment.upvote_count > 0 ? "text-primary" : "text-destructive")}>
              {comment.upvote_count} {Math.abs(comment.upvote_count) === 1 ? "point" : "points"}
            </span>
          </>
        )}
      </div>

      {!collapsed && (
        <>
          {/* Comment body */}
          <div className="mt-1 text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
            {comment.content}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-2 text-xs">
            <button
              onClick={() => user && voteComment(comment.id, 1)}
              disabled={!user}
              className={cn(
                "flex items-center gap-1 transition-colors",
                comment.user_vote === 1
                  ? "text-primary"
                  : "text-muted-foreground/40 hover:text-primary"
              )}
            >
              <ArrowUp className="w-3 h-3" weight={comment.user_vote === 1 ? "fill" : "regular"} />
              upvote
            </button>
            {user && (
              <button
                onClick={() => setShowReply(!showReply)}
                className="text-muted-foreground/40 hover:text-foreground transition-colors"
              >
                reply
              </button>
            )}
            {isAuthor && (
              <button
                onClick={() => deleteComment(comment.id)}
                className="text-muted-foreground/40 hover:text-destructive transition-colors flex items-center gap-1"
              >
                <Trash className="w-3 h-3" />
                delete
              </button>
            )}
          </div>

          {/* Reply form */}
          {showReply && (
            <div className="mt-3">
              <NewsCommentForm
                articleId={articleId}
                parentId={comment.id}
                onSuccess={() => setShowReply(false)}
              />
            </div>
          )}

          {/* Nested replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-3">
              {comment.replies.map((reply) => (
                <CommentNode
                  key={reply.id}
                  comment={reply}
                  articleId={articleId}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface CommentSectionProps {
  articleId: string;
}

export function CommentSection({ articleId }: CommentSectionProps) {
  const { user } = useAuth();
  const comments = useNewsStore((s) => s.currentArticleComments);

  // Build comment tree from flat list
  const commentTree = useMemo(() => {
    const map = new Map<string, NewsArticleComment & { replies: NewsArticleComment[] }>();
    const roots: (NewsArticleComment & { replies: NewsArticleComment[] })[] = [];

    // First pass: create map entries
    for (const c of comments) {
      map.set(c.id, { ...c, replies: [] });
    }

    // Second pass: build tree
    for (const c of comments) {
      const node = map.get(c.id)!;
      if (c.parent_id && map.has(c.parent_id)) {
        map.get(c.parent_id)!.replies.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }, [comments]);

  return (
    <div className="space-y-6">
      {/* Comment form */}
      {user ? (
        <NewsCommentForm articleId={articleId} />
      ) : (
        <p className="text-sm text-muted-foreground/60">
          Sign in to join the discussion.
        </p>
      )}

      {/* Comment list */}
      {commentTree.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-border">
          {commentTree.map((comment) => (
            <CommentNode
              key={comment.id}
              comment={comment}
              articleId={articleId}
              depth={0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
