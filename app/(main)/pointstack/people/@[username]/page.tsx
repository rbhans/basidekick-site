import { PointStackProfileView } from "@/components/pointstack/profile/profile-view";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const { username } = await params;
  const displayName = decodeURIComponent(username);
  return {
    title: `${displayName} - PointStack`,
    description: `View ${displayName}'s profile on PointStack`,
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  return <PointStackProfileView username={decodeURIComponent(username)} />;
}
