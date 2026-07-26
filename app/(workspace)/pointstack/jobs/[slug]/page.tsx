import type { Metadata } from "next";
import { RecordDetail } from "@/components/feature-pages";
import { fetchJobBySlug } from "@/lib/pointstack-api";
import { createServerReadClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function getJob(slug: string) {
  try { return await fetchJobBySlug(await createServerReadClient(), slug); } catch { return null; }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const live = await getJob(slug);
  const title = live?.title ?? "PointStack job";
  const description = live?.description.slice(0, 180) ?? "A building automation role listed through PointStack.";
  return { title, description, alternates: { canonical: `/pointstack/jobs/${slug}` }, openGraph: { title, description, url: `/pointstack/jobs/${slug}` } };
}

export default async function JobDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const live = await getJob(slug);
  if (live) {
    const action = live.application_url
      ? { href: live.application_url, label: "Apply on employer site", external: true }
      : live.application_email
        ? { href: `mailto:${live.application_email}`, label: "Apply by email", external: false }
        : undefined;
    return <RecordDetail section="PointStack Social" title={live.title} summary={`${live.company?.name ?? "PointStack listing"} · ${live.location ?? (live.is_remote ? "Remote" : "Location provided by employer")}`} body={`${live.description}${live.requirements ? `\n\nRequirements\n${live.requirements}` : ""}`} meta={[live.job_type, live.experience_level ?? "Open level", live.is_remote ? "Remote" : "On-site", "External application"]} save={{ kind: "pointstack", entityId: live.id }} primaryAction={action} />;
  }
  const title = slug.split("-").map((word) => word[0]?.toUpperCase() + word.slice(1)).join(" ");
  return <RecordDetail section="PointStack Social" title={title} summary="A building automation role listed through PointStack." body="Job details, location, requirements, and application instructions live here. Applications are handled through the employer’s stated destination." meta={["Job", "External application"]} />;
}
