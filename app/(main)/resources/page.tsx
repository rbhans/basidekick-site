import type { Metadata } from "next";
import { ResourcesView } from "@/components/views/resources-view";

export const metadata: Metadata = {
  title: "BAS Resources — BASidekick",
  description:
    "Free BASidekick resources for building automation references, calculators, Atlas data, wiki guides, and open source tools.",
  alternates: { canonical: "https://basidekick.com/resources" },
};

export default function ResourcesPage() {
  return (
    <>
      <h1 className="sr-only">BAS Resources</h1>
      <ResourcesView />
    </>
  );
}
