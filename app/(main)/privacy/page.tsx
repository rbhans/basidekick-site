import { Metadata } from "next";
import { PrivacyView } from "@/components/views/privacy-view";

export const metadata: Metadata = {
  title: "Privacy Policy — BASidekick",
  description:
    "How BASidekick handles account and community data. No selling, no sharing, no tracking beyond what's needed to run the site.",
  alternates: { canonical: "https://basidekick.com/privacy" },
};

export default function PrivacyPage() {
  return <PrivacyView />;
}
