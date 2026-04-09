"use client";

import { useState, useRef, useEffect } from "react";
import { WikiFacetGroup } from "@/lib/types";
import { MagnifyingGlass, Funnel, X, Check, CaretDown } from "@phosphor-icons/react";

export type SortOption = "newest" | "oldest" | "popular" | "alphabetical";

interface WikiFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  facetGroups: WikiFacetGroup[];
  selectedFacets: Record<string, string[]>;
  onFacetToggle: (paramName: string, slug: string) => void;
  onClearFacets: () => void;
  onSearch: () => void;
  activeFilterCount: number;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "popular", label: "Most viewed" },
  { value: "alphabetical", label: "A–Z" },
];

const GROUP_SLUG_TO_PARAM: Record<string, string> = {
  platform_vendor: "platform",
  protocol: "protocol",
  system_domain: "domain",
  topic: "topic",
  content_format: "format",
};

export function WikiFilterBar({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  facetGroups,
  selectedFacets,
  onFacetToggle,
  onClearFacets,
  onSearch,
  activeFilterCount,
}: WikiFilterBarProps) {
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setSortOpen(false);
      }
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search Input */}
      <div className="relative flex-1 border border-border rounded-md bg-card focus-within:border-foreground transition-colors">
        <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search articles…"
          className="w-full bg-transparent border-none outline-none font-sans text-[14px] text-foreground placeholder:text-muted-foreground/60 placeholder:italic py-3 pl-11 pr-4"
          aria-label="Search wiki articles"
        />
      </div>

      <div className="flex gap-2">
        {/* Sort Dropdown */}
        <div className="relative" ref={sortRef}>
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="h-11 px-4 bg-card border border-border rounded-md flex items-center gap-2 font-mono text-[11px] uppercase tracking-[1.2px] text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
          >
            <span>{sortOptions.find((o) => o.value === sortBy)?.label}</span>
            <CaretDown className="w-3 h-3" />
          </button>

          {sortOpen && (
            <div className="absolute right-0 top-full mt-1 z-50 min-w-[160px] border border-foreground bg-card rounded-md shadow-lg overflow-hidden">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onSortChange(option.value);
                    setSortOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left font-mono text-[11px] uppercase tracking-[1.2px] hover:bg-muted flex items-center justify-between transition-colors ${
                    sortBy === option.value ? "text-accent" : "text-muted-foreground"
                  }`}
                >
                  {option.label}
                  {sortBy === option.value && <Check className="w-3 h-3" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filters Popover */}
        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="h-11 px-4 bg-card border border-border rounded-md flex items-center gap-2 font-mono text-[11px] uppercase tracking-[1.2px] text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
          >
            <Funnel className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 flex items-center justify-center bg-accent text-accent-foreground rounded-sm font-bold tabular-nums text-[10px] border border-foreground">
                {activeFilterCount}
              </span>
            )}
            <CaretDown className="w-3 h-3" />
          </button>

          {filterOpen && (
            <div className="absolute right-0 top-full mt-1 z-50 w-[300px] border border-foreground bg-card rounded-md shadow-lg overflow-hidden">
              <div className="px-3 py-2 border-b border-border flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[1.3px] text-muted-foreground">
                  Filter by facets
                </span>
                {activeFilterCount > 0 && (
                  <button
                    onClick={onClearFacets}
                    className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground hover:text-accent transition-colors flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Clear
                  </button>
                )}
              </div>
              <div className="max-h-[340px] overflow-y-auto">
                {facetGroups.map((group) => {
                  const paramName = GROUP_SLUG_TO_PARAM[group.slug];
                  if (!paramName) return null;
                  const facets = group.facets || [];
                  if (facets.length === 0) return null;
                  const selected = selectedFacets[paramName] || [];

                  return (
                    <div key={group.id}>
                      <div className="px-3 py-1.5 bg-muted border-y border-border">
                        <span className="font-mono text-[9px] font-bold text-accent tracking-[1.3px] uppercase">
                          {group.name}
                        </span>
                      </div>
                      {facets.map((facet) => {
                        const isChecked = selected.includes(facet.slug);
                        return (
                          <button
                            key={facet.id}
                            onClick={() => onFacetToggle(paramName, facet.slug)}
                            className="w-full px-3 py-2 text-left hover:bg-muted/50 flex items-center gap-2.5 transition-colors"
                          >
                            <div
                              className={`w-3.5 h-3.5 border rounded-sm flex items-center justify-center shrink-0 ${
                                isChecked
                                  ? "bg-accent border-foreground"
                                  : "border-border"
                              }`}
                            >
                              {isChecked && (
                                <Check className="w-2.5 h-2.5 text-accent-foreground" weight="bold" />
                              )}
                            </div>
                            <span className="flex-1 truncate text-[13px] text-foreground">
                              {facet.name}
                            </span>
                            {facet.article_count > 0 && (
                              <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
                                {facet.article_count}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Search Button */}
        <button
          onClick={onSearch}
          className="h-11 px-5 bg-primary text-primary-foreground rounded-md font-mono text-[11px] uppercase tracking-[1.2px] font-medium hover:bg-primary/90 transition-colors"
        >
          Search
        </button>
      </div>
    </div>
  );
}
