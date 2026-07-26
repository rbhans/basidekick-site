import type { Metadata } from "next";
import { RecordDetail } from "@/components/feature-pages";
import { JsonLd } from "@/components/json-ld";
import { FALLBACK_POSTS } from "@/lib/fallback-data";
import { fetchPostBySlug } from "@/lib/pointstack-api";
import { createServerReadClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function getPost(slug: string) {
  try { return await fetchPostBySlug(await createServerReadClient(), slug); } catch { return null; }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const live = await getPost(slug);
  const fallback = FALLBACK_POSTS.find((entry) => entry.slug === slug);
  const title = live?.title ?? fallback?.title ?? "PointStack post";
  const description = live?.content.slice(0, 180) ?? `A ${fallback?.kind ?? "discussion"} on PointStack.`;
  return { title, description, alternates: { canonical: `/pointstack/posts/${slug}` }, openGraph: { title, description, url: `/pointstack/posts/${slug}`, type: "article" } };
}

export default async function PostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const live = await getPost(slug);
  if (live) return <><JsonLd data={{ "@context": "https://schema.org", "@type": "DiscussionForumPosting", headline: live.title, articleBody: live.content, datePublished: live.created_at, dateModified: live.updated_at, url: `https://basidekick.com/pointstack/posts/${live.slug}`, author: { "@type": "Person", name: live.author?.display_name ?? "PointStack member" }, commentCount: live.comment_count, interactionStatistic: { "@type": "InteractionCounter", interactionType: "https://schema.org/LikeAction", userInteractionCount: live.upvote_count } }} /><RecordDetail section="PointStack Social" title={live.title} summary={`${live.post_type} shared by ${live.author?.display_name ?? "the PointStack community"}.`} body={live.content} meta={[live.post_type, `${live.upvote_count} votes`, `${live.comment_count} replies`, ...live.tags]} engagement={{ kind: "pointstack", entityId: live.id }} /></>;
  const post = FALLBACK_POSTS.find((entry) => entry.slug === slug) ?? FALLBACK_POSTS[0];
  return <RecordDetail section="PointStack Social" title={post.title} summary={`${post.kind} shared by ${post.author}.`} body="This is where the full project, question, or discussion appears. Replies, votes, and saves require an account; reading remains public." meta={[post.kind, post.meta, ...post.tags]} />;
}
