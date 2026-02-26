"use client";

import { useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  ChatCircle,
  Heart,
  UserPlus,
  Check,
  Briefcase,
  At,
} from "@phosphor-icons/react";
import { useAuth } from "@/hooks/use-auth";
import { usePointStackStore } from "../pointstack-store";
import { UserAvatar } from "../shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/lib/routes";
import { PointStackNotificationType } from "@/lib/types";
import { cn } from "@/lib/utils";

const NOTIFICATION_ICONS: Record<PointStackNotificationType, typeof Bell> = {
  mention: At,
  reply: ChatCircle,
  follow: UserPlus,
  like: Heart,
  answer_accepted: Check,
  job_application: Briefcase,
  system: Bell,
};

export function PointStackNotificationsView() {
  const { user } = useAuth();
  const {
    notifications,
    notificationsLoading,
    fetchNotifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = usePointStackStore();

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Sign in to view notifications</h2>
          <p className="text-muted-foreground mb-4">
            You need to be signed in to access your notifications.
          </p>
          <Button asChild>
            <Link href={ROUTES.SIGNIN}>Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllNotificationsRead}>
            Mark all as read
          </Button>
        )}
      </div>

      {/* Loading */}
      {notificationsLoading && notifications.length === 0 && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      )}

      {/* Notifications list */}
      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const Icon = NOTIFICATION_ICONS[notification.type];
            return (
              <div
                key={notification.id}
                className={cn(
                  "flex items-start gap-3 p-4 rounded-xl border border-border/40 bg-card hover:border-primary/30 transition-colors",
                  !notification.is_read && "bg-primary/5"
                )}
                onClick={() => {
                  if (!notification.is_read) {
                    markNotificationRead(notification.id);
                  }
                }}
              >
                {notification.actor ? (
                  <UserAvatar
                    displayName={notification.actor.display_name || null}
                    avatarUrl={notification.actor.avatar_url}
                    size="md"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm", !notification.is_read && "font-medium")}>
                    {notification.title}
                  </p>
                  {notification.body && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {notification.body}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </p>
                </div>

                {notification.link && (
                  <Link
                    href={notification.link}
                    className="shrink-0 text-sm text-primary hover:underline"
                  >
                    View
                  </Link>
                )}

                {!notification.is_read && (
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!notificationsLoading && notifications.length === 0 && (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            No notifications yet. We&apos;ll let you know when something happens!
          </p>
        </div>
      )}
    </div>
  );
}
