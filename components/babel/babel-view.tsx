"use client";

import { useState, useMemo } from "react";
import { BabelSidebar } from "./babel-sidebar";
import { BabelSearch } from "./babel-search";
import { BabelEntryCard } from "./babel-entry-card";
import { useBabelAll } from "./use-babel-data";
import { GithubLogo, ArrowSquareOut, Code, Copy, Broom } from "@phosphor-icons/react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

type HeroNodeTone = "cyan" | "emerald" | "amber" | "rose" | "indigo" | "slate";

type HeroNode = {
  id: string;
  label: string;
  detail: string;
  x: number;
  y: number;
  tone: HeroNodeTone;
};

const HERO_CENTER = {
  label: "BAS Babel",
  detail: "Canonical Concepts",
  x: 50,
  y: 50,
};

const HERO_NODES: HeroNode[] = [
  { id: "aliases", label: "Aliases", detail: "Vendor + Misspellings", x: 19, y: 22, tone: "cyan" },
  { id: "normalizer", label: "Normalizer", detail: "Name Matching", x: 31, y: 80, tone: "emerald" },
  { id: "search", label: "Search Index", detail: "Weighted Tokens", x: 14, y: 54, tone: "indigo" },
  { id: "templates", label: "Templates", detail: "Equipment to Points", x: 78, y: 17, tone: "amber" },
  { id: "validator", label: "Validator", detail: "Required + Suggested", x: 85, y: 49, tone: "rose" },
  { id: "graph", label: "Graph Layer", detail: "Related Traversal", x: 74, y: 79, tone: "slate" },
];

const HERO_LINKS: Array<{ from: string; to: string }> = [
  { from: "aliases", to: "normalizer" },
  { from: "search", to: "normalizer" },
  { from: "templates", to: "validator" },
  { from: "graph", to: "validator" },
  { from: "search", to: "templates" },
];

function heroNodeToneClasses(tone: HeroNodeTone) {
  switch (tone) {
    case "cyan":
      return "border-cyan-500/40 bg-cyan-500/10 text-cyan-200";
    case "emerald":
      return "border-emerald-500/40 bg-emerald-500/10 text-emerald-200";
    case "amber":
      return "border-amber-500/40 bg-amber-500/10 text-amber-200";
    case "rose":
      return "border-rose-500/40 bg-rose-500/10 text-rose-200";
    case "indigo":
      return "border-indigo-500/40 bg-indigo-500/10 text-indigo-200";
    case "slate":
    default:
      return "border-slate-400/40 bg-slate-500/10 text-slate-200";
  }
}

