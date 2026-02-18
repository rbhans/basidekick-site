import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { getBabelData } from "@/lib/data/babel";
import { getAtlasData } from "@/lib/data/atlas";

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

  const [babelData, atlasData] = await Promise.all([
    getBabelData(),
    getAtlasData(),
  ]);

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
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
      url: `${BASE_URL}/tools/ssk`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/tools/qsk`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/babel`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/equipment`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/wiki`,
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
    {
      url: `${BASE_URL}/resources/rust`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/pointstack`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/references`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];

  const babelLastModified = babelData?.lastUpdated
    ? new Date(babelData.lastUpdated)
    : new Date();
  const atlasLastModified = atlasData?.lastUpdated
    ? new Date(atlasData.lastUpdated)
    : new Date();

  const babelEntryPages: MetadataRoute.Sitemap = babelData
    ? [
      ...babelData.points.map((point) => ({
        url: `${BASE_URL}/babel/${point.concept.id}`,
        lastModified: babelLastModified,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
      ...babelData.equipment.map((equipment) => ({
        url: `${BASE_URL}/babel/${equipment.id}`,
        lastModified: babelLastModified,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    ]
    : [];

  const atlasBrandPages: MetadataRoute.Sitemap = atlasData
    ? atlasData.brands.map((brand) => ({
      url: `${BASE_URL}/equipment/${brand.slug || brand.id}`,
      lastModified: atlasLastModified,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }))
    : [];

  const atlasTypePages: MetadataRoute.Sitemap = [];
  const atlasModelPages: MetadataRoute.Sitemap = [];

  if (atlasData) {
    const brandById = new Map(atlasData.brands.map((brand) => [brand.id, brand]));
    const typeById = new Map(atlasData.types.map((type) => [type.id, type]));
    const typePairs = new Set<string>();

    for (const model of atlasData.models) {
      const brand = brandById.get(model.brand);
      const type = typeById.get(model.type);
      if (!brand || !type) continue;

      const brandSlug = brand.slug || brand.id;
      const typeSlug = type.slug || type.id;
      const modelSlug = model.slug || model.id;

      const typeKey = `${brandSlug}::${typeSlug}`;
      if (!typePairs.has(typeKey)) {
        typePairs.add(typeKey);
        atlasTypePages.push({
          url: `${BASE_URL}/equipment/${brandSlug}/${typeSlug}`,
          lastModified: atlasLastModified,
          changeFrequency: "monthly" as const,
          priority: 0.5,
        });
      }

      atlasModelPages.push({
        url: `${BASE_URL}/equipment/${brandSlug}/${typeSlug}/${modelSlug}`,
        lastModified: atlasLastModified,
        changeFrequency: "monthly" as const,
        priority: 0.5,
      });
    }
  }

  // If no Supabase, return static + Babel + Atlas pages
  if (!supabase) {
    return [
      ...staticPages,
      ...babelEntryPages,
      ...atlasBrandPages,
      ...atlasTypePages,
      ...atlasModelPages,
    ];
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
    ...babelEntryPages,
    ...atlasBrandPages,
    ...atlasTypePages,
    ...atlasModelPages,
    ...wikiPages,
    ...wikiTagPages,
  ];
}
