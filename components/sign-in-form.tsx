"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BrandMark } from "@/components/brand-mark";

export function SignInForm({ initialMode = "signin", redirectTo }: { initialMode?: "signin" | "signup"; redirectTo?: string }) {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const client = createClient();

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!client) {
      setStatus("Supabase is not configured in this preview. Public browsing remains available.");
      return;
    }
    setStatus("Working…");
    const redirect = redirectTo || (mode === "signup" ? "/pointstack/onboarding" : "/dashboard");
    const result = mode === "signin"
      ? await client.auth.signInWithPassword({ email, password })
      : await client.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}`,
          },
        });
    if (result.error) setStatus(result.error.message);
    else if (mode === "signup" && !result.data.session) setStatus("Check your email to confirm your account.");
    else location.assign(redirect);
  }

  return (
    <div className="auth-page">
      <section className="auth-panel">
        <Link className="brand-lockup" href="/"><BrandMark /><strong>BASidekick</strong></Link>
        <span className="eyebrow">ACCOUNT / {mode === "signin" ? "SIGN IN" : "CREATE"}</span>
        <h1>{mode === "signin" ? "Return to the workspace." : "Join the workspace."}</h1>
        <p>Reading stays public. An account adds saving, progress, posting, voting, messaging, and profile tools.</p>
        <form onSubmit={submit}>
          <label><span>Email</span><input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <label><span>Password</span><input type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required /></label>
          <button className="button primary large" type="submit">{mode === "signin" ? "Sign in" : "Create account"}</button>
        </form>
        {status && <p className="auth-status" role="status">{status}</p>}
        {mode === "signin" && <Link className="auth-switch" href="/forgot-password">Forgot your password?</Link>}
        <button type="button" className="auth-switch" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setStatus(""); }}>{mode === "signin" ? "Need an account? Create one" : "Already have an account? Sign in"}</button>
        <Link className="back-link" href="/dashboard">← Keep browsing without an account</Link>
      </section>
      <aside className="auth-aside"><span className="eyebrow">WHY SIGN IN</span><div><b>01</b><strong>Keep your place</strong><p>Bookmarks, course progress, and recent work.</p></div><div><b>02</b><strong>Join PointStack</strong><p>Post projects and questions, comment, vote, and message.</p></div><div><b>03</b><strong>Contribute</strong><p>Submit Library resources and suggest Wiki improvements.</p></div></aside>
    </div>
  );
}
