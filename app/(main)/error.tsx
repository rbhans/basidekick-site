"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Warning, ArrowCounterClockwise } from "@phosphor-icons/react";

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service in production
    console.error("Main section error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-6">
          <Warning className="w-8 h-8 text-destructive" weight="fill" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-6">
          An error occurred while loading this page. This has been logged and we&apos;ll look into it.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground mb-4 font-mono">
            Error ID: {error.digest}
          </p>
        )}
        <Button onClick={reset} variant="outline" className="gap-2">
          <ArrowCounterClockwise className="w-4 h-4" />
          Try again
        </Button>
      </div>
    </div>
  );
}
