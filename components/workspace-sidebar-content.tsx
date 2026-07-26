"use client";

import Link from "next/link";
import { CaretDown, SignIn, SignOut, X } from "@phosphor-icons/react";
import { AnimatedNavIcon, useNavIconAnimation } from "@/components/animated-nav-icon";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/components/providers";
import { NAV_ITEMS, type NavItem } from "@/lib/navigation";

export function WorkspaceSidebarContent({
  pathname,
  currentId,
  collapsed,
  mobile = false,
  onNavigate,
}: {
  pathname: string;
  currentId?: string;
  collapsed: boolean;
  mobile?: boolean;
  onNavigate: () => void;
}) {
  const auth = useAuth();

  return (
    <>
      <div className="sidebar-brand">
        <Link href="/dashboard" aria-label="BASidekick dashboard" onClick={onNavigate}>
          <BrandMark />
          <span>BASidekick</span>
        </Link>
        {mobile && (
          <button
            type="button"
            className="icon-button mobile-close"
            onClick={onNavigate}
            aria-label="Close navigation"
          >
            <X size={17} />
          </button>
        )}
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const active = currentId === item.id;
          return (
            <div className="nav-group" key={item.id}>
              <SidebarNavLink
                item={item}
                active={active}
                collapsed={collapsed}
                onNavigate={onNavigate}
              />
              {item.children && active && !collapsed && (
                <div className="nav-children">
                  {item.children
                    .filter((child) => !child.authOnly || auth.user)
                    .map((child) => {
                      const childActive =
                        pathname === child.href ||
                        (child.href !== item.href &&
                          pathname.startsWith(`${child.href}/`));
                      return (
                        <Link
                          key={child.href}
                          className={childActive ? "active" : ""}
                          href={child.href}
                          onClick={onNavigate}
                          aria-current={childActive ? "page" : undefined}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <ThemeToggle />
        {auth.user ? (
          <button className="sidebar-control" type="button" onClick={auth.signOut}>
            <SignOut size={17} />
            <span>Sign out</span>
          </button>
        ) : (
          <Link className="sidebar-control" href="/signin" onClick={onNavigate}>
            <SignIn size={17} />
            <span>Sign in</span>
          </Link>
        )}
      </div>
    </>
  );
}

function SidebarNavLink({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onNavigate: () => void;
}) {
  const { iconRef, start, stop, playClick } = useNavIconAnimation();

  return (
    <Link
      className={`nav-item ${active ? "active" : ""}`}
      href={item.href}
      onMouseEnter={start}
      onMouseLeave={stop}
      onFocus={start}
      onBlur={stop}
      onClick={() => {
        playClick();
        onNavigate();
      }}
      title={collapsed ? item.label : undefined}
      aria-current={active ? "page" : undefined}
    >
      <AnimatedNavIcon
        ref={iconRef}
        className="animated-nav-icon"
        name={item.id}
        aria-hidden="true"
      />
      <span>{item.label}</span>
      {item.badge && <em>{item.badge}</em>}
      {item.children && !collapsed && (
        <CaretDown className="nav-caret" size={12} />
      )}
    </Link>
  );
}
