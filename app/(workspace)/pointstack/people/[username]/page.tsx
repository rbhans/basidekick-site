import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicProfile } from "@/components/public-profile";
import { JsonLd } from "@/components/json-ld";
import {
  fetchConnectionCounts,
  fetchProfileByUsername,
  fetchUserCompanies,
  fetchUserPosts,
  fetchUserWorkExperience,
} from "@/lib/pointstack-api";
import { createServerReadClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function getProfile(username: string) {
  try {
    const client = await createServerReadClient();
    const profile = await fetchProfileByUsername(client, username);
    if (!profile) return null;
    const [experience, posts, connections, companies] = await Promise.all([
      fetchUserWorkExperience(client, profile.id).catch(() => []),
      fetchUserPosts(client, profile.id).catch(() => []),
      fetchConnectionCounts(client, profile.id).catch(() => ({ followers: 0, following: 0 })),
      fetchUserCompanies(client, profile.id).catch(() => []),
    ]);
    return { profile, experience, posts, connections, companies };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  const result = await getProfile(username);
  if (!result) return { title: "PointStack profile" };
  const name = result.profile.display_name ?? result.profile.username ?? "PointStack member";
  return {
    title: `${name} — PointStack`,
    description: result.profile.headline ?? `${name}'s public building automation profile on PointStack.`,
    alternates: { canonical: `/pointstack/people/${username}` },
    openGraph: { title: `${name} — PointStack`, description: result.profile.headline ?? `${name}'s public building automation profile on PointStack.`, url: `/pointstack/people/${username}`, type: "profile" },
  };
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const result = await getProfile(username);
  if (!result) notFound();
  const name = result.profile.display_name ?? result.profile.username ?? "PointStack member";
  return <><JsonLd data={{ "@context": "https://schema.org", "@type": "ProfilePage", url: `https://basidekick.com/pointstack/people/${username}`, mainEntity: { "@type": "Person", name, description: result.profile.bio ?? result.profile.headline, image: result.profile.avatar_url, url: `https://basidekick.com/pointstack/people/${username}`, sameAs: [result.profile.website_url, result.profile.linkedin_url, result.profile.github_url].filter(Boolean), knowsAbout: result.profile.skills } }} /><PublicProfile profile={result.profile} experience={result.experience} posts={result.posts} companies={result.companies} followers={result.connections.followers} following={result.connections.following} /></>;
}
