"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Bell } from "@phosphor-icons/react";
import { useAuth } from "@/hooks/use-auth";
import { usePointStackStore } from "../pointstack-store";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const { user } = useAuth();
  const { unreadNotificationCount, fetchUnreadCount } = usePointStackStore();

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      // Poll for new notifications every 60 seconds
      const interval = setInterval(fetchUnreadCount, 60000);
      return () => clearInterval(interval);
    }
  }, [user, fetchUnreadCount]);

  if (!user) return null;

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className="relative group"
      asChild
    >
      <Link href={ROUTES.POINTSTACK_NOTIFICATIONS}>
        <Bell
          className="w-4 h-4 transition-all duration-150 group-hover:scale-110"
          weight={unreadNotificationCount > 0 ? "fill" : "regular"}
        />
        {unreadNotificationCount > 0 && (
          <span
            className={cn(
              "absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full",
              "bg-destructive text-destructive-foreground text-[10px] font-medium",
              "flex items-center justify-center"
            )}
          >
            {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
          </span>
        )}
      </Link>
    </Button>
  );
}
