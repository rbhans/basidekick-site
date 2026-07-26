import { NextResponse, type NextRequest } from "next/server";
import { createServerReadClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const requested = url.searchParams.get("next") || "/dashboard";
  const next = requested.startsWith("/") && !requested.startsWith("//") ? requested : "/dashboard";
  if (code) {
    const client = await createServerReadClient();
    try { await client?.auth.exchangeCodeForSession(code); } catch { return NextResponse.redirect(new URL("/signin?error=callback", url.origin)); }
  }
  return NextResponse.redirect(new URL(next, url.origin));
}
