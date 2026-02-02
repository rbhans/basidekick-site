"use client";

import { PointStackFeedFilter, PointStackPostType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FeedFiltersProps {
  currentFilter: PointStackFeedFilter;
  onFilterChange: (filter: PointStackFeedFilter) => void;
  className?: string;
}

const TYPE_FILTERS: { value: PointStackPostType | undefined; label: string }[] = [
  { value: undefined, label: "All" },
  { value: "discussion", label: "Discussions" },
  { value: "question", label: "Questions" },
  { value: "tip", label: "Tips" },
  { value: "project", label: "Projects" },
];

const SORT_FILTERS: { value: "recent" | "popular" | "unanswered" | undefined; label: string }[] = [
  { value: "recent", label: "Recent" },
  { value: "popular", label: "Popular" },
  { value: "unanswered", label: "Unanswered" },
];

export function FeedFilters({ currentFilter, onFilterChange, className }: FeedFiltersProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {/* Type filters */}
      <div className="flex items-center gap-1 mr-4">
        {TYPE_FILTERS.map((filter) => (
          <Button
            key={filter.label}
            variant={currentFilter.type === filter.value ? "default" : "ghost"}
            size="sm"
            onClick={() => onFilterChange({ ...currentFilter, type: filter.value })}
            className="h-8"
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {/* Sort filters */}
      <div className="flex items-center gap-1 border-l border-border pl-4">
        {SORT_FILTERS.map((filter) => (
          <Button
            key={filter.label}
            variant={currentFilter.sortBy === filter.value ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onFilterChange({ ...currentFilter, sortBy: filter.value })}
            className="h-8"
          >
            {filter.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
