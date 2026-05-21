"use client";

import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import type { Course } from "@/lib/courses";
import { useProgress } from "@/lib/progress";

interface CourseOverviewLessonListProps {
  course: Course;
}

export function CourseOverviewLessonList({
  course,
}: CourseOverviewLessonListProps) {
  const { hydrated, isLessonComplete, getCourse } = useProgress();
  const cp = getCourse(course.slug);

  return (
    <ol className="divide-y divide-[color:var(--border)] border-y border-[color:var(--border)]">
      {course.lessons.map((lesson, idx) => {
        const complete = hydrated && isLessonComplete(course.slug, lesson.slug);
        const isResume =
          hydrated &&
          cp.lastLessonSlug === lesson.slug &&
          !complete;
        return (
          <li key={lesson.slug}>
            <Link
              href={`/courses/${course.slug}/${lesson.slug}`}
              className="group flex items-start gap-5 py-5 transition hover:bg-[color:var(--cream)]"
            >
              <div
                className={
                  "brand-mono-label mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full tabular-nums " +
                  (complete
                    ? "bg-[color:var(--punch)] text-[color:var(--cream)] border border-[color:var(--punch)]"
                    : "bg-transparent text-[color:var(--ink-3)] border border-[color:var(--border-strong)]")
                }
                aria-hidden="true"
              >
                {complete ? (
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path
                      fillRule="evenodd"
                      d="M16.704 5.29a1 1 0 0 1 .006 1.414l-8.25 8.32a1 1 0 0 1-1.42 0L3.29 11.29a1 1 0 1 1 1.42-1.41l3.04 3.05 7.54-7.61a1 1 0 0 1 1.414-.03Z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  String(idx + 1).padStart(2, "0")
                )}
              </div>
              <div className="min-w-0 flex-1 pr-4">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="text-lg font-bold tracking-[-0.015em] text-[color:var(--ink)]">
                    {lesson.title}
                  </h3>
                  {isResume ? (
                    <span className="brand-mono-label inline-flex items-center gap-1 rounded-[var(--radius-chip)] bg-[color:var(--punch)] px-2 py-0.5 text-[color:var(--cream)]">
                      RESUME
                    </span>
                  ) : null}
                </div>
                {lesson.description ? (
                  <p className="mt-1 text-[color:var(--ink-2)]">
                    {lesson.description}
                  </p>
                ) : null}
                <p className="brand-mono-label mt-2">
                  <span className="text-[color:var(--punch)]">
                    .{String(idx + 1).padStart(2, "0")}
                  </span>{" "}
                  <span className="text-[color:var(--ink-4)]">—</span> LESSON
                  {lesson.estimatedMinutes
                    ? ` · ${lesson.estimatedMinutes} MIN`
                    : ""}
                </p>
              </div>
              <ArrowRightIcon
                weight="bold"
                size={18}
                aria-hidden="true"
                className="self-center text-[color:var(--ink-3)] transition group-hover:translate-x-1 group-hover:text-[color:var(--punch)]"
              />
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
