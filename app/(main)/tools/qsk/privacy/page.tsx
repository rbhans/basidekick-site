import { QRSidekickPrivacyView } from "@/components/views/qrsidekick-privacy-view";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | QR Sidekick",
  description: "Privacy policy for QR Sidekick app. Learn how we protect your privacy - no data collection, camera access for QR scanning only.",
};

export default function QRSidekickPrivacyPage() {
  return <QRSidekickPrivacyView />;
}
