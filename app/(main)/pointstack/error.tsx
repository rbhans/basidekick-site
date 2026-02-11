"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Warning, ArrowCounterClockwise, ArrowLeft } from "@phosphor-icons/react";
import Link from "next/link";

export default function PointStackError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("PointStack error:", error);
  }, [error]);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-destructive/10">
          <Warning className="w-7 h-7 text-destructive" weight="fill" />
        </div>
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          There was a problem loading this page. This is usually temporary.
        </p>
        <div className="flex items-center gap-3 mt-2">
          <Button onClick={reset} variant="outline" size="sm" className="gap-2">
            <ArrowCounterClockwise className="w-4 h-4" />
            Try again
          </Button>
          <Button asChild variant="ghost" size="sm" className="gap-2">
            <Link href="/pointstack">
              <ArrowLeft className="w-4 h-4" />
              Back to Feed
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
