"use client";

import { ReactNode } from "react";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const FloatingMessenger = dynamic(
  () => import("@/components/pointstack/messenger").then((mod) => mod.FloatingMessenger),
  { ssr: false }
);

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none"
      >
        Skip to main content
      </a>

      <Navbar />

      <main id="main-content" className="flex-1" tabIndex={-1}>
        {children}
      </main>

      <Footer />

      <FloatingMessenger />
    </div>
  );
}
