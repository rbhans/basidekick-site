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
      {/* Hero Banner */}
      <div className="border-b border-border/50 bg-background/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-center">
          <h1 className="text-3xl md:text-4xl font-heading font-bold tracking-tight">
            Point<span className="text-primary">Stack</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-2 max-w-md mx-auto">
            The BAS community hub — share knowledge, find jobs, and connect with professionals.
          </p>
        </div>
      </div>

      {/* Sub-navigation */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-[64px] z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center gap-1 py-2 overflow-x-auto scrollbar-hide">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors",
                    active
                      ? "text-primary-foreground bg-primary shadow-[0_0_12px_rgba(196,248,42,0.3)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className="w-4 h-4" weight={active ? "fill" : "regular"} />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}

            {/* User-specific navigation */}
            {user && (
              <>
                <div className="w-px h-5 bg-border/60 mx-3 shrink-0" />
                {USER_NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  const count = counts[item.countKey];
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors",
                        active
                          ? "text-primary-foreground bg-primary shadow-[0_0_12px_rgba(196,248,42,0.3)]"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                      aria-label={item.label}
                    >
                      <Icon className="w-4 h-4" weight={active ? "fill" : "regular"} />
                      <span className="hidden md:inline">{item.label}</span>
                      {count > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 text-[10px] font-bold bg-destructive text-white rounded-full flex items-center justify-center">
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
      <main className="flex-1" key={pathname}>{children}</main>
    </div>
  );
}
