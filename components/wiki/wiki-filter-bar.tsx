"use client";

import { useState, useRef, useEffect } from "react";
import { WikiTag } from "@/lib/types";
import { MagnifyingGlass, SortAscending, Funnel, X, Check } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export type SortOption = "newest" | "oldest" | "popular" | "alphabetical";

interface WikiFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  availableTags: WikiTag[];
  selectedTagIds: string[];
  onTagsChange: (tagIds: string[]) => void;
  onSearch: () => void;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "popular", label: "Most Viewed" },
  { value: "alphabetical", label: "A-Z" },
];

export function WikiFilterBar({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  availableTags,
  selectedTagIds,
  onTagsChange,
  onSearch,
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

  const handleTagToggle = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onTagsChange(selectedTagIds.filter((id) => id !== tagId));
    } else {
      onTagsChange([...selectedTagIds, tagId]);
    }
  };

  const clearTags = () => {
    onTagsChange([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 p-4 border border-border bg-card">
      {/* Search Input */}
      <div className="relative flex-1">
        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search articles..."
          className="w-full pl-9 pr-4 py-2 bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="flex gap-2">
        {/* Sort Dropdown */}
        <div className="relative" ref={sortRef}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOpen(!sortOpen)}
            className="flex items-center gap-2"
          >
            <SortAscending className="size-4" />
            <span className="hidden sm:inline">
              {sortOptions.find((o) => o.value === sortBy)?.label}
            </span>
          </Button>

          {sortOpen && (
            <div className="absolute right-0 top-full mt-1 z-50 min-w-[140px] border border-border bg-card shadow-lg">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onSortChange(option.value);
                    setSortOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-accent/50 flex items-center justify-between ${
                    sortBy === option.value ? "bg-accent/30" : ""
                  }`}
                >
                  {option.label}
                  {sortBy === option.value && <Check className="size-4" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tag Filter Dropdown */}
        <div className="relative" ref={filterRef}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-2"
          >
            <Funnel className="size-4" />
            <span className="hidden sm:inline">Tags</span>
            {selectedTagIds.length > 0 && (
              <span className="size-5 flex items-center justify-center bg-primary text-primary-foreground text-xs">
                {selectedTagIds.length}
              </span>
            )}
          </Button>

          {filterOpen && (
            <div className="absolute right-0 top-full mt-1 z-50 w-[220px] border border-border bg-card shadow-lg">
              <div className="p-2 border-b border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Filter by tags</span>
                {selectedTagIds.length > 0 && (
                  <button
                    onClick={clearTags}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    <X className="size-3" />
                    Clear
                  </button>
                )}
              </div>
              <div className="max-h-[200px] overflow-y-auto">
                {availableTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleTagToggle(tag.id)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-accent/50 flex items-center gap-2"
                  >
                    <div
                      className={`size-4 border flex items-center justify-center ${
                        selectedTagIds.includes(tag.id)
                          ? "bg-primary border-primary"
                          : "border-border"
                      }`}
                    >
                      {selectedTagIds.includes(tag.id) && (
                        <Check className="size-3 text-primary-foreground" />
                      )}
                    </div>
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Search Button */}
        <Button size="sm" onClick={onSearch}>
          Search
        </Button>
      </div>
    </div>
  );
}
