"use client";

import { ReactNode } from "react";
import { CaretRight } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { NavColorVariant } from "@/lib/types";

// Color classes for each variant
const colorVariantClasses: Record<NavColorVariant, { icon: string; active: string }> = {
  default: {
    icon: "text-primary",
    active: "bg-primary/10 text-primary",
  },
  tools: {
    icon: "text-cyan-500 dark:text-cyan-400",
    active: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  },
  resources: {
    icon: "text-violet-500 dark:text-violet-400",
    active: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  wiki: {
    icon: "text-blue-500 dark:text-blue-400",
    active: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  forum: {
    icon: "text-emerald-500 dark:text-emerald-400",
    active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
};

export interface NavTreeItemProps {
  id: string;
  label: string;
  icon?: ReactNode;
  colorVariant?: NavColorVariant;
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
  colorVariant = "default",
  badge,
  active = false,
  expanded = false,
  hasChildren = false,
  depth = 0,
  onClick,
  onToggle,
}: NavTreeItemProps) {
  const colors = colorVariantClasses[colorVariant];
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
        active && colors.active,
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
          <CaretRight
            className={cn(
              "w-3 h-3 transition-transform duration-150 motion-reduce:transition-none",
              expanded && "rotate-90"
            )}
            weight="bold"
          />
        </button>
      ) : (
        <span className="w-4" />
      )}

      {/* Clickable area for navigation */}
      <button
        type="button"
        onClick={handleClick}
        className="group flex items-center gap-2 flex-grow min-w-0"
      >
        {/* Icon */}
        {icon && (
          <span className={cn(
            "flex-shrink-0 transition-all duration-150 motion-reduce:transition-none",
            "group-hover:scale-110 motion-reduce:group-hover:scale-100",
            active && "scale-110 motion-reduce:scale-100",
            colors.icon
          )}>
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
