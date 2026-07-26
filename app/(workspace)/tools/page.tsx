import type { Metadata } from "next";
import { ToolsView } from "@/components/feature-pages";
export const metadata: Metadata = { title: "Tools", description: "BAS calculators, quick references, and Library resources." };
export default function ToolsPage() { return <ToolsView />; }
