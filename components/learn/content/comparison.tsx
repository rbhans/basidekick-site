import type { ReactNode } from "react";

interface ComparisonRow {
  label: string;
  left: ReactNode;
  right: ReactNode;
}

interface ComparisonProps {
  leftLabel: string;
  rightLabel: string;
  rows: ComparisonRow[];
  caption?: ReactNode;
}

export function Comparison({
  leftLabel,
  rightLabel,
  rows,
  caption,
}: ComparisonProps) {
  return (
    <figure className="my-10 overflow-hidden rounded-[var(--radius-card)] border border-[color:var(--color-border)]">
      <div className="grid grid-cols-1 sm:grid-cols-[10rem_1fr_1fr]">
        <div className="hidden border-r border-[color:var(--color-border)] bg-[color:var(--color-bg-muted)] px-4 py-3 sm:block" />
        <div className="border-b border-[color:var(--color-border)] bg-[color:var(--color-bg-muted)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-fg-muted)] sm:border-b sm:border-r">
          {leftLabel}
        </div>
        <div className="border-b border-[color:var(--color-border)] bg-[color:var(--color-bg-muted)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-fg-muted)]">
          {rightLabel}
        </div>

        {rows.map((row, idx) => (
          <Row
            key={row.label}
            row={row}
            isLast={idx === rows.length - 1}
          />
        ))}
      </div>
      {caption ? (
        <figcaption className="border-t border-[color:var(--color-border)] bg-[color:var(--color-bg-muted)] px-4 py-3 text-sm text-[color:var(--color-fg-muted)]">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

interface RowProps {
  row: ComparisonRow;
  isLast: boolean;
}

function Row({ row, isLast }: RowProps) {
  const borderClass = isLast
    ? ""
    : "border-b border-[color:var(--color-border)]";
  return (
    <>
      <div
        className={`${borderClass} bg-[color:var(--color-bg-muted)] px-4 py-3 text-xs font-medium uppercase tracking-[0.14em] text-[color:var(--color-fg-subtle)] sm:border-r`}
      >
        {row.label}
      </div>
      <div
        className={`${borderClass} px-4 py-3 text-[color:var(--color-fg)] sm:border-r`}
      >
        {row.left}
      </div>
      <div className={`${borderClass} px-4 py-3 text-[color:var(--color-fg)]`}>
        {row.right}
      </div>
    </>
  );
}
