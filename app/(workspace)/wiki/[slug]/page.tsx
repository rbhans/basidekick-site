import type { Metadata } from "next";
import { ArticleDetail } from "@/components/article-detail";
import { JsonLd } from "@/components/json-ld";
import { FALLBACK_WIKI } from "@/lib/fallback-data";
import { createServerReadClient } from "@/lib/supabase/server";
import { fetchWikiArticleBySlug } from "@/lib/wiki-api";

export const dynamic = "force-dynamic";

async function getArticle(slug: string) {
  try { return await fetchWikiArticleBySlug(await createServerReadClient(), slug); } catch { return null; }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const live = await getArticle(slug);
  const fallback = FALLBACK_WIKI.find((entry) => entry.slug === slug);
  const title = live?.title ?? fallback?.title ?? "Wiki article";
  const description = live?.summary ?? fallback?.summary;
  return { title, description, alternates: { canonical: `/wiki/${slug}` }, openGraph: { title, description, type: "article", url: `/wiki/${slug}` } };
}

export default async function WikiArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const live = await getArticle(slug);
  if (live) return <><JsonLd data={{ "@context": "https://schema.org", "@type": "Article", headline: live.title, description: live.summary, datePublished: live.created_at, dateModified: live.updated_at, url: `https://basidekick.com/wiki/${live.slug}`, author: { "@type": "Person", name: live.author?.display_name ?? "BASidekick contributor" }, publisher: { "@id": "https://basidekick.com/#organization" }, mainEntityOfPage: `https://basidekick.com/wiki/${live.slug}` }} /><ArticleDetail backHref="/wiki" backLabel="Wiki" section="Wiki" title={live.title} summary={live.summary ?? "A source-backed BASidekick Wiki article."} body={live.content} meta={[live.category?.name ?? "Wiki", ...((live.facets ?? []).slice(0, 5).map((facet) => facet.name))]} engagement={{ kind: "wiki", entityId: live.id }} /></>;
  const item = FALLBACK_WIKI.find((entry) => entry.slug === slug) ?? { title: slug.replaceAll("-", " "), summary: "A BASidekick Wiki article.", category: "Wiki", updated: "Current" };
  return <ArticleDetail backHref="/wiki" backLabel="Wiki" section="Wiki" title={item.title} summary={item.summary} body="This source-backed article is part of the BASidekick knowledge base. The rebuilt reading surface keeps a narrow measure, clear metadata, and contribution actions without surrounding the content in marketing chrome." meta={[item.category, item.updated]} />;
}
