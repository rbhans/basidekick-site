import type { Metadata } from "next";
import { SignInForm } from "@/components/sign-in-form";

export const metadata: Metadata = { title: "Create account", robots: { index: false, follow: false } };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ redirect?: string }> }) {
  const { redirect } = await searchParams;
  const redirectTo = redirect?.startsWith("/") && !redirect.startsWith("//") ? redirect : undefined;
  return <SignInForm initialMode="signup" redirectTo={redirectTo} />;
}
