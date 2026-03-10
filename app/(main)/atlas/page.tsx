import { Suspense } from "react";
import { Metadata } from "next";
import { AtlasTabbedView } from "@/components/atlas/atlas-tabbed-view";

export const metadata: Metadata = {
  title: "BAS Atlas - Points & Equipment | BASidekick",
  description:
    "Open source, community-driven BAS Atlas for point naming standards and equipment catalog browsing. Actively growing with contributions.",
  openGraph: {
    title: "BAS Atlas - Points & Equipment",
    description:
      "Open source, community-driven BAS Atlas for point naming standards and equipment catalog browsing. Actively growing with contributions.",
    type: "website",
    siteName: "BASidekick",
    url: "https://basidekick.com/atlas",
  },
  alternates: {
    canonical: "https://basidekick.com/atlas",
  },
};

export default function AtlasPage() {
  return (
    <Suspense fallback={<div className="min-h-full" />}>
      <AtlasTabbedView />
    </Suspense>
  );
}
