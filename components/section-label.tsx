import { cn } from "@/lib/utils";

type SectionVariant = "default" | "tools" | "wiki" | "pointstack" | "resources" | "atlas";

interface SectionLabelProps {
  children: React.ReactNode;
  variant?: SectionVariant;
}

const variantStyles: Record<SectionVariant, string> = {
  default: "text-primary border-primary/30",
  tools: "text-cyan-500 border-cyan-500/30 dark:text-cyan-400 dark:border-cyan-400/30",
  wiki: "text-blue-500 border-blue-500/30 dark:text-blue-400 dark:border-blue-400/30",
  pointstack: "text-emerald-500 border-emerald-500/30 dark:text-emerald-400 dark:border-emerald-400/30",
  resources: "text-violet-500 border-violet-500/30 dark:text-violet-400 dark:border-violet-400/30",
  atlas: "text-amber-500 border-amber-500/30 dark:text-amber-400 dark:border-amber-400/30",
};

export function SectionLabel({ children, variant = "default" }: SectionLabelProps) {
  return (
    <span
      className={cn(
        "inline-block font-mono text-xs uppercase tracking-wider px-3 py-1 border",
        variantStyles[variant]
      )}
    >
      [ {children} ]
    </span>
  );
}
