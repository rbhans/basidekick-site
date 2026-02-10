import { Metadata } from "next";
import { CleanerView } from "@/components/babel/cleaner";

export const metadata: Metadata = {
  title: "Point Name Cleaner - BAS Babel | BASidekick",
  description:
    "Upload BAS point name files and match them against the Babel database. Clean up messy naming conventions and contribute back to the community.",
  openGraph: {
    title: "Point Name Cleaner - BAS Babel",
    description:
      "Upload BAS point name files and match them against the Babel database for standardized naming.",
  },
};

export default function CleanerPage() {
  return <CleanerView />;
}
