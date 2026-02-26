"use client";

import { useEffect, useCallback } from "react";
import { X, ChatCircle } from "@phosphor-icons/react";
import { useAuth } from "@/hooks/use-auth";
import { usePointStackStore } from "../pointstack-store";
import { MessengerInbox } from "./messenger-inbox";
import { MessengerConversation } from "./messenger-conversation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FloatingMessenger() {
  const { user } = useAuth();
  const {
    messengerOpen,
    messengerView,
    toggleMessenger,
    closeMessenger,
    backToMessengerInbox,
    conversations,
    unreadMessageCount,
    fetchConversations,
  } = usePointStackStore();

  // Fetch conversations on mount for unread count
  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, fetchConversations]);

  const totalUnread = conversations.reduce(
    (sum, conv) => sum + (conv.unread_count || 0),
    0
  );
  const displayCount = totalUnread || unreadMessageCount;

  // Handle escape key to close
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && messengerOpen) {
        if (messengerView === "conversation") {
          backToMessengerInbox();
        } else {
          closeMessenger();
        }
      }
    },
    [messengerOpen, messengerView, closeMessenger, backToMessengerInbox]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Don't render at all if not authenticated
  if (!user) {
    return null;
  }

  return (
    <>
      {/* Persistent floating trigger button — always visible bottom-right */}
      {!messengerOpen && (
        <button
          onClick={toggleMessenger}
          className="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center hover:bg-primary/90 transition-all hover:scale-110 active:scale-95"
          aria-label="Open messages"
        >
          <ChatCircle className="w-5 h-5" weight="fill" />
          {displayCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-destructive text-white rounded-full flex items-center justify-center">
              {displayCount > 99 ? "99+" : displayCount}
            </span>
          )}
        </button>
      )}

      {/* Backdrop for mobile */}
      {messengerOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeMessenger}
        />
      )}

      {/* Messenger panel */}
      <div
        className={cn(
          "fixed z-40 bg-card border border-border/30 shadow-2xl shadow-black/50 flex flex-col",
          // Mobile: full screen
          "inset-0 md:inset-auto",
          // Desktop: bottom-right corner
          "md:bottom-5 md:right-5 md:w-[360px] md:h-[500px] md:rounded-xl",
          // Animation
          "transition-all duration-200 ease-out",
          messengerOpen
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
          <h2 className="font-semibold text-sm">Messages</h2>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={closeMessenger}
            aria-label="Close messages"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {messengerView === "inbox" ? (
            <MessengerInbox />
          ) : (
            <MessengerConversation />
          )}
        </div>
      </div>
    </>
  );
}
