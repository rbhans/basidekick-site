import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonShell } from "@/components/courses/lesson-shell";
import {
  getAllCourseSlugs,
  getCourse,
  getAdjacentLessons,
  type LessonFrontmatter,
} from "@/lib/courses";

interface PageProps {
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { courseSlug, lessonSlug } = await params;
  try {
    const course = getCourse(courseSlug);
    const lesson = course.lessons.find((l) => l.slug === lessonSlug);
    if (lesson) {
      return {
        title: lesson.title,
        description: lesson.description,
        alternates: {
          canonical: `https://basidekick.com/courses/${courseSlug}/${lessonSlug}`,
        },
      };
    }
  } catch {
    // fall through
  }
  return {};
}

export function generateStaticParams() {
  return getAllCourseSlugs().flatMap((courseSlug) => {
    const course = getCourse(courseSlug);
    return course.lessons.map((lesson) => ({
      courseSlug,
      lessonSlug: lesson.slug,
    }));
  });
}

export const dynamicParams = false;

export default async function LessonPage({ params }: PageProps) {
  const { courseSlug, lessonSlug } = await params;

  let course;
  try {
    course = getCourse(courseSlug);
  } catch {
    notFound();
  }
  const lessonMeta = course.lessons.find((l) => l.slug === lessonSlug);
  if (!lessonMeta) notFound();

  const { prev, next } = getAdjacentLessons(course, lessonSlug);

  const mod = await import(
    `@/content/courses/${courseSlug}/lessons/${lessonSlug}.mdx`
  );
  const Lesson = mod.default;
  const frontmatter =
    (mod.frontmatter as LessonFrontmatter | undefined) ?? lessonMeta;

  return (
    <LessonShell
      course={course}
      currentLessonSlug={lessonSlug}
      lessonTitle={frontmatter.title}
      lessonDescription={frontmatter.description}
      estimatedMinutes={frontmatter.estimatedMinutes}
      prev={
        prev
          ? { title: prev.title, href: `/courses/${courseSlug}/${prev.slug}` }
          : null
      }
      next={
        next
          ? { title: next.title, href: `/courses/${courseSlug}/${next.slug}` }
          : null
      }
    >
      <Lesson />
    </LessonShell>
  );
}
