import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Check, ArrowLeft } from "@phosphor-icons/react/dist/ssr";

const proFeatures = [
  "Cloud storage for your projects",
  "Graphics library access",
  "Priority support",
  "20% off all tool upgrades",
];

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Logo size="lg" />
        </div>

        <div className="p-6 rounded-lg border border-border bg-card">
          <h1 className="text-xl font-semibold text-center mb-2">
            Sign Up for Pro
          </h1>
          <p className="text-center text-2xl font-mono mb-6">
            $5<span className="text-sm text-muted-foreground">/month</span>
          </p>

          <ul className="space-y-3 mb-6">
            {proFeatures.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm">
                <div className="size-5 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check className="size-3 text-primary" weight="bold" />
                </div>
                {feature}
              </li>
            ))}
          </ul>

          <form className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="••••••••"
              />
            </div>

            <Button type="submit" className="w-full">
              Start Pro Trial
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
