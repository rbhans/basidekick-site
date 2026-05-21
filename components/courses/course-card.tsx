"use client";

import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import type { Course } from "@/lib/courses";
import { useProgress } from "@/lib/progress";

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const { hydrated, getCourse } = useProgress();
  const courseProgress = getCourse(course.slug);
  const total = course.lessons.length;
  const done = courseProgress.lessonsCompleted.filter((slug) =>
    course.lessons.some((l) => l.slug === slug),
  ).length;
  const percent = total ? Math.round((done / total) * 100) : 0;
  const inProgress = hydrated && done > 0 && done < total;
  const finished = hydrated && total > 0 && done === total;

  // Only resume to a stored slug if it still exists in the course —
  // lesson slugs can change between content edits and a stale slug
  // would land users on a 404 because lesson routes use dynamicParams=false.
  const storedSlug = courseProgress.lastLessonSlug;
  const storedExists = !!storedSlug && course.lessons.some((l) => l.slug === storedSlug);
  const resumeSlug = storedExists ? storedSlug : course.lessons[0]?.slug;
  const href = resumeSlug
    ? `/courses/${course.slug}/${resumeSlug}`
    : `/courses/${course.slug}`;

  const cta = !hydrated
    ? "View course"
    : finished
      ? "Review course"
      : inProgress
        ? "Resume lesson"
        : "Start course";

  return (
    <Link
      href={href}
      className="group block rounded-[var(--radius-card)] border border-[color:var(--border)] bg-[color:var(--cream)] p-6 transition hover:border-[color:var(--punch)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--punch)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--sand)]"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="brand-mono-label">COURSE</p>
        <p className="brand-mono-label tabular-nums">
          {total} {total === 1 ? "LESSON" : "LESSONS"}
        </p>
      </div>
      <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.02em] text-[color:var(--ink)]">
        {course.title}
      </h2>
      <p className="mt-2 max-w-[55ch] text-[color:var(--ink-2)]">
        {course.description}
      </p>

      <div className="mt-5 flex items-center gap-4">
        <span className="inline-flex items-center gap-2 rounded-[var(--radius-control)] border border-[color:var(--ink)] bg-[color:var(--ink)] px-3 py-1.5 text-sm font-semibold text-[color:var(--cream)] transition group-hover:bg-[color:var(--punch)] group-hover:border-[color:var(--punch)]">
          {cta}
          <ArrowRightIcon weight="bold" size={14} aria-hidden="true" />
        </span>
        {hydrated && total > 0 ? (
          <div className="flex flex-1 items-center gap-3">
            <div
              className="h-1 flex-1 overflow-hidden rounded-full bg-[color:var(--border)]"
              aria-hidden="true"
            >
              <div
                className="h-full bg-[color:var(--punch)] transition-[width]"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="brand-mono-label tabular-nums">
              {done}/{total}
            </span>
          </div>
        ) : null}
      </div>
    </Link>
  );
}
