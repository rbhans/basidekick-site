"use client";

import { PointStackFeedFilter, PointStackPostType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { X, Funnel } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface FeedFiltersProps {
  currentFilter: PointStackFeedFilter;
  onFilterChange: (filter: PointStackFeedFilter) => void;
  className?: string;
}

type TabItem =
  | { kind: "type"; value: PointStackPostType | undefined; label: string }
  | { kind: "sort"; value: "recent" | "popular" | "unanswered"; label: string };

const TAB_ITEMS: TabItem[] = [
  { kind: "type", value: undefined, label: "All" },
  { kind: "type", value: "discussion", label: "Discussions" },
  { kind: "type", value: "question", label: "Questions" },
  { kind: "type", value: "tip", label: "Tips" },
  { kind: "type", value: "project", label: "Projects" },
  { kind: "sort", value: "recent", label: "Recent" },
  { kind: "sort", value: "popular", label: "Popular" },
  { kind: "sort", value: "unanswered", label: "Unanswered" },
];

export function FeedFilters({ currentFilter, onFilterChange, className }: FeedFiltersProps) {
  const activeTags = currentFilter.tags || [];
  const hasActiveFilters = activeTags.length > 0 || currentFilter.type;

  const isTabActive = (tab: TabItem) => {
    if (tab.kind === "type") {
      return currentFilter.type === tab.value && !currentFilter.sortBy;
    }
    return currentFilter.sortBy === tab.value;
  };

  const handleTabClick = (tab: TabItem) => {
    if (tab.kind === "type") {
      onFilterChange({ ...currentFilter, type: tab.value, sortBy: undefined });
    } else {
      onFilterChange({ ...currentFilter, sortBy: tab.value, type: undefined });
    }
  };

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
      <div className="flex items-center gap-2 flex-wrap">
        {TAB_ITEMS.map((tab) => (
          <button
            key={tab.label}
            onClick={() => handleTabClick(tab)}
            className={cn(
              "px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors",
              isTabActive(tab)
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground/70 hover:bg-muted/50"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active tag filters */}
      {activeTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Funnel className="w-3.5 h-3.5 text-muted-foreground" />
          {activeTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-border text-[11px] font-mono text-muted-foreground"
            >
              #{tag}
              <button
                onClick={() => removeTag(tag)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10 transition-colors"
                aria-label={`Remove ${tag} filter`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
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
