"use client";

import { useRouter } from "next/navigation";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { ROUTES } from "@/lib/routes";

export default function SignUpPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push(ROUTES.HOME);
  };

  return <SignUpForm onSuccess={handleSuccess} />;
}
