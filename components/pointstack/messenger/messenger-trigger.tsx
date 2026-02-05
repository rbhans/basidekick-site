"use client";

import { useEffect } from "react";
import { ChatCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { usePointStackStore } from "../pointstack-store";
import { useAuth } from "@/hooks/use-auth";

export function MessengerTrigger() {
  const { user } = useAuth();
  const {
    toggleMessenger,
    fetchConversations,
    conversations,
    unreadMessageCount
  } = usePointStackStore();

  // Fetch conversations on mount to get unread count
  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, fetchConversations]);

  // Calculate unread count from conversations
  const totalUnread = conversations.reduce(
    (sum, conv) => sum + (conv.unread_count || 0),
    0
  );

  const displayCount = totalUnread || unreadMessageCount;

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className="relative group"
      onClick={toggleMessenger}
      aria-label="Open messages"
    >
      <ChatCircle className="w-5 h-5 transition-all duration-150 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
      {displayCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 text-[10px] font-medium bg-primary text-primary-foreground rounded-full flex items-center justify-center">
          {displayCount > 99 ? "99+" : displayCount}
        </span>
      )}
    </Button>
  );
}
