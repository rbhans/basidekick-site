import type { Metadata } from "next";
import { PointStackView, type PointStackListItem } from "@/components/feature-pages";
import { fetchPosts } from "@/lib/pointstack-api";
import { createServerReadClient } from "@/lib/supabase/server";
export const metadata: Metadata = { title: "PointStack Social", description: "The BASidekick social workspace for building automation practitioners." };
export const dynamic = "force-dynamic";
export default async function PointStackPage() { let items: PointStackListItem[] = []; try { const posts = await fetchPosts(await createServerReadClient()); items = posts.map((post) => ({ slug: post.slug, kind: post.post_type[0].toUpperCase() + post.post_type.slice(1), title: post.title, author: post.author?.display_name ?? "Community", tags: post.tags, meta: `${post.upvote_count} votes · ${post.comment_count} replies` })); } catch {} return <PointStackView initialPosts={items.length ? items : undefined} />; }
