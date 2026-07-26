import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient as SupabaseJsClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export type SupabaseClient = SupabaseJsClient;

function config() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? { url, key } : null;
}

export async function createServerReadClient(): Promise<SupabaseClient | null> {
  const current = config();
  if (!current) return null;
  const cookieStore = await cookies();
  return createServerClient(current.url, current.key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(values) {
        try {
          values.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server component reads cannot always mutate response cookies.
        }
      },
    },
  }) as SupabaseClient;
}
