"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useProgress } from "@/lib/progress";

interface LessonSectionProps {
  id?: string;
  title?: string;
  level?: 2 | 3;
  trackProgress?: boolean;
  courseSlug?: string;
  lessonSlug?: string;
  children: ReactNode;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function LessonSection({
  id,
  title,
  level = 2,
  trackProgress = false,
  courseSlug,
  lessonSlug,
  children,
}: LessonSectionProps) {
  const sectionId = id ?? (title ? slugify(title) : undefined);
  const ref = useRef<HTMLElement | null>(null);
  const { setInteraction, hydrated } = useProgress();

  useEffect(() => {
    if (
      !trackProgress ||
      !hydrated ||
      !sectionId ||
      !courseSlug ||
      !lessonSlug ||
      !ref.current
    )
      return;
    const key = `section.${courseSlug}.${lessonSlug}.${sectionId}`;
    const node = ref.current;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
            setInteraction(key, { seenAt: Date.now() });
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: [0.4] },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [
    trackProgress,
    hydrated,
    sectionId,
    courseSlug,
    lessonSlug,
    setInteraction,
  ]);

  const Heading = (level === 3 ? "h3" : "h2") as "h2" | "h3";
  const headingClass =
    level === 3
      ? "group mt-10 mb-3 flex items-baseline gap-2 text-2xl font-bold tracking-[-0.015em] text-[color:var(--ink)]"
      : "group mt-12 mb-4 flex items-baseline gap-2 text-3xl font-extrabold tracking-[-0.02em] text-[color:var(--ink)]";

  return (
    <section
      ref={ref}
      id={sectionId}
      className="scroll-mt-24"
    >
      {title ? (
        <Heading className={headingClass}>
          {title}
          {sectionId ? (
            <a
              href={`#${sectionId}`}
              aria-label={`Link to ${title}`}
              className="opacity-0 transition group-hover:opacity-100 text-[color:var(--color-fg-subtle)] hover:text-[color:var(--color-fg)] focus-visible:opacity-100"
            >
              #
            </a>
          ) : null}
        </Heading>
      ) : null}
      {children}
    </section>
  );
}
