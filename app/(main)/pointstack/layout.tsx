"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChatCircle, Bell } from "@phosphor-icons/react";
import { useAuth } from "@/hooks/use-auth";
import { usePointStackStore } from "@/components/pointstack/pointstack-store";

const NAV_ITEMS: { href: string; label: string; exact?: boolean }[] = [
  { href: "/pointstack", label: "Feed", exact: true },
  { href: "/pointstack/people", label: "People" },
  { href: "/pointstack/companies", label: "Companies" },
  { href: "/pointstack/jobs", label: "Jobs" },
  { href: "/pointstack/resources", label: "Resources" },
];

const USER_NAV_ITEMS = [
  { href: "/pointstack/messages", label: "Messages", icon: ChatCircle, countKey: "unreadMessageCount" as const },
  { href: "/pointstack/notifications", label: "Notifications", icon: Bell, countKey: "unreadNotificationCount" as const },
];

export default function PointStackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const unreadNotificationCount = usePointStackStore((s) => s.unreadNotificationCount);
  const unreadMessageCount = usePointStackStore((s) => s.unreadMessageCount);

  const counts = {
    unreadMessageCount,
    unreadNotificationCount,
  };

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <div className="min-h-full flex flex-col">
      {/* Title block strip */}
      <div className="title-block">
        <div className="field">
          <span className="field-label">Drawing</span>
          <span className="field-value">PointStack</span>
        </div>
        <div className="field">
          <span className="field-label">Title</span>
          <span className="field-value">Community Feed</span>
        </div>
        <div className="field hidden md:flex">
          <span className="field-label">Scope</span>
          <span className="field-value">BAS Professionals</span>
        </div>
        <div className="spacer" />
        <div className="field">
          <span className="field-label"><span className="live-dot" />Live</span>
          <span className="field-value">Active</span>
        </div>
      </div>

      {/* Section sub-nav */}
      <nav className="border-b border-border sticky top-0 z-10 bg-background">
        <div className="container mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-16">
          <div className="flex items-center gap-6 py-4 overflow-x-auto scrollbar-hide">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "font-mono text-[11px] uppercase tracking-[1.2px] whitespace-nowrap transition-colors py-1",
                    active
                      ? "text-accent border-b-[1.5px] border-accent pb-0.5"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}

            {user && (
              <>
                <span className="w-px h-4 bg-border mx-1 shrink-0" />
                {USER_NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  const count = counts[item.countKey];
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "relative flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[1.2px] whitespace-nowrap transition-colors py-1",
                        active
                          ? "text-accent"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                      aria-label={item.label}
                    >
                      <Icon className="w-3.5 h-3.5" weight={active ? "fill" : "regular"} />
                      <span className="hidden md:inline">{item.label}</span>
                      {count > 0 && (
                        <span className="min-w-[16px] h-4 px-1 text-[9px] font-bold bg-accent text-accent-foreground rounded-full flex items-center justify-center tabular-nums">
                          {count > 99 ? "99+" : count}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Page content */}
      <div className="flex-1" key={pathname}>{children}</div>
    </div>
  );
}
