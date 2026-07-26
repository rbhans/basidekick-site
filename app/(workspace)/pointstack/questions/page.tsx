import { PointStackView, type PointStackListItem } from "@/components/feature-pages";
import { fetchPosts } from "@/lib/pointstack-api";
import { createServerReadClient } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export default async function QuestionsPage() { let items: PointStackListItem[] = []; try { const posts = await fetchPosts(await createServerReadClient()); items = posts.filter((post) => post.post_type === "question").map((post) => ({ slug: post.slug, kind: "Question", title: post.title, author: post.author?.display_name ?? "Community", tags: post.tags, meta: `${post.upvote_count} votes · ${post.comment_count} replies` })); } catch {} return <PointStackView mode="questions" initialPosts={items.length ? items : undefined} />; }
