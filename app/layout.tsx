import type { Metadata } from "next";
import { Fraunces, Manrope, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-heading",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BASidekick — BAS info, community, and resources",
  description:
    "BAS info, community, and resources collected from next to the industry. Curated by Rob Hansen in Tucson.",
  keywords: ["BAS", "building automation", "Niagara", "Metasys", "BACnet", "atlas", "wiki"],
  metadataBase: new URL("https://basidekick.com"),
  openGraph: {
    title: "BASidekick — BAS info, community, and resources",
    description:
      "BAS info, community, and resources collected from next to the industry.",
    siteName: "BASidekick",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BASidekick — BAS info, community, and resources",
    description:
      "BAS info, community, and resources collected from next to the industry.",
  },
  alternates: {
    canonical: "https://basidekick.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${manrope.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://basidekick.com/#organization",
                  name: "BASidekick",
                  url: "https://basidekick.com",
                  description:
                    "BAS info, community, and resources collected from next to the industry. Curated by Rob Hansen in Tucson.",
                },
                {
                  "@type": "WebSite",
                  "@id": "https://basidekick.com/#website",
                  url: "https://basidekick.com",
                  name: "BASidekick",
                  publisher: {
                    "@id": "https://basidekick.com/#organization",
                  },
                },
              ],
            }),
          }}
        />
        <AuthProvider>{children}</AuthProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
