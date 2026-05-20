"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { Skeleton } from "@/components/ui/skeleton";
import { useBabelAll } from "./use-babel-data";
import { useAtlasAll } from "@/components/atlas/use-atlas-data";
import { BabelEntryRow } from "./babel-entry-row";
import { ModelEntryRow } from "@/components/atlas/model-entry-row";
import { ReportButton } from "@/components/feedback/report-button";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import type { BabelPointEntry, BabelEquipmentEntry, AtlasModel, AtlasBrand } from "@/lib/types";

export type AtlasScope = "all" | "points" | "equipment" | "models";

interface BabelViewProps {
  scope: AtlasScope;
  onScopeChange: (scope: AtlasScope) => void;
}

function matchesQuery(query: string, haystacks: Array<string | undefined | null>): boolean {
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

function modelMatches(model: AtlasModel, query: string): boolean {
  return matchesQuery(query, [
    model.name,
    model.brand_name,
    model.type_name,
    model.description,
    ...(model.model_numbers ?? []),
    ...(model.protocols ?? []),
  ]);
}

export function BabelView({ scope, onScopeChange }: BabelViewProps) {
  const { data, categories, loading, error } = useBabelAll();
  const { data: atlasData, loading: atlasLoading } = useAtlasAll();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [modelWorkedCounts, setModelWorkedCounts] = useState<Record<string, number>>({});
  const expandedGroupsInitialized = useRef(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch "worked with" counts for all models from Supabase
  useEffect(() => {
    if (!atlasData?.models?.length) return;
    let cancelled = false;
    const fetchCounts = async () => {
      const supabase = createClient();
      if (!supabase) return;
      const ids = atlasData.models.map((m) => m.id);
      const { data: rows, error: fetchError } = await supabase
        .from("equipment_experience")
        .select("equipment_id")
        .in("equipment_id", ids);
      if (fetchError || !rows || cancelled) return;
      const next: Record<string, number> = {};
      for (const row of rows as Array<{ equipment_id: string }>) {
        next[row.equipment_id] = (next[row.equipment_id] || 0) + 1;
      }
      if (!cancelled) setModelWorkedCounts(next);
    };
    fetchCounts();
    return () => {
      cancelled = true;
    };
  }, [atlasData]);

  // "/" outside any input focuses search
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) return;
      e.preventDefault();
      searchInputRef.current?.focus();
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const filtered = useMemo(() => {
    const empty = {
      points: [] as BabelPointEntry[],
      equipment: [] as BabelEquipmentEntry[],
      models: [] as AtlasModel[],
    };
    if (!data) return empty;
    const q = searchQuery.trim();
    const includePoints = scope === "all" || scope === "points";
    const includeEquipment = scope === "all" || scope === "equipment";
    const includeModels = scope === "all" || scope === "models";
    const points = (includePoints ? data.points : []).filter((p) => pointMatches(p, q));
    const equipment = (includeEquipment ? data.equipment : []).filter((e) => equipmentMatches(e, q));
    const models = (includeModels && atlasData ? atlasData.models : []).filter((m) => modelMatches(m, q));
    return { points, equipment, models };
  }, [data, atlasData, searchQuery, scope]);

  const totalVisible = filtered.points.length + filtered.equipment.length + filtered.models.length;

  // Distinct aliases
  const distinctAliases = useMemo(() => {
    if (!data) return 0;
    const set = new Set<string>();
    for (const p of data.points) for (const a of p.aliases.common) set.add(a);
    for (const e of data.equipment) for (const a of e.aliases.common) set.add(a);
    return set.size;
  }, [data]);

  // Haystack mapped %
  const haystackMapped = useMemo(() => {
    if (!data) return { count: 0, percent: 0 };
    const mapped = data.points.filter((p) => p.concept.haystack && p.concept.haystack.tags.length > 0).length;
    const percent = data.points.length > 0 ? Math.round((mapped / data.points.length) * 100) : 0;
    return { count: mapped, percent };
  }, [data]);

  // Featured: most-aliased point
  const featured = useMemo(() => {
    if (!data) return null;
    let best: BabelPointEntry | null = null;
    let bestCount = -1;
    for (const p of data.points) {
      const c = p.aliases.common.length;
      if (c > bestCount) {
        best = p;
        bestCount = c;
      }
    }
    return best;
  }, [data]);

  // Trending: top 6 by alias count, excluding featured
  const trending = useMemo(() => {
    if (!data) return [] as { id: string; name: string; type: "point" | "equipment"; aliasCount: number }[];
    const all: { id: string; name: string; type: "point" | "equipment"; aliasCount: number }[] = [];
    for (const p of data.points) {
      if (featured && p.concept.id === featured.concept.id) continue;
      all.push({ id: p.concept.id, name: p.concept.name, type: "point", aliasCount: p.aliases.common.length });
    }
    for (const e of data.equipment) {
      all.push({ id: e.id, name: e.name, type: "equipment", aliasCount: e.aliases.common.length });
    }
    all.sort((a, b) => b.aliasCount - a.aliasCount);
    return all.slice(0, 6);
  }, [data, featured]);

  // Grouping
  const groups = useMemo(() => {
    if (!data || !categories)
      return [] as Array<{
        id: string;
        catId: string;
        name: string;
        type: "point" | "equipment" | "model";
        points: BabelPointEntry[];
        equipment: BabelEquipmentEntry[];
        models: AtlasModel[];
        desc: string;
      }>;

    const pointCats = categories.categories.filter((c) => c.type === "points");
    const equipCats = categories.categories.filter((c) => c.type === "equipment");

    const pointGroups = pointCats
      .map((cat) => {
        const points = filtered.points.filter((p) => p.concept.category === cat.id);
        return {
          id: `pt-${cat.id}`,
          catId: cat.id,
          name: cat.name,
          type: "point" as const,
          points,
          equipment: [] as BabelEquipmentEntry[],
          models: [] as AtlasModel[],
          desc: "",
        };
      })
      .filter((g) => g.points.length > 0 || (!searchQuery && scope === "points"));

    const equipGroups = equipCats
      .map((cat) => {
        const equipment = filtered.equipment.filter((e) => e.category === cat.id);
        return {
          id: `eq-${cat.id}`,
          catId: cat.id,
          name: cat.name,
          type: "equipment" as const,
          points: [] as BabelPointEntry[],
          equipment,
          models: [] as AtlasModel[],
          desc: "",
        };
      })
      .filter((g) => g.equipment.length > 0 || (!searchQuery && scope === "equipment"));

    const brands: AtlasBrand[] = atlasData?.brands ?? [];
    const modelGroups = brands
      .map((b) => {
        const models = filtered.models.filter((m) => m.brand === b.id);
        return {
          id: `md-${b.id}`,
          catId: b.id,
          name: b.name,
          type: "model" as const,
          points: [] as BabelPointEntry[],
          equipment: [] as BabelEquipmentEntry[],
          models,
          desc: b.description ?? "",
        };
      })
      .filter((g) => g.models.length > 0 || (!searchQuery && scope === "models"));

    if (scope === "points") return pointGroups;
    if (scope === "equipment") return equipGroups;
    if (scope === "models") return modelGroups;
    return [...pointGroups, ...equipGroups, ...modelGroups];
  }, [data, atlasData, categories, filtered, scope, searchQuery]);

  // Default-expand first 2 groups on first load only
  useEffect(() => {
    if (expandedGroupsInitialized.current) return;
    if (groups.length === 0) return;
    expandedGroupsInitialized.current = true;
    setExpandedGroups(new Set(groups.slice(0, 2).map((g) => g.id)));
  }, [groups]);

  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isGroupExpanded = (id: string, itemCount: number) => {
    if (searchQuery.trim() && itemCount > 0) return true;
    return expandedGroups.has(id);
  };

  if (error) {
    return (
      <div className="min-h-full flex items-center justify-center py-24">
        <div className="text-center">
          <p className="text-foreground font-sans italic">Failed to load Atlas data.</p>
          <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
        </div>
      </div>
    );
  }

  const totalPoints = data?.totalPoints ?? 0;
  const totalEquipment = data?.totalEquipment ?? 0;
  const totalModels = atlasData?.totalModels ?? 0;
  const totalBrands = atlasData?.totalBrands ?? 0;
  const lastReviewedDate = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <section className="sand-section">
      <div className="at-page">
        <div className="at-head">
          <span className="num">.01</span>
          <h1>Atlas / Point &amp; equipment reference</h1>
          <span className="id">
            <span className="live-dot" />LIVE INDEX · <b>{totalPoints}</b> POINTS · <b>{totalEquipment}</b> EQUIPMENT
          </span>
        </div>

        <div className="at-hero">
          <h2>
            The same sensor, <em>fourteen names</em>. One reference.
          </h2>
          <p className="lede">
            A community-curated dictionary of BAS points and equipment with every alias, vendor spelling, Project Haystack tag string, and Brick class — searchable in one place, fed by submissions, kept honest by the field.
          </p>

          <div className="at-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="m20 20-4.3-4.3" />
            </svg>
            <input
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search points, aliases, vendors, Haystack tags…"
              aria-label="Search atlas"
            />
            <span className="keys">
              <kbd className="kbd">/</kbd>
            </span>
          </div>

          <div className="at-controls">
            <span className="label">Showing</span>
            <button className="at-chip" aria-selected={scope === "all"} onClick={() => onScopeChange("all")}>
              All <span className="n">{totalPoints + totalEquipment + totalModels}</span>
            </button>
            <button className="at-chip" aria-selected={scope === "points"} onClick={() => onScopeChange("points")}>
              Points <span className="n">{totalPoints}</span>
            </button>
            <button className="at-chip" aria-selected={scope === "equipment"} onClick={() => onScopeChange("equipment")}>
              Equipment Types <span className="n">{totalEquipment}</span>
            </button>
            <button className="at-chip" aria-selected={scope === "models"} onClick={() => onScopeChange("models")}>
              Models <span className="n">{totalModels}</span>
            </button>
            <span className="count">
              <b>{totalVisible}</b>
              {searchQuery ? "matches" : "indexed · sorted by category"}
            </span>
          </div>
        </div>

        {/* Stat strip */}
        <div className="at-stats tabular-nums">
          <div className="cell">
            <span className="k">Total points</span>
            <span className="v">{totalPoints}</span>
            <span className="delta dim">indexed</span>
          </div>
          <div className="cell">
            <span className="k">Equipment types</span>
            <span className="v">{totalEquipment}</span>
            <span className="delta dim">generic classes</span>
          </div>
          <div className="cell">
            <span className="k">Models</span>
            <span className="v">{totalModels}</span>
            <span className="delta dim">{totalBrands} {totalBrands === 1 ? "brand" : "brands"}</span>
          </div>
          <div className="cell">
            <span className="k">Distinct aliases</span>
            <span className="v">{distinctAliases.toLocaleString()}</span>
            <span className="delta dim">common variants</span>
          </div>
          <div className="cell">
            <span className="k">Haystack mapped</span>
            <span className="v">{haystackMapped.percent}%</span>
            <span className="delta dim">{haystackMapped.count} / {totalPoints}</span>
          </div>
          <div className="cell">
            <span className="k">Last reviewed</span>
            <span className="v">Today</span>
            <span className="delta dim">{lastReviewedDate}</span>
          </div>
        </div>

        {/* Featured entry */}
        {featured && (
          <article className="at-featured">
            <div className="left">
              <div className="eyebrow">
                <span className="star">★</span>
                <span>
                  Featured entry · <b>Most-aliased point in the atlas</b>
                </span>
              </div>
              <div className="name">{featured.concept.name}</div>
              {featured.concept.description && (
                <p className="desc">{featured.concept.description}</p>
              )}
              <dl className="quick">
                {featured.concept.brick && (
                  <>
                    <dt>Brick</dt>
                    <dd className="brick">brick:{featured.concept.brick}</dd>
                  </>
                )}
                {featured.concept.haystack?.tagString && (
                  <>
                    <dt>Haystack</dt>
                    <dd className="haystack">{featured.concept.haystack.tagString}</dd>
                  </>
                )}
                {featured.concept.unit && (
                  <>
                    <dt>Unit</dt>
                    <dd>{Array.isArray(featured.concept.unit) ? featured.concept.unit.join(" · ") : featured.concept.unit}</dd>
                  </>
                )}
                <dt>Kind</dt>
                <dd>{featured.concept.haystack?.kind || featured.concept.point_function || "Point"}</dd>
              </dl>
              <Link href={ROUTES.ATLAS_ENTRY(featured.concept.id)} className="open">
                Open full entry →
              </Link>
            </div>
            <div className="right">
              <p className="crosswalk-title">
                <span className="idx">A</span>Common aliases · {featured.aliases.common.length} known
              </p>
              <div className="at-aliases">
                {featured.aliases.common.slice(0, 24).map((a, idx) => (
                  <span key={idx} className="at-alias">{a}</span>
                ))}
              </div>
            </div>
          </article>
        )}

        {/* Trending */}
        {trending.length > 0 && (
          <div className="at-trending">
            <h3>
              <span className="idx">B</span>Most-aliased in the atlas
              <span className="small">live · {data?.points.length ?? 0} total points scanned</span>
            </h3>
            <div className="at-trending-grid">
              {trending.map((t, idx) => (
                <Link key={t.id} href={ROUTES.ATLAS_ENTRY(t.id)} className="at-trend-card">
                  <span className="rank">{String(idx + 1).padStart(2, "0")}</span>
                  <div className="body">
                    <div className="ttl">{t.name}</div>
                    <div className="sub">
                      {t.type} · {t.aliasCount} aliases
                    </div>
                  </div>
                  <span className="arr">→</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end mb-9">
          <ReportButton targetType="new_atlas_entry" isAuthenticated={!!user} variant="outline" size="sm" />
        </div>

        {/* Browse */}
        {loading || (scope !== "points" && scope !== "equipment" && atlasLoading) ? (
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
          <div className="at-empty">
            <span className="glyph">⌕</span>
            Nothing matches. Try a different alias, vendor name, or part of the description.
          </div>
        ) : (
          <div className="at-browse">
            {groups.map((group, idx) => {
              const itemCount = group.points.length + group.equipment.length + group.models.length;
              if (itemCount === 0) return null;
              const expanded = isGroupExpanded(group.id, itemCount);
              const num = String(idx + 1).padStart(2, "0");
              const kindLabel =
                group.type === "point" ? "Points" : group.type === "equipment" ? "Equipment Type" : "Brand";
              const countLabel =
                group.type === "point" ? "points" : group.type === "equipment" ? "types" : "models";
              return (
                <section key={group.id} className="at-cat" data-cat-kind={group.type}>
                  <button
                    className="at-cat-head"
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => toggleGroup(group.id)}
                  >
                    <span className="num">.{num}</span>
                    <span className="name">{group.name}</span>
                    <span className="kind">{kindLabel}</span>
                    <span className="ct">
                      <b>{itemCount}</b>
                      {countLabel}
                    </span>
                    <span className="toggle">{expanded ? "−  Collapse" : "+  Expand"}</span>
                  </button>
                  {group.desc && <p className="at-cat-desc">{group.desc}</p>}
                  {expanded && (
                    <div className="at-rows">
                      {group.points.map((entry) => (
                        <BabelEntryRow key={`pt-${entry.concept.id}`} entry={entry} type="point" />
                      ))}
                      {group.equipment.map((entry) => (
                        <BabelEntryRow key={`eq-${entry.id}`} entry={entry} type="equipment" />
                      ))}
                      {group.models.map((m) => (
                        <ModelEntryRow key={`md-${m.id}`} model={m} workedCount={modelWorkedCounts[m.id] ?? 0} />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}

        {/* API / Contribute */}
        <div className="at-cta">
          <div className="panel">
            <h4>
              <span className="idx">A</span>Recently added
            </h4>
            <p className="lede">
              New entries ship with the weekly data drop. Follow the repo for the <em>changelog</em> and submission guidelines.
            </p>
            <p className="small">Changelog · synced weekly</p>
          </div>
          <div className="panel">
            <h4>
              <span className="idx">B</span>API access
            </h4>
            <a className="lnk" href="/api/atlas/babel" target="_blank" rel="noreferrer">
              <span>/api/atlas/babel</span>
              <span className="arr">→</span>
            </a>
            <a className="lnk" href="/api/atlas/babel/categories" target="_blank" rel="noreferrer">
              <span>/api/atlas/babel/categories</span>
              <span className="arr">→</span>
            </a>
            <a className="lnk" href="/api/atlas/search?q=temperature" target="_blank" rel="noreferrer">
              <span>/api/atlas/search?q=…</span>
              <span className="arr">→</span>
            </a>
            <p className="small">No auth · JSON · stable URLs</p>
          </div>
          <div className="panel">
            <h4>
              <span className="idx">C</span>Contribute
            </h4>
            <a className="lnk" href="https://github.com/rbhans/bas-babel" target="_blank" rel="noreferrer">
              <span>↗  View on GitHub</span>
              <span className="arr">→</span>
            </a>
            <Link className="lnk" href={ROUTES.ATLAS_EQUIPMENT_ADD}>
              <span>+  Add equipment model</span>
              <span className="arr">→</span>
            </Link>
            <p className="small">PRs welcome · open reference</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function BabelViewContent() {
  return <BabelView scope="all" onScopeChange={() => {}} />;
}
