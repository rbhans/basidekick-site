"use client";

import type { Course } from "@/lib/courses";
import { useProgress } from "@/lib/progress";

interface CourseProgressBarProps {
  course: Course;
}

export function CourseProgressBar({ course }: CourseProgressBarProps) {
  const { hydrated, getCourse } = useProgress();
  const total = course.lessons.length;
  if (total === 0) return null;

  const cp = getCourse(course.slug);
  const done = cp.lessonsCompleted.filter((slug) =>
    course.lessons.some((l) => l.slug === slug),
  ).length;
  const percent = hydrated ? Math.round((done / total) * 100) : 0;

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {/* Bar is wider on >=sm; hidden on phone-width to keep the sticky
          header on one line. The N / N counter stays visible. */}
      <div
        className="hidden h-1 w-24 overflow-hidden rounded-full bg-[color:var(--border)] sm:block sm:w-32"
        aria-hidden="true"
      >
        <div
          className="h-full bg-[color:var(--punch)] transition-[width] duration-300"
          style={{ width: hydrated ? `${percent}%` : "0%" }}
        />
      </div>
      <span
        className="brand-mono-label whitespace-nowrap tabular-nums"
        suppressHydrationWarning
      >
        {hydrated ? `${done} / ${total}` : `0 / ${total}`}
      </span>
    </div>
  );
}
