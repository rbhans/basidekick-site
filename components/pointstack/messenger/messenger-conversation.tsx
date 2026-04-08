"use client";

import { useEffect, useState, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, PaperPlaneTilt } from "@phosphor-icons/react";
import { useAuth } from "@/hooks/use-auth";
import { usePointStackStore } from "../pointstack-store";
import { UserAvatar } from "../shared/user-avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function MessengerConversation() {
  const { user } = useAuth();
  const {
    currentConversation,
    currentMessages,
    messagesLoading,
    selectedConversationId,
    sendMessage,
    backToMessengerInbox,
  } = usePointStackStore();
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !selectedConversationId) return;

    setSending(true);
    try {
      await sendMessage(selectedConversationId, newMessage.trim());
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Couldn't send that. Try again.");
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="font-heading italic text-[14px] text-muted-foreground">
          Sign in required
        </p>
      </div>
    );
  }

  const otherParticipant = currentConversation?.participants?.find(
    (p) => p.user_id !== user.id,
  );

  return (
    <div className="flex flex-col h-full">
      {/* Sub-header */}
      <div className="px-4 py-3 border-b border-border flex items-center gap-2.5 shrink-0 bg-secondary">
        <button
          onClick={backToMessengerInbox}
          aria-label="Back to inbox"
          className="w-7 h-7 flex items-center justify-center text-foreground hover:text-accent transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        {otherParticipant && (
          <>
            <UserAvatar
              displayName={otherParticipant.profile?.display_name || null}
              avatarUrl={otherParticipant.profile?.avatar_url}
              size="sm"
            />
            <p className="font-heading font-semibold text-[14px] leading-tight text-foreground truncate">
              {otherParticipant.profile?.display_name || "Unknown User"}
            </p>
          </>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
        {messagesLoading && (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-3/4 rounded-sm" />
            ))}
          </div>
        )}

        {currentMessages.map((message) => {
          const isOwn = message.sender_id === user.id;
          return (
            <div
              key={message.id}
              className={cn("flex", isOwn ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[80%] px-3 py-2 rounded-sm",
                  isOwn
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary border border-border text-foreground",
                )}
              >
                <p className="text-[13px] leading-[1.5] break-words whitespace-pre-wrap">
                  {message.content}
                </p>
                <p
                  className={cn(
                    "mt-1 font-mono text-[9px] uppercase tracking-[1px] tabular-nums",
                    isOwn ? "text-primary-foreground/60" : "text-muted-foreground",
                  )}
                >
                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: false })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="px-3 py-3 border-t border-border shrink-0 bg-card">
        <div className="flex items-center gap-2 border-[1.5px] border-foreground rounded-sm bg-background focus-within:border-accent transition-colors px-3">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message…"
            disabled={sending}
            className="flex-1 bg-transparent border-none outline-none font-sans text-[13px] text-foreground placeholder:text-muted-foreground/60 placeholder:italic py-2"
            aria-label="New message"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="shrink-0 bg-primary text-primary-foreground w-7 h-7 rounded-sm flex items-center justify-center hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors my-1"
            aria-label="Send"
          >
            <PaperPlaneTilt className="w-3.5 h-3.5" weight="fill" />
          </button>
        </div>
      </form>
    </div>
  );
}
