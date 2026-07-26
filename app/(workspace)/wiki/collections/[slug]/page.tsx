import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WikiRouteView } from "@/components/wiki-route-view";
import { createServerReadClient } from "@/lib/supabase/server";
import { fetchCollectionBySlug } from "@/lib/wiki-api";

export const dynamic = "force-dynamic";

async function load(slug: string) {
  return fetchCollectionBySlug(await createServerReadClient(), slug);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const collection = await load(slug);
  return { title: collection?.name ?? "Wiki collection", description: collection?.description ?? "A BASidekick Wiki collection.", alternates: { canonical: `/wiki/collections/${slug}` } };
}

export default async function WikiCollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = await load(slug);
  if (!collection) notFound();
  return <WikiRouteView eyebrow="WIKI / COLLECTION" title={collection.name} description={collection.description ?? "A curated set of related BAS field articles."} articles={collection.articles} />;
}
