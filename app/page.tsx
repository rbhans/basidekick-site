"use client";

import { useState } from "react";
import { SidebarLayout } from "@/components/sidebar-layout";
import { PageTransition } from "@/components/page-transition";
import { HomeView } from "@/components/views/home-view";
import { ToolsView } from "@/components/views/tools-view";
import { ResourcesView } from "@/components/views/resources-view";
import { ToolDetailView } from "@/components/views/tool-detail-view";
import { SignInForm } from "@/components/auth/sign-in-form";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { AccountView } from "@/components/views/account-view";
import { ForumView } from "@/components/views/forum-view";
import { WikiView } from "@/components/views/wiki-view";
import { VIEW_TITLES, TOOL_DETAILS } from "@/lib/constants";
import { VIEW_IDS } from "@/lib/types";

// View registry - maps view IDs to components
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const viewRegistry: Record<string, React.ComponentType<any>> = {
  [VIEW_IDS.HOME]: HomeView,
  [VIEW_IDS.TOOLS]: ToolsView,
  [VIEW_IDS.RESOURCES]: ResourcesView,
  [VIEW_IDS.ACCOUNT]: AccountView,
  [VIEW_IDS.FORUM]: ForumView,
  [VIEW_IDS.WIKI]: WikiView,
};

export default function HomePage() {
  const [activeView, setActiveView] = useState<string>(VIEW_IDS.HOME);

  const handleViewChange = (viewId: string) => {
    setActiveView(viewId);
  };

  // Render the appropriate view based on activeView
  const renderView = () => {
    // Check if it's a tool detail page
    if (TOOL_DETAILS[activeView]) {
      return <ToolDetailView toolId={activeView as "nsk" | "ssk" | "msk"} />;
    }

    // Check view registry
    if (activeView in viewRegistry) {
      const ViewComponent = viewRegistry[activeView];
      return <ViewComponent onNavigate={handleViewChange} />;
    }

    // Handle special views
    switch (activeView) {
      case VIEW_IDS.PSK:
        return (
          <div className="p-8">
            <h1 className="text-2xl font-semibold mb-4">PSK</h1>
            <p className="text-muted-foreground">Project management tool coming soon...</p>
          </div>
        );
      case VIEW_IDS.SIGNIN:
        return <SignInForm />;
      case VIEW_IDS.SIGNUP:
        return <SignUpForm />;
      default:
        return <HomeView />;
    }
  };

  const viewTitle = VIEW_TITLES[activeView] || "Home";

  return (
    <SidebarLayout activeView={activeView} onViewChange={handleViewChange}>
      <PageTransition viewId={activeView} viewTitle={viewTitle}>
        {renderView()}
      </PageTransition>
    </SidebarLayout>
  );
}
