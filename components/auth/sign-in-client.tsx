"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SignInForm } from "@/components/auth/sign-in-form";
import { ROUTES } from "@/lib/routes";

// Only allow same-origin path redirects (starts with a single "/"), never
// protocol-relative ("//host") or backslash-tricked targets.
function safeRedirect(target: string | null): string {
  if (target && /^\/(?!\/|\\)/.test(target)) return target;
  return ROUTES.HOME;
}

function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = safeRedirect(searchParams.get("redirect"));

  return (
    <SignInForm
      onSuccess={() => router.push(redirectPath)}
      redirectPath={redirectPath}
    />
  );
}

export function SignInClient() {
  return (
    <Suspense fallback={null}>
      <SignIn />
    </Suspense>
  );
}
