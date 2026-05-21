import { PointStackProfileView } from "@/components/pointstack/profile/profile-view";
import { getAllCourses } from "@/lib/courses";
import type { CompletionsCatalogEntry } from "@/components/pointstack/profile/completions-tab";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const { username } = await params;
  const displayName = decodeURIComponent(username).replace(/^@/, "");
  return {
    title: `${displayName} - PointStack`,
    description: `View ${displayName}'s profile on PointStack`,
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const cleanUsername = decodeURIComponent(username).replace(/^@/, "");

  const coursesCatalog: CompletionsCatalogEntry[] = getAllCourses().map((c) => ({
    slug: c.slug,
    title: c.title,
    totalLessons: c.lessons.length,
  }));

  return <PointStackProfileView username={cleanUsername} coursesCatalog={coursesCatalog} />;
}
