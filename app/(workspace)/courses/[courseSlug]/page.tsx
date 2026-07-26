import type { Metadata } from "next";
import { CourseDetailView } from "@/components/feature-pages";
import { JsonLd } from "@/components/json-ld";
import { notFound } from "next/navigation";
import { INTRO_TO_BAS } from "@/lib/course-data";
import { createServerReadClient } from "@/lib/supabase/server";
export const metadata: Metadata = { title: "Intro to BAS", description: "A ten-lesson introduction to the building automation field.", alternates: { canonical: "/courses/intro-to-bas" }, openGraph: { title: "Intro to BAS", description: "A ten-lesson introduction to the building automation field.", url: "/courses/intro-to-bas" } };
export const dynamic = "force-dynamic";
export default async function CoursePage({ params }: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await params;
  if (courseSlug !== INTRO_TO_BAS.slug) notFound();
  const client = await createServerReadClient();
  const { data } = client ? await client.auth.getUser() : { data: { user: null } };
  let completedLessons: string[] = [];
  if (client && data.user) {
    const { data: progress } = await client.from("course_progress").select("lessons_completed").eq("user_id", data.user.id).eq("course_slug", INTRO_TO_BAS.slug).maybeSingle();
    completedLessons = (progress?.lessons_completed as string[] | null) ?? [];
  }
  return <><JsonLd data={{ "@context": "https://schema.org", "@type": "Course", name: INTRO_TO_BAS.title, description: INTRO_TO_BAS.description, url: "https://basidekick.com/courses/intro-to-bas", provider: { "@id": "https://basidekick.com/#organization" }, isAccessibleForFree: true, hasCourseInstance: { "@type": "CourseInstance", courseMode: "online", courseWorkload: `PT${INTRO_TO_BAS.lessons.reduce((total, lesson) => total + lesson.estimatedMinutes, 0)}M` } }} /><CourseDetailView completedLessons={completedLessons} signedIn={Boolean(data.user)} /></>;
}
