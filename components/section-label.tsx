interface SectionLabelProps {
  children: React.ReactNode;
}

export function SectionLabel({ children }: SectionLabelProps) {
  return (
    <span className="inline-block font-mono text-xs uppercase tracking-wider text-muted-foreground border border-border px-3 py-1">
      [ {children} ]
    </span>
  );
}
