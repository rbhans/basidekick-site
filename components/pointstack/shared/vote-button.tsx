"use client";

import { ArrowUp, ArrowDown } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VoteButtonProps {
  count: number;
  userVote: number | null | undefined;
  onVote: (voteType: 1 | -1) => void;
  disabled?: boolean;
  size?: "sm" | "md";
  vertical?: boolean;
}

export function VoteButton({
  count,
  userVote,
  onVote,
  disabled = false,
  size = "md",
  vertical = false,
}: VoteButtonProps) {
  const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  const buttonSize = size === "sm" ? "h-6 w-6" : "h-8 w-8";

  return (
    <div
      className={cn(
        "flex items-center gap-1",
        vertical && "flex-col"
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          buttonSize,
          userVote === 1 && "text-primary bg-primary/10 hover:bg-primary/20"
        )}
        onClick={() => onVote(1)}
        disabled={disabled}
        aria-label="Upvote"
      >
        <ArrowUp className={iconSize} weight={userVote === 1 ? "fill" : "regular"} />
      </Button>
      <span
        className={cn(
          "font-medium tabular-nums",
          size === "sm" ? "text-xs" : "text-sm",
          count > 0 && "text-primary",
          count < 0 && "text-destructive"
        )}
      >
        {count}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          buttonSize,
          userVote === -1 && "text-destructive bg-destructive/10 hover:bg-destructive/20"
        )}
        onClick={() => onVote(-1)}
        disabled={disabled}
        aria-label="Downvote"
      >
        <ArrowDown className={iconSize} weight={userVote === -1 ? "fill" : "regular"} />
      </Button>
    </div>
  );
}
