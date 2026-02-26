"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { ArrowRight, Tag } from "@phosphor-icons/react";
import type { BabelPointEntry, BabelEquipmentEntry } from "@/lib/types";

interface RotatingAtlasCardProps {
  entries: (BabelPointEntry | BabelEquipmentEntry)[];
  type: "point" | "equipment";
  intervalMs?: number;
}

export function RotatingAtlasCard({
  entries,
  type,
  intervalMs = 6000,
}: RotatingAtlasCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (entries.length <= 1) return;

    const interval = setInterval(() => {
      // Fade out
      setVisible(false);
      timeoutRef.current = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % entries.length);
        // Fade in
        setVisible(true);
      }, 300);
    }, intervalMs);

    return () => {
      clearInterval(interval);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [entries.length, intervalMs]);

  if (entries.length === 0) return null;

  const entry = entries[currentIndex];
  const isPoint = type === "point";
  const pointEntry = entry as BabelPointEntry;
  const equipEntry = entry as BabelEquipmentEntry;

  const id = isPoint ? pointEntry.concept.id : equipEntry.id;
  const name = isPoint ? pointEntry.concept.name : equipEntry.name;
  const description = isPoint ? pointEntry.concept.description : equipEntry.description;
  const category = isPoint ? pointEntry.concept.category : equipEntry.category;
  const aliases = isPoint ? pointEntry.aliases : equipEntry.aliases;
  const topAliases = aliases.common.slice(0, 3);

  return (
    <Link
      href={ROUTES.ATLAS_ENTRY(id)}
      className={`group block p-5 bg-[#1E1E22] border border-[#333] rounded-xl hover:border-[#3F3F46] transition-all ${
        visible ? "opacity-100" : "opacity-0"
      } transition-opacity duration-300`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <span className="font-mono text-[11px] font-bold text-primary tracking-[2px] uppercase">
            {category}
          </span>
          <h3 className="mt-1 font-heading text-[15px] font-bold text-foreground group-hover:text-primary transition-colors truncate">
            {name}
          </h3>
          <p className="mt-1 text-[12px] text-muted-foreground line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
      </div>

      {topAliases.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {topAliases.map((alias, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] bg-muted rounded font-mono"
            >
              <Tag className="w-3 h-3 opacity-50" />
              {alias}
            </span>
          ))}
          {aliases.common.length > 3 && (
            <span className="text-[11px] text-muted-foreground px-1">
              +{aliases.common.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="mt-3 text-[12px] font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
        View Details &rarr;
      </div>
    </Link>
  );
}
