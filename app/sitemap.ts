import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { getBabelData } from "@/lib/data/babel";
import { getAtlasData } from "@/lib/data/atlas";

export const dynamic = "force-dynamic";

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
      url: `${BASE_URL}/atlas`,
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
      url: `${BASE_URL}/calculators`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/courses`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/open-source`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/news`,
      lastModified: new Date(),
      changeFrequency: "daily",
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
    {
      url: `${BASE_URL}/wiki/videos`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/experts`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/llms.txt`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.4,
    },
  ];

  const babelLastModified = babelData?.lastUpdated
    ? new Date(babelData.lastUpdated)
    : new Date();
  const atlasLastModified = atlasData?.lastUpdated
    ? new Date(atlasData.lastUpdated)
    : new Date();

  const atlasEntryPages: MetadataRoute.Sitemap = babelData
    ? [
      ...babelData.points.map((point) => ({
        url: `${BASE_URL}/atlas/${point.concept.id}`,
        lastModified: babelLastModified,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
      ...babelData.equipment.map((equipment) => ({
        url: `${BASE_URL}/atlas/${equipment.id}`,
        lastModified: babelLastModified,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    ]
    : [];

  const atlasBrandPages: MetadataRoute.Sitemap = atlasData
    ? atlasData.brands.map((brand) => ({
      url: `${BASE_URL}/atlas/equipment/${brand.slug || brand.id}`,
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
          url: `${BASE_URL}/atlas/equipment/${brandSlug}/${typeSlug}`,
          lastModified: atlasLastModified,
          changeFrequency: "monthly" as const,
          priority: 0.5,
        });
      }

      atlasModelPages.push({
        url: `${BASE_URL}/atlas/equipment/${brandSlug}/${typeSlug}/${modelSlug}`,
        lastModified: atlasLastModified,
        changeFrequency: "monthly" as const,
        priority: 0.5,
      });
    }
  }

  // If no Supabase, return static + Atlas pages
  if (!supabase) {
    return [
      ...staticPages,
      ...atlasEntryPages,
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

  // Fetch wiki facets for facet landing pages
  const { data: wikiFacets } = await supabase
    .from("wiki_facets")
    .select("slug, group:wiki_facet_groups!wiki_facets_group_id_fkey(slug)")
    .gt("article_count", 0);

  const facetGroupRouteMap: Record<string, string> = {
    platform_vendor: "platform",
    protocol: "protocol",
    system_domain: "topic",
    topic: "topic",
    content_format: "topic",
  };

  const wikiFacetPages: MetadataRoute.Sitemap = (wikiFacets || []).map((facet) => {
    const group = Array.isArray(facet.group) ? facet.group[0] : facet.group;
    const routePrefix = facetGroupRouteMap[(group as { slug: string })?.slug || ""] || "topic";
    return {
      url: `${BASE_URL}/wiki/${routePrefix}/${facet.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    };
  });

  // Fetch wiki collections
  const { data: wikiCollections } = await supabase
    .from("wiki_collections")
    .select("slug");

  const wikiCollectionPages: MetadataRoute.Sitemap = (wikiCollections || []).map((col) => ({
    url: `${BASE_URL}/wiki/collections/${col.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // Fetch published news articles
  const { data: newsArticles } = await supabase
    .from("news_articles")
    .select("slug, updated_at, published_at, created_at")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  const newsPages: MetadataRoute.Sitemap = (newsArticles || []).map((article) => ({
    url: `${BASE_URL}/news/${article.slug}`,
    lastModified: new Date(article.updated_at || article.published_at || article.created_at),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  // Fetch active Community Share entries
  const { data: communityShareEntries } = await supabase
    .from("pointstack_resource_listings")
    .select("slug, updated_at, created_at")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const communitySharePages: MetadataRoute.Sitemap = (communityShareEntries || []).map((entry) => ({
    url: `${BASE_URL}/open-source/${entry.slug}`,
    lastModified: new Date(entry.updated_at || entry.created_at),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [
    ...staticPages,
    ...atlasEntryPages,
    ...atlasBrandPages,
    ...atlasTypePages,
    ...atlasModelPages,
    ...wikiPages,
    ...wikiFacetPages,
    ...wikiCollectionPages,
    ...newsPages,
    ...communitySharePages,
  ];
}
