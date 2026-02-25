"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  House,
  UsersThree,
  Buildings,
  Briefcase,
  Folder,
  ChatCircle,
  Bell,
} from "@phosphor-icons/react";
import { useAuth } from "@/hooks/use-auth";
import { usePointStackStore } from "@/components/pointstack/pointstack-store";

const NAV_ITEMS = [
  { href: "/pointstack", label: "Feed", icon: House, exact: true },
  { href: "/pointstack/people", label: "People", icon: UsersThree },
  { href: "/pointstack/companies", label: "Companies", icon: Buildings },
  { href: "/pointstack/jobs", label: "Jobs", icon: Briefcase },
  { href: "/pointstack/resources", label: "Resources", icon: Folder },
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
      {/* Sub-navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center py-2">
            {/* Main navigation — fade hints on mobile for scroll */}
            <div className="relative flex-1 min-w-0">
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide justify-start sm:justify-center">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href, item.exact);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <Icon className="w-4 h-4" weight={active ? "fill" : "regular"} />
                      <span className="hidden sm:inline">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
              {/* Fade gradient on right edge for mobile scroll hint */}
              <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-card/50 to-transparent pointer-events-none sm:hidden" />
            </div>

            {/* User-specific navigation */}
            {user && (
              <div className="flex items-center gap-1 border-l border-border pl-2 ml-2 shrink-0">
                {USER_NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  const count = counts[item.countKey];
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "relative flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                      aria-label={item.label}
                    >
                      <Icon className="w-4 h-4" weight={active ? "fill" : "regular"} />
                      <span className="hidden md:inline">{item.label}</span>
                      {count > 0 && (
                        <span
                          className={cn(
                            "absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold leading-none px-1",
                            active
                              ? "bg-primary-foreground text-primary"
                              : "bg-destructive text-destructive-foreground"
                          )}
                        >
                          {count > 99 ? "99+" : count}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main className="flex-1" key={pathname}>{children}</main>
    </div>
  );
}
