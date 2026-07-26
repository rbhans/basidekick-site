import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Landing } from "@/components/landing";
import { createServerReadClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: { absolute: "BASidekick — Building automation workspace" },
  description: "The public workspace for BAS knowledge, engineering tools, industry signal, and PointStack Social.",
  alternates: { canonical: "https://basidekick.com" },
};

export const dynamic = "force-dynamic";

export default async function Home() {
  const client = await createServerReadClient();
  try {
    const { data } = client ? await client.auth.getUser() : { data: { user: null } };
    if (data.user) redirect("/dashboard");
  } catch {
    // Public landing remains available during a transient auth outage.
  }
  return <Landing />;
}
