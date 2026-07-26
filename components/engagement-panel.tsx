"use client";

import { ChatCircle, ThumbsUp } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/providers";
import { SaveButton } from "@/components/personalization";
import { createClient } from "@/lib/supabase/client";

type EngagementKind = "news" | "wiki" | "pointstack" | "library";
type CommentRow = {
  id: string;
  content: string;
  created_at: string;
  author?: { display_name: string | null } | { display_name: string | null }[] | null;
};

const CONFIG = {
  news: { comments: "news_article_comments", commentId: "article_id", authorId: "author_id", votes: "news_article_votes", voteId: "article_id" },
  wiki: { comments: "wiki_comments", commentId: "article_id", authorId: "user_id", votes: null, voteId: null },
  pointstack: { comments: "pointstack_post_comments", commentId: "post_id", authorId: "author_id", votes: "pointstack_post_votes", voteId: "post_id" },
  library: { comments: "pointstack_resource_comments", commentId: "resource_id", authorId: "author_id", votes: "pointstack_resource_votes", voteId: "resource_id" },
} as const;

function authorName(author: CommentRow["author"]) {
  const value = Array.isArray(author) ? author[0] : author;
  return value?.display_name ?? "Member";
}

export function EngagementPanel({ kind, entityId, title }: { kind: EngagementKind; entityId: string; title: string }) {
  const auth = useAuth();
  const client = useMemo(() => createClient(), []);
  const config = CONFIG[kind];
  const [voted, setVoted] = useState(false);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!client) return;
    const relation = config.authorId === "user_id" ? "author:profiles!user_id(display_name)" : "author:profiles!author_id(display_name)";
    client.from(config.comments).select(`id, content, created_at, ${relation}`).eq(config.commentId, entityId).order("created_at", { ascending: true }).limit(100)
      .then(({ data }) => setComments((data as unknown as CommentRow[]) ?? []));
    if (auth.user) {
      if (config.votes && config.voteId) {
        client.from(config.votes).select("vote_type").eq("user_id", auth.user.id).eq(config.voteId, entityId).maybeSingle()
          .then(({ data }) => setVoted(data?.vote_type === 1));
      }
    }
  }, [auth.user, client, config, entityId, kind]);

  function requireUser(action: string) {
    if (auth.user) return true;
    auth.requestSignIn(action, window.location.pathname);
    return false;
  }

  async function toggleVote() {
    if (!client || !config.votes || !config.voteId || !requireUser("vote on this entry") || !auth.user || busy) return;
    setBusy(true);
    const query = client.from(config.votes);
    const result = voted
      ? await query.delete().eq("user_id", auth.user.id).eq(config.voteId, entityId)
      : await query.upsert({ user_id: auth.user.id, [config.voteId]: entityId, vote_type: 1 }, { onConflict: `user_id,${config.voteId}` });
    if (result.error) setStatus(result.error.message);
    else setVoted(!voted);
    setBusy(false);
  }

  async function submitComment(event: React.FormEvent) {
    event.preventDefault();
    if (!client || !requireUser("join the discussion") || !auth.user || !draft.trim() || busy) return;
    setBusy(true);
    setStatus("");
    const payload = { [config.commentId]: entityId, [config.authorId]: auth.user.id, content: draft.trim() };
    const relation = config.authorId === "user_id" ? "author:profiles!user_id(display_name)" : "author:profiles!author_id(display_name)";
    const { data, error } = await client.from(config.comments).insert(payload).select(`id, content, created_at, ${relation}`).single();
    if (error) setStatus(error.message);
    else {
      setComments((items) => [...items, data as unknown as CommentRow]);
      setDraft("");
    }
    setBusy(false);
  }

  return <section className="engagement-panel" id="discussion"><header><div><ChatCircle size={18} /><span><strong>Discussion</strong><small>{comments.length} comment{comments.length === 1 ? "" : "s"}</small></span></div><div><SaveButton kind={kind} entityId={entityId} title={title} />{config.votes && <button type="button" className={voted ? "active" : ""} disabled={busy} onClick={toggleVote}><ThumbsUp size={16} weight={voted ? "fill" : "regular"} /> {voted ? "Voted" : "Vote"}</button>}</div></header><div className="comment-list">{comments.map((comment) => <article key={comment.id}><strong>{authorName(comment.author)}</strong><p>{comment.content}</p><small>{new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(comment.created_at))}</small></article>)}{comments.length === 0 && <p>No comments yet. Add the first useful note.</p>}</div><form onSubmit={submitComment}><textarea aria-label="Comment" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={auth.user ? "Add a useful comment…" : "Sign in to comment"} maxLength={5000} /><button className="button primary" type="submit" disabled={busy || !draft.trim()}>{busy ? "Posting…" : "Post comment"}</button></form>{status && <p className="form-status error" role="alert">{status}</p>}</section>;
}
