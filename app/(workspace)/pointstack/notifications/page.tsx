import { redirect } from "next/navigation";
import { NotificationsPanel } from "@/components/account-activity";
import { fetchNotifications } from "@/lib/pointstack-api";
import { createServerReadClient } from "@/lib/supabase/server";
import type { PointStackNotification } from "@/lib/types";
export const dynamic = "force-dynamic";
export default async function NotificationsPage() {
  const client = await createServerReadClient();
  const { data } = client ? await client.auth.getUser() : { data: { user: null } };
  if (!data.user) redirect("/signin?redirect=/pointstack/notifications");
  let notifications: PointStackNotification[] = [];
  let loadFailed = false;
  try {
    notifications = await fetchNotifications(client, data.user.id);
  } catch {
    loadFailed = true;
  }
  return <NotificationsPanel initialNotifications={notifications} loadFailed={loadFailed} />;
}
