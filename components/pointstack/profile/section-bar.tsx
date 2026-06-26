import type { ReactNode } from "react";

/** Numbered section header used across the profile page (".01 About", etc.). */
export function SectionBar({
  num,
  title,
  meta,
}: {
  num: string;
  title: string;
  meta?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3.5 border-b border-[var(--sand-line-2)] pb-3">
      <span className="font-mono text-[11.5px] font-medium uppercase tracking-[0.22em] text-punch">
        .{num}
      </span>
      <h2 className="m-0 font-heading text-[13.5px] font-bold uppercase tracking-[0.04em] text-ink">
        {title}
      </h2>
      {meta != null && (
        <span className="ml-auto font-mono text-[11px] uppercase tracking-[0.16em] text-ink-3">
          {meta}
        </span>
      )}
    </div>
  );
}
