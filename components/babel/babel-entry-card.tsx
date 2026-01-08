"use client";

import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { ArrowRight, Tag } from "@phosphor-icons/react";
import type { BabelPointEntry, BabelEquipmentEntry } from "@/lib/types";

interface BabelEntryCardProps {
  entry: BabelPointEntry | BabelEquipmentEntry;
  type: "point" | "equipment";
}

export function BabelEntryCard({ entry, type }: BabelEntryCardProps) {
  const isPoint = type === "point";
  const pointEntry = entry as BabelPointEntry;
  const equipEntry = entry as BabelEquipmentEntry;

  const id = isPoint ? pointEntry.concept.id : equipEntry.id;
  const name = isPoint ? pointEntry.concept.name : equipEntry.name;
  const description = isPoint ? pointEntry.concept.description : equipEntry.description;
  const haystack = isPoint ? pointEntry.concept.haystack : undefined;
  const aliases = isPoint ? pointEntry.aliases : equipEntry.aliases;

  // Get top 4 common aliases
  const topAliases = aliases.common.slice(0, 4);

  return (
    <Link
      href={ROUTES.BABEL_ENTRY(id)}
      className="group block p-4 border border-border bg-card hover:border-primary/50 transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
            {name}
          </h3>
          {haystack && (
            <p className="text-xs text-primary/70 font-mono mt-0.5 truncate">
              {haystack}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {description}
          </p>
        </div>
        <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
      </div>

      {topAliases.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {topAliases.map((alias, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-muted/50 rounded font-mono"
            >
              <Tag className="size-3 opacity-50" />
              {alias}
            </span>
          ))}
          {aliases.common.length > 4 && (
            <span className="inline-flex items-center px-2 py-0.5 text-xs text-muted-foreground">
              +{aliases.common.length - 4} more
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
