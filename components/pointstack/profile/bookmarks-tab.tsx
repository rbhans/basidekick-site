"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useBookmarks, type Bookmark } from "@/hooks/use-bookmarks";
import { ROUTES } from "@/lib/routes";
import { BookOpen, Translate, Calculator, FileText } from "@phosphor-icons/react";

const TYPE_META: Record<Bookmark["type"], { label: string; icon: React.ReactNode; href: (b: Bookmark) => string }> = {
  wiki: {
    label: "Wiki",
    icon: <BookOpen className="w-3 h-3" />,
    href: (b) => ROUTES.WIKI_ARTICLE(b.slug),
  },
  babel: {
    label: "Atlas",
    icon: <Translate className="w-3 h-3" />,
    href: (b) => ROUTES.ATLAS_ENTRY(b.slug),
  },
  calculator: {
    label: "Calculator",
    icon: <Calculator className="w-3 h-3" />,
    href: () => ROUTES.CALCULATORS,
  },
  reference: {
    label: "Reference",
    icon: <FileText className="w-3 h-3" />,
    href: () => ROUTES.REFERENCES,
  },
};

export function BookmarksTab() {
  const { bookmarks, isLoaded } = useBookmarks();

  if (!isLoaded) {
    return null;
  }

  if (bookmarks.length === 0) {
    return (
      <div className="py-12 text-center italic text-[15px] text-muted-foreground border border-dashed border-border">
        No bookmarks yet. Add bookmarks across the site via the bookmark icon.
      </div>
    );
  }

  // Group by type for readability
  const grouped = bookmarks.reduce<Record<string, Bookmark[]>>((acc, b) => {
    (acc[b.type] = acc[b.type] || []).push(b);
    return acc;
  }, {});

  const groupOrder: Bookmark["type"][] = ["wiki", "babel", "reference", "calculator"];

  return (
    <div className="space-y-10">
      <p className="font-mono text-[10px] uppercase tracking-[1.3px] text-muted-foreground">
        Stored locally in your browser. Only visible to you.
      </p>
      {groupOrder
        .filter((type) => grouped[type]?.length)
        .map((type) => {
          const meta = TYPE_META[type];
          const items = grouped[type];
          return (
            <div key={type}>
              <div className="flex items-baseline gap-3.5 pb-3.5 border-b border-foreground mb-4">
                <span className="font-mono text-[11px] text-accent tracking-[1px] inline-flex items-center gap-1.5">
                  {meta.icon}
                  {meta.label}
                </span>
                <span className="ml-auto font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground tabular-nums">
                  {items.length}
                </span>
              </div>
              <div className="space-y-0">
                {items.map((b, idx) => (
                  <Link
                    key={`${b.type}-${b.id}`}
                    href={meta.href(b)}
                    className="group grid grid-cols-[28px_1fr_auto] gap-4 items-start py-4 px-2 border-b border-muted hover:bg-muted/40 transition-colors"
                  >
                    <span className="font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground tabular-nums mt-1">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <h4 className="font-heading font-semibold text-[15px] leading-[1.3] text-foreground group-hover:text-accent transition-colors truncate">
                        {b.title}
                      </h4>
                      <div className="mt-2 font-mono text-[9px] uppercase tracking-[1.1px] text-muted-foreground">
                        {b.category && <span className="text-accent">{b.category}</span>}
                        {b.category && " · "}
                        <span className="tabular-nums">
                          Saved {formatDistanceToNow(new Date(b.addedAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground group-hover:text-accent transition-colors">
                      Open →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
    </div>
  );
}