export function BabelView() {
  // Use combined hook for parallel data fetching
  const { data, categories, loading, error: dataError } = useBabelAll();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showApi, setShowApi] = useState(false);

  const apiEndpoints = [
    {
      name: "Full Dataset",
      url: "https://raw.githubusercontent.com/rbhans/bas-babel/main/dist/index.json",
      description: "Complete point and equipment definitions",
    },
    {
      name: "Categories",
      url: "https://raw.githubusercontent.com/rbhans/bas-babel/main/dist/categories.json",
      description: "Category tree with counts",
    },
    {
      name: "Search Index",
      url: "https://raw.githubusercontent.com/rbhans/bas-babel/main/dist/search-index.json",
      description: "Pre-tokenized search data",
    },
  ];

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("API URL copied");
  };

  // Filter and search entries
  const filteredEntries = useMemo(() => {
    if (!data) return { points: [], equipment: [] };

    let points = [...data.points];
    let equipment = [...data.equipment];

    // Filter by category
    if (selectedCategory) {
      // Check if it's an equipment category
      const isEquipmentCategory = ["air-handling", "terminal-units", "central-plant", "metering", "motors", "vrf"].includes(selectedCategory);

      if (isEquipmentCategory) {
        points = [];
        equipment = equipment.filter((e) => e.category === selectedCategory);
      } else {
        equipment = [];
        points = points.filter((p) => p.concept.category === selectedCategory);
      }
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();

      points = points.filter((entry) => {
        // Search in name
        if (entry.concept.name.toLowerCase().includes(query)) return true;
        // Search in description
        if (entry.concept.description?.toLowerCase().includes(query)) return true;
        // Search in haystack
        if (entry.concept.haystack?.toLowerCase().includes(query)) return true;
        // Search in aliases
        const allAliases = [
          ...entry.aliases.common,
          ...(entry.aliases.misspellings || []),
        ];
        return allAliases.some((a) => a.toLowerCase().includes(query));
      });

      equipment = equipment.filter((entry) => {
        if (entry.name.toLowerCase().includes(query)) return true;
        if (entry.full_name?.toLowerCase().includes(query)) return true;
        if (entry.description?.toLowerCase().includes(query)) return true;
        return entry.aliases.common.some((a) => a.toLowerCase().includes(query));
      });
    }

    return { points, equipment };
  }, [data, searchQuery, selectedCategory]);

  const totalResults = filteredEntries.points.length + filteredEntries.equipment.length;
  const totalEntries = data ? data.totalPoints + data.totalEquipment : 0;

  if (dataError) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load babel data</p>
          <p className="text-sm text-muted-foreground mt-1">{dataError.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      {/* Hero */}
      <section className="relative overflow-hidden py-12 md:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.14),_transparent_42%),radial-gradient(circle_at_85%_25%,_rgba(16,185,129,0.12),_transparent_44%),radial-gradient(circle_at_30%_100%,_rgba(245,158,11,0.10),_transparent_52%)]" />
        <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] [background-size:36px_36px]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,620px)] lg:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                BAS Resource Graph
              </p>
              <h1 className="mt-4 text-3xl md:text-5xl font-semibold tracking-tight">
                BAS Babel as a connected data map
              </h1>
              <p className="mt-4 max-w-xl text-sm md:text-base text-muted-foreground">
                Explore how aliases, templates, search indexing, and validation link together around canonical
                BAS point and equipment concepts. The dataset remains backward-compatible while adding richer
                relationships for tooling and discovery.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  href="https://github.com/rbhans/bas-babel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors rounded-md"
                >
                  <GithubLogo className="size-4" weight="bold" />
                  Open Repository
                  <ArrowSquareOut className="size-3" />
                </a>
                <Link
                  href="/babel/cleaner"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border hover:bg-muted transition-colors rounded-md"
                >
                  <Broom className="size-4" weight="bold" />
                  Point Name Cleaner
                </Link>
                <button
                  onClick={() => setShowApi(!showApi)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border hover:bg-muted transition-colors rounded-md"
                >
                  <Code className="size-4" weight="bold" />
                  {showApi ? "Hide API Access" : "Show API Access"}
                </button>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-2 max-w-md">
                <div className="rounded-lg border border-border/80 bg-background/70 px-3 py-2 backdrop-blur">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Points</p>
                  <p className="mt-1 text-base font-semibold">{loading ? "..." : data?.totalPoints ?? 0}</p>
                </div>
                <div className="rounded-lg border border-border/80 bg-background/70 px-3 py-2 backdrop-blur">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Equipment</p>
                  <p className="mt-1 text-base font-semibold">{loading ? "..." : data?.totalEquipment ?? 0}</p>
                </div>
                <div className="rounded-lg border border-border/80 bg-background/70 px-3 py-2 backdrop-blur">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Results</p>
                  <p className="mt-1 text-base font-semibold">{loading ? "..." : totalResults}</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-2xl border border-border/70 bg-background/80 p-4 md:p-6 shadow-sm backdrop-blur">
                <p className="mb-4 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  Connected Layers
                </p>
                <div className="relative mx-auto aspect-[4/3] w-full max-w-[620px]">
                  <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
                    {HERO_NODES.map((node) => (
                      <line
                        key={`${node.id}-root`}
                        x1={HERO_CENTER.x}
                        y1={HERO_CENTER.y}
                        x2={node.x}
                        y2={node.y}
                        stroke="hsl(var(--muted-foreground) / 0.35)"
                        strokeWidth="0.65"
                      />
                    ))}
                    {HERO_LINKS.map((link) => {
                      const from = HERO_NODES.find((node) => node.id === link.from);
                      const to = HERO_NODES.find((node) => node.id === link.to);
                      if (!from || !to) return null;
                      return (
                        <line
                          key={`${link.from}-${link.to}`}
                          x1={from.x}
                          y1={from.y}
                          x2={to.x}
                          y2={to.y}
                          stroke="hsl(var(--muted-foreground) / 0.20)"
                          strokeWidth="0.45"
                          strokeDasharray="1.6 1.2"
                        />
                      );
                    })}
                  </svg>

                  <div
                    className="absolute w-[32%] min-w-[148px] max-w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-primary/45 bg-primary/10 px-3 py-2.5 text-center shadow-sm"
                    style={{ left: `${HERO_CENTER.x}%`, top: `${HERO_CENTER.y}%` }}
                  >
                    <p className="text-sm font-semibold">{HERO_CENTER.label}</p>
                    <p className="mt-1 text-[11px] text-primary/80">{HERO_CENTER.detail}</p>
                  </div>

                  {HERO_NODES.map((node) => (
                    <div
                      key={node.id}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-lg border px-2.5 py-2 text-center shadow-sm transition-transform duration-300 hover:scale-[1.03] ${heroNodeToneClasses(node.tone)} w-[24%] min-w-[112px] max-w-[170px]`}
                      style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    >
                      <p className="text-[11px] font-semibold leading-tight">{node.label}</p>
                      <p className="mt-1 text-[10px] opacity-90 leading-tight">{node.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {showApi && (
            <div className="mt-8 p-4 bg-muted/50 rounded-lg border">
              <h3 className="text-sm font-semibold mb-2">Free JSON API</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Access the complete dataset via jsDelivr CDN. No authentication required.
              </p>
              <div className="space-y-3">
                {apiEndpoints.map((endpoint) => (
                  <div key={endpoint.name} className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{endpoint.name}</p>
                      <p className="text-xs text-muted-foreground">{endpoint.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-background px-2 py-1 rounded border truncate max-w-[300px]">
                        {endpoint.url}
                      </code>
                      <button
                        onClick={() => copyToClipboard(endpoint.url)}
                        className="shrink-0 p-1.5 hover:bg-background rounded transition-colors"
                        title="Copy URL"
                      >
                        <Copy className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-2">Example usage:</p>
                <pre className="text-xs bg-background p-3 rounded border overflow-x-auto">
{`fetch("https://raw.githubusercontent.com/rbhans/bas-babel/main/dist/index.json")
  .then(res => res.json())
  .then(data => console.log(data));`}
                </pre>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            {loading ? (
              <aside className="w-full lg:w-56 shrink-0 space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </aside>
            ) : (
              <BabelSidebar
                categories={categories?.categories || []}
                selectedCategory={selectedCategory}
                onCategorySelect={setSelectedCategory}
              />
            )}

            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Search */}
              <BabelSearch
                query={searchQuery}
                onQueryChange={setSearchQuery}
                resultCount={totalResults}
                totalCount={totalEntries}
              />

              {/* Results */}
              <div className="mt-6">
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <Skeleton key={i} className="h-32" />
                    ))}
                  </div>
                ) : totalResults === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No entries found</p>
                    {searchQuery && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Try a different search term
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Equipment results */}
                    {filteredEntries.equipment.length > 0 && (
                      <div>
                        {!selectedCategory && (
                          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                            Equipment ({filteredEntries.equipment.length})
                          </h2>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {filteredEntries.equipment.map((entry) => (
                            <BabelEntryCard
                              key={entry.id}
                              entry={entry}
                              type="equipment"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Point results */}
                    {filteredEntries.points.length > 0 && (
                      <div>
                        {!selectedCategory && (
                          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                            Points ({filteredEntries.points.length})
                          </h2>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {filteredEntries.points.map((entry) => (
                            <BabelEntryCard
                              key={entry.concept.id}
                              entry={entry}
                              type="point"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
