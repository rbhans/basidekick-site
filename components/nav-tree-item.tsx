"use client";

import { ReactNode } from "react";
import { CaretRight, CaretDown } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface NavTreeItemProps {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: {
    text: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  };
  active?: boolean;
  expanded?: boolean;
  hasChildren?: boolean;
  depth?: number;
  onClick?: () => void;
  onToggle?: () => void;
}

export function NavTreeItem({
  label,
  icon,
  badge,
  active = false,
  expanded = false,
  hasChildren = false,
  depth = 0,
  onClick,
  onToggle,
}: NavTreeItemProps) {
  // Clicking name/icon navigates only
  const handleClick = () => {
    onClick?.();
  };

  // Arrow click toggles expand/collapse only
  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle?.();
  };

  return (
    <div
      className={cn(
        "w-full flex items-center gap-2 px-2 py-1.5 text-left text-sm font-mono transition-colors",
        "hover:bg-muted/50",
        active && "bg-primary/10 text-primary",
        !active && "text-muted-foreground hover:text-foreground"
      )}
      style={{ paddingLeft: `${8 + depth * 16}px` }}
    >
      {/* Expand/Collapse toggle - separate button */}
      {hasChildren ? (
        <button
          type="button"
          onClick={handleToggleClick}
          className="flex items-center justify-center w-5 h-5 hover:bg-muted rounded -ml-1"
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          {expanded ? (
            <CaretDown className="w-3 h-3" weight="bold" />
          ) : (
            <CaretRight className="w-3 h-3" weight="bold" />
          )}
        </button>
      ) : (
        <span className="w-4" />
      )}

      {/* Clickable area for navigation */}
      <button
        type="button"
        onClick={handleClick}
        className="flex items-center gap-2 flex-grow min-w-0"
      >
        {/* Icon */}
        {icon && (
          <span className={cn("flex-shrink-0", active ? "text-primary" : "text-muted-foreground")}>
            {icon}
          </span>
        )}

        {/* Label */}
        <span className="flex-grow truncate text-left">{label}</span>
      </button>

      {/* Badge */}
      {badge && (
        <Badge
          variant={badge.variant}
          className={cn(
            "ml-auto text-[10px] px-1.5 py-0 h-4 font-normal flex-shrink-0",
            badge.text === "Ready" && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
            badge.text === "Dev" && "bg-amber-500/10 text-amber-500 border-amber-500/20"
          )}
        >
          {badge.text}
        </Badge>
      )}
    </div>
  );
}
