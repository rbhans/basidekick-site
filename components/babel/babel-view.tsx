"use client";

import { useState, useMemo } from "react";
import { SectionLabel } from "@/components/section-label";
import { CircuitBackground } from "@/components/circuit-background";
import { BabelSidebar } from "./babel-sidebar";
import { BabelSearch } from "./babel-search";
import { BabelEntryCard } from "./babel-entry-card";
import { useBabelData, useBabelCategories } from "./use-babel-data";
import { GithubLogo, ArrowSquareOut, Code, Copy, Check } from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";
import type { BabelPointEntry, BabelEquipmentEntry } from "@/lib/types";

export function BabelView() {
  const { data, loading: dataLoading, error: dataError } = useBabelData();
  const { categories, loading: categoriesLoading } = useBabelCategories();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showApi, setShowApi] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const apiEndpoints = [
    {
      name: "Full Dataset",
      url: "https://cdn.jsdelivr.net/gh/rbhans/bas-babel@main/dist/index.json",
      description: "Complete point and equipment definitions",
    },
    {
      name: "Categories",
      url: "https://cdn.jsdelivr.net/gh/rbhans/bas-babel@main/dist/categories.json",
      description: "Category tree with counts",
    },
    {
      name: "Search Index",
      url: "https://cdn.jsdelivr.net/gh/rbhans/bas-babel@main/dist/search-index.json",
      description: "Pre-tokenized search data",
    },
  ];

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
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
          ...(entry.aliases.abbreviated || []),
          ...(entry.aliases.verbose || []),
          ...(entry.aliases.misspellings || []),
        ];
        return allAliases.some((a) => a.toLowerCase().includes(query));
      });

      equipment = equipment.filter((entry) => {
        if (entry.name.toLowerCase().includes(query)) return true;
        if (entry.full_name.toLowerCase().includes(query)) return true;
        if (entry.description?.toLowerCase().includes(query)) return true;
        const allAliases = [
          ...entry.aliases.common,
          ...(entry.aliases.abbreviated || []),
        ];
        return allAliases.some((a) => a.toLowerCase().includes(query));
      });
    }

    return { points, equipment };
  }, [data, searchQuery, selectedCategory]);

  const totalResults = filteredEntries.points.length + filteredEntries.equipment.length;
  const totalEntries = data ? data.totalPoints + data.totalEquipment : 0;

  const loading = dataLoading || categoriesLoading;

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
      {/* Header */}
      <section className="relative py-12 overflow-hidden">
        <CircuitBackground opacity={0.15} />
        <div className="container mx-auto px-4 relative z-10">
          <SectionLabel>resources</SectionLabel>

          <h1 className="mt-6 text-3xl md:text-4xl font-semibold tracking-tight">
            BAS Babel
          </h1>
          <p className="mt-3 text-muted-foreground max-w-xl">
            Point naming standards and aliases across BAS platforms. Translate between
            vendor conventions, Haystack tags, and Brick schema.
          </p>

          <div className="mt-4 flex items-center gap-4">
            <a
              href="https://github.com/rbhans/bas-babel"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <GithubLogo className="size-4" />
              View on GitHub
              <ArrowSquareOut className="size-3" />
            </a>
            <button
              onClick={() => setShowApi(!showApi)}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Code className="size-4" />
              API Access
            </button>
          </div>

          {/* API Section */}
          {showApi && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
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
                        {copiedUrl === endpoint.url ? (
                          <Check className="size-4 text-green-500" />
                        ) : (
                          <Copy className="size-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-2">Example usage:</p>
                <pre className="text-xs bg-background p-3 rounded border overflow-x-auto">
{`fetch("https://cdn.jsdelivr.net/gh/rbhans/bas-babel@main/dist/index.json")
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
