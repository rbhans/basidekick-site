import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient as SupabaseJsClient } from "@supabase/supabase-js";

export type SupabaseClient = SupabaseJsClient;
let browserClient: SupabaseClient | null = null;

function config() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? { url, key } : null;
}

export function createClient(): SupabaseClient | null {
  const current = config();
  if (!current) return null;
  browserClient ??= createBrowserClient(current.url, current.key) as SupabaseClient;
  return browserClient;
}
