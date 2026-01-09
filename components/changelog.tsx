"use client";

import { useState } from "react";
import { Clock, CaretDown, CaretUp, Sparkle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  items: string[];
  isNew?: boolean;
}

const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    version: "0.3.0",
    date: "Jan 2025",
    title: "Community Features",
    items: [
      "Added Wiki with articles and categories",
      "Launched Forum for community discussions",
      "Added user profiles and authentication",
      "Introduced Babel BAS terminology database",
    ],
    isNew: true,
  },
  {
    version: "0.2.0",
    date: "Dec 2024",
    title: "Resources & Tools",
    items: [
      "Added ProjectSidekick for project management",
      "Introduced BAS calculators and converters",
      "Added external resources section",
      "Improved site navigation",
    ],
  },
  {
    version: "0.1.0",
    date: "Nov 2024",
    title: "Initial Launch",
    items: [
      "Launched basidekick.com",
      "Added core tools section",
      "Implemented dark/light theme",
      "Basic site structure and design",
    ],
  },
];

interface ChangelogProps {
  maxItems?: number;
  showExpand?: boolean;
  className?: string;
}

export function Changelog({
  maxItems = 2,
  showExpand = true,
  className,
}: ChangelogProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const displayedEntries = isExpanded
    ? CHANGELOG_ENTRIES
    : CHANGELOG_ENTRIES.slice(0, maxItems);

  return (
    <div className={cn("space-y-4", className)}>
      {displayedEntries.map((entry, index) => (
        <div
          key={entry.version}
          className={cn(
            "relative pl-6 pb-4 border-l-2 border-border last:pb-0",
            "animate-fade-in-up"
          )}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Timeline dot */}
          <div
            className={cn(
              "absolute -left-[9px] top-0 size-4 rounded-full border-2 bg-background",
              entry.isNew
                ? "border-primary bg-primary"
                : "border-muted-foreground"
            )}
          />

          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-sm font-semibold">
              v{entry.version}
            </span>
            {entry.isNew && (
              <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                <Sparkle className="size-3" weight="fill" />
                New
              </span>
            )}
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="size-3" />
              {entry.date}
            </span>
          </div>

          {/* Title */}
          <h4 className="font-semibold mb-2">{entry.title}</h4>

          {/* Items */}
          <ul className="space-y-1">
            {entry.items.map((item, itemIndex) => (
              <li
                key={itemIndex}
                className="text-sm text-muted-foreground flex items-start gap-2"
              >
                <span className="text-primary mt-1.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {showExpand && CHANGELOG_ENTRIES.length > maxItems && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors ml-6"
        >
          {isExpanded ? (
            <>
              <CaretUp className="size-4" />
              Show less
            </>
          ) : (
            <>
              <CaretDown className="size-4" />
              Show {CHANGELOG_ENTRIES.length - maxItems} more updates
            </>
          )}
        </button>
      )}
    </div>
  );
}
