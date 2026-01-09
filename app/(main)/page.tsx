import { HomeView } from "@/components/views/home-view";
import { createClient } from "@supabase/supabase-js";

// ISR: Revalidate every 5 minutes for fresh content without blocking
export const revalidate = 300;

// Simple Supabase client for public data (no cookies needed)
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

async function getRecentContent() {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return { recentArticles: [], recentThreads: [], stats: { articleCount: 0, threadCount: 0, termCount: 500 } };
  }

  // Fetch all data in parallel using foreign key joins
  const [articlesResult, threadsResult, articleCountResult, threadCountResult] = await Promise.all([
    // Wiki articles with category in single query
    supabase
      .from("wiki_articles")
      .select(`
        id, title, slug, summary, created_at,
        category:wiki_categories!wiki_articles_category_id_fkey(name, slug)
      `)
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(5),
    // Forum threads with category and author in single query
    supabase
      .from("forum_threads")
      .select(`
        id, title, slug, created_at,
        category:forum_categories!forum_threads_category_id_fkey(name, slug),
        author:profiles!forum_threads_author_id_fkey(display_name)
      `)
      .order("created_at", { ascending: false })
      .limit(5),
    // Counts
    supabase.from("wiki_articles").select("id", { count: "exact", head: true }).eq("is_published", true),
    supabase.from("forum_threads").select("id", { count: "exact", head: true }),
  ]);

  if (articlesResult.error) {
    console.error("[Home] Wiki articles error:", articlesResult.error);
  }
  if (threadsResult.error) {
    console.error("[Home] Forum threads error:", threadsResult.error);
  }

  // Handle Supabase join returns (may be array or object)
  const normalizeJoin = <T,>(data: T | T[] | null): T | null => {
    if (!data) return null;
    return Array.isArray(data) ? data[0] : data;
  };

  const recentArticles = (articlesResult.data || []).map(article => ({
    id: article.id,
    title: article.title,
    slug: article.slug,
    summary: article.summary,
    created_at: article.created_at,
    category: normalizeJoin(article.category),
  }));

  const recentThreads = (threadsResult.data || []).map(thread => ({
    id: thread.id,
    title: thread.title,
    slug: thread.slug,
    created_at: thread.created_at,
    category: normalizeJoin(thread.category),
    author: normalizeJoin(thread.author),
  }));

  const stats = {
    articleCount: articleCountResult.count || 0,
    threadCount: threadCountResult.count || 0,
    termCount: 500,
  };

  return {
    recentArticles,
    recentThreads,
    stats,
  };
}

export default async function HomePage() {
  const { recentArticles, recentThreads, stats } = await getRecentContent();

  return (
    <HomeView
      recentArticles={recentArticles}
      recentThreads={recentThreads}
      stats={stats}
    />
  );
}
