import type { Metadata } from "next";
import { WikiView, type WikiListItem } from "@/components/feature-pages";
import { fetchWikiArticles } from "@/lib/wiki-api";
import { createServerReadClient } from "@/lib/supabase/server";
export const metadata: Metadata = { title: "Wiki", description: "Source-backed building automation field guides and reference articles." };
export const dynamic = "force-dynamic";
const WIKI_INDEX_LIMIT = 1000;

export default async function WikiPage() {
  const client = await createServerReadClient();
  let items: WikiListItem[] = [];
  let totalCount = 0;
  try {
    const result = await fetchWikiArticles(client, { category: null, platform: [], protocol: [], domain: [], topic: [], format: [], q: "", sort: "newest", page: 1 }, 1, WIKI_INDEX_LIMIT);
    items = result.articles.map((item) => ({ slug: item.slug, category: item.category?.name ?? "Wiki", title: item.title, summary: item.summary ?? "Open the article for the complete field reference.", updated: new Date(item.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) }));
    totalCount = result.count;
  } catch { /* The client component retains its curated offline fallback. */ }
  return <WikiView initialItems={items.length ? items : undefined} totalCount={totalCount || undefined} />;
}
