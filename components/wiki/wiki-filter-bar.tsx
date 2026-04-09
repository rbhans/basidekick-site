"use client";

import { useState, useRef, useEffect } from "react";
import { WikiFacetGroup } from "@/lib/types";
import { MagnifyingGlass, SortAscending, Funnel, X, Check, CaretDown } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

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
  { value: "popular", label: "Most Viewed" },
  { value: "alphabetical", label: "A-Z" },
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
      <div className="relative flex-1">
        <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search articles..."
          className="w-full h-11 bg-card border border-border rounded-md pl-11 pr-4 text-sm focus:outline-none focus:border-muted-foreground transition-colors"
        />
      </div>

      <div className="flex gap-2">
        {/* Sort Dropdown */}
        <div className="relative" ref={sortRef}>
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="h-11 px-4 bg-card border border-border rounded-md flex items-center gap-2 text-muted-foreground hover:border-muted-foreground transition-colors"
          >
            <span className="text-[13px]">
              {sortOptions.find((o) => o.value === sortBy)?.label}
            </span>
            <CaretDown className="size-4" />
          </button>

          {sortOpen && (
            <div className="absolute right-0 top-full mt-1 z-50 min-w-[140px] border border-border bg-card rounded-md shadow-lg overflow-hidden">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onSortChange(option.value);
                    setSortOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center justify-between transition-colors ${
                    sortBy === option.value ? "bg-muted/50" : ""
                  }`}
                >
                  {option.label}
                  {sortBy === option.value && <Check className="size-4 text-primary" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filters Popover */}
        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="h-11 px-4 bg-card border border-border rounded-md flex items-center gap-2 text-muted-foreground hover:border-muted-foreground transition-colors"
          >
            <Funnel className="size-4" />
            <span className="text-[13px]">Filters</span>
            {activeFilterCount > 0 && (
              <span className="size-5 flex items-center justify-center bg-primary text-primary-foreground text-xs rounded-full font-bold">
                {activeFilterCount}
              </span>
            )}
            <CaretDown className="size-4" />
          </button>

          {filterOpen && (
            <div className="absolute right-0 top-full mt-1 z-50 w-[280px] border border-border bg-card rounded-md shadow-lg overflow-hidden">
              <div className="p-2 border-b border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Filter by facets</span>
                {activeFilterCount > 0 && (
                  <button
                    onClick={onClearFacets}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    <X className="size-3" />
                    Clear
                  </button>
                )}
              </div>
              <div className="max-h-[320px] overflow-y-auto">
                {facetGroups.map((group) => {
                  const paramName = GROUP_SLUG_TO_PARAM[group.slug];
                  if (!paramName) return null;
                  const facets = group.facets || [];
                  if (facets.length === 0) return null;
                  const selected = selectedFacets[paramName] || [];

                  return (
                    <div key={group.id}>
                      <div className="px-3 py-1.5 bg-muted/30">
                        <span className="font-mono text-[10px] font-bold text-muted-foreground tracking-[1.5px] uppercase">
                          {group.name}
                        </span>
                      </div>
                      {facets.map((facet) => {
                        const isChecked = selected.includes(facet.slug);
                        return (
                          <button
                            key={facet.id}
                            onClick={() => onFacetToggle(paramName, facet.slug)}
                            className="w-full px-3 py-1.5 text-left text-sm hover:bg-muted flex items-center gap-2 transition-colors"
                          >
                            <div
                              className={`size-3.5 border rounded flex items-center justify-center shrink-0 ${
                                isChecked ? "bg-primary border-primary" : "border-border"
                              }`}
                            >
                              {isChecked && <Check className="size-2.5 text-primary-foreground" />}
                            </div>
                            <span className="flex-1 truncate text-[13px]">{facet.name}</span>
                            {facet.article_count > 0 && (
                              <span className="text-[11px] text-muted-foreground/60">({facet.article_count})</span>
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
        <Button onClick={onSearch} className="h-11 px-5 rounded-md font-semibold">
          Search
        </Button>
      </div>
    </div>
  );
}
