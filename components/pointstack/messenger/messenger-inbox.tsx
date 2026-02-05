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
    openMessengerConversation
  } = usePointStackStore();

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, fetchConversations]);

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-sm text-muted-foreground">Sign in to view messages</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Loading */}
      {messagesLoading && conversations.length === 0 && (
        <div className="p-3 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      )}

      {/* Conversations list */}
      {conversations.length > 0 && (
        <div className="divide-y divide-border">
          {conversations.map((conversation) => {
            const otherParticipant = conversation.participants?.find(
              (p) => p.user_id !== user.id
            );
            const hasUnread = conversation.unread_count && conversation.unread_count > 0;

            return (
              <button
                key={conversation.id}
                onClick={() => openMessengerConversation(conversation.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left",
                  hasUnread && "bg-primary/5"
                )}
              >
                <UserAvatar
                  displayName={otherParticipant?.profile?.display_name || null}
                  avatarUrl={otherParticipant?.profile?.avatar_url}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn("text-sm font-medium truncate", hasUnread && "text-primary")}>
                      {otherParticipant?.profile?.display_name || "Unknown User"}
                    </p>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: false })}
                    </span>
                  </div>
                  {conversation.last_message && (
                    <p className="text-xs text-muted-foreground truncate">
                      {conversation.last_message.content}
                    </p>
                  )}
                </div>
                {hasUnread && (
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!messagesLoading && conversations.length === 0 && (
        <div className="flex-1 flex items-center justify-center p-6">
          <p className="text-sm text-muted-foreground text-center">
            No messages yet
          </p>
        </div>
      )}
    </div>
  );
}
