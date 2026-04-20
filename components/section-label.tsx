import { cn } from "@/lib/utils";

type SectionVariant = "default" | "tools" | "wiki" | "pointstack" | "resources" | "atlas";

interface SectionLabelProps {
  children: React.ReactNode;
  variant?: SectionVariant;
}

export function SectionLabel({ children, variant = "default" }: SectionLabelProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-4 py-1.5 rounded-sm border border-foreground bg-muted",
        "font-mono text-[12px] font-bold text-primary tracking-[2px] uppercase"
      )}
    >
      {children}
    </span>
  );
}
