"use client";

import { useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Check, Plus, WarningCircle } from "@phosphor-icons/react";
import { useAuth } from "@/hooks/use-auth";
import { usePointStackStore } from "../pointstack-store";
import { CreatePostDialog } from "../feed/create-post-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getPointStackPostRoute } from "@/lib/routes";

const SORT_CHIPS: { key: "recent" | "unanswered" | "popular"; label: string }[] = [
  { key: "recent", label: "Recent" },
  { key: "unanswered", label: "Unanswered" },
  { key: "popular", label: "Popular" },
];

export function PointStackQuestionsView() {
  const { user } = useAuth();
  const { posts, feedLoading, feedError, feedFilter, setFeedFilter } = usePointStackStore();

  useEffect(() => {
    setFeedFilter({ type: "question", sortBy: "recent" });
  }, [setFeedFilter]);

  const questions = posts.filter((p) => p.post_type === "question");
  const currentSort = feedFilter.sortBy || "recent";

  return (
    <section className="container mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-16 py-10">
      {/* Section heading */}
      <div className="flex items-baseline gap-3.5 pb-3.5 border-b border-foreground mb-6">
        <span className="font-mono text-[11px] text-accent tracking-[1px]">01 /</span>
        <h1 className="font-heading font-semibold text-[26px] leading-none text-foreground">
          Questions
        </h1>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground tabular-nums">
          {questions.length} {questions.length === 1 ? "question" : "questions"}
        </span>
        {user && (
          <CreatePostDialog
            trigger={
              <button className="ml-3 font-mono text-[10px] uppercase tracking-[1.2px] text-foreground hover:text-accent transition-colors inline-flex items-center gap-1">
                <Plus className="w-3 h-3" />
                Ask
              </button>
            }
            defaultType="question"
          />
        )}
      </div>

      <p className="font-heading italic text-[15px] text-muted-foreground mb-7">
        Ask things you got stuck on. Answer things you know.
      </p>

      {/* Sort chips */}
      <div className="flex items-center gap-3 mb-8 font-mono text-[11px] uppercase tracking-[1.2px] text-muted-foreground">
        <span>Sort</span>
        {SORT_CHIPS.map((chip) => (
          <button
            key={chip.key}
            onClick={() => setFeedFilter({ type: "question", sortBy: chip.key })}
            className={`px-3 py-1.5 border rounded-sm transition-colors ${
              currentSort === chip.key
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {feedError && (
        <div className="p-6 mb-6 border border-border rounded-md bg-card text-center">
          <WarningCircle className="w-7 h-7 text-destructive mx-auto mb-2" />
          <p className="font-heading italic text-[16px] mb-1">Something went wrong.</p>
          <p className="text-sm text-muted-foreground mb-3">{feedError}</p>
          <Button variant="outline" size="sm" onClick={() => setFeedFilter({ type: "question" })}>
            Try again
          </Button>
        </div>
      )}

      {/* Loading */}
      {feedLoading && questions.length === 0 && (
        <div className="space-y-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-[56px_1fr_60px] gap-4 py-5 px-2 border-b border-muted">
              <div className="flex flex-col gap-2 items-center">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-8" />
              </div>
              <div>
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-3 w-12 self-center" />
            </div>
          ))}
        </div>
      )}

      {/* Questions list */}
      {questions.length > 0 && (
        <div className="space-y-0">
          {questions.map((question) => {
            const hasAcceptedAnswer = Boolean(question.metadata?.hasAcceptedAnswer);
            return (
              <Link
                key={question.id}
                href={getPointStackPostRoute(question.post_type, question.slug)}
                className="group grid grid-cols-[64px_1fr_auto] gap-5 items-start py-5 px-2 border-b border-muted hover:bg-muted/40 transition-colors"
              >
                {/* Stats column */}
                <div className="flex flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[1px] text-muted-foreground">
                  <div className="text-center">
                    <div className="font-heading font-semibold text-[16px] text-foreground tabular-nums not-italic normal-case tracking-normal">
                      {question.upvote_count}
                    </div>
                    <div>votes</div>
                  </div>
                  <div className="text-center">
                    <div className={`font-heading font-semibold text-[16px] tabular-nums not-italic normal-case tracking-normal flex items-center justify-center gap-0.5 ${hasAcceptedAnswer ? "text-accent" : "text-foreground"}`}>
                      {hasAcceptedAnswer && <Check className="w-3 h-3" weight="bold" />}
                      {question.comment_count}
                    </div>
                    <div>answers</div>
                  </div>
                </div>

                {/* Content */}
                <div className="min-w-0">
                  <h3 className="font-heading font-semibold text-[17px] leading-[1.3] text-foreground group-hover:text-accent transition-colors mb-1.5">
                    {question.title}
                  </h3>
                  {question.content && (
                    <p className="text-[13px] text-muted-foreground leading-[1.5] line-clamp-2 mb-2.5 max-w-[640px]">
                      {question.content.slice(0, 220)}
                      {question.content.length > 220 && "…"}
                    </p>
                  )}
                  <div className="flex items-center gap-3 flex-wrap font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground">
                    <span className="text-foreground">
                      @{question.author?.display_name || "anonymous"}
                    </span>
                    <span>
                      {formatDistanceToNow(new Date(question.created_at), { addSuffix: true })}
                    </span>
                    <span className="tabular-nums">{question.view_count} views</span>
                    {question.tags.length > 0 && (
                      <span className="normal-case tracking-normal text-[11px] text-muted-foreground truncate max-w-[280px]">
                        {question.tags.slice(0, 3).join(" · ")}
                        {question.tags.length > 3 && ` · +${question.tags.length - 3}`}
                      </span>
                    )}
                  </div>
                </div>

                <span className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground group-hover:text-accent transition-colors self-center">
                  Open →
                </span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!feedLoading && questions.length === 0 && !feedError && (
        <div className="py-20 text-center font-heading italic text-[18px] text-muted-foreground">
          No questions yet. Be the first to ask.
        </div>
      )}
    </section>
  );
}
