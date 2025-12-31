"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Warning, ArrowCounterClockwise, Chats } from "@phosphor-icons/react";
import Link from "next/link";

export default function ForumError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Forum error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-6">
          <Warning className="w-8 h-8 text-destructive" weight="fill" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Forum Error</h2>
        <p className="text-muted-foreground mb-6">
          We couldn&apos;t load this forum content. The thread may have been moved or deleted.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} variant="outline" className="gap-2">
            <ArrowCounterClockwise className="w-4 h-4" />
            Try again
          </Button>
          <Button asChild variant="default" className="gap-2">
            <Link href="/forum">
              <Chats className="w-4 h-4" />
              Browse Forum
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
