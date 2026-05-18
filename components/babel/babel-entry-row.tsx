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
  const brick = isPoint ? pointEntry.concept.brick : equipEntry.brick;
  const haystackTagString = isPoint
    ? pointEntry.concept.haystack?.tagString
    : equipEntry.haystack?.tagString;

  const totalAliases = aliases.length;
  const previewAliases = aliases.slice(0, 6);

  return (
    <Link href={ROUTES.ATLAS_ENTRY(id)} className="at-row" data-type={type}>
      <div className="lead">
        <span className="nm">{name}</span>
        <span className="meta">
          {brick && (
            <>
              <span className="brick">brick:{brick}</span>
              <span className="sep">·</span>
            </>
          )}
          <span>{totalAliases} {totalAliases === 1 ? "alias" : "aliases"}</span>
        </span>
      </div>
      <div className="aliases">
        {previewAliases.length > 0 ? (
          previewAliases.map((alias, idx) => (
            <span key={idx}>
              {idx === 0 ? <span className="pp">{alias}</span> : alias}
              {idx < previewAliases.length - 1 && <span className="sep">·</span>}
            </span>
          ))
        ) : (
          <span className="text-ink-4">no aliases</span>
        )}
      </div>
      <div className="right">
        <span className="ct">
          <b>{totalAliases}</b>
          {totalAliases === 1 ? "alias" : "aliases"}
        </span>
        {haystackTagString && <span className="haystack">{haystackTagString}</span>}
        <span className="arr">→</span>
      </div>
    </Link>
  );
}
