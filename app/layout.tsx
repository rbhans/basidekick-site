import type { Metadata } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ProgressProvider } from "@/lib/progress";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-sans",
  display: "swap",
});

const archivoHeading = Archivo({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-heading",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BASidekick — BAS info, community, and resources",
  description:
    "Independent BAS reference, community, and open-source toolkit. Maintained by Rob in Tucson.",
  metadataBase: new URL("https://basidekick.com"),
  openGraph: {
    title: "BASidekick — BAS info, community, and resources",
    description:
      "Independent BAS reference, community, and open-source toolkit.",
    siteName: "BASidekick",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BASidekick — BAS info, community, and resources",
    description:
      "Independent BAS reference, community, and open-source toolkit.",
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
      <body className={`${archivo.variable} ${archivoHeading.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
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
                  logo: "https://basidekick.com/brand/wordmark-light.svg",
                  description:
                    "Independent BAS reference, community, and open-source toolkit. Maintained by Rob in Tucson.",
                  founder: {
                    "@type": "Person",
                    name: "Rob",
                  },
                  sameAs: ["https://github.com/rbhans"],
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
        <AuthProvider>
          <ProgressProvider>{children}</ProgressProvider>
        </AuthProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
