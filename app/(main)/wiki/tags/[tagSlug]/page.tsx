import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return null;
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Map facet group slugs to URL route prefixes
const GROUP_ROUTE_MAP: Record<string, string> = {
  platform_vendor: "platform",
  protocol: "protocol",
  system_domain: "topic",
  topic: "topic",
  content_format: "topic",
};

async function findFacetRoute(supabase: NonNullable<ReturnType<typeof getSupabaseClient>>, slug: string) {
  // Fetch all facets matching this slug (could be in different groups)
  const { data: facets } = await supabase
    .from("wiki_facets")
    .select("name, group_id")
    .eq("slug", slug);

  if (!facets || facets.length === 0) return null;

  const firstFacet = facets[0] as { name: string; group_id: string };

  // Resolve group slug for the first match
  const { data: group } = await supabase
    .from("wiki_facet_groups")
    .select("slug")
    .eq("id", firstFacet.group_id)
    .single();

  if (!group) return null;

  const routePrefix = GROUP_ROUTE_MAP[(group as { slug: string }).slug] || "topic";
  return { name: firstFacet.name, routePrefix };
}

interface WikiTagPageProps {
  params: Promise<{ tagSlug: string }>;
}

export async function generateMetadata({ params }: WikiTagPageProps): Promise<Metadata> {
  const { tagSlug } = await params;
  const supabase = getSupabaseClient();
  if (!supabase) return { title: "Tag Not Found — BASidekick Wiki" };

  const result = await findFacetRoute(supabase, tagSlug);
  if (!result) return { title: "Tag Not Found — BASidekick Wiki" };

  return {
    title: `${result.name} Articles — BASidekick Wiki`,
    alternates: { canonical: `https://basidekick.com/wiki/${result.routePrefix}/${tagSlug}` },
  };
}

export default async function WikiTagPage({ params }: WikiTagPageProps) {
  const { tagSlug } = await params;
  const supabase = getSupabaseClient();
  if (!supabase) notFound();

  const result = await findFacetRoute(supabase, tagSlug);
  if (!result) notFound();

  redirect(`/wiki/${result.routePrefix}/${tagSlug}`);
}
