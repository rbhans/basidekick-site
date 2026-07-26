"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BrandMark } from "@/components/brand-mark";
import { createClient } from "@/lib/supabase/client";

function AuthFrame({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="auth-page">
      <section className="auth-panel">
        <Link className="brand-lockup" href="/"><BrandMark /><strong>BASidekick</strong></Link>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
        {children}
        <Link className="back-link" href="/signin">← Back to sign in</Link>
      </section>
      <aside className="auth-aside">
        <span className="eyebrow">ACCOUNT SECURITY</span>
        <div><b>01</b><strong>Private by default</strong><p>Reset links are time-limited and tied to your Supabase account.</p></div>
        <div><b>02</b><strong>One workspace</strong><p>Your profile, progress, saves, and contributions remain connected.</p></div>
      </aside>
    </div>
  );
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const client = createClient();
    if (!client || busy) return;
    setBusy(true);
    setStatus("");
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    setStatus(error ? error.message : "Check your email for a password reset link.");
    setBusy(false);
  }

  return (
    <AuthFrame eyebrow="ACCOUNT / RECOVERY" title="Reset your password." description="Enter the email attached to your BASidekick account.">
      <form onSubmit={submit}>
        <label><span>Email</span><input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
        <button className="button primary large" type="submit" disabled={busy}>{busy ? "Sending…" : "Send reset link"}</button>
      </form>
      {status && <p className="auth-status" role="status">{status}</p>}
    </AuthFrame>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (password !== confirmation) {
      setStatus("Passwords do not match.");
      return;
    }
    const client = createClient();
    if (!client || busy) return;
    setBusy(true);
    const { error } = await client.auth.updateUser({ password });
    if (error) {
      setStatus(error.message);
      setBusy(false);
      return;
    }
    setStatus("Password updated. Returning to your account…");
    router.replace("/account");
    router.refresh();
  }

  return (
    <AuthFrame eyebrow="ACCOUNT / NEW PASSWORD" title="Choose a new password." description="Use at least eight characters and avoid reusing a password from another service.">
      <form onSubmit={submit}>
        <label><span>New password</span><input type="password" autoComplete="new-password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
        <label><span>Confirm password</span><input type="password" autoComplete="new-password" minLength={8} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required /></label>
        <button className="button primary large" type="submit" disabled={busy}>{busy ? "Updating…" : "Update password"}</button>
      </form>
      {status && <p className="auth-status" role="status">{status}</p>}
    </AuthFrame>
  );
}
