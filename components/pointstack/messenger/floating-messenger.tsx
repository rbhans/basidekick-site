"use client";

import { useEffect, useCallback } from "react";
import { X } from "@phosphor-icons/react";
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
    closeMessenger,
    backToMessengerInbox
  } = usePointStackStore();

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

  // Don't render if not authenticated or not open
  if (!user || !messengerOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 md:hidden",
          messengerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={closeMessenger}
      />

      {/* Messenger panel */}
      <div
        className={cn(
          "fixed z-40 bg-card border border-border shadow-lg flex flex-col",
          // Mobile: full screen
          "inset-0 md:inset-auto",
          // Desktop: bottom-right corner
          "md:bottom-4 md:right-4 md:w-[360px] md:h-[500px] md:rounded-lg",
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
