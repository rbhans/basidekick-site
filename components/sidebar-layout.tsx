"use client";

import { useState, ReactNode } from "react";
import { X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { NavTree } from "./nav-tree";
import { WorkbenchToolbar } from "./workbench-toolbar";
import { StatusBar } from "./status-bar";
import { SidebarStatus } from "./sidebar-status";
import { SidebarFooter } from "./sidebar-footer";
import { Button } from "./ui/button";

interface SidebarLayoutProps {
  children: ReactNode;
  activeView: string;
  onViewChange: (viewId: string) => void;
}

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

export function SidebarLayout({ children, activeView, onViewChange }: SidebarLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pageTitle = viewTitles[activeView] || "Home";

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Toolbar */}
      <WorkbenchToolbar
        onMenuClick={() => setSidebarOpen(true)}
        onHomeClick={() => onViewChange("home")}
        pageTitle={pageTitle}
      />

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex w-[260px] flex-shrink-0 border-r border-border flex-col bg-card/30">
          <div className="flex-1 overflow-y-auto">
            <NavTree activeView={activeView} onViewChange={onViewChange} />
          </div>
          <SidebarStatus />
          <SidebarFooter />
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 z-50 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Mobile sidebar drawer */}
        <aside
          className={cn(
            "lg:hidden fixed top-0 left-0 bottom-0 z-50 w-[280px] bg-card border-r border-border flex flex-col transition-transform duration-300",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="h-12 px-4 flex items-center justify-between border-b border-border">
            <span className="font-mono text-sm font-medium">[nav]</span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <NavTree
              activeView={activeView}
              onViewChange={(viewId) => {
                onViewChange(viewId);
                setSidebarOpen(false);
              }}
            />
          </div>
          <SidebarStatus />
          <SidebarFooter />
        </aside>

        {/* Main content pane */}
        <main className="flex-1 overflow-y-auto bg-background">
          {children}
        </main>
      </div>

      {/* Status bar */}
      <StatusBar />
    </div>
  );
}
