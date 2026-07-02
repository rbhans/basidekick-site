import { Metadata } from "next";
import { RustResourcesView } from "@/components/views/rust-resources-view";

export const metadata: Metadata = {
  title: "Rust BAS Crates",
  description:
    "Open source Rust crates for BAS protocols. Start with rustbac for BACnet and follow the growing protocol suite.",
  openGraph: {
    title: "Rust BAS Crates",
    description:
      "Open source Rust crates for BAS protocols, starting with rustbac for BACnet.",
  },
  alternates: { canonical: "https://basidekick.com/resources/rust" },
};

export default function RustResourcesPage() {
  return <RustResourcesView />;
}
