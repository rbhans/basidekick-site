import { HomeView } from "@/components/views/home-view";
import { createClient } from "@supabase/supabase-js";

// Force dynamic rendering to always show fresh wiki/forum content
export const dynamic = "force-dynamic";

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

  // If supabase client is null (env vars not set), return empty
  if (!supabase) {
    return { recentArticles: [], recentThreads: [] };
  }

  // Fetch recent wiki articles (published only, last 5)
  const { data: recentArticles } = await supabase
    .from("wiki_articles")
    .select(`
      id,
      title,
      slug,
      summary,
      created_at,
      category:wiki_categories!wiki_articles_category_id_fkey(name, slug)
    `)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(5);

  // Fetch recent forum threads (last 5)
  const { data: recentThreads } = await supabase
    .from("forum_threads")
    .select(`
      id,
      title,
      slug,
      created_at,
      reply_count,
      category:forum_categories!forum_threads_category_id_fkey(name, slug),
      author:profiles!forum_threads_author_id_fkey(display_name)
    `)
    .order("created_at", { ascending: false })
    .limit(5);

  return {
    recentArticles: recentArticles || [],
    recentThreads: recentThreads || [],
  };
}

export default async function HomePage() {
  const { recentArticles, recentThreads } = await getRecentContent();

  return (
    <HomeView
      recentArticles={recentArticles}
      recentThreads={recentThreads}
    />
  );
}
