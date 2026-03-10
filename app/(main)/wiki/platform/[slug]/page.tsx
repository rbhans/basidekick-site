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

const GROUP_SLUG = "platform_vendor";
const GROUP_LABEL = "Platform / Vendor";
const ROUTE_PREFIX = "platform";

async function findFacet(supabase: NonNullable<ReturnType<typeof getSupabaseClient>>, slug: string) {
  const { data: group } = await supabase
    .from("wiki_facet_groups")
    .select("id, name")
    .eq("slug", GROUP_SLUG)
    .single();

  if (!group) return null;

  const groupId = (group as { id: string; name: string }).id;
  const groupName = (group as { id: string; name: string }).name;

  const { data: facets } = await supabase
    .from("wiki_facets")
    .select("*")
    .eq("slug", slug)
    .eq("group_id", groupId);

  if (!facets || facets.length === 0) return null;
  return { facet: facets[0], groupName };
}

interface FacetPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: FacetPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = getSupabaseClient();
  if (!supabase) return { title: "Not Found | BASidekick Wiki" };

  const result = await findFacet(supabase, slug);
  if (!result) return { title: "Not Found | BASidekick Wiki" };

  const description = `Browse BAS knowledge articles about ${result.facet.name}`;
  return {
    title: `${result.facet.name} Articles | BASidekick Wiki`,
    description,
    openGraph: {
      title: `${result.facet.name} - BASidekick Wiki`,
      description,
      type: "website",
      siteName: "BASidekick",
      url: `https://basidekick.com/wiki/${ROUTE_PREFIX}/${slug}`,
    },
    alternates: { canonical: `https://basidekick.com/wiki/${ROUTE_PREFIX}/${slug}` },
  };
}

export default async function PlatformFacetPage({ params }: FacetPageProps) {
  const { slug } = await params;
  const supabase = getSupabaseClient();
  if (!supabase) notFound();

  const result = await findFacet(supabase, slug);
  if (!result) notFound();

  const { facet } = result;

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
      groupName={result.groupName}
      articles={articles}
    />
  );
}
