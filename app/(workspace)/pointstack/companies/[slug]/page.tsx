import type { Metadata } from "next";
import { RecordDetail } from "@/components/feature-pages";
import { companies } from "@/lib/data/pointstack-companies";
import { fetchCompanyBySlug } from "@/lib/pointstack-api";
import { createServerReadClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function getCompany(slug: string) {
  try { return await fetchCompanyBySlug(await createServerReadClient(), slug); } catch { return null; }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const live = await getCompany(slug);
  const fallback = companies.find((entry) => entry.slug === slug);
  const title = live?.name ?? fallback?.name ?? "PointStack company";
  const description = live?.description ?? fallback?.description;
  return { title, description, alternates: { canonical: `/pointstack/companies/${slug}` }, openGraph: { title, description, url: `/pointstack/companies/${slug}` } };
}

export default async function CompanyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const live = await getCompany(slug);
  if (live) return <RecordDetail section="PointStack Social" title={live.name} summary={live.description ?? "A company represented in PointStack."} body={live.description ?? "Company details are maintained by its PointStack members."} meta={[live.location ?? "BAS", live.industry ?? "Building automation", `${live.members?.length ?? 0} members`, ...(live.is_verified ? ["Verified"] : [])]} />;
  const company = companies.find((entry) => entry.slug === slug) ?? companies[0];
  return <RecordDetail section="PointStack Social" title={company.name} summary={company.tagline} body={company.description} meta={[company.location ?? "BAS", `${company.members.length} members`]} />;
}
