"use client";

interface WikiCategoryBlockProps {
  name: string;
  slug: string;
  /** Legacy prop — unused in the new design */
  color?: string;
  count?: number;
  onClick: () => void;
}

function categoryGlyph(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "·";
  return trimmed[0].toUpperCase();
}

export function WikiCategoryBlock({ name, count, onClick }: WikiCategoryBlockProps) {
  return (
    <button onClick={onClick} className="wk-cat-card" type="button">
      <span className="glyph">{categoryGlyph(name)}</span>
      <span className="body">
        <span className="name">{name}</span>
        {count != null && (
          <span className="ct tabular-nums">
            {count} {count === 1 ? "article" : "articles"}
          </span>
        )}
      </span>
    </button>
  );
}
