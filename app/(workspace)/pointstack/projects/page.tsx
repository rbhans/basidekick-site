import { PointStackView, type PointStackListItem } from "@/components/feature-pages";
import { fetchPosts } from "@/lib/pointstack-api";
import { createServerReadClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  let items: PointStackListItem[] = [];
  try {
    const posts = await fetchPosts(await createServerReadClient(), { sort: "recent" }, 50);
    items = posts.filter((post) => post.post_type === "project").map((post) => ({
      slug: post.slug,
      kind: "Project",
      title: post.title,
      author: post.author?.display_name ?? "Community",
      tags: post.tags,
      meta: `${post.upvote_count} votes · ${post.comment_count} replies`,
    }));
  } catch {}
  return <PointStackView mode="projects" initialPosts={items.length ? items : undefined} />;
}
