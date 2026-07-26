import type { Metadata } from "next";
import { RecordDetail } from "@/components/feature-pages";
import { projects } from "@/lib/data/pointstack-projects";
import { fetchPostBySlug } from "@/lib/pointstack-api";
import { createServerReadClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function getProject(slug: string) {
  try { return await fetchPostBySlug(await createServerReadClient(), slug); } catch { return null; }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const live = await getProject(slug);
  const fallback = projects.find((entry) => entry.slug === slug);
  const title = live?.title ?? fallback?.title ?? "PointStack project";
  const description = live?.content.slice(0, 180) ?? fallback?.summary;
  return { title, description, alternates: { canonical: `/pointstack/projects/${slug}` }, openGraph: { title, description, url: `/pointstack/projects/${slug}`, type: "article" } };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const live = await getProject(slug);
  if (live?.post_type === "project") return <RecordDetail section="PointStack Social" title={live.title} summary={`Project shared by ${live.author?.display_name ?? "the PointStack community"}.`} body={live.content} meta={["Project", `${live.upvote_count} votes`, `${live.comment_count} replies`, ...live.tags]} engagement={{ kind: "pointstack", entityId: live.id }} />;
  const project = projects.find((entry) => entry.slug === slug) ?? projects[0];
  return <RecordDetail section="PointStack Social" title={project.title} summary={project.summary} body={project.description} meta={[project.status, project.owner, ...project.tags]} />;
}
