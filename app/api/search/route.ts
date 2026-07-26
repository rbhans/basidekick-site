import { NextResponse } from "next/server";
import { sanitizeSearchInput } from "@/lib/security";
import { createServerReadClient } from "@/lib/supabase/server";
import type { WorkspaceSearchItem } from "@/lib/workspace-search";

export async function GET(request: Request) {
  const query = sanitizeSearchInput(new URL(request.url).searchParams.get("q") ?? "").trim();
  if (query.length < 2) return NextResponse.json({ items: [] });
  const client = await createServerReadClient();
  if (!client) return NextResponse.json({ items: [] });
  const pattern = `%${query}%`;
  const [wiki, news, posts, companies, resources] = await Promise.all([
    client.from("wiki_articles").select("title, slug, summary").eq("is_published", true).or(`title.ilike.${pattern},summary.ilike.${pattern}`).limit(6),
    client.from("news_articles").select("title, slug, summary, source_domain").eq("is_published", true).or(`title.ilike.${pattern},summary.ilike.${pattern}`).limit(5),
    client.from("pointstack_posts").select("title, slug, content, post_type").eq("is_published", true).or(`title.ilike.${pattern},content.ilike.${pattern}`).limit(5),
    client.from("pointstack_companies").select("name, slug, description, industry").or(`name.ilike.${pattern},description.ilike.${pattern}`).limit(4),
    client.from("pointstack_resource_listings").select("title, slug, description, category").eq("is_active", true).or(`title.ilike.${pattern},description.ilike.${pattern}`).limit(5),
  ]);
  const items: WorkspaceSearchItem[] = [
    ...(wiki.data ?? []).map((item) => ({ label: item.title, href: `/wiki/${item.slug}`, kind: "Wiki", keywords: item.summary ?? "" })),
    ...(news.data ?? []).map((item) => ({ label: item.title, href: `/news/${item.slug}`, kind: "News", keywords: `${item.source_domain} ${item.summary ?? ""}` })),
    ...(posts.data ?? []).filter((item) => !item.title.startsWith("[Example]")).map((item) => ({ label: item.title, href: item.post_type === "project" ? `/pointstack/projects/${item.slug}` : `/pointstack/posts/${item.slug}`, kind: "PointStack", keywords: `${item.post_type} ${item.content}` })),
    ...(companies.data ?? []).map((item) => ({ label: item.name, href: `/pointstack/companies/${item.slug}`, kind: "Company", keywords: `${item.industry ?? ""} ${item.description ?? ""}` })),
    ...(resources.data ?? []).filter((item) => !item.title.startsWith("[Example]")).map((item) => ({ label: item.title, href: `/library/${item.slug}`, kind: "Library", keywords: `${item.category} ${item.description ?? ""}` })),
  ];
  return NextResponse.json({ items }, { headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=120" } });
}
