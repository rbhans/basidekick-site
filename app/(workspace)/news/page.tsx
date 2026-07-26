import type { Metadata } from "next";
import { NewsView, type NewsListItem } from "@/components/feature-pages";
import { fetchArticles } from "@/lib/news-api";
import { createServerReadClient } from "@/lib/supabase/server";
export const metadata: Metadata = { title: "News", description: "Building automation industry signal, standards updates, and advisories." };
export const dynamic = "force-dynamic";

function age(value: string | null) {
  if (!value) return "Recent";
  const days = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000));
  return days === 0 ? "Today" : days === 1 ? "1d" : `${days}d`;
}

export default async function NewsPage() {
  const client = await createServerReadClient();
  let items: NewsListItem[] = [];
  try {
    const articles = await fetchArticles(client, { sortBy: "recent", timeRange: "all" }, 30);
    items = articles.map((item) => ({ slug: item.slug, source: item.source_domain, age: age(item.published_at ?? item.created_at), title: item.title, summary: item.summary ?? "Open the original source and community discussion.", tags: item.tags, votes: item.upvote_count, comments: item.comment_count }));
  } catch { /* The client component retains its curated offline fallback. */ }
  return <NewsView initialItems={items.length ? items : undefined} />;
}
