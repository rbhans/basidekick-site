"use client";

import Link from "next/link";
import type { Course, Lesson } from "@/lib/courses";
import { useProgress } from "@/lib/progress";

interface LessonNavSidebarProps {
  course: Course;
  currentLessonSlug: string;
}

export function LessonNavSidebar({
  course,
  currentLessonSlug,
}: LessonNavSidebarProps) {
  const { hydrated, isLessonComplete } = useProgress();

  return (
    <nav aria-label="Course lessons" className="text-sm">
      <p className="brand-mono-label mb-3">LESSONS</p>
      <ol className="space-y-1">
        {course.lessons.map((lesson, idx) => (
          <LessonItem
            key={lesson.slug}
            lesson={lesson}
            index={idx + 1}
            isCurrent={lesson.slug === currentLessonSlug}
            isComplete={hydrated && isLessonComplete(course.slug, lesson.slug)}
          />
        ))}
      </ol>
    </nav>
  );
}

interface LessonItemProps {
  lesson: Lesson;
  index: number;
  isCurrent: boolean;
  isComplete: boolean;
}

function LessonItem({ lesson, index, isCurrent, isComplete }: LessonItemProps) {
  return (
    <li>
      <Link
        href={`/courses/${lesson.courseSlug}/${lesson.slug}`}
        aria-current={isCurrent ? "page" : undefined}
        className={
          isCurrent
            ? "group relative flex items-start gap-3 rounded-[var(--radius-control)] bg-[color:var(--cream)] px-3 py-2 text-[color:var(--ink)]"
            : "group relative flex items-start gap-3 rounded-[var(--radius-control)] px-3 py-2 text-[color:var(--ink-2)] transition hover:bg-[color:var(--cream)] hover:text-[color:var(--ink)]"
        }
      >
        <span
          aria-hidden="true"
          className={
            "mt-[0.45em] inline-flex h-2 w-2 shrink-0 items-center justify-center rounded-full " +
            (isCurrent
              ? "bg-[color:var(--punch)]"
              : isComplete
                ? "bg-[color:var(--moss)]"
                : "border border-[color:var(--border-strong)]")
          }
        />
        <div className="min-w-0">
          <p className="brand-mono-label truncate tabular-nums">
            .{String(index).padStart(2, "0")}{" "}
            <span className="text-[color:var(--ink-4)]">—</span> LESSON
          </p>
          <p className="truncate font-semibold leading-snug">{lesson.title}</p>
        </div>
        {isComplete ? (
          <span className="sr-only">Completed</span>
        ) : null}
      </Link>
    </li>
  );
}
