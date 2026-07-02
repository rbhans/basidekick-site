"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { GoogleLogo } from "@phosphor-icons/react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { signInSchema, type SignInValues } from "@/lib/schemas/auth";
import { friendlyAuthError } from "@/lib/auth-errors";

interface SignInFormProps {
  onSuccess?: () => void;
  /** Same-origin path to return to after OAuth sign-in. */
  redirectPath?: string;
}

const defaultValues: SignInValues = {
  email: "",
  password: "",
};

export function SignInForm({ onSuccess, redirectPath }: SignInFormProps) {
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues,
  });

  const onSubmit = async (values: SignInValues) => {
    setError(null);
    setMessage(null);

    if (!supabase) {
      setError("Unable to connect to authentication service");
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (signInError) {
      setError(friendlyAuthError(signInError.message));
      return;
    }

    setMessage("Signed in. Taking you through…");
    onSuccess?.();
  };

  const handleGoogleSignIn = async () => {
    setOauthLoading(true);
    setError(null);
    setMessage(null);

    if (!supabase) {
      setError("Unable to connect to authentication service");
      setOauthLoading(false);
      return;
    }

    const callbackUrl = new URL("/auth/callback", window.location.origin);
    if (redirectPath && redirectPath !== "/") {
      callbackUrl.searchParams.set("next", redirectPath);
    }

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl.toString(),
      },
    });

    if (oauthError) {
      setError(friendlyAuthError(oauthError.message));
      setOauthLoading(false);
    }
  };

  const isBusy = form.formState.isSubmitting || oauthLoading;

  return (
    <div className="mx-auto max-w-sm p-8">
      <div className="mb-2 font-mono text-[11px] uppercase tracking-[1.5px] text-ink-3">
        <span className="text-punch">Account</span> / Sign in
      </div>
      <h1 className="mb-6 font-heading text-2xl font-semibold">Sign in</h1>

      {error && (
        <div className="mb-4 border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {message && (
        <div className="mb-4 border border-primary/20 bg-secondary p-3 text-sm text-primary">
          {message}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="mt-2"
                    disabled={isBusy}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link
                    href={ROUTES.FORGOT_PASSWORD}
                    className="text-xs text-muted-foreground hover:text-accent"
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="mt-2"
                    disabled={isBusy}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isBusy}>
            {form.formState.isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </Form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogleSignIn}
        disabled={isBusy}
      >
        <GoogleLogo className="mr-2 size-4" weight="bold" />
        Google
      </Button>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href={ROUTES.SIGNUP} className="text-primary underline-offset-4 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
