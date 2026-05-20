"use client";

import { useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { usePointStackStore } from "../pointstack-store";
import { UserAvatar } from "../shared/user-avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function MessengerInbox() {
  const { user } = useAuth();
  const {
    conversations,
    messagesLoading,
    fetchConversations,
    openMessengerConversation,
  } = usePointStackStore();

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, fetchConversations]);

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="italic text-[14px] text-muted-foreground">
          Sign in to view messages
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Loading */}
      {messagesLoading && conversations.length === 0 && (
        <div className="p-3 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-sm" />
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
              <button
                key={conversation.id}
                onClick={() => openMessengerConversation(conversation.id)}
                className="w-full flex items-center gap-3 px-4 py-3 border-b border-muted hover:bg-muted/50 transition-colors text-left"
              >
                <UserAvatar
                  displayName={otherParticipant?.profile?.display_name || null}
                  avatarUrl={otherParticipant?.profile?.avatar_url}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-heading font-semibold text-[14px] leading-tight text-foreground truncate">
                      {otherParticipant?.profile?.display_name || "Unknown User"}
                    </p>
                    <span className="font-mono text-[9px] uppercase tracking-[1px] text-muted-foreground shrink-0">
                      {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: false })}
                    </span>
                  </div>
                  {conversation.last_message && (
                    <p
                      className={cn(
                        "text-[12px] truncate mt-0.5 leading-[1.4]",
                        hasUnread ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {conversation.last_message.content}
                    </p>
                  )}
                </div>
                {hasUnread ? (
                  <span className="w-2 h-2 rounded-full bg-accent shrink-0" aria-label="Unread" />
                ) : null}
              </button>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!messagesLoading && conversations.length === 0 && (
        <div className="flex-1 flex items-center justify-center p-6">
          <p className="italic text-[14px] text-muted-foreground text-center">
            No messages yet.
          </p>
        </div>
      )}
    </div>
  );
}
