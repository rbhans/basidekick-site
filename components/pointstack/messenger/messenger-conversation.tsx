"use client";

import { useEffect, useState, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, PaperPlaneTilt } from "@phosphor-icons/react";
import { useAuth } from "@/hooks/use-auth";
import { usePointStackStore } from "../pointstack-store";
import { UserAvatar } from "../shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-sm text-muted-foreground">Sign in required</p>
      </div>
    );
  }

  const otherParticipant = currentConversation?.participants?.find(
    (p) => p.user_id !== user.id
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border flex items-center gap-2 shrink-0">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={backToMessengerInbox}
          className="shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        {otherParticipant && (
          <>
            <UserAvatar
              displayName={otherParticipant.profile?.display_name || null}
              avatarUrl={otherParticipant.profile?.avatar_url}
              size="sm"
            />
            <p className="text-sm font-medium truncate">
              {otherParticipant.profile?.display_name || "Unknown User"}
            </p>
          </>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messagesLoading && (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-3/4" />
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
                  "max-w-[80%] px-3 py-2 rounded-lg",
                  isOwn
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <p className="text-sm break-words">{message.content}</p>
                <p
                  className={cn(
                    "text-[10px] mt-0.5",
                    isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
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
      <form onSubmit={handleSend} className="p-3 border-t border-border shrink-0">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={sending}
            className="h-9 text-sm"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!newMessage.trim() || sending}
          >
            <PaperPlaneTilt className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
