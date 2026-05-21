import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ROUTES } from "@/lib/routes";

export const dynamic = "force-dynamic";

export default async function ProfileShimPage() {
  const supabase = await createClient();
  if (!supabase) redirect(ROUTES.SIGNIN);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(ROUTES.SIGNIN);

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  if (!profile?.display_name) {
    // No display name yet — send to settings to set one
    redirect(ROUTES.ACCOUNT);
  }

  redirect(ROUTES.POINTSTACK_PROFILE(profile.display_name));
}
