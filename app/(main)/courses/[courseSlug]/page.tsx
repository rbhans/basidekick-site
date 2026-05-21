import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CourseProgressBar } from "@/components/courses/course-progress-bar";
import { CourseOverviewLessonList } from "@/components/courses/course-overview-lesson-list";
import { getAllCourseSlugs, getCourse } from "@/lib/courses";

export function generateStaticParams() {
  return getAllCourseSlugs().map((courseSlug) => ({ courseSlug }));
}

export const dynamicParams = false;

interface PageProps {
  params: Promise<{ courseSlug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { courseSlug } = await params;
  try {
    const course = getCourse(courseSlug);
    return {
      title: course.title,
      description: course.description,
      alternates: { canonical: `https://basidekick.com/courses/${courseSlug}` },
    };
  } catch {
    return {};
  }
}

export default async function CourseOverviewPage({ params }: PageProps) {
  const { courseSlug } = await params;
  let course;
  try {
    course = getCourse(courseSlug);
  } catch {
    notFound();
  }

  const totalMinutes = course.lessons.reduce(
    (sum, l) => sum + (l.estimatedMinutes ?? 0),
    0,
  );

  return (
    <div>
      <div className="border-b border-[color:var(--border)]">
        <div className="mx-auto flex h-12 w-full max-w-3xl items-center justify-end px-6">
          <CourseProgressBar course={course} />
        </div>
      </div>

      <main className="mx-auto w-full max-w-3xl px-6 py-16">
        <section className="border-b border-[color:var(--border)] pb-10">
          <p className="brand-mono-label mb-3 inline-flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--punch)]"
            />
            COURSE
            {totalMinutes > 0 ? (
              <>
                <span className="text-[color:var(--ink-4)]">·</span>
                <span>{totalMinutes} MIN TOTAL</span>
              </>
            ) : null}
          </p>
          <h1 className="text-4xl font-extrabold leading-[1.05] tracking-[-0.025em] text-[color:var(--ink)] sm:text-5xl md:text-6xl">
            {course.title}
          </h1>
          {course.tagline ? (
            <p className="mt-4 text-lg italic text-[color:var(--ink-2)]">
              {course.tagline}
            </p>
          ) : null}
          <p className="mt-6 max-w-[62ch] text-[color:var(--ink-2)]">
            {course.description}
          </p>
        </section>

        <section className="mt-10">
          <h2 className="mb-6 text-xl font-bold tracking-[-0.015em] text-[color:var(--ink)]">
            Lessons
          </h2>
          <CourseOverviewLessonList course={course} />
        </section>
      </main>
    </div>
  );
}
