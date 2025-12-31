import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "basidekick - Tools for BAS Professionals",
  description: "QA tools for building automation professionals. No subscriptions. No bloat. Software that works.",
  keywords: ["BAS", "building automation", "Niagara", "Metasys", "BACnet", "QA tools"],
  metadataBase: new URL("https://basidekick.com"),
  openGraph: {
    title: "basidekick - Tools for BAS Professionals",
    description: "QA tools for building automation professionals. No subscriptions. No bloat. Software that works.",
    siteName: "basidekick",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "basidekick - Tools for BAS Professionals",
    description: "QA tools for building automation professionals. No subscriptions. No bloat.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
