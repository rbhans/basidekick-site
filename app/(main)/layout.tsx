"use client";

import { useState, ReactNode, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { WorkbenchToolbar } from "@/components/workbench-toolbar";
import { StatusBar } from "@/components/status-bar";
import { SidebarStatus } from "@/components/sidebar-status";
import { SidebarFooter } from "@/components/sidebar-footer";
import { Button } from "@/components/ui/button";
import { VIEW_TITLES, VIEW_LOADING_TEXT, NAV_ITEMS } from "@/lib/constants";
import { NavNode } from "@/lib/types";
import { getViewIdFromPath, ROUTES, getRouteForViewId } from "@/lib/routes";
import { getIcon } from "@/lib/icons";
import { NavTreeItem } from "@/components/nav-tree-item";

interface MainLayoutProps {
  children: ReactNode;
}

// NavTree that uses Links instead of callbacks
function NavTreeWithLinks({
  activeView,
  onLinkClick,
}: {
  activeView: string;
  onLinkClick?: () => void;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    NAV_ITEMS.forEach((item) => {
      initial[item.id] = item.defaultExpanded ?? false;
    });
    return initial;
  });

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderNode = (node: NavNode, depth: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expanded[node.id] ?? false;
    const isActive = activeView === node.id;
    const href = getRouteForViewId(node.id);

    // Parent folders (with children) toggle expansion, don't navigate
    if (hasChildren) {
      return (
        <div key={node.id}>
          <NavTreeItem
            id={node.id}
            label={node.label}
            icon={node.iconName ? getIcon(node.iconName) : undefined}
            badge={node.badge}
            active={isActive}
            expanded={isExpanded}
            hasChildren={hasChildren}
            depth={depth}
            onClick={() => toggleExpanded(node.id)}
            onToggle={() => toggleExpanded(node.id)}
          />
          {isExpanded && (
            <div>{node.children!.map((child) => renderNode(child, depth + 1))}</div>
          )}
        </div>
      );
    }

    // Leaf nodes navigate via Link
    return (
      <div key={node.id}>
        <Link href={href} onClick={onLinkClick}>
          <NavTreeItem
            id={node.id}
            label={node.label}
            icon={node.iconName ? getIcon(node.iconName) : undefined}
            badge={node.badge}
            active={isActive}
            expanded={false}
            hasChildren={false}
            depth={depth}
            onClick={() => {}}
          />
        </Link>
      </div>
    );
  };

  return <nav className="py-2">{NAV_ITEMS.map((item) => renderNode(item))}</nav>;
}

// PageTransition using pathname
function PageTransition({
  children,
  pathname,
}: {
  children: ReactNode;
  pathname: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const prevPathnameRef = useRef(pathname);
  const isFirstRender = useRef(true);

  const viewId = getViewIdFromPath(pathname);
  const viewTitle = VIEW_TITLES[viewId] || "Home";
  const loadingText = VIEW_LOADING_TEXT[viewId] || viewTitle.toUpperCase();
  const fullText = `> LOADING ${loadingText}...`;

  useEffect(() => {
    // Skip transition on first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Only trigger on pathname change
    if (pathname !== prevPathnameRef.current) {
      prevPathnameRef.current = pathname;
      setIsLoading(true);
      setDisplayText("");

      let currentIndex = 0;
      const typeInterval = setInterval(() => {
        if (currentIndex < fullText.length) {
          setDisplayText(fullText.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(typeInterval);
          setTimeout(() => {
            setIsLoading(false);
          }, 150);
        }
      }, 25);

      return () => clearInterval(typeInterval);
    }
  }, [pathname, fullText]);

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center bg-background">
        <div className="font-mono text-sm text-primary">
          {displayText}
          <span className="inline-block w-2 h-4 bg-primary ml-0.5 animate-pulse" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeView = getViewIdFromPath(pathname);
  const pageTitle = VIEW_TITLES[activeView] || "Home";

  const handleHomeClick = () => router.push(ROUTES.HOME);

  // Navigation handler for toolbar (wraps router.push)
  const handleNavigate = (viewId: string) => {
    router.push(getRouteForViewId(viewId));
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Toolbar */}
      <WorkbenchToolbar
        onMenuClick={() => setSidebarOpen(true)}
        onHomeClick={handleHomeClick}
        onNavigate={handleNavigate}
        pageTitle={pageTitle}
      />

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex w-[260px] flex-shrink-0 border-r border-border flex-col bg-card/30">
          <div className="flex-1 overflow-y-auto">
            <NavTreeWithLinks activeView={activeView} />
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
            <Button variant="ghost" size="icon-sm" onClick={() => setSidebarOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <NavTreeWithLinks
              activeView={activeView}
              onLinkClick={() => setSidebarOpen(false)}
            />
          </div>
          <SidebarStatus />
          <SidebarFooter />
        </aside>

        {/* Main content pane */}
        <main className="flex-1 overflow-y-auto bg-background">
          <PageTransition pathname={pathname}>{children}</PageTransition>
        </main>
      </div>

      {/* Status bar */}
      <StatusBar />
    </div>
  );
}
