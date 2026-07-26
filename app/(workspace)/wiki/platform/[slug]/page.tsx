import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WikiRouteView } from "@/components/wiki-route-view";
import { createServerReadClient } from "@/lib/supabase/server";
import { fetchArticlesByFacet, fetchFacetBySlug } from "@/lib/wiki-api";

export const dynamic = "force-dynamic";

async function load(slug: string) {
  const client = await createServerReadClient();
  const facet = await fetchFacetBySlug(client, ["platform_vendor"], slug);
  if (!facet) return null;
  return { facet, articles: await fetchArticlesByFacet(client, facet.id) };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const result = await load(slug);
  return { title: result?.facet.name ?? "Wiki platform", description: result?.facet.description ?? "Building automation platform articles.", alternates: { canonical: `/wiki/platform/${slug}` } };
}

export default async function WikiPlatformPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await load(slug);
  if (!result) notFound();
  return <WikiRouteView eyebrow="WIKI / PLATFORM" title={result.facet.name} description={result.facet.description ?? `Field articles related to ${result.facet.name}.`} articles={result.articles} />;
}
