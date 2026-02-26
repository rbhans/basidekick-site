"use client";

import { useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { usePointStackStore } from "../pointstack-store";
import { UserAvatar } from "../shared/user-avatar";
import { Button } from "@/components/ui/button";
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

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Sign in to view messages</h2>
          <p className="text-muted-foreground mb-4">
            You need to be signed in to access your messages.
          </p>
          <Button asChild>
            <Link href={ROUTES.SIGNIN}>Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-heading font-bold mb-6">Messages</h1>

      {/* Loading */}
      {messagesLoading && conversations.length === 0 && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      )}

      {/* Conversations list */}
      {conversations.length > 0 && (
        <div className="space-y-2">
          {conversations.map((conversation) => {
            const otherParticipant = conversation.participants?.find(
              (p) => p.user_id !== user.id
            );
            const hasUnread = conversation.unread_count && conversation.unread_count > 0;

            return (
              <Link
                key={conversation.id}
                href={ROUTES.POINTSTACK_CONVERSATION(conversation.id)}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-[#3F3F46] transition-colors",
                  hasUnread && "bg-primary/5"
                )}
              >
                <UserAvatar
                  displayName={otherParticipant?.profile?.display_name || null}
                  avatarUrl={otherParticipant?.profile?.avatar_url}
                  size="lg"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={cn("font-medium truncate", hasUnread && "text-primary")}>
                      {otherParticipant?.profile?.display_name || "Unknown User"}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })}
                    </span>
                  </div>
                  {conversation.last_message && (
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.last_message.content}
                    </p>
                  )}
                </div>
                {hasUnread && (
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                )}
              </Link>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!messagesLoading && conversations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No messages yet. Start a conversation with someone!
          </p>
        </div>
      )}
    </div>
  );
}
