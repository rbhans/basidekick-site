import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminView } from "@/components/views/admin-view";
import { ROUTES } from "@/lib/routes";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

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
    contentReportsResult,
    wikiContributionsResult,
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
    // Content reports
    supabase
      .from("content_reports")
      .select(`
        id, user_id, target_type, target_id, target_label, target_url, message,
        status, admin_notes, resolved_by, resolved_at, created_at,
        submitter:profiles!content_reports_user_id_fkey(display_name)
      `)
      .order("created_at", { ascending: false })
      .limit(100),
    // Wiki contributions (user-submitted new entries + edits awaiting review)
    supabase
      .from("wiki_contributions")
      .select(`
        id, user_id, type, target_article_id, title, slug, summary, content,
        category_id, submitter_notes, status, reviewer_notes, reviewed_by,
        reviewed_at, approved_article_id, created_at, updated_at,
        submitter:profiles!wiki_contributions_user_id_fkey(display_name),
        target_article:wiki_articles!wiki_contributions_target_article_id_fkey(title, slug),
        category:wiki_categories!wiki_contributions_category_id_fkey(name, slug)
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
      supabase.from("content_reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("pointstack_companies").select("id", { count: "exact", head: true }).eq("is_verified", false),
      supabase.from("wiki_articles").select("id", { count: "exact", head: true }).eq("is_published", true),
      supabase.from("wiki_contributions").select("id", { count: "exact", head: true }).eq("status", "pending"),
    ]),
  ]);

  const stats = {
    userCount: statsResult[0].count || 0,
    articleCount: statsResult[1].count || 0,
    companyCount: statsResult[2].count || 0,
    pendingBabelContributions: statsResult[3].count || 0,
    pendingEquipmentSubmissions: statsResult[4].count || 0,
    pendingReports: statsResult[5].count || 0,
    unverifiedCompanies: statsResult[6].count || 0,
    publishedArticles: statsResult[7].count || 0,
    pendingWikiContributions: statsResult[8].count || 0,
  };

  return (
    <AdminView
      users={usersResult.data || []}
      articles={articlesResult.data || []}
      companies={companiesResult.data || []}
      babelContributions={babelContributionsResult.data || []}
      equipmentSubmissions={equipmentSubmissionsResult.data || []}
      contentReports={contentReportsResult.data || []}
      wikiContributions={wikiContributionsResult.data || []}
      stats={stats}
    />
  );
}
