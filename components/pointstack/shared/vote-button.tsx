"use client";

import { useState } from "react";
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
  const [animating, setAnimating] = useState<"up" | "down" | null>(null);

  const handleVote = (type: 1 | -1) => {
    setAnimating(type === 1 ? "up" : "down");
    onVote(type);
    setTimeout(() => setAnimating(null), 300);
  };

  return (
    <div
      className={cn(
        "flex items-center gap-0.5",
        vertical && "flex-col"
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          buttonSize,
          "transition-all duration-200",
          userVote === 1 && "text-primary bg-secondary hover:bg-secondary",
          animating === "up" && "scale-125"
        )}
        onClick={() => handleVote(1)}
        disabled={disabled}
        aria-label="Upvote"
      >
        <ArrowUp className={iconSize} weight={userVote === 1 ? "fill" : "regular"} />
      </Button>
      <span
        className={cn(
          "font-medium tabular-nums min-w-[1.5rem] text-center",
          size === "sm" ? "text-xs" : "text-sm",
          count > 0 && "text-primary",
          count < 0 && "text-destructive",
          animating && "scale-110 transition-transform duration-200"
        )}
      >
        {count}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          buttonSize,
          "transition-all duration-200",
          userVote === -1 && "text-destructive bg-destructive/10 hover:bg-destructive/20",
          animating === "down" && "scale-125"
        )}
        onClick={() => handleVote(-1)}
        disabled={disabled}
        aria-label="Downvote"
      >
        <ArrowDown className={iconSize} weight={userVote === -1 ? "fill" : "regular"} />
      </Button>
    </div>
  );
}
