import type { Metadata } from "next";
import { RecordDetail } from "@/components/feature-pages";

export const metadata: Metadata = {
  title: "QR Sidekick Privacy",
  description: "Privacy information for the QR Sidekick mobile application.",
};

export default function QRSidekickPrivacyPage() {
  return <RecordDetail section="Legal" title="QR Sidekick Privacy" summary="QR Sidekick performs QR scanning on your device and does not require a BASidekick account." body="Camera access is used only to scan QR codes while the scanner is open. QR Sidekick does not upload camera images, create an advertising profile, sell personal information, or process payments. Links opened from a scanned code are governed by the destination site’s privacy practices. Device and app-store platforms may collect their own operational diagnostics under their published policies." />;
}
