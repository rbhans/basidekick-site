"use client";

import { PointStackFeedFilter, PointStackPostType } from "@/lib/types";
import { X } from "@phosphor-icons/react";

interface FeedFiltersProps {
  currentFilter: PointStackFeedFilter;
  onFilterChange: (filter: PointStackFeedFilter) => void;
  className?: string;
}

type TabItem =
  | { kind: "type"; value: PointStackPostType | undefined; label: string }
  | { kind: "sort"; value: "recent" | "popular" | "unanswered"; label: string };

const TYPE_TABS: TabItem[] = [
  { kind: "type", value: undefined, label: "All" },
  { kind: "type", value: "discussion", label: "Discussions" },
  { kind: "type", value: "question", label: "Questions" },
  { kind: "type", value: "tip", label: "Tips" },
  { kind: "type", value: "project", label: "Projects" },
];

const SORT_TABS: TabItem[] = [
  { kind: "sort", value: "recent", label: "Recent" },
  { kind: "sort", value: "popular", label: "Popular" },
  { kind: "sort", value: "unanswered", label: "Unanswered" },
];

export function FeedFilters({ currentFilter, onFilterChange, className }: FeedFiltersProps) {
  const activeTags = currentFilter.tags || [];

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

  return (
    <div className={`ps-filters ${className ?? ""}`}>
      {TYPE_TABS.map((tab) => (
        <button
          key={tab.label}
          onClick={() => handleTabClick(tab)}
          aria-selected={isTabActive(tab)}
          className="ps-pill"
        >
          {tab.label === "Questions" && <span className="q-mark">?</span>}
          {tab.label}
        </button>
      ))}
      <span className="ps-filter-divider" aria-hidden />
      {SORT_TABS.map((tab) => (
        <button
          key={tab.label}
          onClick={() => handleTabClick(tab)}
          aria-selected={isTabActive(tab)}
          className="ps-pill"
        >
          {tab.label}
        </button>
      ))}

      {activeTags.length > 0 && (
        <div className="flex w-full items-center gap-2 mt-3 flex-wrap">
          {activeTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-1 font-mono text-[10px] text-ink-2 bg-[var(--punch-soft)] border border-[var(--punch-soft-2)] rounded-sm"
            >
              #{tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-punch hover:text-ink transition-colors"
                aria-label={`Remove ${tag} filter`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
