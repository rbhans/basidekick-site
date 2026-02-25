import type { Metadata } from "next";
import { Space_Grotesk, Manrope, Space_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "BASidekick - Tools for BAS Professionals",
  description: "QA tools for building automation professionals. No subscriptions. No bloat. Software that works.",
  keywords: ["BAS", "building automation", "Niagara", "Metasys", "BACnet", "QA tools"],
  metadataBase: new URL("https://basidekick.com"),
  openGraph: {
    title: "BASidekick - Tools for BAS Professionals",
    description: "QA tools for building automation professionals. No subscriptions. No bloat. Software that works.",
    siteName: "BASidekick",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BASidekick - Tools for BAS Professionals",
    description: "QA tools for building automation professionals. No subscriptions. No bloat.",
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${manrope.variable} ${spaceMono.variable} font-sans antialiased`}>
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
                    "Tools, community, and knowledge for building automation professionals.",
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
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>{children}</AuthProvider>
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
