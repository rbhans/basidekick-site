"use client";

import { PointStackFeedFilter, PointStackPostType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Funnel } from "@phosphor-icons/react";
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
  const activeTags = currentFilter.tags || [];
  const hasActiveFilters = activeTags.length > 0 || currentFilter.type;

  const removeTag = (tag: string) => {
    const newTags = activeTags.filter((t) => t !== tag);
    onFilterChange({
      ...currentFilter,
      tags: newTags.length > 0 ? newTags : undefined,
    });
  };

  const clearAllFilters = () => {
    onFilterChange({ sortBy: currentFilter.sortBy });
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
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

      {/* Active tag filters */}
      {activeTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Funnel className="w-3.5 h-3.5 text-muted-foreground" />
          {activeTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="gap-1 pr-1 text-xs hover:bg-destructive/10 transition-colors"
            >
              #{tag}
              <button
                onClick={() => removeTag(tag)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10 transition-colors"
                aria-label={`Remove ${tag} filter`}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear all
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
