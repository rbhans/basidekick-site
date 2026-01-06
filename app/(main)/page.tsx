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

  if (!supabase) {
    return { recentArticles: [], recentThreads: [] };
  }

  // Fetch recent wiki articles - simple query like sitemap.ts (published only, last 5)
  const { data: articles, error: articlesError } = await supabase
    .from("wiki_articles")
    .select("id, title, slug, summary, created_at, category_id")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(5);

  if (articlesError) {
    console.error("[Home] Wiki articles error:", articlesError);
  }

  // If we have articles with category_ids, fetch categories separately
  let categoriesMap: Record<string, { name: string; slug: string }> = {};
  if (articles && articles.length > 0) {
    const categoryIds = [...new Set(articles.map(a => a.category_id).filter(Boolean))];
    if (categoryIds.length > 0) {
      const { data: categories } = await supabase
        .from("wiki_categories")
        .select("id, name, slug")
        .in("id", categoryIds);

      if (categories) {
        categoriesMap = Object.fromEntries(categories.map(c => [c.id, { name: c.name, slug: c.slug }]));
      }
    }
  }

  // Map articles with categories
  const recentArticles = (articles || []).map(article => ({
    id: article.id,
    title: article.title,
    slug: article.slug,
    summary: article.summary,
    created_at: article.created_at,
    category: article.category_id ? categoriesMap[article.category_id] || null : null,
  }));

  // Fetch recent forum threads - simple query (last 5)
  const { data: threads, error: threadsError } = await supabase
    .from("forum_threads")
    .select("id, title, slug, created_at, category_id, author_id")
    .order("created_at", { ascending: false })
    .limit(5);

  if (threadsError) {
    console.error("[Home] Forum threads error:", threadsError);
  }

  // Fetch categories and authors separately
  let threadCategoriesMap: Record<string, { name: string; slug: string }> = {};
  let authorsMap: Record<string, { display_name: string | null }> = {};

  if (threads && threads.length > 0) {
    const categoryIds = [...new Set(threads.map(t => t.category_id).filter(Boolean))];
    const authorIds = [...new Set(threads.map(t => t.author_id).filter(Boolean))];

    if (categoryIds.length > 0) {
      const { data: categories } = await supabase
        .from("forum_categories")
        .select("id, name, slug")
        .in("id", categoryIds);

      if (categories) {
        threadCategoriesMap = Object.fromEntries(categories.map(c => [c.id, { name: c.name, slug: c.slug }]));
      }
    }

    if (authorIds.length > 0) {
      const { data: authors } = await supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", authorIds);

      if (authors) {
        authorsMap = Object.fromEntries(authors.map(a => [a.id, { display_name: a.display_name }]));
      }
    }
  }

  // Map threads with categories and authors
  const recentThreads = (threads || []).map(thread => ({
    id: thread.id,
    title: thread.title,
    slug: thread.slug,
    created_at: thread.created_at,
    category: thread.category_id ? threadCategoriesMap[thread.category_id] || null : null,
    author: thread.author_id ? authorsMap[thread.author_id] || null : null,
  }));

  return {
    recentArticles,
    recentThreads,
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
