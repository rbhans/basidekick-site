import { redirect } from "next/navigation";
import { WikiContributionForm } from "@/components/contribution-forms";
import { createServerReadClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function WikiContributionPage() {
  const client = await createServerReadClient();
  const { data } = client ? await client.auth.getUser() : { data: { user: null } };
  if (!data.user) redirect("/signin?redirect=/wiki/contribute");
  return <WikiContributionForm userId={data.user.id} />;
}
