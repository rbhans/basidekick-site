"use client";

import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import type { BabelPointEntry, BabelEquipmentEntry } from "@/lib/types";

interface BabelEntryRowProps {
  entry: BabelPointEntry | BabelEquipmentEntry;
  type: "point" | "equipment";
}

export function BabelEntryRow({ entry, type }: BabelEntryRowProps) {
  const isPoint = type === "point";
  const pointEntry = entry as BabelPointEntry;
  const equipEntry = entry as BabelEquipmentEntry;

  const id = isPoint ? pointEntry.concept.id : equipEntry.id;
  const name = isPoint ? pointEntry.concept.name : equipEntry.name;
  const aliases = isPoint ? pointEntry.aliases.common : equipEntry.aliases.common;

  const aliasString = aliases.slice(0, 6).join(" · ");
  const totalAliases = aliases.length;

  const haystackTagString = isPoint
    ? pointEntry.concept.haystack?.tagString
    : equipEntry.haystack?.tagString;

  return (
    <Link
      href={ROUTES.ATLAS_ENTRY(id)}
      className="group grid grid-cols-1 md:grid-cols-[280px_1fr_200px] gap-6 items-baseline px-1 py-3.5 border-b border-muted hover:bg-muted/40 transition-colors"
    >
      <div className="font-heading font-semibold text-[16px] leading-[1.25] text-foreground group-hover:text-accent transition-colors">
        {name}
      </div>
      <div className="font-mono text-[12px] text-muted-foreground leading-[1.5] min-w-0 truncate">
        {aliasString || <span className="text-muted-foreground/40">no aliases</span>}
      </div>
      <div className="font-mono text-[11px] text-muted-foreground uppercase tracking-[1.2px] md:text-right truncate">
        {totalAliases > 0 && (
          <>
            <span className="text-foreground tabular-nums font-bold">{totalAliases}</span>
            {" alias"}
            {totalAliases !== 1 ? "es" : ""}
          </>
        )}
        {haystackTagString && (
          <>
            {totalAliases > 0 && " · "}
            <span className="normal-case tracking-normal text-[10px]">{haystackTagString}</span>
          </>
        )}
      </div>
    </Link>
  );
}
