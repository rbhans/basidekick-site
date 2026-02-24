import { Suspense } from "react";
import { Metadata } from "next";
import { AtlasTabbedView } from "@/components/atlas/atlas-tabbed-view";

export const metadata: Metadata = {
  title: "BAS Atlas - Points & Equipment | BASidekick",
  description:
    "Unified BAS Atlas experience for point naming standards and equipment catalog browsing.",
  openGraph: {
    title: "BAS Atlas - Points & Equipment",
    description:
      "Unified BAS Atlas experience for point naming standards and equipment catalog browsing.",
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
