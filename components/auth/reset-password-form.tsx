"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getClient } from "@/lib/supabase/client";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { useRouter } from "next/navigation";

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const supabase = getClient();
  const router = useRouter();

  useEffect(() => {
    // Check if user has a valid recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsValidSession(!!session);
    };
    checkSession();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      // Redirect to sign in after 3 seconds
      setTimeout(() => {
        router.push(ROUTES.SIGNIN);
      }, 3000);
    }
    setLoading(false);
  };

  // Still checking session
  if (isValidSession === null) {
    return (
      <div className="p-8 max-w-sm mx-auto">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // No valid session - invalid or expired link
  if (!isValidSession) {
    return (
      <div className="p-8 max-w-sm mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Invalid or Expired Link</h1>
        <p className="text-muted-foreground mb-6">
          This password reset link is invalid or has expired. Please request a new one.
        </p>
        <Link href={ROUTES.FORGOT_PASSWORD}>
          <Button className="w-full">Request New Link</Button>
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="p-8 max-w-sm mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Password Updated</h1>
        <p className="text-muted-foreground mb-6">
          Your password has been successfully updated. Redirecting to sign in...
        </p>
        <Link href={ROUTES.SIGNIN}>
          <Button className="w-full">Sign In Now</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-sm mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Reset Password</h1>
      <p className="text-muted-foreground mb-6">
        Enter your new password below.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            className="mt-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            minLength={8}
            pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$"
            title="Password must be at least 8 characters with lowercase, uppercase, number, and symbol"
            required
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            Min 8 characters with uppercase, lowercase, number, and symbol
          </p>
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            className="mt-2"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            minLength={8}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </div>
  );
}
