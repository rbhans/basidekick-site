import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Only allow same-origin path redirects, never protocol-relative or backslash targets.
function safeNext(target: string | null): string {
  if (target && /^\/(?!\/|\\)/.test(target)) return target;
  return "/";
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  const next = safeNext(requestUrl.searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(new URL("/signin?error=missing_code", origin));
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.redirect(new URL("/signin?error=auth_unavailable", origin));
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/signin?error=auth_failed", origin));
  }

  return NextResponse.redirect(new URL(next, origin));
}
