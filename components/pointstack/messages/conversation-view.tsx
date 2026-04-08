"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { ArrowLeft, PaperPlaneTilt } from "@phosphor-icons/react";
import { useAuth } from "@/hooks/use-auth";
import { usePointStackStore } from "../pointstack-store";
import { UserAvatar } from "../shared/user-avatar";
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
      <div className="container mx-auto max-w-[880px] px-4 sm:px-6 lg:px-16 py-16 text-center">
        <p className="font-heading italic text-[20px] text-muted-foreground mb-5">
          Sign in to view this conversation.
        </p>
        <Link
          href={ROUTES.SIGNIN}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-md text-[13px] font-semibold hover:bg-primary/90 transition-colors"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const otherParticipant = currentConversation?.participants?.find(
    (p) => p.user_id !== user.id,
  );

  return (
    <section className="container mx-auto max-w-[880px] px-4 sm:px-6 lg:px-16 py-10 flex flex-col h-[calc(100vh-180px)] min-h-[540px]">
      {/* Header */}
      <div className="flex items-center gap-4 pb-5 border-b border-foreground shrink-0">
        <Link
          href={ROUTES.POINTSTACK_MESSAGES}
          className="font-mono text-[11px] uppercase tracking-[1.2px] text-muted-foreground hover:text-accent transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3 h-3 text-accent" />
          Inbox
        </Link>
        <span className="text-border">·</span>
        {otherParticipant ? (
          <div className="flex items-center gap-3">
            <UserAvatar
              displayName={otherParticipant.profile?.display_name || null}
              avatarUrl={otherParticipant.profile?.avatar_url}
              size="md"
            />
            <div>
              <div className="font-heading font-semibold text-[17px] leading-tight text-foreground">
                {otherParticipant.profile?.display_name || "Unknown User"}
              </div>
            </div>
          </div>
        ) : (
          <div className="font-heading italic text-[14px] text-muted-foreground">
            Loading conversation…
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-8 space-y-4">
        {messagesLoading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-3/4 rounded-md" />
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
                  "max-w-[70%] px-4 py-3 rounded-md",
                  isOwn
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary border border-border text-foreground",
                )}
              >
                <p className="text-[14px] leading-[1.55] whitespace-pre-wrap break-words">
                  {message.content}
                </p>
                <p
                  className={cn(
                    "mt-1.5 font-mono text-[9px] uppercase tracking-[1.1px] tabular-nums",
                    isOwn ? "text-primary-foreground/60" : "text-muted-foreground",
                  )}
                  title={format(new Date(message.created_at), "MMM d, yyyy 'at' h:mm a")}
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
      <form onSubmit={handleSend} className="pt-4 border-t border-border shrink-0">
        <div className="flex items-center gap-3 border-[1.5px] border-foreground rounded-md bg-card focus-within:border-accent transition-colors px-4">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message…"
            disabled={sending}
            className="flex-1 bg-transparent border-none outline-none font-sans text-[14px] text-foreground placeholder:text-muted-foreground/60 placeholder:italic py-3"
            aria-label="New message"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="shrink-0 bg-primary text-primary-foreground w-9 h-9 rounded-sm flex items-center justify-center hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors my-1"
            aria-label="Send"
          >
            <PaperPlaneTilt className="w-4 h-4" weight="fill" />
          </button>
        </div>
      </form>
    </section>
  );
}
