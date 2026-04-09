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
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/lib/routes";
import { PointStackNotificationType } from "@/lib/types";

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
      <section className="container mx-auto max-w-[720px] px-4 sm:px-6 lg:px-16 py-20">
        <div className="pb-5 border-b border-foreground mb-8">
          <div className="font-mono text-[10px] uppercase tracking-[1.3px] text-muted-foreground mb-2">
            PointStack
          </div>
          <h1 className="font-heading font-semibold text-[32px] md:text-[38px] leading-[1.05] text-foreground">
            Sign in to view notifications
          </h1>
          <p className="font-heading italic text-[15px] text-muted-foreground mt-3">
            You need to be signed in to access your notifications.
          </p>
        </div>
        <Link
          href={ROUTES.SIGNIN}
          className="inline-flex items-center gap-1.5 px-5 py-3 border border-foreground bg-primary text-primary-foreground font-mono text-[10px] uppercase tracking-[1.2px] hover:bg-primary/90 transition-colors"
        >
          Sign in →
        </Link>
      </section>
    );
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <section className="container mx-auto max-w-[800px] px-4 sm:px-6 lg:px-16 py-10">
      {/* Header */}
      <div className="flex items-baseline gap-3.5 pb-3.5 border-b border-foreground mb-6">
        <span className="font-mono text-[11px] text-accent tracking-[1px]">01 /</span>
        <h1 className="font-heading font-semibold text-[26px] leading-none text-foreground">
          Notifications
        </h1>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground tabular-nums">
          {unreadCount > 0 ? `${unreadCount} unread` : "all caught up"}
        </span>
        {unreadCount > 0 && (
          <button
            onClick={markAllNotificationsRead}
            className="ml-3.5 font-mono text-[10px] uppercase tracking-[1.2px] text-accent hover:text-foreground transition-colors"
          >
            Mark all read →
          </button>
        )}
      </div>

      {/* Loading */}
      {notificationsLoading && notifications.length === 0 && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )}

      {/* Notifications list */}
      {notifications.length > 0 && (
        <div className="space-y-0">
          {notifications.map((notification) => {
            const Icon = NOTIFICATION_ICONS[notification.type];
            const unread = !notification.is_read;
            return (
              <div
                key={notification.id}
                className={`grid grid-cols-[36px_1fr_auto] gap-4 items-start py-4 px-2 border-b border-muted cursor-pointer transition-colors ${
                  unread ? "bg-muted/40" : "hover:bg-muted/30"
                }`}
                onClick={() => {
                  if (unread) {
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
                  <div className="w-8 h-8 border border-border bg-card flex items-center justify-center">
                    <Icon className="w-4 h-4 text-accent" />
                  </div>
                )}

                <div className="min-w-0">
                  <p
                    className={`text-[14px] leading-[1.4] text-foreground ${
                      unread ? "font-heading font-semibold" : ""
                    }`}
                  >
                    {notification.title}
                  </p>
                  {notification.body && (
                    <p className="text-[13px] text-muted-foreground line-clamp-2 mt-0.5 leading-[1.5]">
                      {notification.body}
                    </p>
                  )}
                  <p className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground mt-1 tabular-nums">
                    {formatDistanceToNow(new Date(notification.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-center">
                  {unread && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
                  {notification.link && (
                    <Link
                      href={notification.link}
                      className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground hover:text-accent transition-colors"
                    >
                      View →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!notificationsLoading && notifications.length === 0 && (
        <div className="py-20 text-center">
          <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <p className="font-heading italic text-[16px] text-muted-foreground">
            No notifications yet. We&apos;ll let you know when something happens.
          </p>
        </div>
      )}
    </section>
  );
}
