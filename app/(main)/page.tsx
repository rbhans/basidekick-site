import { HomeView } from "@/components/views/home-view";
import { createClient } from "@supabase/supabase-js";
import { getBabelData } from "@/lib/data/babel";
import { getAtlasData } from "@/lib/data/atlas";

// ISR: Revalidate daily — content updates come via redeployments
export const revalidate = 86400;

// Simple Supabase client for public data (no cookies needed)
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

async function getBabelTermCount(): Promise<number> {
  try {
    const data = await getBabelData();
    if (!data) return 500;
    return (data.equipment?.length || 0) + (data.points?.length || 0);
  } catch {
    return 500;
  }
}

async function getAtlasModelCount(): Promise<number> {
  try {
    const data = await getAtlasData();
    if (!data) return 0;
    return data.models?.length || 0;
  } catch {
    return 0;
  }
}

async function getRecentContent() {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return {
      carouselArticles: [],
      stats: { articleCount: 0, termCount: 500, modelCount: 0 },
      samplePoints: [],
      sampleEquipment: [],
    };
  }

  // Fetch all data in parallel
  const [articlesResult, articleCountResult, termCount, modelCount, babelData] = await Promise.all([
    // Wiki articles with category (fetch more for carousel)
    supabase
      .from("wiki_articles")
      .select(`
        id, title, slug, summary, created_at,
        category:wiki_categories!wiki_articles_category_id_fkey(name, slug)
      `)
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(30),
    // Counts
    supabase.from("wiki_articles").select("id", { count: "exact", head: true }).eq("is_published", true),
    // Babel and Atlas counts
    getBabelTermCount(),
    getAtlasModelCount(),
    // Babel data for sample cards
    getBabelData(),
  ]);

  if (articlesResult.error) {
    console.error("[Home] Wiki articles error:", articlesResult.error);
  }

  // Handle Supabase join returns (may be array or object)
  const normalizeJoin = <T,>(data: T | T[] | null): T | null => {
    if (!data) return null;
    return Array.isArray(data) ? data[0] : data;
  };

  const carouselArticles = (articlesResult.data || []).map(article => ({
    id: article.id,
    title: article.title,
    slug: article.slug,
    summary: article.summary,
    created_at: article.created_at,
    category: normalizeJoin(article.category),
  }));

  const stats = {
    articleCount: articleCountResult.count || 0,
    termCount,
    modelCount,
  };

  // Sample entries for rotating cards
  const samplePoints = babelData?.points?.slice(0, 20) || [];
  const sampleEquipment = babelData?.equipment?.slice(0, 20) || [];

  return {
    carouselArticles,
    stats,
    samplePoints,
    sampleEquipment,
  };
}

export default async function HomePage() {
  const { carouselArticles, stats, samplePoints, sampleEquipment } = await getRecentContent();

  return (
    <HomeView
      carouselArticles={carouselArticles}
      stats={stats}
      samplePoints={samplePoints}
      sampleEquipment={sampleEquipment}
    />
  );
}
