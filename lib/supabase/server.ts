import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export type ServerSupabaseClient = ReturnType<typeof createServerClient>;

/**
 * Creates a Supabase server client for use in Server Components and Route Handlers.
 * Returns null if credentials aren't configured.
 */
export async function createClient(): Promise<ServerSupabaseClient | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return null when credentials aren't set
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch (error) {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
          // Log in development for debugging
          if (process.env.NODE_ENV === "development") {
            console.debug("[Supabase] setAll called from Server Component:", error);
          }
        }
      },
    },
  });
}

/**
 * Returns the Supabase server client or throws if not configured.
 * Use this in routes/components where Supabase is required.
 */
export async function getClient(): Promise<ServerSupabaseClient> {
  const client = await createClient();
  if (!client) {
    throw new Error(
      "Supabase server client not configured. " +
      "Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set."
    );
  }
  return client;
}
