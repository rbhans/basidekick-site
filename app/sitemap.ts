import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = "https://basidekick.com";

// Create a Supabase client for sitemap generation (no cookies needed)
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = getSupabaseClient();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/tools`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/tools/nsk`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/tools/ssk`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/tools/msk`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/wiki`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/forum`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/resources`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  // If no Supabase, return just static pages
  if (!supabase) {
    return staticPages;
  }

  // Fetch published wiki articles
  const { data: wikiArticles } = await supabase
    .from("wiki_articles")
    .select("slug, updated_at, created_at")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  const wikiPages: MetadataRoute.Sitemap = (wikiArticles || []).map((article) => ({
    url: `${BASE_URL}/wiki/${article.slug}`,
    lastModified: new Date(article.updated_at || article.created_at),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Fetch forum categories
  const { data: forumCategories } = await supabase
    .from("forum_categories")
    .select("slug")
    .order("display_order");

  const forumCategoryPages: MetadataRoute.Sitemap = (forumCategories || []).map((category) => ({
    url: `${BASE_URL}/forum/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  // Fetch forum threads (limit to recent/active ones for performance)
  const { data: forumThreads } = await supabase
    .from("forum_threads")
    .select("slug, category:forum_categories!forum_threads_category_id_fkey(slug), last_post_at, created_at")
    .order("last_post_at", { ascending: false, nullsFirst: false })
    .limit(500);

  type ThreadWithCategory = {
    slug: string;
    category: { slug: string } | { slug: string }[] | null;
    last_post_at: string | null;
    created_at: string;
  };

  const forumThreadPages: MetadataRoute.Sitemap = (forumThreads as ThreadWithCategory[] || [])
    .filter((thread) => {
      const cat = Array.isArray(thread.category) ? thread.category[0] : thread.category;
      return cat?.slug;
    })
    .map((thread) => {
      const cat = Array.isArray(thread.category) ? thread.category[0] : thread.category;
      return {
        url: `${BASE_URL}/forum/${cat!.slug}/${thread.slug}`,
        lastModified: new Date(thread.last_post_at || thread.created_at),
        changeFrequency: "daily" as const,
        priority: 0.6,
      };
    });

  // Fetch wiki tags for tag pages
  const { data: wikiTags } = await supabase
    .from("wiki_tags")
    .select("slug")
    .order("name");

  const wikiTagPages: MetadataRoute.Sitemap = (wikiTags || []).map((tag) => ({
    url: `${BASE_URL}/wiki/tags/${tag.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [
    ...staticPages,
    ...wikiPages,
    ...wikiTagPages,
    ...forumCategoryPages,
    ...forumThreadPages,
  ];
}
