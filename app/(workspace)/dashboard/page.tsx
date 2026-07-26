import type { Metadata } from "next";
import { Dashboard, type DashboardNewsItem, type DashboardPostItem, type DashboardWikiItem } from "@/components/dashboard";
import { fetchArticles } from "@/lib/news-api";
import { fetchPosts } from "@/lib/pointstack-api";
import { createServerReadClient } from "@/lib/supabase/server";
import { fetchWikiArticles } from "@/lib/wiki-api";

export const metadata: Metadata = { title: "Dashboard", description: "The BASidekick workspace dashboard." };
export const dynamic = "force-dynamic";

function shortDate(value: string | null | undefined) {
  if (!value) return "Recent";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(value));
}

export default async function DashboardPage() {
  let news: DashboardNewsItem[] | undefined;
  let posts: DashboardPostItem[] | undefined;
  let wiki: DashboardWikiItem[] | undefined;
  let counts: { wiki: number; library: number; courses: number } | undefined;
  try {
    const client = await createServerReadClient();
    if (client) {
      const [newsRows, postRows, wikiResult, wikiCount, libraryCount] = await Promise.all([
        fetchArticles(client, { sortBy: "recent" }, 3),
        fetchPosts(client, { sort: "recent" }, 3),
        fetchWikiArticles(client, { q: "", category: null, platform: [], protocol: [], domain: [], topic: [], format: [], sort: "newest", page: 1 }, 1),
        client.from("wiki_articles").select("*", { count: "exact", head: true }).eq("is_published", true),
        client.from("pointstack_resource_listings").select("*", { count: "exact", head: true }).eq("is_active", true),
      ]);
      news = newsRows.map((item) => ({
        slug: item.slug,
        source: item.source_domain,
        age: shortDate(item.published_at ?? item.created_at),
        title: item.title,
        summary: item.summary ?? "Open the source and community discussion.",
        tags: item.tags,
        votes: item.upvote_count,
      }));
      posts = postRows.map((item) => ({
        slug: item.slug,
        kind: item.post_type,
        title: item.title,
        author: item.author?.display_name ?? "Community",
        meta: `${item.comment_count} replies`,
      }));
      wiki = wikiResult.articles.slice(0, 3).map((item) => ({
        slug: item.slug,
        category: item.category?.name ?? "Wiki",
        title: item.title,
        summary: item.summary ?? "A source-backed BASidekick field article.",
        updated: shortDate(item.updated_at),
      }));
      counts = { wiki: wikiCount.count ?? wikiResult.count, library: libraryCount.count ?? 0, courses: 1 };
    }
  } catch {
    // Public fallback content keeps the workspace usable during a data outage.
  }
  return <Dashboard news={news?.length ? news : undefined} posts={posts?.length ? posts : undefined} wiki={wiki?.length ? wiki : undefined} counts={counts} />;
}
