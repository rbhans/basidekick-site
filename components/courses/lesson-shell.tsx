import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@phosphor-icons/react/dist/ssr";
import { CourseProgressBar } from "@/components/courses/course-progress-bar";
import { LessonNavSidebar } from "@/components/courses/lesson-nav-sidebar";
import { MarkCompleteButton } from "@/components/courses/mark-complete-button";
import type { Course } from "@/lib/courses";

interface LessonShellProps {
  course: Course;
  currentLessonSlug: string;
  lessonTitle: string;
  lessonDescription?: string;
  estimatedMinutes?: number;
  prev: { title: string; href: string } | null;
  next: { title: string; href: string } | null;
  children: ReactNode;
}

export function LessonShell({
  course,
  currentLessonSlug,
  lessonTitle,
  lessonDescription,
  estimatedMinutes,
  prev,
  next,
  children,
}: LessonShellProps) {
  return (
    <div>
      <div className="sticky top-0 z-10 border-b border-[color:var(--border)] bg-[color:var(--sand)]/90 backdrop-blur-md">
        <div className="mx-auto flex h-12 w-full max-w-6xl items-center justify-between gap-4 px-6">
          <Link
            href={`/courses/${course.slug}`}
            className="truncate font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--ink-2)] hover:text-[color:var(--punch)]"
          >
            {course.title}
          </Link>
          <CourseProgressBar course={course} />
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-12 px-6 py-12 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <LessonNavSidebar
              course={course}
              currentLessonSlug={currentLessonSlug}
            />
          </div>
        </aside>

        <article className="min-w-0">
          <header className="mb-10 border-b border-[color:var(--border)] pb-8">
            <p className="brand-mono-label mb-3 inline-flex items-center gap-2">
              <span
                aria-hidden="true"
                className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--punch)]"
              />
              {course.title}
              {estimatedMinutes ? (
                <>
                  <span className="text-[color:var(--ink-4)]"> · </span>
                  <span>{estimatedMinutes} MIN</span>
                </>
              ) : null}
            </p>
            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-[-0.025em] text-[color:var(--ink)] sm:text-5xl md:text-6xl">
              {lessonTitle}
            </h1>
            {lessonDescription ? (
              <p className="mt-4 max-w-[60ch] text-lg leading-[1.5] text-[color:var(--ink-2)]">
                {lessonDescription}
              </p>
            ) : null}
          </header>

          <div className="prose">{children}</div>

          <footer className="mt-16 border-t border-[color:var(--border)] pt-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <MarkCompleteButton
                courseSlug={course.slug}
                lessonSlug={currentLessonSlug}
                nextHref={next?.href ?? null}
              />
            </div>

            <nav
              aria-label="Lesson navigation"
              className="mt-10 grid gap-3 sm:grid-cols-2"
            >
              {prev ? (
                <Link
                  href={prev.href}
                  className="group rounded-[var(--radius-card)] border border-[color:var(--border)] p-4 transition hover:border-[color:var(--punch)] hover:bg-[color:var(--punch-soft)]"
                >
                  <p className="brand-mono-label inline-flex items-center gap-1 group-hover:text-[color:var(--punch)]">
                    <ArrowLeftIcon
                      weight="bold"
                      size={12}
                      aria-hidden="true"
                    />
                    PREVIOUS
                  </p>
                  <p className="mt-1 font-semibold text-[color:var(--ink)]">
                    {prev.title}
                  </p>
                </Link>
              ) : (
                <div />
              )}
              {next ? (
                <Link
                  href={next.href}
                  className="group rounded-[var(--radius-card)] border border-[color:var(--border)] p-4 text-right transition hover:border-[color:var(--punch)] hover:bg-[color:var(--punch-soft)]"
                >
                  <p className="brand-mono-label inline-flex items-center justify-end gap-1 group-hover:text-[color:var(--punch)]">
                    NEXT
                    <ArrowRightIcon
                      weight="bold"
                      size={12}
                      aria-hidden="true"
                    />
                  </p>
                  <p className="mt-1 font-semibold text-[color:var(--ink)]">
                    {next.title}
                  </p>
                </Link>
              ) : null}
            </nav>
          </footer>
        </article>
      </div>
    </div>
  );
}
