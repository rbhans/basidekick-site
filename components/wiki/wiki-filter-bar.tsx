"use client";

import { useState, useRef, useEffect } from "react";
import { WikiTag } from "@/lib/types";
import { MagnifyingGlass, SortAscending, Funnel, X, Check, CaretDown } from "@phosphor-icons/react";
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
          className="w-full h-11 bg-card border border-border rounded-xl pl-11 pr-4 text-sm focus:outline-none focus:border-muted-foreground transition-colors"
        />
      </div>

      <div className="flex gap-2">
        {/* Sort Dropdown */}
        <div className="relative" ref={sortRef}>
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="h-11 px-4 bg-card border border-border rounded-xl flex items-center gap-2 text-muted-foreground hover:border-muted-foreground transition-colors"
          >
            <span className="text-[13px]">
              {sortOptions.find((o) => o.value === sortBy)?.label}
            </span>
            <CaretDown className="size-4" />
          </button>

          {sortOpen && (
            <div className="absolute right-0 top-full mt-1 z-50 min-w-[140px] border border-border bg-card rounded-xl shadow-lg overflow-hidden">
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

        {/* Tag Filter Dropdown */}
        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="h-11 px-4 bg-card border border-border rounded-xl flex items-center gap-2 text-muted-foreground hover:border-muted-foreground transition-colors"
          >
            <Funnel className="size-4" />
            <span className="text-[13px]">Tags</span>
            {selectedTagIds.length > 0 && (
              <span className="size-5 flex items-center justify-center bg-primary text-primary-foreground text-xs rounded-full font-bold">
                {selectedTagIds.length}
              </span>
            )}
            <CaretDown className="size-4" />
          </button>

          {filterOpen && (
            <div className="absolute right-0 top-full mt-1 z-50 w-[220px] border border-border bg-card rounded-xl shadow-lg overflow-hidden">
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
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 transition-colors"
                  >
                    <div
                      className={`size-4 border rounded flex items-center justify-center ${
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
        <Button onClick={onSearch} className="h-11 px-5 rounded-xl font-semibold">
          Search
        </Button>
      </div>
    </div>
  );
}
