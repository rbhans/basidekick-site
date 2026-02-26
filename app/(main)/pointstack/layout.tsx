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
import { PageHero } from "@/components/page-hero";

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
      {/* Hero */}
      <PageHero centered imageSrc="/images/hero/pointstack.png">
        <h1 className="text-3xl md:text-[42px] font-heading font-bold tracking-tight">
          PointStack
        </h1>
        <p className="mt-3 text-muted-foreground max-w-[600px] mx-auto text-lg">
          Connect with BAS professionals, share projects, find work, and grow your network.
        </p>
      </PageHero>

      {/* Horizontal Nav */}
      <nav className="border-b border-border sticky top-[64px] z-10 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center gap-1 pb-4 overflow-x-auto scrollbar-hide">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-[14px] font-semibold rounded-lg whitespace-nowrap transition-colors",
                    active
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground/70 hover:bg-muted/50"
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
                <div className="w-px h-5 bg-border mx-3 shrink-0" />
                {USER_NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  const count = counts[item.countKey];
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "relative flex items-center gap-2 px-4 py-2 text-[14px] font-semibold rounded-lg whitespace-nowrap transition-colors",
                        active
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-foreground/70 hover:bg-muted/50"
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
