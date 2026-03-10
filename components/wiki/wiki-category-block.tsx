"use client";

interface WikiCategoryBlockProps {
  name: string;
  slug: string;
  color: string;
  count?: number;
  onClick: () => void;
}

export function WikiCategoryBlock({ name, color, count, onClick }: WikiCategoryBlockProps) {
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col items-start gap-2 p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-all text-left"
      style={{ borderTopWidth: "3px", borderTopColor: color }}
    >
      <span
        className="size-3 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="font-heading text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
        {name}
      </span>
      {count != null && (
        <span className="text-[11px] text-muted-foreground">
          {count} {count === 1 ? "article" : "articles"}
        </span>
      )}
    </button>
  );
}
