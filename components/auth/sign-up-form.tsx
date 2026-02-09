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
import { signUpSchema, type SignUpValues } from "@/lib/schemas/auth";

interface SignUpFormProps {
  onSuccess?: () => void;
}

const defaultValues: SignUpValues = {
  email: "",
  password: "",
  confirmPassword: "",
};

export function SignUpForm({ onSuccess }: SignUpFormProps) {
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues,
  });

  const onSubmit = async (values: SignUpValues) => {
    setError(null);
    setMessage(null);

    if (!supabase) {
      setError("Unable to connect to authentication service");
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    setMessage("Check your email for the confirmation link!");
    onSuccess?.();
  };

  const handleGoogleSignUp = async () => {
    setOauthLoading(true);
    setError(null);
    setMessage(null);

    if (!supabase) {
      setError("Unable to connect to authentication service");
      setOauthLoading(false);
      return;
    }

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      setOauthLoading(false);
    }
  };

  const isBusy = form.formState.isSubmitting || oauthLoading;

  return (
    <div className="mx-auto max-w-sm p-8">
      <h1 className="mb-4 text-2xl font-semibold">Sign Up</h1>
      <p className="mb-6 text-muted-foreground">
        Create an account for wiki editing, PointStack access, and project management.
      </p>

      {error && (
        <div className="mb-4 border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {message && (
        <div className="mb-4 border border-primary/20 bg-primary/10 p-3 text-sm text-primary">
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
                <FormLabel>Password</FormLabel>
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
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Min 8 characters with uppercase, lowercase, number, and symbol
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    id="confirmPassword"
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
            {form.formState.isSubmitting ? "Creating account..." : "Create Account"}
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
        onClick={handleGoogleSignUp}
        disabled={isBusy}
      >
        <GoogleLogo className="mr-2 size-4" weight="bold" />
        Google
      </Button>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href={ROUTES.SIGNIN} className="text-primary underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
