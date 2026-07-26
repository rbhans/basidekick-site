import { redirect } from "next/navigation";
import { PointStackJobForm } from "@/components/contribution-forms";
import { createServerReadClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function NewJobPage() {
  const client = await createServerReadClient();
  const { data } = client ? await client.auth.getUser() : { data: { user: null } };
  if (!data.user) redirect("/signin?redirect=/pointstack/jobs/new");
  return <PointStackJobForm userId={data.user.id} />;
}
