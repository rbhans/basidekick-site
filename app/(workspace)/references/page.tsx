import type { Metadata } from "next";
import { ReferenceExplorer } from "@/components/reference-explorer";
export const metadata: Metadata = { title: "References", description: "Quick source-backed building automation reference sheets." };
export default function ReferencesPage() { return <ReferenceExplorer />; }
