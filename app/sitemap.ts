import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { INTRO_TO_BAS } from "@/lib/course-data";

export const dynamic = "force-dynamic";

const BASE_URL = "https://basidekick.com";
const routes = ["", "/dashboard", "/atlas", "/wiki", "/courses", "/news", "/pointstack", "/pointstack/questions", "/pointstack/projects", "/pointstack/people", "/pointstack/companies", "/pointstack/jobs", "/tools", "/calculators", "/references", "/library", "/privacy", "/terms"];

function supabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? createClient(url, key) : null;
}

function entry(path: string, lastModified: string | Date | null | undefined, priority = 0.6): MetadataRoute.Sitemap[number] {
  return { url: `${BASE_URL}${path}`, lastModified: lastModified ? new Date(lastModified) : new Date(), changeFrequency: "weekly", priority };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const staticEntries: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified,
    changeFrequency: route === "/news" || route === "/pointstack" ? "daily" : "weekly",
    priority: route === "" ? 1 : route === "/dashboard" ? 0.9 : 0.7,
  }));
  const courseEntries: MetadataRoute.Sitemap = [
    entry(`/courses/${INTRO_TO_BAS.slug}`, lastModified, 0.8),
    ...INTRO_TO_BAS.lessons.map((lesson) => entry(`/courses/${INTRO_TO_BAS.slug}/${lesson.slug}`, lastModified, 0.7)),
  ];
  const client = supabase();
  if (!client) return [...staticEntries, ...courseEntries];

  const [wiki, news, resources, posts, profiles, companies, jobs, facets, collections] = await Promise.all([
    client.from("wiki_articles").select("slug, updated_at, created_at").eq("is_published", true),
    client.from("news_articles").select("slug, updated_at, published_at, created_at").eq("is_published", true),
    client.from("pointstack_resource_listings").select("slug, updated_at, created_at").eq("is_active", true),
    client.from("pointstack_posts").select("slug, post_type, updated_at, created_at").eq("is_published", true),
    client.from("profiles").select("username, display_name, updated_at, created_at").not("display_name", "is", null),
    client.from("pointstack_companies").select("slug, updated_at, created_at"),
    client.from("pointstack_jobs").select("slug, updated_at, created_at").eq("is_active", true),
    client.from("wiki_facets").select("slug, group:wiki_facet_groups!wiki_facets_group_id_fkey(slug)").gt("article_count", 0),
    client.from("wiki_collections").select("slug, updated_at, created_at"),
  ]);

  const facetPrefix: Record<string, string> = { platform_vendor: "platform", protocol: "protocol", system_domain: "topic", topic: "topic", content_format: "topic" };
  const dynamicEntries: MetadataRoute.Sitemap = [
    ...(wiki.data ?? []).map((item) => entry(`/wiki/${item.slug}`, item.updated_at ?? item.created_at, 0.75)),
    ...(news.data ?? []).map((item) => entry(`/news/${item.slug}`, item.updated_at ?? item.published_at ?? item.created_at, 0.65)),
    ...(resources.data ?? []).map((item) => entry(`/library/${item.slug}`, item.updated_at ?? item.created_at, 0.65)),
    ...(posts.data ?? []).map((item) => entry(item.post_type === "project" ? `/pointstack/projects/${item.slug}` : `/pointstack/posts/${item.slug}`, item.updated_at ?? item.created_at, 0.6)),
    ...(profiles.data ?? []).map((item) => entry(`/pointstack/people/${item.username || String(item.display_name).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, item.updated_at ?? item.created_at, 0.5)),
    ...(companies.data ?? []).map((item) => entry(`/pointstack/companies/${item.slug}`, item.updated_at ?? item.created_at, 0.5)),
    ...(jobs.data ?? []).map((item) => entry(`/pointstack/jobs/${item.slug}`, item.updated_at ?? item.created_at, 0.6)),
    ...(facets.data ?? []).flatMap((item) => {
      const group = Array.isArray(item.group) ? item.group[0] : item.group;
      const prefix = facetPrefix[group?.slug ?? ""];
      return prefix ? [entry(`/wiki/${prefix}/${item.slug}`, lastModified, 0.5)] : [];
    }),
    ...(collections.data ?? []).map((item) => entry(`/wiki/collections/${item.slug}`, item.updated_at ?? item.created_at, 0.55)),
  ];

  return [...staticEntries, ...courseEntries, ...dynamicEntries];
}
