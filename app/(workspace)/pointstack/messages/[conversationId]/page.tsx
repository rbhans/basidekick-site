import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MessagesPanel } from "@/components/account-activity";
import { fetchConversations, fetchMessages } from "@/lib/pointstack-api";
import { createServerReadClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Conversation", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function ConversationPage({ params }: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = await params;
  const client = await createServerReadClient();
  const { data } = client ? await client.auth.getUser() : { data: { user: null } };
  if (!data.user) redirect(`/signin?redirect=${encodeURIComponent(`/pointstack/messages/${conversationId}`)}`);
  const [conversations, messages, peopleResult] = await Promise.all([
    fetchConversations(client, data.user.id).catch(() => []),
    fetchMessages(client, conversationId).catch(() => []),
    client!.from("profiles").select("id, display_name, username, headline").neq("id", data.user.id).order("display_name").limit(100),
  ]);
  if (!conversations.some((conversation) => conversation.id === conversationId)) redirect("/pointstack/messages");
  return <MessagesPanel userId={data.user.id} initialConversations={conversations} people={peopleResult.data ?? []} initialConversationId={conversationId} initialMessages={messages} />;
}
