"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MagnifyingGlass, GithubLogo } from "@phosphor-icons/react";
import { ROUTES } from "@/lib/routes";
import { Skeleton } from "@/components/ui/skeleton";
import { useBabelAll } from "./use-babel-data";
import { BabelEntryRow } from "./babel-entry-row";
import { ReportButton } from "@/components/feedback/report-button";
import { useAuth } from "@/hooks/use-auth";
import type { BabelPointEntry, BabelEquipmentEntry } from "@/lib/types";

export type AtlasScope = "all" | "points" | "equipment";

interface BabelViewProps {
  scope: AtlasScope;
  onScopeChange: (scope: AtlasScope) => void;
}

// Equipment category IDs — used to disambiguate point vs equipment categories
// when building grouped browse sections.
const EQUIPMENT_CATEGORY_IDS = new Set([
  "air-handling",
  "terminal-units",
  "central-plant",
  "metering",
  "motors",
  "vrf",
]);

// ---- Utility: filter + group ----

function matchesQuery(
  query: string,
  haystacks: Array<string | undefined | null>,
): boolean {
  if (!query) return true;
  const q = query.toLowerCase().trim();
  if (!q) return true;
  return haystacks.some((h) => h && h.toLowerCase().includes(q));
}

function pointMatches(entry: BabelPointEntry, query: string): boolean {
  return matchesQuery(query, [
    entry.concept.name,
    entry.concept.description,
    entry.concept.haystack?.tagString,
    entry.concept.brick,
    ...entry.aliases.common,
    ...(entry.aliases.abbreviated ?? []),
    ...(entry.aliases.verbose ?? []),
    ...(entry.aliases.misspellings ?? []),
  ]);
}

function equipmentMatches(entry: BabelEquipmentEntry, query: string): boolean {
  return matchesQuery(query, [
    entry.name,
    entry.full_name,
    entry.description,
    entry.haystack?.tagString,
    entry.brick,
    ...entry.aliases.common,
    ...(entry.aliases.abbreviated ?? []),
    ...(entry.aliases.verbose ?? []),
    ...(entry.aliases.misspellings ?? []),
  ]);
}

// ---- Main view ----

