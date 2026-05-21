"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/lib/routes";
import * as api from "../pointstack-api";
import type { UserCourseProgressRow } from "../pointstack-api";

export interface CompletionsCatalogEntry {
  slug: string;
  title: string;
  totalLessons: number;
}

interface CompletionsTabProps {
  userId: string;
  isOwner: boolean;
  catalog: CompletionsCatalogEntry[];
}

export function CompletionsTab({ userId, isOwner, catalog }: CompletionsTabProps) {
  const [progress, setProgress] = useState<UserCourseProgressRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOwner) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    api
      .fetchUserCourseProgress(userId)
      .then((rows) => {
        if (!cancelled) setProgress(rows);
      })
      .catch((err) => {
        console.error("Failed to fetch course progress", err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId, isOwner]);

  if (!isOwner) {
    // Public view: until DB-side policy permits cross-user reads, hide details.
    return (
      <div className="py-16 text-center italic text-[16px] text-muted-foreground">
        Course completions are private.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (progress.length === 0) {
    return (
      <div className="py-16 text-center italic text-[16px] text-muted-foreground">
        No course progress yet.{" "}
        <Link
          href={ROUTES.COURSES}
          className="text-foreground underline decoration-accent underline-offset-[3px] hover:text-accent not-italic font-sans"
        >
          Browse courses →
        </Link>
      </div>
    );
  }

  const catalogBySlug = new Map(catalog.map((c) => [c.slug, c]));

  return (
    <div className="space-y-0">
      {progress.map((row, idx) => {
        const meta = catalogBySlug.get(row.course_slug);
        const total = meta?.totalLessons ?? row.lessons_completed.length;
        const completed = Math.min(row.lessons_completed.length, total);
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
        const isDone = total > 0 && completed === total;
        const href = row.last_lesson_slug
          ? `${ROUTES.COURSES}/${row.course_slug}/${row.last_lesson_slug}`
          : `${ROUTES.COURSES}/${row.course_slug}`;

        return (
          <Link
            key={row.course_slug}
            href={href}
            className="group grid grid-cols-[28px_1fr_auto] gap-4 items-center py-4 px-2 border-b border-muted hover:bg-muted/40 transition-colors"
          >
            <span className="font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground tabular-nums">
              {String(idx + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <div className="font-heading font-semibold text-[15px] leading-[1.3] text-foreground group-hover:text-accent transition-colors">
                {meta?.title || row.course_slug}
              </div>
              <div className="flex items-center gap-3 mt-1 font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground flex-wrap">
                {isDone ? (
                  <span className="text-accent">Complete</span>
                ) : (
                  <span className="tabular-nums">{completed} / {total} lessons</span>
                )}
                <span className="tabular-nums">{pct}%</span>
                <span className="tabular-nums">
                  Last active {formatDistanceToNow(new Date(row.last_active_at), { addSuffix: true })}
                </span>
              </div>
              <div className="mt-2 h-1 w-full max-w-[280px] rounded-full bg-muted overflow-hidden" aria-hidden="true">
                <div className="h-full bg-accent transition-[width] duration-300" style={{ width: `${pct}%` }} />
              </div>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground group-hover:text-accent transition-colors">
              {isDone ? "Review" : "Continue"} →
            </span>
          </Link>
        );
      })}
    </div>
  );
}
