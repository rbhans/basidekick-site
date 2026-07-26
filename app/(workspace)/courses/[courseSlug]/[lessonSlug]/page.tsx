import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CourseLearningShell } from "@/components/course-learning-shell";
import { courseMdxComponents } from "@/components/course-mdx-components";
import { getCourseLesson, INTRO_TO_BAS } from "@/lib/course-data";
import { loadCourseLesson } from "@/lib/course-content";
import { createServerReadClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
}): Promise<Metadata> {
  const { courseSlug, lessonSlug } = await params;
  const lesson = courseSlug === INTRO_TO_BAS.slug ? getCourseLesson(lessonSlug) : null;
  if (!lesson) return { title: "Course lesson" };
  return {
    title: `${lesson.title} — ${INTRO_TO_BAS.title}`,
    description: lesson.description,
    alternates: { canonical: `/courses/${courseSlug}/${lessonSlug}` },
    openGraph: { title: `${lesson.title} — ${INTRO_TO_BAS.title}`, description: lesson.description, url: `/courses/${courseSlug}/${lessonSlug}`, type: "article" },
  };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
}) {
  const { courseSlug, lessonSlug } = await params;
  if (courseSlug !== INTRO_TO_BAS.slug) notFound();
  const lesson = getCourseLesson(lessonSlug);
  const modulePromise = loadCourseLesson(lessonSlug);
  if (!lesson || !modulePromise) notFound();

  const [lessonModule, client] = await Promise.all([
    modulePromise,
    createServerReadClient(),
  ]);
  const { data } = client ? await client.auth.getUser() : { data: { user: null } };
  let completedLessons: string[] = [];
  if (client && data.user) {
    const { data: progress } = await client
      .from("course_progress")
      .select("lessons_completed")
      .eq("user_id", data.user.id)
      .eq("course_slug", INTRO_TO_BAS.slug)
      .maybeSingle();
    completedLessons = (progress?.lessons_completed as string[] | null) ?? [];
  }

  const Lesson = lessonModule.default;
  return (
    <CourseLearningShell
      lesson={lesson}
      completedLessons={completedLessons}
      userId={data.user?.id ?? null}
    >
      <Lesson components={courseMdxComponents} />
    </CourseLearningShell>
  );
}
