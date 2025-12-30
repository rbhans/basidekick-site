"use client";

import { useRouter } from "next/navigation";
import { SignInForm } from "@/components/auth/sign-in-form";
import { ROUTES } from "@/lib/routes";

export default function SignInPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push(ROUTES.HOME);
  };

  return <SignInForm onSuccess={handleSuccess} />;
}
