"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from "@/lib/schemas/auth";

const defaultValues: ResetPasswordValues = {
  password: "",
  confirmPassword: "",
};

export function ResetPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const router = useRouter();

  const supabase = useMemo(() => createClient(), []);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues,
  });

  useEffect(() => {
    const checkSession = async () => {
      if (!supabase) {
        setIsValidSession(false);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsValidSession(Boolean(session));
    };

    checkSession();
  }, [supabase]);

  const onSubmit = async (values: ResetPasswordValues) => {
    setError(null);

    if (!supabase) {
      setError("Unable to connect to authentication service");
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: values.password,
    });

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      router.push(ROUTES.SIGNIN);
    }, 3000);
  };

  if (isValidSession === null) {
    return (
      <div className="mx-auto max-w-sm p-8">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="mx-auto max-w-sm p-8">
        <h1 className="mb-4 text-2xl font-semibold">Invalid or Expired Link</h1>
        <p className="mb-6 text-muted-foreground">
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
      <div className="mx-auto max-w-sm p-8">
        <h1 className="mb-4 text-2xl font-semibold">Password Updated</h1>
        <p className="mb-6 text-muted-foreground">
          Your password has been successfully updated. Redirecting to sign in...
        </p>
        <Link href={ROUTES.SIGNIN}>
          <Button className="w-full">Sign In Now</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm p-8">
      <h1 className="mb-4 text-2xl font-semibold">Reset Password</h1>
      <p className="mb-6 text-muted-foreground">Enter your new password below.</p>

      {error && (
        <div className="mb-4 border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="mt-2"
                    disabled={form.formState.isSubmitting}
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
                    disabled={form.formState.isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
