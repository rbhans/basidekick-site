import { Metadata } from "next";
import { CleanerView } from "@/components/babel/cleaner";

export const metadata: Metadata = {
  title: "Point Name Cleaner - BAS Atlas | BASidekick",
  description:
    "Upload BAS point name files and match them against Atlas points data. Clean up messy naming conventions and contribute back to the community.",
  openGraph: {
    title: "Point Name Cleaner - BAS Atlas",
    description:
      "Upload BAS point name files and match them against Atlas points data for standardized naming.",
  },
};

export default function CleanerPage() {
  return <CleanerView />;
}
