import type { Metadata } from "next";
import { CourseCard } from "@/components/courses/course-card";
import { getAllCourses } from "@/lib/courses";

export const metadata: Metadata = {
  title: "Courses — BASidekick",
  description:
    "Free, browser-based courses for the building automation industry.",
  alternates: { canonical: "https://basidekick.com/courses" },
};

export default function CoursesIndexPage() {
  const courses = getAllCourses();

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-16">
      <section className="max-w-3xl">
        <p className="brand-mono-label mb-4 inline-flex items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--punch)]"
          />
          <span>LEARNING PLATFORM</span>
        </p>
        <h1 className="text-5xl font-extrabold leading-[1.02] tracking-[-0.025em] text-[color:var(--ink)] sm:text-6xl md:text-7xl">
          Free, browser-based courses for the{" "}
          <em className="font-extrabold not-italic text-[color:var(--punch)]">
            building automation
          </em>{" "}
          industry.
        </h1>
        <p className="mt-6 max-w-[60ch] text-lg leading-[1.5] text-[color:var(--ink-2)]">
          Short lessons on how building automation actually works. Built to
          poke at, not memorize.
        </p>
      </section>

      <section className="mt-20">
        <div className="mb-6 flex items-baseline justify-between gap-4 border-b border-[color:var(--border)] pb-4">
          <h2 className="text-2xl font-bold tracking-[-0.015em] text-[color:var(--ink)]">
            Courses
          </h2>
          <p className="brand-mono-label">
            {courses.length} AVAILABLE
          </p>
        </div>
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {courses.map((course) => (
              <CourseCard key={course.slug} course={course} />
            ))}
          </div>
        ) : (
          <p className="text-[color:var(--ink-2)]">
            No courses yet. Check back soon.
          </p>
        )}
      </section>
    </div>
  );
}
