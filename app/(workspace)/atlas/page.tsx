import type { Metadata } from "next";
import { AtlasView } from "@/components/feature-pages";
export const metadata: Metadata = { title: "Atlas — Returning soon", description: "BAS Atlas is being rebuilt with a new data model and interface." };
export default function AtlasPage() { return <AtlasView />; }
