import type { Metadata } from "next";
import { RecordDetail } from "@/components/feature-pages";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return <RecordDetail section="Legal" title="Terms" summary="Use BASidekick as a practical reference, not as a substitute for project-specific engineering judgment." body="BASidekick provides public information, community contributions, calculators, references, and links to external resources. Verify field conditions, applicable codes, standards, manufacturer requirements, and project documents before acting. Creators are responsible for resources and purchases handled on their own sites; BASidekick does not process those transactions." />;
}
