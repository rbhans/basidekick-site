import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AdminConsole } from "@/components/admin-console";
import { createServerReadClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Administration", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const client = await createServerReadClient();
  const { data } = client ? await client.auth.getUser() : { data: { user: null } };
  if (!data.user) redirect("/signin?redirect=/admin");
  const { data: profile } = client
    ? await client.from("profiles").select("role").eq("id", data.user.id).maybeSingle()
    : { data: null };
  if (profile?.role !== "admin") notFound();
  const [resources, contributions, companies, reports, news, users] = await Promise.all([
    client!.from("pointstack_resource_listings").select("id, title, slug, category, is_active, created_at, author:profiles!author_id(display_name)").order("created_at", { ascending: false }).limit(100),
    client!.from("wiki_contributions").select("id, type, title, slug, summary, content, category_id, status, created_at, submitter:profiles!wiki_contributions_user_id_fkey(display_name)").order("created_at", { ascending: false }).limit(100),
    client!.from("pointstack_companies").select("id, name, slug, is_verified, created_at").order("created_at", { ascending: false }).limit(100),
    client!.from("content_reports").select("id, target_type, target_label, target_url, message, status, created_at").order("created_at", { ascending: false }).limit(100),
    client!.from("news_articles").select("id, title, slug, is_published, created_at").order("created_at", { ascending: false }).limit(100),
    client!.from("profiles").select("id, display_name, username, role, created_at").order("created_at", { ascending: false }).limit(100),
  ]);
  return <AdminConsole adminId={data.user.id} initialResources={resources.data ?? []} initialContributions={contributions.data ?? []} initialCompanies={companies.data ?? []} initialReports={reports.data ?? []} initialNews={news.data ?? []} users={users.data ?? []} />;
}
