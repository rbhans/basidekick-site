import { cn } from "@/lib/utils";

interface SiteBadgeProps {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

/**
 * Small mono label chip. Retrofit from the old pill-shaped eyebrow per
 * spec §5.3 — kept alive for legacy pages that still use SiteBadge. New
 * pages should use the title block strip pattern from spec §3.5 instead.
 */
export function SiteBadge({ label, icon: Icon, className }: SiteBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[1.4px] text-muted-foreground",
        className,
      )}
    >
      {Icon && <Icon className="w-3 h-3 text-accent" />}
      <span className="text-accent">—</span>
      <span>{label}</span>
    </span>
  );
}
