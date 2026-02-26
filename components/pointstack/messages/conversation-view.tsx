"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, PaperPlaneTilt } from "@phosphor-icons/react";
import { useAuth } from "@/hooks/use-auth";
import { usePointStackStore } from "../pointstack-store";
import { UserAvatar } from "../shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

interface ConversationViewProps {
  conversationId: string;
}

export function PointStackConversationView({ conversationId }: ConversationViewProps) {
  const { user } = useAuth();
  const {
    currentConversation,
    currentMessages,
    messagesLoading,
    fetchMessages,
    sendMessage,
    markConversationRead,
  } = usePointStackStore();
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages(conversationId);
    markConversationRead(conversationId);
  }, [conversationId, fetchMessages, markConversationRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await sendMessage(conversationId, newMessage.trim());
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Sign in required</h2>
          <Button asChild>
            <Link href={ROUTES.SIGNIN}>Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  const otherParticipant = currentConversation?.participants?.find(
    (p) => p.user_id !== user.id
  );

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-180px)]">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card flex items-center gap-3">
        <Link
          href={ROUTES.POINTSTACK_MESSAGES}
          className="p-2 hover:bg-muted rounded-md"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        {otherParticipant && (
          <>
            <UserAvatar
              displayName={otherParticipant.profile?.display_name || null}
              avatarUrl={otherParticipant.profile?.avatar_url}
              size="md"
            />
            <div>
              <p className="font-medium">
                {otherParticipant.profile?.display_name || "Unknown User"}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messagesLoading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-3/4" />
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
                  "max-w-[70%] p-3 rounded-lg",
                  isOwn
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <p className="text-sm">{message.content}</p>
                <p
                  className={cn(
                    "text-xs mt-1",
                    isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                  )}
                >
                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-border/40">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={sending}
          />
          <Button type="submit" disabled={!newMessage.trim() || sending}>
            <PaperPlaneTilt className="w-5 h-5" />
          </Button>
        </div>
      </form>
    </div>
  );
}
