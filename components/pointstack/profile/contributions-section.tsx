"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { SectionBar } from "./section-bar";
import type { ContributionFeedItem, ContributionSection } from "../pointstack-api";

const SECTION_META: Record<ContributionSection, { label: string; glyph: string }> = {
  pointstack: { label: "PointStack", glyph: "P" },
  atlas: { label: "Atlas", glyph: "A" },
  wiki: { label: "Wiki", glyph: "W" },
  news: { label: "News", glyph: "N" },
};

const SECTION_ORDER: ContributionSection[] = ["pointstack", "atlas", "wiki", "news"];

export function ContributionsSection({ items }: { items: ContributionFeedItem[] }) {
  const [filter, setFilter] = useState<ContributionSection | "all">("all");

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const it of items) c[it.section] = (c[it.section] || 0) + 1;
    return c;
  }, [items]);

  const presentSections = SECTION_ORDER.filter((s) => (counts[s] || 0) > 0);
  const visible = filter === "all" ? items : items.filter((it) => it.section === filter);

  if (items.length === 0) return null;

  return (
    <section className="pt-11">
      <SectionBar
        num="04"
        title="Contributions"
        meta={
          <>
            <b className="font-medium text-ink-2">{items.length}</b> across {presentSections.length}{" "}
            {presentSections.length === 1 ? "area" : "areas"}
          </>
        }
      />

      {/* Count chips */}
      <div className="mb-4 flex flex-wrap gap-2">
        {presentSections.map((s) => (
          <span
            key={s}
            className="inline-flex items-center gap-2.5 rounded-md border border-[var(--sand-line-2)] bg-card py-1.5 pl-2 pr-3"
          >
            <span className="flex h-[22px] w-[22px] items-center justify-center rounded-sm border border-[var(--sand-line-2)] bg-sand font-mono text-[11px] font-bold text-ink-2">
              {SECTION_META[s].glyph}
            </span>
            <span className="text-[12.5px] font-medium text-ink">{SECTION_META[s].label}</span>
            <span className="font-mono text-[12px] font-semibold tabular-nums text-ink-2">{counts[s]}</span>
          </span>
        ))}
      </div>

      {/* Filter */}
      {presentSections.length > 1 && (
        <div className="mb-4 flex flex-wrap items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-3">
          <span className="mr-0.5">Filter</span>
          <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>
            All
          </FilterPill>
          {presentSections.map((s) => (
            <FilterPill key={s} active={filter === s} onClick={() => setFilter(s)}>
              {SECTION_META[s].label}
            </FilterPill>
          ))}
          <span className="ml-auto">
            <b className="mr-0.5 font-heading text-[12px] font-semibold tabular-nums text-ink">{visible.length}</b>
            shown
          </span>
        </div>
      )}

      {/* Feed */}
      <div className="flex flex-col gap-2.5">
        {visible.map((it) => (
          <FeedRow key={it.id} item={it} />
        ))}
      </div>
    </section>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-sm border px-2.5 py-1.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] transition-colors ${
        active
          ? "border-ink bg-ink text-sand"
          : "border-[var(--sand-line-2)] text-ink-2 hover:border-ink hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function FeedRow({ item }: { item: ContributionFeedItem }) {
  const meta = SECTION_META[item.section];
  const inner = (
    <>
      <span className="flex h-[34px] w-[34px] items-center justify-center rounded-sm border border-[var(--sand-line-2)] bg-sand font-mono text-[13px] font-bold text-ink-2">
        {meta.glyph}
      </span>
      <div className="min-w-0">
        <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3">
          <b className="font-medium text-ink-2">{item.label}</b> · <span className="text-punch">{meta.label}</span>
        </div>
        <h4 className="m-0 truncate font-heading text-[15px] font-semibold tracking-[-0.005em] text-ink group-hover:text-punch">
          {item.title}
        </h4>
      </div>
      <div className="flex flex-col items-end gap-1 text-right">
        {item.stat && <span className="font-mono text-[11px] tabular-nums text-ink-2">{item.stat}</span>}
        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-4">
          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
        </span>
      </div>
    </>
  );

  const cls =
    "group grid grid-cols-[34px_1fr_auto] items-center gap-4 rounded-md border border-[var(--sand-line)] bg-card px-4 py-3 shadow-sm transition-all hover:-translate-y-px hover:border-[var(--sand-line-2)] hover:shadow-md";

  return item.href ? (
    <Link href={item.href} className={cls}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}
