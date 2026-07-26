import { redirect } from "next/navigation";
import { MessagesPanel } from "@/components/account-activity";
import { fetchConversations } from "@/lib/pointstack-api";
import { createServerReadClient } from "@/lib/supabase/server";
import type { PointStackConversation } from "@/lib/types";
export const dynamic = "force-dynamic";
export default async function MessagesPage() {
  const client = await createServerReadClient();
  const { data } = client ? await client.auth.getUser() : { data: { user: null } };
  if (!data.user) redirect("/signin?redirect=/pointstack/messages");
  let conversations: PointStackConversation[] = [];
  let loadFailed = false;
  try {
    conversations = await fetchConversations(client, data.user.id);
  } catch {
    loadFailed = true;
  }
  const { data: people, error: peopleError } = await client!
    .from("profiles")
    .select("id, display_name, username, headline")
    .neq("id", data.user.id)
    .order("display_name")
    .limit(100);
  return (
    <MessagesPanel
      userId={data.user.id}
      initialConversations={conversations}
      people={people ?? []}
      loadFailed={loadFailed || Boolean(peopleError)}
    />
  );
}
