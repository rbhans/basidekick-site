import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LibraryDetail } from "@/components/library-detail";
import { JsonLd } from "@/components/json-ld";
import { getCommunityShareEntry } from "@/lib/community-share-api";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const entry = await getCommunityShareEntry(slug); const title = entry?.title ?? "Library entry"; const description = entry?.summary; return { title, description, alternates: { canonical: `/library/${slug}` }, openGraph: { title, description, url: `/library/${slug}` } }; }
export default async function LibraryDetailPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const entry = await getCommunityShareEntry(slug); if (!entry) notFound(); return <><JsonLd data={{ "@context": "https://schema.org", "@type": entry.kind === "Project" || entry.kind === "Module" ? "SoftwareApplication" : "CreativeWork", name: entry.title, description: entry.description, url: `https://basidekick.com/library/${entry.id}`, applicationCategory: entry.protocol, author: { "@type": "Organization", name: entry.owner }, offers: entry.access === "Paid externally" ? { "@type": "Offer", url: entry.links[0]?.href, availability: "https://schema.org/OnlineOnly" } : undefined }} /><LibraryDetail entry={entry} /></>; }
