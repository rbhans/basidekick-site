import { HomeView } from "@/components/views/home-view";
import { createClient } from "@/lib/supabase/server";

// Force dynamic rendering to always show fresh wiki/forum content
export const dynamic = "force-dynamic";

async function getRecentContent() {
  const supabase = await createClient();

  // Fetch recent wiki articles (published only, last 5)
  const { data: recentArticles, error: articlesError } = await supabase
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

  if (articlesError) {
    console.error("Error fetching wiki articles:", articlesError);
  }

  // Fetch recent forum threads (last 5)
  const { data: recentThreads, error: threadsError } = await supabase
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

  if (threadsError) {
    console.error("Error fetching forum threads:", threadsError);
  }

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
