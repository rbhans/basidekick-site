import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { WikiFacetLanding } from "@/components/wiki/wiki-facet-landing";
import { WikiArticle, WikiFacet } from "@/lib/types";

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return null;
  return createClient(supabaseUrl, supabaseAnonKey);
}

// The /wiki/topic/ route handles topic, system_domain, and content_format facet groups
const ACCEPTED_GROUP_SLUGS = ["topic", "system_domain", "content_format"];
const ROUTE_PREFIX = "topic";

/** Resolve group IDs for accepted groups, then find the facet by (group_id, slug). */
async function findFacetBySlug(supabase: NonNullable<ReturnType<typeof getSupabaseClient>>, slug: string) {
  // Get IDs for the accepted groups
  const { data: groups } = await supabase
    .from("wiki_facet_groups")
    .select("id, slug, name")
    .in("slug", ACCEPTED_GROUP_SLUGS);

  if (!groups || groups.length === 0) return null;

  const typedGroups = groups as { id: string; slug: string; name: string }[];
  const groupIds = typedGroups.map((g) => g.id);

  const { data: facets } = await supabase
    .from("wiki_facets")
    .select("*")
    .eq("slug", slug)
    .in("group_id", groupIds);

  if (!facets || facets.length === 0) return null;

  const facet = facets[0];
  const facetGroupId = (facet as Record<string, unknown>).group_id as string;
  const group = typedGroups.find((g) => g.id === facetGroupId);
  return { facet, group };
}

interface FacetPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: FacetPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = getSupabaseClient();
  if (!supabase) return { title: "Not Found" };

  const result = await findFacetBySlug(supabase, slug);
  if (!result) return { title: "Not Found" };

  const description = `Browse BAS knowledge articles about ${result.facet.name}`;
  return {
    title: `${result.facet.name} Articles`,
    description,
    openGraph: {
      title: `${result.facet.name}`,
      description,
      type: "website",
      siteName: "BASidekick",
      url: `https://basidekick.com/wiki/${ROUTE_PREFIX}/${slug}`,
    },
    alternates: { canonical: `https://basidekick.com/wiki/${ROUTE_PREFIX}/${slug}` },
  };
}

export default async function TopicFacetPage({ params }: FacetPageProps) {
  const { slug } = await params;
  const supabase = getSupabaseClient();
  if (!supabase) notFound();

  const result = await findFacetBySlug(supabase, slug);
  if (!result) notFound();

  const { facet, group } = result;

  const { data: articleFacets } = await supabase
    .from("wiki_article_facets")
    .select("article_id")
    .eq("facet_id", facet.id);

  const articleIds = articleFacets?.map((af: { article_id: string }) => af.article_id) || [];

  let articles: WikiArticle[] = [];
  if (articleIds.length > 0) {
    const { data } = await supabase
      .from("wiki_articles")
      .select(`
        *,
        author:profiles!wiki_articles_author_id_fkey(display_name),
        category:wiki_categories!wiki_articles_category_id_fkey(name, slug)
      `)
      .in("id", articleIds)
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    articles = (data || []) as WikiArticle[];
  }

  return (
    <WikiFacetLanding
      facet={facet as WikiFacet}
      groupName={group?.name || "Topic"}
      articles={articles}
    />
  );
}
