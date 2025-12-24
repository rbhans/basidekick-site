"use client";

import { useState } from "react";
import { SidebarLayout } from "@/components/sidebar-layout";
import { PageTransition } from "@/components/page-transition";
import { HomeView } from "@/components/views/home-view";
import { ToolsView } from "@/components/views/tools-view";
import { ResourcesView } from "@/components/views/resources-view";
import { ToolDetailView } from "@/components/views/tool-detail-view";

// Map view IDs to display titles
const viewTitles: Record<string, string> = {
  home: "Home",
  tools: "Tools",
  nsk: "NiagaraSidekick",
  ssk: "SimulatorSidekick",
  msk: "MetasysSidekick",
  resources: "Resources",
  wiki: "Wiki",
  forum: "Forum",
  psk: "PSK",
  account: "Account",
  signin: "Sign In",
  signup: "Sign Up",
};

export default function HomePage() {
  const [activeView, setActiveView] = useState("home");

  const handleViewChange = (viewId: string) => {
    setActiveView(viewId);
  };

  // Render the appropriate view based on activeView
  const renderView = () => {
    switch (activeView) {
      case "home":
        return <HomeView onNavigate={handleViewChange} />;

      // Tool category landing
      case "tools":
        return <ToolsView onNavigate={handleViewChange} />;

      // Individual tools
      case "nsk":
        return <ToolDetailView toolId="nsk" />;
      case "ssk":
        return <ToolDetailView toolId="ssk" />;
      case "msk":
        return <ToolDetailView toolId="msk" />;

      // Resources category landing
      case "resources":
        return <ResourcesView onNavigate={handleViewChange} />;

      // Individual resources (placeholder for now)
      case "wiki":
        return (
          <div className="p-8">
            <h1 className="text-2xl font-semibold mb-4">Wiki</h1>
            <p className="text-muted-foreground">Wiki content coming soon...</p>
          </div>
        );
      case "forum":
        return (
          <div className="p-8">
            <h1 className="text-2xl font-semibold mb-4">Forum</h1>
            <p className="text-muted-foreground">Forum content coming soon...</p>
          </div>
        );
      case "psk":
        return (
          <div className="p-8">
            <h1 className="text-2xl font-semibold mb-4">PSK</h1>
            <p className="text-muted-foreground">Project management tool coming soon...</p>
          </div>
        );

      // Account
      case "account":
        return (
          <div className="p-8">
            <h1 className="text-2xl font-semibold mb-4">Account</h1>
            <p className="text-muted-foreground">Sign in or create an account.</p>
          </div>
        );
      case "signin":
        return (
          <div className="p-8 max-w-sm mx-auto">
            <h1 className="text-2xl font-semibold mb-4">Sign In</h1>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  className="w-full h-10 px-3 rounded-md border border-border bg-background"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  className="w-full h-10 px-3 rounded-md border border-border bg-background"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                className="w-full h-10 bg-primary text-primary-foreground rounded-md font-medium"
              >
                Sign In
              </button>
            </form>
          </div>
        );
      case "signup":
        return (
          <div className="p-8 max-w-sm mx-auto">
            <h1 className="text-2xl font-semibold mb-4">Sign Up for Pro</h1>
            <p className="text-muted-foreground mb-6">$5/month for cloud storage, graphics library, and priority support.</p>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  className="w-full h-10 px-3 rounded-md border border-border bg-background"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  className="w-full h-10 px-3 rounded-md border border-border bg-background"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                className="w-full h-10 bg-primary text-primary-foreground rounded-md font-medium"
              >
                Start Pro Trial
              </button>
            </form>
          </div>
        );

      default:
        return <HomeView onNavigate={handleViewChange} />;
    }
  };

  const viewTitle = viewTitles[activeView] || "Home";

  return (
    <SidebarLayout activeView={activeView} onViewChange={handleViewChange}>
      <PageTransition viewId={activeView} viewTitle={viewTitle}>
        {renderView()}
      </PageTransition>
    </SidebarLayout>
  );
}
