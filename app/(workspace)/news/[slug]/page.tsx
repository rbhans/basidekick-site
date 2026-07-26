import type { Metadata } from "next";
import { ArticleDetail } from "@/components/article-detail";
import { JsonLd } from "@/components/json-ld";
import { FALLBACK_NEWS } from "@/lib/fallback-data";
import { fetchArticleBySlug } from "@/lib/news-api";
import { createServerReadClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function getArticle(slug: string) {
  try { return await fetchArticleBySlug(await createServerReadClient(), slug); } catch { return null; }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const live = await getArticle(slug);
  const fallback = FALLBACK_NEWS.find((entry) => entry.slug === slug);
  const title = live?.title ?? fallback?.title ?? "News";
  const description = live?.summary ?? fallback?.summary;
  return { title, description, alternates: { canonical: `/news/${slug}` }, openGraph: { title, description, type: "article", url: `/news/${slug}` } };
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const live = await getArticle(slug);
  if (live) return <><JsonLd data={{ "@context": "https://schema.org", "@type": "NewsArticle", headline: live.title, description: live.summary, datePublished: live.published_at ?? live.created_at, dateModified: live.updated_at, url: `https://basidekick.com/news/${live.slug}`, isBasedOn: live.url, publisher: { "@id": "https://basidekick.com/#organization" }, mainEntityOfPage: `https://basidekick.com/news/${live.slug}` }} /><ArticleDetail backHref="/news" backLabel="News" section="News" title={live.title} summary={live.summary ?? "BAS industry signal with the original source attached."} body={`${live.summary ?? "Open the original source for the complete report."}\n\nBASidekick keeps its summary separate from the primary source and preserves discussion as a community layer.`} meta={[live.source_domain, ...live.tags]} sourceUrl={live.url} engagement={{ kind: "news", entityId: live.id }} /></>;
  const item = FALLBACK_NEWS.find((entry) => entry.slug === slug) ?? FALLBACK_NEWS[0];
  return <ArticleDetail backHref="/news" backLabel="News" section="News" title={item.title} summary={item.summary} body={`This signal originated with ${item.source}. BASidekick keeps the summary separate from the primary source and preserves discussion as a community layer.`} meta={[item.source, item.age, ...item.tags]} />;
}
