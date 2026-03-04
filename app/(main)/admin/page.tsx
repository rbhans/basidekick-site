import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminView } from "@/components/views/admin-view";
import { ROUTES } from "@/lib/routes";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(ROUTES.SIGNIN);
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect(ROUTES.HOME);
  }

  // Fetch all admin data in parallel
  const [
    usersResult,
    articlesResult,
    companiesResult,
    babelContributionsResult,
    equipmentSubmissionsResult,
    statsResult,
  ] = await Promise.all([
    // Users with profiles
    supabase
      .from("profiles")
      .select("id, display_name, avatar_url, company, role, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
    // Wiki articles
    supabase
      .from("wiki_articles")
      .select(`
        id, title, slug, is_published, view_count, created_at,
        author:profiles!wiki_articles_author_id_fkey(display_name),
        category:wiki_categories!wiki_articles_category_id_fkey(name)
      `)
      .order("created_at", { ascending: false })
      .limit(50),
    // PointStack companies
    supabase
      .from("pointstack_companies")
      .select(`
        id, name, slug, owner_id, is_verified, created_at,
        owner:profiles!pointstack_companies_owner_id_fkey(display_name, avatar_url)
      `)
      .order("created_at", { ascending: false })
      .limit(50),
    // Babel contributions
    supabase
      .from("babel_contributions")
      .select(`
        id, type, entry_id, entry_type, entry_category, title, description,
        suggested_changes, status, reviewer_notes, github_issue_url, created_at,
        submitter:profiles!babel_contributions_user_id_fkey(display_name)
      `)
      .order("created_at", { ascending: false })
      .limit(50),
    // Equipment submissions
    supabase
      .from("equipment_submissions")
      .select(`
        id, type, entry_id, brand_id, brand_name, brand_logo_url, type_id, type_name,
        model_name, model_numbers, protocols, model_status, description, manufacturer_url, image_url,
        suggested_changes, review_status, reviewer_notes, github_issue_url, created_at,
        submitter:profiles!equipment_submissions_user_id_fkey(display_name)
      `)
      .order("created_at", { ascending: false })
      .limit(50),
    // Stats
    Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("wiki_articles").select("id", { count: "exact", head: true }),
      supabase.from("pointstack_companies").select("id", { count: "exact", head: true }),
      supabase.from("babel_contributions").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("equipment_submissions").select("id", { count: "exact", head: true }).eq("review_status", "pending"),
    ]),
  ]);

  const stats = {
    userCount: statsResult[0].count || 0,
    articleCount: statsResult[1].count || 0,
    companyCount: statsResult[2].count || 0,
    pendingBabelContributions: statsResult[3].count || 0,
    pendingEquipmentSubmissions: statsResult[4].count || 0,
  };

  return (
    <AdminView
      users={usersResult.data || []}
      articles={articlesResult.data || []}
      companies={companiesResult.data || []}
      babelContributions={babelContributionsResult.data || []}
      equipmentSubmissions={equipmentSubmissionsResult.data || []}
      stats={stats}
    />
  );
}
