import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { ROUTES } from "@/lib/routes";
import { EndorsementTopic } from "@/lib/schemas/endorsements";
import { EndorsementTopicsAdmin } from "@/components/admin/endorsement-topics-admin";

export const dynamic = "force-dynamic";

export default async function AdminEndorsementTopicsPage() {
  const supabase = await createClient();
  if (!supabase) redirect(ROUTES.HOME);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(ROUTES.SIGNIN);

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect(ROUTES.HOME);

  const { data: topics } = await supabase
    .from("endorsement_topics")
    .select("*")
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  const { data: categories } = await supabase
    .from("wiki_categories")
    .select("id, name, slug")
    .order("name", { ascending: true });

  return (
    <EndorsementTopicsAdmin
      initialTopics={(topics ?? []) as EndorsementTopic[]}
      wikiCategories={(categories ?? []) as Array<{
        id: string;
        name: string;
        slug: string;
      }>}
    />
  );
}
