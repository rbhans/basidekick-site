"use client";

import { useEffect } from "react";
import {
  CheckIcon,
  ArrowRightIcon,
} from "@phosphor-icons/react/dist/ssr";
import { useProgress } from "@/lib/progress";

interface MarkCompleteButtonProps {
  courseSlug: string;
  lessonSlug: string;
  nextHref: string | null;
}

export function MarkCompleteButton({
  courseSlug,
  lessonSlug,
  nextHref,
}: MarkCompleteButtonProps) {
  const {
    hydrated,
    isLessonComplete,
    markLessonComplete,
    unmarkLessonComplete,
    setLastLesson,
  } = useProgress();

  useEffect(() => {
    if (hydrated) setLastLesson(courseSlug, lessonSlug);
  }, [hydrated, courseSlug, lessonSlug, setLastLesson]);

  const complete = hydrated && isLessonComplete(courseSlug, lessonSlug);

  if (!hydrated) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex items-center gap-2 rounded-[var(--radius-control)] border border-[color:var(--color-border-strong)] px-4 py-2 text-sm font-medium text-[color:var(--color-fg-subtle)]"
      >
        Mark complete
      </button>
    );
  }

  if (complete) {
    return (
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-[var(--radius-control)] border border-[color:var(--color-feedback-correct-border)] bg-[color:var(--color-feedback-correct-bg)] px-3 py-2 text-sm font-semibold text-[color:var(--color-feedback-correct-fg)]">
          <CheckIcon weight="bold" size={16} aria-hidden="true" />
          Completed
        </span>
        <button
          type="button"
          onClick={() => unmarkLessonComplete(courseSlug, lessonSlug)}
          className="text-sm text-[color:var(--color-fg-subtle)] underline-offset-4 hover:text-[color:var(--color-fg)] hover:underline"
        >
          Undo
        </button>
        {nextHref ? (
          <a
            href={nextHref}
            className="ml-auto inline-flex items-center gap-2 rounded-[var(--radius-control)] border border-[color:var(--color-border-strong)] px-4 py-2 text-sm font-medium text-[color:var(--color-fg)] transition hover:bg-[color:var(--color-bg-muted)]"
          >
            Next lesson
            <ArrowRightIcon weight="bold" size={16} aria-hidden="true" />
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => markLessonComplete(courseSlug, lessonSlug)}
      className="inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[color:var(--color-accent)] px-4 py-2 text-sm font-medium text-[color:var(--color-accent-fg)] transition hover:bg-[color:var(--color-accent-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-strong)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg)]"
    >
      Mark complete
      <ArrowRightIcon weight="bold" size={16} aria-hidden="true" />
    </button>
  );
}
