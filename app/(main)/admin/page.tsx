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
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect(ROUTES.HOME);
  }

  // Fetch all admin data in parallel
  const [
    usersResult,
    articlesResult,
    threadsResult,
    suggestionsResult,
    statsResult,
  ] = await Promise.all([
    // Users with profiles
    supabase
      .from("profiles")
      .select("id, display_name, avatar_url, company, is_admin, post_count, created_at")
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
    // Forum threads
    supabase
      .from("forum_threads")
      .select(`
        id, title, slug, is_pinned, is_locked, view_count, reply_count, created_at,
        author:profiles!forum_threads_author_id_fkey(display_name),
        category:forum_categories!forum_threads_category_id_fkey(name, slug)
      `)
      .order("created_at", { ascending: false })
      .limit(50),
    // Wiki suggestions
    supabase
      .from("wiki_suggestions")
      .select(`
        id, created_at, status,
        thread:forum_threads!wiki_suggestions_thread_id_fkey(id, title, slug, category:forum_categories!forum_threads_category_id_fkey(slug)),
        suggested_by:profiles!wiki_suggestions_suggested_by_fkey(display_name)
      `)
      .order("created_at", { ascending: false })
      .limit(50),
    // Stats
    Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("wiki_articles").select("id", { count: "exact", head: true }),
      supabase.from("forum_threads").select("id", { count: "exact", head: true }),
      supabase.from("forum_posts").select("id", { count: "exact", head: true }),
      supabase.from("wiki_suggestions").select("id", { count: "exact", head: true }).eq("status", "pending"),
    ]),
  ]);

  const stats = {
    userCount: statsResult[0].count || 0,
    articleCount: statsResult[1].count || 0,
    threadCount: statsResult[2].count || 0,
    postCount: statsResult[3].count || 0,
    pendingSuggestions: statsResult[4].count || 0,
  };

  return (
    <AdminView
      users={usersResult.data || []}
      articles={articlesResult.data || []}
      threads={threadsResult.data || []}
      suggestions={suggestionsResult.data || []}
      stats={stats}
    />
  );
}
