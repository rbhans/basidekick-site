"use client";

import { useState } from "react";
import { EnvelopeSimple, PaperPlaneTilt, Check, SpinnerGap } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NewsletterSignupProps {
  variant?: "default" | "compact";
  className?: string;
}

export function NewsletterSignup({ variant = "default", className }: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");

    // Simulate API call - replace with actual newsletter signup
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // For now, just show success (implement actual signup later)
    setStatus("success");
    setMessage("Thanks for subscribing!");
    setEmail("");

    // Reset after 3 seconds
    setTimeout(() => {
      setStatus("idle");
      setMessage("");
    }, 3000);
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
              disabled={status === "loading" || status === "success"}
              required
            />
          </div>
          <Button type="submit" disabled={status === "loading" || status === "success"}>
            {status === "loading" ? (
              <SpinnerGap className="size-4 animate-spin" />
            ) : status === "success" ? (
              <Check className="size-4" />
            ) : (
              <PaperPlaneTilt className="size-4" />
            )}
          </Button>
        </div>
        {message && (
          <p className={`text-xs mt-2 ${status === "success" ? "text-emerald-500" : "text-destructive"}`}>
            {message}
          </p>
        )}
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
            disabled={status === "loading" || status === "success"}
            required
          />
          <Button type="submit" disabled={status === "loading" || status === "success"}>
            {status === "loading" ? (
              <>
                <SpinnerGap className="size-4 animate-spin mr-2" />
                Subscribing...
              </>
            ) : status === "success" ? (
              <>
                <Check className="size-4 mr-2" />
                Subscribed!
              </>
            ) : (
              <>
                Subscribe
                <PaperPlaneTilt className="size-4 ml-2" />
              </>
            )}
          </Button>
        </div>
        {message && (
          <p className={`text-sm mt-2 ${status === "success" ? "text-emerald-500" : "text-destructive"}`}>
            {message}
          </p>
        )}
      </form>
      <p className="text-xs text-muted-foreground mt-3">
        No spam, unsubscribe anytime.
      </p>
    </div>
  );
}
