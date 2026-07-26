"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MotionConfig } from "motion/react";
import {
  CaretLeft,
  CaretRight,
  List,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatedNavIcon,
  useNavIconAnimation,
} from "@/components/animated-nav-icon";
import { MobileWorkspaceNav } from "@/components/mobile-workspace-nav";
import { useAuth } from "@/components/providers";
import { WorkspaceCommand } from "@/components/workspace-command";
import { WorkspaceSidebarContent } from "@/components/workspace-sidebar-content";
import { NAV_ITEMS, activeNav, breadcrumbs } from "@/lib/navigation";
import type { NavItem } from "@/lib/navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const auth = useAuth();
  const current = activeNav(pathname);
  const crumbs = breadcrumbs(pathname);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const mobileTriggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() =>
      setCollapsed(localStorage.getItem("bsk-sidebar-collapsed") === "true"),
    );
    return () => cancelAnimationFrame(frame);
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((value) => {
      localStorage.setItem("bsk-sidebar-collapsed", String(!value));
      return !value;
    });
  }, []);

  const closePalette = useCallback(() => setPaletteOpen(false), [setPaletteOpen]);
  const openPalette = useCallback(() => setPaletteOpen(true), [setPaletteOpen]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (paletteOpen) closePalette();
        else openPalette();
      }
      if (event.key === "[" && !event.metaKey && !event.ctrlKey) {
        toggleCollapsed();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closePalette, openPalette, paletteOpen, toggleCollapsed]);

  return (
    <MotionConfig reducedMotion="user">
      <div className={`app-frame ${collapsed ? "sidebar-collapsed" : ""}`}>
        <a className="skip-link" href="#content">
          Skip to content
        </a>

        <aside
          id="workspace-navigation"
          className="sidebar desktop-sidebar"
          aria-label="BASidekick workspace"
        >
          <WorkspaceSidebarContent
            pathname={pathname}
            currentId={current?.id}
            collapsed={collapsed}
            onNavigate={() => undefined}
          />
        </aside>

        <div className="app-column">
          <header className="topbar">
            <div className="topbar-left">
              <button
                type="button"
                className="icon-button mobile-menu"
                onClick={(event) => {
                  mobileTriggerRef.current = event.currentTarget;
                  setMobileOpen(true);
                }}
                aria-label="Open navigation"
                aria-expanded={mobileOpen}
                aria-controls="mobile-workspace-navigation"
              >
                <List size={18} />
              </button>
              <button
                type="button"
                className="icon-button collapse-button"
                onClick={toggleCollapsed}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? <CaretRight size={16} /> : <CaretLeft size={16} />}
              </button>
              <div className="breadcrumbs">
                {crumbs.map((crumb, index) => (
                  <span key={crumb.href}>
                    {index > 0 && <i>/</i>}
                    <Link href={crumb.href}>{crumb.label}</Link>
                  </span>
                ))}
              </div>
            </div>
            <div className="topbar-actions">
              <WorkspaceCommand
                open={paletteOpen}
                onOpenChange={setPaletteOpen}
                trigger={
                  <button
                    type="button"
                    className="topbar-search"
                    onClick={openPalette}
                    aria-label="Search all of BASidekick"
                  >
                    <MagnifyingGlass size={15} />
                    <span>Search</span>
                    <kbd>⌘K</kbd>
                  </button>
                }
              />
              {auth.user ? (
                <Link
                  className="user-chip"
                  href="/account"
                  aria-label="Open account settings"
                >
                  {auth.user.email?.slice(0, 1).toUpperCase()}
                </Link>
              ) : (
                <Link className="button compact" href="/signin">
                  Sign in
                </Link>
              )}
            </div>
          </header>

          <main id="content" className="content-pane">
            <div className="content-inner">{children}</div>
          </main>
        </div>

        <nav className="mobile-tabs" aria-label="Primary mobile navigation">
          {NAV_ITEMS.filter((item) =>
            ["dashboard", "wiki", "pointstack", "tools"].includes(item.id),
          ).map((item) => {
            const active = current?.id === item.id;
            return <MobileNavLink item={item} active={active} key={item.id} />;
          })}
          <button
            type="button"
            onClick={(event) => {
              mobileTriggerRef.current = event.currentTarget;
              setMobileOpen(true);
            }}
            aria-expanded={mobileOpen}
            aria-controls="mobile-workspace-navigation"
          >
            <List size={19} />
            <span>More</span>
          </button>
        </nav>

        <MobileWorkspaceNav
          open={mobileOpen}
          onOpenChange={setMobileOpen}
          pathname={pathname}
          currentId={current?.id}
          returnFocusRef={mobileTriggerRef}
        />
      </div>
    </MotionConfig>
  );
}

function MobileNavLink({ item, active }: { item: NavItem; active: boolean }) {
  const { iconRef, playClick } = useNavIconAnimation();

  return (
    <Link
      href={item.href}
      className={active ? "active" : ""}
      aria-current={active ? "page" : undefined}
      onClick={playClick}
    >
      <AnimatedNavIcon
        ref={iconRef}
        className="animated-nav-icon"
        name={item.id}
        size={19}
        aria-hidden="true"
      />
      <span>{item.label.replace("PointStack Social", "Social")}</span>
    </Link>
  );
}
