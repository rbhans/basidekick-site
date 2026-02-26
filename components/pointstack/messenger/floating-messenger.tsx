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
          className="fixed bottom-6 right-6 z-40 w-[52px] h-[52px] rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 flex items-center justify-center hover:brightness-110 transition-colors"
          aria-label="Open messages"
        >
          <ChatCircle className="w-6 h-6" weight="fill" />
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
          "fixed z-40 bg-card border border-border shadow-2xl flex flex-col",
          // Mobile: full screen
          "inset-0 md:inset-auto",
          // Desktop: bottom-right corner
          "md:bottom-6 md:right-6 md:w-[380px] md:h-[400px] md:rounded-2xl",
          // Animation
          "transition-all duration-200 ease-out",
          messengerOpen
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="h-[56px] bg-[#27272A] flex items-center justify-between px-4 shrink-0 md:rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <ChatCircle className="w-4 h-4 text-primary-foreground" weight="fill" />
            </div>
            <div>
              <p className="font-heading text-[14px] font-bold text-foreground leading-tight">
                Messages
              </p>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-[11px] text-muted-foreground">Online</span>
              </div>
            </div>
          </div>
          <button
            onClick={closeMessenger}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#3F3F46] transition-colors"
            aria-label="Close messages"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
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
