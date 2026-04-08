"use client";

interface WikiCategoryBlockProps {
  name: string;
  slug: string;
  /** Legacy prop — unused in the new design (§1.4 eliminates category colors) */
  color?: string;
  count?: number;
  onClick: () => void;
}

/**
 * Derive a single-letter glyph for the category (per spec §1.4).
 */
function categoryGlyph(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "·";
  return trimmed[0].toUpperCase();
}

export function WikiCategoryBlock({ name, count, onClick }: WikiCategoryBlockProps) {
  return (
    <button
      onClick={onClick}
      className="group flex items-start gap-3 p-4 border border-border bg-card hover:border-foreground rounded-md transition-colors text-left"
    >
      <div className="w-8 h-8 bg-muted rounded-sm flex items-center justify-center shrink-0 font-mono text-[14px] font-bold text-foreground group-hover:text-accent transition-colors">
        {categoryGlyph(name)}
      </div>
      <div className="min-w-0 flex-1">
        <span className="block font-heading font-semibold text-[15px] leading-[1.2] text-foreground group-hover:text-accent transition-colors">
          {name}
        </span>
        {count != null && (
          <span className="block font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground mt-0.5 tabular-nums">
            {count} {count === 1 ? "article" : "articles"}
          </span>
        )}
      </div>
    </button>
  );
}
