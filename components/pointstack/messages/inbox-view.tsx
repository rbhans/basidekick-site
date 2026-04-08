"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { usePointStackStore } from "../pointstack-store";
import { UserAvatar } from "../shared/user-avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

export function PointStackMessagesView() {
  const { user } = useAuth();
  const { conversations, messagesLoading, fetchConversations } = usePointStackStore();

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, fetchConversations]);

  const totalUnread = useMemo(
    () => conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0),
    [conversations],
  );

  if (!user) {
    return (
      <div className="container mx-auto max-w-[880px] px-4 sm:px-6 lg:px-16 py-16 text-center">
        <p className="font-heading italic text-[20px] text-muted-foreground mb-5">
          Sign in to view your messages.
        </p>
        <Link
          href={ROUTES.SIGNIN}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-md text-[13px] font-semibold hover:bg-primary/90 transition-colors"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <section className="container mx-auto max-w-[880px] px-4 sm:px-6 lg:px-16 py-14">
      {/* Section heading */}
      <div className="flex items-baseline gap-3.5 pb-3.5 border-b border-foreground mb-0">
        <span className="font-mono text-[11px] text-accent tracking-[1px]">01 /</span>
        <h1 className="font-heading font-semibold text-[26px] leading-none text-foreground">
          Messages
        </h1>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground tabular-nums">
          {conversations.length} {conversations.length === 1 ? "thread" : "threads"}
          {totalUnread > 0 && (
            <>
              <span className="text-muted-foreground/50 mx-1.5">·</span>
              <span className="text-accent">{totalUnread} unread</span>
            </>
          )}
        </span>
      </div>

      {/* Loading */}
      {messagesLoading && conversations.length === 0 && (
        <div className="space-y-2 mt-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-md" />
          ))}
        </div>
      )}

      {/* Conversations list */}
      {conversations.length > 0 && (
        <div>
          {conversations.map((conversation) => {
            const otherParticipant = conversation.participants?.find(
              (p) => p.user_id !== user.id,
            );
            const hasUnread = conversation.unread_count && conversation.unread_count > 0;

            return (
              <Link
                key={conversation.id}
                href={ROUTES.POINTSTACK_CONVERSATION(conversation.id)}
                className="group flex items-center gap-4 py-4 px-2 border-b border-muted hover:bg-muted/40 transition-colors"
              >
                <UserAvatar
                  displayName={otherParticipant?.profile?.display_name || null}
                  avatarUrl={otherParticipant?.profile?.avatar_url}
                  size="lg"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <p
                      className={cn(
                        "font-heading font-semibold text-[16px] leading-[1.2] text-foreground truncate group-hover:text-accent transition-colors",
                      )}
                    >
                      {otherParticipant?.profile?.display_name || "Unknown User"}
                    </p>
                    <span className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground shrink-0">
                      {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })}
                    </span>
                  </div>
                  {conversation.last_message && (
                    <p
                      className={cn(
                        "text-[13px] truncate mt-1 leading-[1.4]",
                        hasUnread ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {conversation.last_message.content}
                    </p>
                  )}
                </div>
                {hasUnread ? (
                  <span className="shrink-0 w-2 h-2 rounded-full bg-accent" aria-label="Unread" />
                ) : (
                  <span className="shrink-0 w-2 h-2" aria-hidden />
                )}
              </Link>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!messagesLoading && conversations.length === 0 && (
        <div className="py-20 text-center font-heading italic text-[18px] text-muted-foreground">
          No messages yet. Start a conversation with someone.
        </div>
      )}
    </section>
  );
}
