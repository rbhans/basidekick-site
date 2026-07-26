import { redirect } from "next/navigation";
import { PointStackPostForm } from "@/components/contribution-forms";
import { createServerReadClient } from "@/lib/supabase/server";
import type { PointStackPostType } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function NewPointStackPostPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const client = await createServerReadClient();
  const { data } = client ? await client.auth.getUser() : { data: { user: null } };
  if (!data.user) redirect("/signin?redirect=/pointstack/new");
  const requested = (await searchParams).type;
  const initialType: PointStackPostType = requested === "question" || requested === "project" || requested === "tip" ? requested : "discussion";
  return <PointStackPostForm userId={data.user.id} initialType={initialType} />;
}
