"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowSquareOut, ChatCircle } from "@phosphor-icons/react";
import { NewsArticle } from "@/lib/types";
import { ROUTES } from "@/lib/routes";
import { VoteButton } from "@/components/pointstack/shared/vote-button";
import { useNewsStore } from "./news-store";
import { useAuth } from "@/hooks/use-auth";

interface NewsCardProps {
  article: NewsArticle;
  rank: number;
}

export function NewsCard({ article, rank }: NewsCardProps) {
  const { user } = useAuth();
  const { voteArticle } = useNewsStore();
  const detailHref = ROUTES.NEWS_ARTICLE(article.slug);

  return (
    <div className="flex items-start gap-3 py-3 group">
      {/* Rank number */}
      <span className="text-muted-foreground/50 font-mono text-sm w-6 text-right pt-1 shrink-0">
        {rank}.
      </span>

      {/* Vote arrows */}
      <div className="shrink-0 pt-0.5">
        <VoteButton
          count={article.upvote_count}
          userVote={article.user_vote}
          onVote={(voteType) => user && voteArticle(article.id, voteType)}
          disabled={!user}
          size="sm"
          vertical
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title row */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[15px] font-semibold text-foreground hover:text-primary transition-colors leading-snug"
          >
            {article.title}
            <ArrowSquareOut className="w-3 h-3 inline ml-1.5 opacity-40 group-hover:opacity-70 transition-opacity" />
          </a>
          <span className="text-xs text-muted-foreground/50 font-mono shrink-0">
            ({article.source_domain})
          </span>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground/60">
          <span>
            {article.upvote_count} {article.upvote_count === 1 ? "point" : "points"}
          </span>
          {article.submitter?.display_name && (
            <>
              <span>·</span>
              <span>
                by{" "}
                <span className="text-muted-foreground/80">
                  {article.submitter.display_name}
                </span>
              </span>
            </>
          )}
          {article.is_ai_submitted && (
            <>
              <span>·</span>
              <span className="text-muted-foreground/40">AI curated</span>
            </>
          )}
          <span>·</span>
          <span>
            {formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}
          </span>
          <span>·</span>
          <Link
            href={detailHref}
            className="inline-flex items-center gap-1 hover:text-primary transition-colors"
          >
            <ChatCircle className="w-3 h-3" />
            {article.comment_count} {article.comment_count === 1 ? "comment" : "comments"}
          </Link>
        </div>
      </div>
    </div>
  );
}
