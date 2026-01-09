import { createBrowserClient } from "@supabase/ssr";

export type SupabaseClient = ReturnType<typeof createBrowserClient>;

// Singleton client instance to prevent multiple clients competing for auth state
let supabaseInstance: SupabaseClient | null = null;

/**
 * Creates or returns the singleton Supabase browser client.
 * Returns null if credentials aren't configured (e.g., build time).
 * Callers should handle the null case appropriately.
 */
export function createClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return null for build time or when credentials aren't set
    // Callers must handle this case
    return null;
  }

  // Return existing instance if available (singleton pattern)
  if (supabaseInstance) {
    return supabaseInstance;
  }

  supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
}

/**
 * Returns the Supabase client or throws if not configured.
 * Use this in components where Supabase is required for functionality.
 */
export function getClient(): SupabaseClient {
  const client = createClient();
  if (!client) {
    throw new Error(
      "Supabase client not configured. " +
      "Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set."
    );
  }
  return client;
}
