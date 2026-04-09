"use client";

import { PointStackFeedFilter, PointStackPostType } from "@/lib/types";
import { X, Funnel } from "@phosphor-icons/react";

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
    <div className={`space-y-4 ${className || ""}`}>
      <div className="flex items-center gap-2 flex-wrap">
        {TAB_ITEMS.map((tab) => {
          const active = isTabActive(tab);
          return (
            <button
              key={tab.label}
              onClick={() => handleTabClick(tab)}
              className={`px-3 py-1.5 border rounded-sm font-mono text-[10px] uppercase tracking-[1.2px] transition-colors ${
                active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Active tag filters */}
      {activeTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Funnel className="w-3 h-3 text-muted-foreground" />
          {activeTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-1 border border-border font-mono text-[10px] text-muted-foreground"
            >
              #{tag}
              <button
                onClick={() => removeTag(tag)}
                className="hover:text-foreground transition-colors"
                aria-label={`Remove ${tag} filter`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground hover:text-accent transition-colors ml-1"
            >
              Clear all →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
