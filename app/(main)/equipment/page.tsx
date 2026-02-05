import { Metadata } from "next";
import { EquipmentBrowseView } from "@/components/atlas/equipment-browse-view";

export const metadata: Metadata = {
  title: "BAS Atlas - Equipment Database | BASidekick",
  description:
    "A community-driven equipment database for BAS professionals. Browse by brand and type, track what you've worked with, and share field notes.",
  openGraph: {
    title: "BAS Atlas - Equipment Database",
    description:
      "A community-driven equipment database for BAS professionals. Browse by brand and type, track what you've worked with, and share field notes.",
    type: "website",
    siteName: "BASidekick",
    url: "https://basidekick.com/equipment",
  },
  alternates: {
    canonical: "https://basidekick.com/equipment",
  },
};

export default function EquipmentPage() {
  return <EquipmentBrowseView />;
}
