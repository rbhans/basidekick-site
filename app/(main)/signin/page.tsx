import type { Metadata } from "next";
import { SignInClient } from "@/components/auth/sign-in-client";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your BASidekick account.",
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return <SignInClient />;
}
