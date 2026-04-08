"use client";

import { useEffect, useCallback } from "react";
import { X, ChatCircle } from "@phosphor-icons/react";
import { useAuth } from "@/hooks/use-auth";
import { usePointStackStore } from "../pointstack-store";
import { MessengerInbox } from "./messenger-inbox";
import { MessengerConversation } from "./messenger-conversation";
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

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, fetchConversations]);

  const totalUnread = conversations.reduce(
    (sum, conv) => sum + (conv.unread_count || 0),
    0,
  );
  const displayCount = totalUnread || unreadMessageCount;

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
    [messengerOpen, messengerView, closeMessenger, backToMessengerInbox],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!user) {
    return null;
  }

  return (
    <>
      {/* Persistent floating trigger — always visible bottom-right */}
      {!messengerOpen && (
        <button
          onClick={toggleMessenger}
          aria-label="Open messages"
          className="group fixed bottom-6 right-6 z-40 bg-primary text-primary-foreground border-[1.5px] border-foreground rounded-md pl-4 pr-4 py-3 flex items-center gap-2.5 shadow-[0_10px_30px_-12px_rgba(31,41,32,0.35)] hover:shadow-[0_14px_34px_-12px_rgba(31,41,32,0.5)] hover:-translate-y-0.5 transition-all"
        >
          <ChatCircle className="w-4 h-4" weight="fill" />
          <span className="font-mono text-[11px] font-medium uppercase tracking-[1.4px]">
            Messages
          </span>
          {displayCount > 0 && (
            <span className="ml-1 min-w-[22px] h-[18px] px-1.5 font-mono text-[10px] font-bold bg-accent text-accent-foreground rounded-sm flex items-center justify-center tabular-nums border border-foreground">
              {displayCount > 99 ? "99+" : displayCount}
            </span>
          )}
        </button>
      )}

      {/* Mobile backdrop */}
      {messengerOpen && (
        <div
          className="fixed inset-0 bg-foreground/50 z-40 md:hidden"
          onClick={closeMessenger}
        />
      )}

      {/* Messenger panel */}
      <div
        className={cn(
          "fixed z-40 bg-card border-[1.5px] border-foreground shadow-2xl flex flex-col overflow-hidden",
          // Mobile: full screen
          "inset-0 md:inset-auto",
          // Desktop: bottom-right corner
          "md:bottom-6 md:right-6 md:w-[380px] md:h-[440px] md:rounded-md",
          // Animation
          "transition-all duration-200 ease-out",
          messengerOpen
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0 pointer-events-none",
        )}
      >
        {/* Header — mini title block strip */}
        <div className="title-block !py-3 !px-4 shrink-0 !border-b">
          <div className="field">
            <span className="field-label">Drawing</span>
            <span className="field-value">Messages</span>
          </div>
          <div className="field hidden sm:flex">
            <span className="field-label"><span className="live-dot" />Live</span>
            <span className="field-value">Online</span>
          </div>
          <div className="spacer" />
          <button
            onClick={closeMessenger}
            aria-label="Close messages"
            className="w-6 h-6 border border-foreground rounded-sm flex items-center justify-center text-foreground hover:bg-foreground hover:text-background transition-colors shrink-0"
          >
            <X className="w-3 h-3" weight="bold" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {messengerView === "inbox" ? <MessengerInbox /> : <MessengerConversation />}
        </div>
      </div>
    </>
  );
}
