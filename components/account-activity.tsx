"use client";

import Link from "next/link";
import { ArrowRight, Check, PaperPlaneTilt } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { EmptyState, PageHeader, Pill } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import type { PointStackConversation, PointStackMessage, PointStackNotification } from "@/lib/types";

function formatActivityDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

export function NotificationsPanel({ initialNotifications, loadFailed = false }: { initialNotifications: PointStackNotification[]; loadFailed?: boolean }) {
  const client = useMemo(() => createClient(), []);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [busy, setBusy] = useState(false);

  async function markRead(id?: string) {
    if (!client || busy) return;
    setBusy(true);
    let query = client.from("pointstack_notifications").update({ is_read: true });
    query = id ? query.eq("id", id) : query.eq("is_read", false);
    const { error } = await query;
    if (!error) setNotifications((items) => items.map((item) => id && item.id !== id ? item : { ...item, is_read: true }));
    setBusy(false);
  }

  return (
    <>
      <PageHeader eyebrow="POINTSTACK / ACCOUNT" title="Notifications" description="Replies, mentions, follows, and activity tied to your account." actions={notifications.some((item) => !item.is_read) ? <button className="button quiet" type="button" disabled={busy} onClick={() => markRead()}><Check size={15} /> Mark all read</button> : undefined} />
      {loadFailed ? <EmptyState label="TEMPORARILY UNAVAILABLE">Notifications could not be loaded. Refresh this page to try again.</EmptyState> : notifications.length ? <div className="activity-list">{notifications.map((item) => {
        const content = <><span><Pill tone={item.is_read ? "neutral" : "accent"}>{item.type.replaceAll("_", " ")}</Pill><strong>{item.title}</strong><small>{item.body ?? formatActivityDate(item.created_at)}</small></span>{item.link && <ArrowRight size={15} />}</>;
        return item.link
          ? <Link className={item.is_read ? "" : "unread"} href={item.link} key={item.id} onClick={() => markRead(item.id)}>{content}</Link>
          : <button className={item.is_read ? "" : "unread"} type="button" key={item.id} onClick={() => markRead(item.id)}>{content}</button>;
      })}</div> : <EmptyState label="ALL CAUGHT UP">No notifications yet.</EmptyState>}
    </>
  );
}

export function MessagesPanel({ userId, initialConversations, people, initialConversationId = null, initialMessages = [], loadFailed = false }: { userId: string; initialConversations: PointStackConversation[]; people: { id: string; display_name: string | null; username: string | null; headline: string | null }[]; initialConversationId?: string | null; initialMessages?: PointStackMessage[]; loadFailed?: boolean }) {
  const router = useRouter();
  const client = useMemo(() => createClient(), []);
  const [activeId, setActiveId] = useState<string | null>(initialConversationId);
  const [messages, setMessages] = useState<PointStackMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [targetId, setTargetId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function participantName(conversation: PointStackConversation) {
    return conversation.participants?.find((participant) => participant.user_id !== userId)?.profile?.display_name ?? "Conversation";
  }

  async function openConversation(id: string) {
    if (!client) return;
    router.push(`/pointstack/messages/${id}`);
    setActiveId(id);
    setBusy(true);
    setError("");
    const { data, error: loadError } = await client
      .from("pointstack_messages")
      .select("*, sender:profiles!sender_id(display_name, avatar_url)")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });
    if (loadError) setError(loadError.message);
    else setMessages((data as PointStackMessage[]) ?? []);
    await client.from("pointstack_conversation_participants").update({ last_read_at: new Date().toISOString() }).eq("conversation_id", id).eq("user_id", userId);
    setBusy(false);
  }

  async function startConversation(event: React.FormEvent) {
    event.preventDefault();
    if (!client || !targetId || busy) return;
    setBusy(true);
    setError("");
    const { data, error: startError } = await client.rpc("start_pointstack_conversation", { other_user_id: targetId });
    if (startError) {
      setError(startError.message);
      setBusy(false);
      return;
    }
    const id = String(data);
    router.push(`/pointstack/messages/${id}`);
    router.refresh();
  }

  async function sendMessage(event: React.FormEvent) {
    event.preventDefault();
    if (!client || !activeId || !draft.trim() || busy) return;
    setBusy(true);
    setError("");
    const content = draft.trim().slice(0, 5000);
    const { data, error: sendError } = await client
      .from("pointstack_messages")
      .insert({ conversation_id: activeId, sender_id: userId, content })
      .select("*, sender:profiles!sender_id(display_name, avatar_url)")
      .single();
    if (sendError) setError(sendError.message);
    else {
      setMessages((items) => [...items, data as PointStackMessage]);
      setDraft("");
    }
    setBusy(false);
  }

  const active = initialConversations.find((item) => item.id === activeId);
  return (
    <>
      <PageHeader eyebrow="POINTSTACK / ACCOUNT" title="Messages" description="Private, direct conversations between PointStack members." actions={people.length ? <form className="new-conversation" onSubmit={startConversation}><select aria-label="Start a conversation with" value={targetId} onChange={(event) => setTargetId(event.target.value)}><option value="">New conversation…</option>{people.map((person) => <option value={person.id} key={person.id}>{person.display_name ?? person.username ?? "PointStack member"}{person.headline ? ` — ${person.headline}` : ""}</option>)}</select><button className="button primary" type="submit" disabled={!targetId || busy}>Start</button></form> : undefined} />
      {loadFailed ? <EmptyState label="TEMPORARILY UNAVAILABLE">Messages could not be loaded. Refresh this page to try again.</EmptyState> : initialConversations.length ? <div className="message-layout">
        <aside className="conversation-list">{initialConversations.map((conversation) => <button className={activeId === conversation.id ? "active" : ""} type="button" key={conversation.id} onClick={() => openConversation(conversation.id)}><strong>{participantName(conversation)}</strong><small>{formatActivityDate(conversation.updated_at)}</small></button>)}</aside>
        <section className="message-thread">
          {!activeId ? <EmptyState label="SELECT A CONVERSATION">Choose an existing thread to read or reply.</EmptyState> : <>
            <header><strong>{active ? participantName(active) : "Conversation"}</strong><small>Only participants can read or reply to this thread.</small></header>
            <div className="message-scroll">{messages.map((message) => <article className={message.sender_id === userId ? "mine" : ""} key={message.id}><strong>{message.sender?.display_name ?? (message.sender_id === userId ? "You" : "Member")}</strong><p>{message.content}</p><small>{formatActivityDate(message.created_at)}</small></article>)}</div>
            <form onSubmit={sendMessage}><input aria-label="Message" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write a reply…" maxLength={5000} /><button className="button primary" type="submit" disabled={busy || !draft.trim()}><PaperPlaneTilt size={15} /> Send</button></form>
          </>}
          {busy && <p className="form-status">Loading…</p>}
          {error && <p className="form-status error" role="alert">{error}</p>}
        </section>
      </div> : <EmptyState label="NO CONVERSATIONS">{people.length ? "Choose a member above to start your first conversation." : "More PointStack members will appear here as the network grows."}</EmptyState>}
    </>
  );
}
