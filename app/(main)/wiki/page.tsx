import { Metadata } from "next";
import { WikiView } from "@/components/views/wiki-view";

export const metadata: Metadata = {
  title: "Wiki",
  description:
    "Community-driven knowledge base for building automation professionals. Articles on BACnet, Niagara, Metasys, and more.",
  openGraph: {
    title: "Wiki",
    description:
      "Community-driven knowledge base for building automation professionals.",
    type: "website",
    siteName: "BASidekick",
    url: "https://basidekick.com/wiki",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wiki",
    description:
      "Community-driven knowledge base for building automation professionals.",
  },
  alternates: {
    canonical: "https://basidekick.com/wiki",
  },
};

export default function WikiPage() {
  return (
    <>
      <h1 className="sr-only">BAS Wiki</h1>
      <WikiView />
    </>
  );
}
