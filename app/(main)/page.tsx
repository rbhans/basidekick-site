import { HomeView } from "@/components/views/home-view";
import { createClient } from "@/lib/supabase/server";

async function getRecentContent() {
  const supabase = await createClient();

  // Fetch recent wiki articles (published only, last 5)
  const { data: recentArticles } = await supabase
    .from("wiki_articles")
    .select(`
      id,
      title,
      slug,
      summary,
      created_at,
      category:wiki_categories(name, slug)
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
      category:forum_categories(name, slug),
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
