import { PointStackView, type PointStackJobItem } from "@/components/feature-pages";
import { fetchJobs } from "@/lib/pointstack-api";
import { createServerReadClient } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export default async function JobsPage() { let items: PointStackJobItem[] = []; try { const jobs = await fetchJobs(await createServerReadClient()); items = jobs.map((job) => ({ slug: job.slug, title: job.title, meta: `${job.job_type} · ${job.experience_level ?? "Open level"}`, summary: job.description, tags: [job.is_remote ? "Remote" : job.location ?? "On-site"], end: job.company?.name ?? "External apply" })); } catch {} return <PointStackView mode="jobs" initialJobs={items.length ? items : undefined} />; }
