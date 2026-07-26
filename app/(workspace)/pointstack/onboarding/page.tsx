import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountSettings, type EditableProfile } from "@/components/account-settings";
import { createServerReadClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Welcome to PointStack", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

function editableProfile(profile: Partial<EditableProfile> | null): EditableProfile {
  return {
    display_name: profile?.display_name ?? null,
    username: profile?.username ?? null,
    headline: profile?.headline ?? null,
    bio: profile?.bio ?? null,
    location: profile?.location ?? null,
    website_url: profile?.website_url ?? null,
    linkedin_url: profile?.linkedin_url ?? null,
    github_url: profile?.github_url ?? null,
    skills: profile?.skills ?? [],
    availability_status: profile?.availability_status ?? "not-looking",
    avatar_url: profile?.avatar_url ?? null,
    cover_image_url: profile?.cover_image_url ?? null,
    show_completions: profile?.show_completions ?? false,
    onboarding_completed: profile?.onboarding_completed ?? false,
    role: profile?.role ?? "member",
  };
}

export default async function PointStackOnboardingPage() {
  const client = await createServerReadClient();
  const { data } = client ? await client.auth.getUser() : { data: { user: null } };
  if (!data.user) redirect("/signin?redirect=/pointstack/onboarding");
  const { data: profile } = await client!.from("profiles").select("display_name, username, headline, bio, location, website_url, linkedin_url, github_url, skills, availability_status, avatar_url, cover_image_url, show_completions, onboarding_completed, role").eq("id", data.user.id).maybeSingle();
  return <AccountSettings userId={data.user.id} email={data.user.email ?? ""} initialProfile={editableProfile(profile)} stats={{ posts: 0, resources: 0, progress: 0 }} savedItems={[]} recentViews={[]} onboarding />;
}
