"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useBabelData } from "@/components/babel/use-babel-data";
import type { BabelEquipmentEntry, BabelPointEntry } from "@/lib/types";
import { ROUTES } from "@/lib/routes";

type SidebarBabelEntry = {
  id: string;
  type: "point" | "equipment";
  name: string;
  description: string;
  aliases: string[];
  category?: string;
  subcategory?: string;
  unit?: string;
  tags: string[];
};

function toSidebarEntry(entry: BabelPointEntry | BabelEquipmentEntry): SidebarBabelEntry {
  if ("concept" in entry) {
    return {
      id: entry.concept.id,
      type: "point",
      name: entry.concept.name,
      description: entry.concept.description,
      aliases: entry.aliases.common ?? [],
      category: entry.concept.category,
      subcategory: entry.concept.subcategory,
      unit: entry.concept.unit,
      tags: [entry.concept.haystack, entry.concept.brick].filter((value): value is string => Boolean(value)),
    };
  }

  return {
    id: entry.id,
    type: "equipment",
    name: entry.name,
    description: entry.description,
    aliases: entry.aliases.common ?? [],
    category: entry.category,
    unit: entry.abbreviation,
    tags: [entry.haystack, entry.brick].filter((value): value is string => Boolean(value)),
  };
}

function pickRandomIndex(length: number, excludeIndex?: number): number {
  if (length <= 1) return 0;

  let next = Math.floor(Math.random() * length);
  while (next === excludeIndex) {
    next = Math.floor(Math.random() * length);
  }

  return next;
}

export function SidebarStatus() {
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { data, loading, error } = useBabelData();

  useEffect(() => {
    setMounted(true);
  }, []);

  const entries = useMemo(
    () => [
      ...(data?.points.map(toSidebarEntry) ?? []),
      ...(data?.equipment.map(toSidebarEntry) ?? []),
    ],
    [data]
  );

  useEffect(() => {
    if (!mounted || entries.length === 0) return;

    setActiveIndex(() => pickRandomIndex(entries.length));
  }, [mounted, entries.length]);

  useEffect(() => {
    if (!mounted || entries.length <= 1) return;

    const interval = setInterval(() => {
      setIsVisible(false);

      transitionTimeoutRef.current = setTimeout(() => {
        setActiveIndex((prev) => pickRandomIndex(entries.length, prev));
        setIsVisible(true);
      }, 250);
    }, 12000);

    return () => {
      clearInterval(interval);
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, [mounted, entries.length]);

  if (!mounted) {
    return (
      <div className="px-3 py-3 border-t border-border">
        <div className="space-y-2 animate-pulse">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-2.5 bg-muted rounded w-1/2" />
          <div className="h-2.5 bg-muted rounded w-full" />
          <div className="h-2.5 bg-muted rounded w-5/6" />
          <div className="h-2.5 bg-muted rounded w-4/5" />
        </div>
      </div>
    );
  }

  if (error || (!loading && entries.length === 0)) {
    return null;
  }

  if (loading || entries.length === 0) {
    return (
      <div className="px-3 py-3 border-t border-border">
        <div className="space-y-2 animate-pulse">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-2.5 bg-muted rounded w-1/2" />
          <div className="h-2.5 bg-muted rounded w-full" />
          <div className="h-2.5 bg-muted rounded w-5/6" />
          <div className="h-2.5 bg-muted rounded w-4/5" />
        </div>
      </div>
    );
  }

  const entry = entries[activeIndex];
  if (!entry) return null;

  const topAliases = entry.aliases.slice(0, 4);

  return (
    <div className="px-3 py-3 border-t border-border">
      <Link
        href={ROUTES.BABEL_ENTRY(entry.id)}
        className={`block rounded-md border border-border/60 bg-muted/20 p-3 transition-all duration-300 hover:border-cyan-500/40 hover:bg-muted/40 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="text-sm font-medium leading-tight">{entry.name}</div>
          <span className="text-[9px] font-mono uppercase tracking-wide rounded border border-cyan-500/40 px-1.5 py-0.5 text-cyan-500 dark:text-cyan-400 shrink-0">
            {entry.type}
          </span>
        </div>
        <div className="text-[9px] font-mono uppercase tracking-wider text-cyan-500/90 dark:text-cyan-400/90 mb-1">
          Description
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed mb-2">{entry.description}</p>
        <div className="text-[9px] font-mono uppercase tracking-wider text-cyan-500/90 dark:text-cyan-400/90 mb-1">
          Attributes
        </div>
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          {entry.category && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-background/60 border border-border font-mono">
              {entry.category}
            </span>
          )}
          {entry.subcategory && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-background/60 border border-border font-mono">
              {entry.subcategory}
            </span>
          )}
          {entry.unit && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-background/60 border border-border font-mono">
              {entry.unit}
            </span>
          )}
          {entry.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-500 dark:text-cyan-400 font-mono"
            >
              {tag}
            </span>
          ))}
        </div>
        {topAliases.length > 0 && (
          <>
            <div className="text-[9px] font-mono uppercase tracking-wider text-cyan-500/90 dark:text-cyan-400/90 mb-1">
              Aliases
            </div>
            <p className="text-[10px] text-muted-foreground/90 leading-relaxed">{topAliases.join(" • ")}</p>
          </>
        )}
      </Link>
    </div>
  );
}
