"use client";

import { useState, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { ArrowUp, Trash, CaretDown, CaretUp } from "@phosphor-icons/react";
import { NewsArticleComment } from "@/lib/types";
import { useNewsStore } from "./news-store";
import { useAuth } from "@/hooks/use-auth";
import { NewsCommentForm } from "./comment-form";

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
    <div className={`relative ${depth > 0 ? "ml-5 pl-4 border-l border-border" : ""}`}>
      {/* Comment header */}
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hover:text-foreground transition-colors"
        >
          {collapsed ? <CaretDown className="w-3 h-3" /> : <CaretUp className="w-3 h-3" />}
        </button>
        <span className="text-foreground normal-case tracking-normal font-sans text-[13px] font-heading font-semibold">
          {comment.author?.display_name || "Anonymous"}
        </span>
        <span>·</span>
        <span className="tabular-nums">
          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
        </span>
        {comment.upvote_count !== 0 && (
          <>
            <span>·</span>
            <span
              className={`tabular-nums ${
                comment.upvote_count > 0 ? "text-accent" : "text-destructive"
              }`}
            >
              {comment.upvote_count}{" "}
              {Math.abs(comment.upvote_count) === 1 ? "point" : "points"}
            </span>
          </>
        )}
      </div>

      {!collapsed && (
        <>
          {/* Comment body */}
          <div className="mt-2 text-[14px] text-foreground leading-[1.6] whitespace-pre-wrap">
            {comment.content}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => user && voteComment(comment.id, 1)}
              disabled={!user}
              className={`inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[1.1px] transition-colors ${
                comment.user_vote === 1
                  ? "text-accent"
                  : "text-muted-foreground hover:text-accent"
              } disabled:cursor-not-allowed`}
            >
              <ArrowUp
                className="w-3 h-3"
                weight={comment.user_vote === 1 ? "fill" : "regular"}
              />
              Upvote
            </button>
            {user && (
              <button
                onClick={() => setShowReply(!showReply)}
                className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground hover:text-foreground transition-colors"
              >
                Reply
              </button>
            )}
            {isAuthor && (
              <button
                onClick={() => deleteComment(comment.id)}
                className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash className="w-3 h-3" />
                Delete
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
            <div className="mt-4 space-y-4">
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

    for (const c of comments) {
      map.set(c.id, { ...c, replies: [] });
    }

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
    <div>
      {/* Comment form */}
      {user ? (
        <NewsCommentForm articleId={articleId} />
      ) : (
        <p className="font-heading italic text-[15px] text-muted-foreground">
          Sign in to join the discussion.
        </p>
      )}

      {/* Comment list */}
      {commentTree.length > 0 && (
        <div className="mt-6 pt-6 border-t border-foreground space-y-6">
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
