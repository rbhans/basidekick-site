import type { Metadata } from "next";
import { LibraryExplorer } from "@/components/library-explorer";
import { getCommunityShareEntries } from "@/lib/community-share-api";
export const metadata: Metadata = { title: "Library", description: "BAS apps, software, modules, scripts, templates, PDFs, and useful external resources." };
export const dynamic = "force-dynamic";
export default async function LibraryPage() { const entries = await getCommunityShareEntries(); return <LibraryExplorer initialEntries={entries} />; }
