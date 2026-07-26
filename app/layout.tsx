import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { JsonLd } from "@/components/json-ld";
import { Providers } from "@/components/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://basidekick.com"),
  title: {
    default: "BASidekick — Building automation workspace",
    template: "%s — BASidekick",
  },
  description: "Independent BAS reference, field tools, industry signal, and PointStack community for building automation practitioners.",
  icons: {
    icon: "/brand/favicon.svg",
    shortcut: "/brand/favicon.svg",
  },
  openGraph: {
    title: "BASidekick — Building automation workspace",
    description: "Knowledge, tools, signal, and community for the people who build and operate BAS.",
    siteName: "BASidekick",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "BASidekick building automation workspace" }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <JsonLd data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://basidekick.com/#organization",
              name: "BASidekick",
              url: "https://basidekick.com",
              logo: "https://basidekick.com/brand/wordmark-light.svg",
              description: "Independent building automation reference, tools, industry signal, and PointStack community.",
              founder: { "@type": "Person", name: "Rob Hansen" },
              sameAs: ["https://github.com/rbhans"],
            },
            {
              "@type": "WebSite",
              "@id": "https://basidekick.com/#website",
              url: "https://basidekick.com",
              name: "BASidekick",
              publisher: { "@id": "https://basidekick.com/#organization" },
              potentialAction: {
                "@type": "SearchAction",
                target: "https://basidekick.com/api/search?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            },
          ],
        }} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
