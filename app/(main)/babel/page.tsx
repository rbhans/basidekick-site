import { Metadata } from "next";
import { BabelView } from "@/components/babel";

export const metadata: Metadata = {
  title: "BAS Babel - Point Naming Standards | BASidekick",
  description:
    "Comprehensive resource for BAS point naming standards and aliases. Translate between vendor conventions, Haystack tags, and Brick schema.",
  openGraph: {
    title: "BAS Babel - Point Naming Standards",
    description:
      "Comprehensive resource for BAS point naming standards and aliases across BAS platforms.",
  },
};

export default function BabelPage() {
  return <BabelView />;
}
