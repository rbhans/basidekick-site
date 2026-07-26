import type { Metadata } from "next";
import { SignInForm } from "@/components/sign-in-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ redirect?: string }> }) {
  const { redirect } = await searchParams;
  const redirectTo = redirect?.startsWith("/") && !redirect.startsWith("//") ? redirect : undefined;
  return <SignInForm redirectTo={redirectTo} />;
}