export function BabelView({ scope, onScopeChange }: BabelViewProps) {
  const { data, categories, loading, error } = useBabelAll();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const lastUpdated = useMemo(
    () =>
      new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    [],
  );

  // Filtering
  const filtered = useMemo(() => {
    if (!data) return { points: [] as BabelPointEntry[], equipment: [] as BabelEquipmentEntry[] };

    const q = searchQuery.trim();
    const points = (scope === "equipment" ? [] : data.points).filter((p) => pointMatches(p, q));
    const equipment = (scope === "points" ? [] : data.equipment).filter((e) => equipmentMatches(e, q));
    return { points, equipment };
  }, [data, searchQuery, scope]);

  const totalVisible = filtered.points.length + filtered.equipment.length;

  // Grouping — build groups from the categories tree so the order is stable.
  const groups = useMemo(() => {
    if (!data || !categories) return [] as Array<{ id: string; name: string; type: "point" | "equipment"; points: BabelPointEntry[]; equipment: BabelEquipmentEntry[] }>;

    const pointCats = categories.categories.filter((c) => c.type === "points");
    const equipCats = categories.categories.filter((c) => c.type === "equipment");

    const pointGroups = pointCats
      .map((cat) => {
        const points = filtered.points.filter((p) => p.concept.category === cat.id);
        return { id: `pt-${cat.id}`, name: cat.name, type: "point" as const, points, equipment: [] as BabelEquipmentEntry[] };
      })
      .filter((g) => g.points.length > 0 || (!searchQuery && scope === "points"));

    const equipGroups = equipCats
      .map((cat) => {
        const equipment = filtered.equipment.filter((e) => e.category === cat.id);
        return { id: `eq-${cat.id}`, name: cat.name, type: "equipment" as const, points: [] as BabelPointEntry[], equipment };
      })
      .filter((g) => g.equipment.length > 0 || (!searchQuery && scope === "equipment"));

    if (scope === "points") return pointGroups;
    if (scope === "equipment") return equipGroups;
    return [...pointGroups, ...equipGroups];
  }, [data, categories, filtered, scope, searchQuery]);

  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isGroupExpanded = (id: string, itemCount: number) => {
    // When searching: auto-expand groups that have results
    if (searchQuery.trim() && itemCount > 0) return true;
    // Otherwise: respect the user's explicit toggle, default to collapsed
    return expandedGroups.has(id);
  };

  // Loading and error states
  if (error) {
    return (
      <div className="min-h-full flex items-center justify-center py-24">
        <div className="text-center">
          <p className="text-foreground font-heading italic">Failed to load Atlas data.</p>
          <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
        </div>
      </div>
    );
  }

  const totalPoints = data?.totalPoints ?? 0;
  const totalEquipment = data?.totalEquipment ?? 0;

  // --- Render ---

  return (
    <div className="min-h-full">
      {/* Title block strip */}
      <div className="title-block">
        <div className="field">
          <span className="field-label">Drawing</span>
          <span className="field-value">Atlas</span>
        </div>
        <div className="field">
          <span className="field-label">Title</span>
          <span className="field-value">Point &amp; Equipment Reference</span>
        </div>
        <div className="field">
          <span className="field-label">Rev</span>
          <span className="field-value">{lastUpdated}</span>
        </div>
        <div className="field">
          <span className="field-label">Points</span>
          <span className="field-value tabular-nums">{totalPoints}</span>
        </div>
        <div className="field">
          <span className="field-label">Equipment</span>
          <span className="field-value tabular-nums">{totalEquipment}</span>
        </div>
        <div className="spacer" />
        <div className="field">
          <span className="field-label">Drawn by</span>
          <span className="field-value">R.H.</span>
        </div>
      </div>

      {/* Search area */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-16 pt-20 pb-12 max-w-[980px]">
        <p className="font-heading italic text-[17px] text-muted-foreground text-center mb-5 leading-[1.5]">
          A reference of points, equipment, and the names they show up under.
        </p>

        {/* Search input */}
        <div className="relative border-[1.5px] border-foreground rounded-md bg-card focus-within:border-accent transition-colors">
          <MagnifyingGlass className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search points, aliases, equipment, brands…"
            className="w-full bg-transparent border-none outline-none font-heading text-[20px] md:text-[22px] text-foreground placeholder:text-muted-foreground/60 placeholder:italic placeholder:font-normal py-[22px] pl-[56px] pr-6"
            aria-label="Search atlas"
          />
        </div>

        {/* Scope chips */}
        <div className="mt-[18px] flex items-center gap-3.5 flex-wrap font-mono text-[11px] uppercase tracking-[1.2px] text-muted-foreground">
          <span>Showing</span>
          <ScopeChip active={scope === "all"} onClick={() => onScopeChange("all")}>
            All <span className="text-accent ml-1.5">{totalPoints + totalEquipment}</span>
          </ScopeChip>
          <ScopeChip active={scope === "points"} onClick={() => onScopeChange("points")}>
            Points <span className="text-accent ml-1.5">{totalPoints}</span>
          </ScopeChip>
          <ScopeChip active={scope === "equipment"} onClick={() => onScopeChange("equipment")}>
            Equipment <span className="text-accent ml-1.5">{totalEquipment}</span>
          </ScopeChip>
          <span className="flex-1" />
          <span className="font-mono text-[11px] text-muted-foreground">
            <strong className="text-foreground tabular-nums">{totalVisible}</strong> shown
          </span>
        </div>

        <div className="mt-4 flex justify-end">
          <ReportButton
            targetType="new_atlas_entry"
            isAuthenticated={!!user}
            variant="outline"
            size="sm"
          />
        </div>
      </section>

      {/* Browse */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-16 pb-16 max-w-[1100px]">
        {loading ? (
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <Skeleton className="h-7 w-60 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : totalVisible === 0 ? (
          <div className="py-24 text-center font-heading italic text-[18px] text-muted-foreground">
            <span className="block font-mono not-italic text-[28px] mb-3">⌕</span>
            Nothing matches that. Try a different alias, vendor name, or part of the description.
          </div>
        ) : (
          <div className="space-y-9">
            {groups.map((group, idx) => {
              const itemCount = group.points.length + group.equipment.length;
              if (itemCount === 0) return null;
              const expanded = isGroupExpanded(group.id, itemCount);
              const num = String(idx + 1).padStart(2, "0");
              return (
                <div key={group.id}>
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className="w-full flex items-baseline gap-3.5 pb-3.5 border-b border-foreground text-left"
                  >
                    <span className="font-mono text-[11px] text-accent tracking-[1px]">{num} /</span>
                    <span className="font-heading font-semibold text-[22px] leading-none text-foreground">
                      {group.name}
                    </span>
                    <span className="ml-auto font-mono text-[11px] uppercase tracking-[1.2px] text-muted-foreground tabular-nums">
                      {itemCount} {group.type === "point" ? "points" : "models"}
                    </span>
                    <span className="ml-3.5 font-mono text-[11px] text-muted-foreground">
                      [ {expanded ? "COLLAPSE" : "EXPAND"} ]
                    </span>
                  </button>
                  {expanded && (
                    <div className="mt-0">
                      {group.points.map((entry) => (
                        <BabelEntryRow key={`pt-${entry.concept.id}`} entry={entry} type="point" />
                      ))}
                      {group.equipment.map((entry) => (
                        <BabelEntryRow key={`eq-${entry.id}`} entry={entry} type="equipment" />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Footer row */}
      <section className="bg-secondary border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-16 py-16 max-w-[1100px]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-14">
            <FooterColumn letter="A" title="Recently added">
              <p className="text-[13px] text-muted-foreground leading-[1.55]">
                New entries ship with the weekly data drop. Follow the repo for the changelog.
              </p>
            </FooterColumn>
            <FooterColumn letter="B" title="API access">
              <a
                href="https://basidekick.com/api/atlas/babel"
                target="_blank"
                rel="noreferrer"
                className="block font-heading italic text-[14px] text-foreground hover:text-accent py-2 transition-colors"
              >
                /api/atlas/babel →
              </a>
              <a
                href="https://basidekick.com/api/atlas/babel/categories"
                target="_blank"
                rel="noreferrer"
                className="block font-heading italic text-[14px] text-foreground hover:text-accent py-2 transition-colors"
              >
                /api/atlas/babel/categories →
              </a>
              <a
                href="https://basidekick.com/api/atlas/search?q=temperature"
                target="_blank"
                rel="noreferrer"
                className="block font-heading italic text-[14px] text-foreground hover:text-accent py-2 transition-colors"
              >
                /api/atlas/search →
              </a>
              <p className="text-[11px] text-muted-foreground mt-2 font-mono uppercase tracking-[1px]">
                No auth · JSON · stable URLs
              </p>
            </FooterColumn>
            <FooterColumn letter="C" title="Contribute">
              <a
                href="https://github.com/rbhans/bas-babel"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 font-heading italic text-[14px] text-foreground hover:text-accent py-2 transition-colors"
              >
                <GithubLogo className="w-3.5 h-3.5" />
                View on GitHub →
              </a>
              <Link
                href={ROUTES.ATLAS_EQUIPMENT_ADD}
                className="block font-heading italic text-[14px] text-foreground hover:text-accent py-2 transition-colors"
              >
                Add equipment →
              </Link>
              <p className="text-[11px] text-muted-foreground mt-2 font-mono uppercase tracking-[1px]">
                PRs welcome · Open reference
              </p>
            </FooterColumn>
          </div>
        </div>
      </section>

      {/* Colophon */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-16 py-14 max-w-[1100px]">
          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr_220px] gap-10 font-mono text-[12px] text-muted-foreground leading-relaxed">
            <div>
              <strong className="text-foreground font-bold">Atlas</strong>
              <br />
              Curated by Rob Hansen
              <br />
              Independent of any vendor
            </div>
            <div>
              Sources: Project Haystack, Brick Schema, vendor docs, community submissions.
              <br />
              <a
                href="https://github.com/rbhans/bas-babel"
                target="_blank"
                rel="noreferrer"
                className="text-foreground underline decoration-accent underline-offset-[3px] hover:text-accent transition-colors"
              >
                View sources on GitHub
              </a>
            </div>
            <div className="md:text-right">
              Last updated · {lastUpdated}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Sub-components ----

function ScopeChip({
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
      className={`px-3 py-1.5 border rounded-sm font-mono text-[11px] uppercase tracking-[1.2px] transition-colors ${
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function FooterColumn({
  letter,
  title,
  children,
}: {
  letter: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="font-mono text-[11px] uppercase tracking-[1.4px] text-muted-foreground mb-4 pb-3 border-b border-foreground">
        <span className="text-accent mr-1.5">{letter} /</span>
        {title}
      </h4>
      {children}
    </div>
  );
}

// ---- Legacy exports for backwards compat ----

export function BabelViewContent() {
  // Kept for any external imports; renders with scope defaulting to "all".
  return <BabelView scope="all" onScopeChange={() => {}} />;
}
