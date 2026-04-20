import { Metadata } from "next";
import { TermsView } from "@/components/views/terms-view";

export const metadata: Metadata = {
  title: "Terms of Use — BASidekick",
  description:
    "Ground rules for using BASidekick — accounts, community conduct, content ownership, and the usual legal backstops.",
  alternates: { canonical: "https://basidekick.com/terms" },
};

export default function TermsPage() {
  return <TermsView />;
}
