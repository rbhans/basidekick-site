"use client";

import { useState } from "react";
import { EnvelopeSimple, PaperPlaneTilt, SpinnerGap } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface NewsletterSignupProps {
  variant?: "default" | "compact";
  className?: string;
}

export function NewsletterSignup({ variant = "default", className }: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");

    try {
      // Simulate API call - replace with actual newsletter signup
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For now, just show success (implement actual signup later)
      setEmail("");
      toast.success("Thanks for subscribing!");
    } catch (error) {
      console.error("Newsletter signup failed:", error);
      toast.error("Unable to subscribe right now. Please try again.");
    } finally {
      setStatus("idle");
    }
  };

  if (variant === "compact") {
    return (
      <form onSubmit={handleSubmit} className={className}>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <EnvelopeSimple className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9"
              disabled={status === "loading"}
              required
            />
          </div>
          <Button type="submit" disabled={status === "loading"}>
            {status === "loading" ? (
              <SpinnerGap className="size-4 animate-spin" />
            ) : (
              <PaperPlaneTilt className="size-4" />
            )}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-2">
        <EnvelopeSimple className="size-5 text-primary" />
        <h3 className="font-semibold">Stay Updated</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Get notified when new tools launch and receive BAS tips & tricks.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
            disabled={status === "loading"}
            required
          />
          <Button type="submit" disabled={status === "loading"}>
            {status === "loading" ? (
              <>
                <SpinnerGap className="size-4 animate-spin mr-2" />
                Subscribing...
              </>
            ) : (
              <>
                Subscribe
                <PaperPlaneTilt className="size-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </form>
      <p className="text-xs text-muted-foreground mt-3">
        No spam, unsubscribe anytime.
      </p>
    </div>
  );
}
