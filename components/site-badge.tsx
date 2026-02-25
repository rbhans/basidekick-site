import { cn } from "@/lib/utils";

interface SiteBadgeProps {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export function SiteBadge({ label, icon: Icon, className }: SiteBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary bg-transparent",
        className
      )}
    >
      {Icon && <Icon className="w-4 h-4 text-primary" />}
      <span className="font-mono text-[12px] font-bold text-primary tracking-[2px] uppercase">
        {label}
      </span>
    </span>
  );
}
