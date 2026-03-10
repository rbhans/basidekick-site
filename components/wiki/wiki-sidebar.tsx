"use client";

import { useState } from "react";
import { WikiCategory, WikiFacetGroup, WikiFacet } from "@/lib/types";
import { cn } from "@/lib/utils";
import { getWikiCategoryColor } from "@/lib/wiki-colors";
import { CaretDown, X } from "@phosphor-icons/react";

interface WikiSidebarProps {
  categories: WikiCategory[];
  facetGroups: WikiFacetGroup[];
  selectedCategorySlug: string | null;
  selectedFacets: Record<string, string[]>; // paramName → slugs
  onCategorySelect: (slug: string | null) => void;
  onFacetToggle: (paramName: string, slug: string) => void;
  onClearFacets: () => void;
}

const GROUP_SLUG_TO_PARAM: Record<string, string> = {
  platform_vendor: "platform",
  protocol: "protocol",
  system_domain: "domain",
  topic: "topic",
  content_format: "format",
};

export function WikiSidebar({
  categories,
  facetGroups,
  selectedCategorySlug,
  selectedFacets,
  onCategorySelect,
  onFacetToggle,
  onClearFacets,
}: WikiSidebarProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (groupSlug: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupSlug)) {
        next.delete(groupSlug);
      } else {
        next.add(groupSlug);
      }
      return next;
    });
  };

  // Collect all active filter pills
  const activePills: { paramName: string; slug: string; label: string }[] = [];
  for (const group of facetGroups) {
    const paramName = GROUP_SLUG_TO_PARAM[group.slug];
    if (!paramName) continue;
    const selected = selectedFacets[paramName] || [];
    for (const slug of selected) {
      const facet = group.facets?.find((f) => f.slug === slug);
      if (facet) {
        activePills.push({ paramName, slug, label: facet.name });
      }
    }
  }

  const hasActiveFilters = !!selectedCategorySlug || activePills.length > 0;

  return (
    <aside className="w-full lg:w-56 shrink-0">
      <div className="sticky top-20 space-y-6">
        {/* Active Filter Pills */}
        {hasActiveFilters && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Active Filters
              </h3>
              <button
                onClick={onClearFacets}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 px-3">
              {selectedCategorySlug && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-mono">
                  {categories.find((c) => c.slug === selectedCategorySlug)?.name || selectedCategorySlug}
                  <button onClick={() => onCategorySelect(null)} className="hover:text-foreground">
                    <X className="size-3" />
                  </button>
                </span>
              )}
              {activePills.map((pill) => (
                <span
                  key={`${pill.paramName}-${pill.slug}`}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-foreground text-[11px] font-mono"
                >
                  {pill.label}
                  <button
                    onClick={() => onFacetToggle(pill.paramName, pill.slug)}
                    className="hover:text-primary"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* All Articles */}
        <button
          onClick={() => onCategorySelect(null)}
          className={cn(
            "w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors",
            selectedCategorySlug === null
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          All Articles
        </button>

        {/* Categories */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-3">
            Categories
          </h3>
          <div className="space-y-0.5">
            {categories.map((cat) => {
              const isSelected = selectedCategorySlug === cat.slug;
              const color = cat.color || getWikiCategoryColor(cat.name, cat.slug);

              return (
                <button
                  key={cat.id}
                  onClick={() => onCategorySelect(cat.slug)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors",
                    isSelected
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <span
                    className="size-2 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="flex-1 truncate">{cat.name}</span>
                  {cat.article_count != null && (
                    <span className="text-[11px] text-muted-foreground/60">{cat.article_count}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Facet Groups */}
        {facetGroups.map((group) => {
          const paramName = GROUP_SLUG_TO_PARAM[group.slug];
          if (!paramName) return null;
          const selected = selectedFacets[paramName] || [];
          const isCollapsed = collapsedGroups.has(group.slug);
          const facets = group.facets || [];
          if (facets.length === 0) return null;

          return (
            <div key={group.id}>
              <button
                onClick={() => toggleGroup(group.slug)}
                className="w-full flex items-center justify-between px-3 mb-2"
              >
                <h3 className="font-mono text-[11px] font-bold text-muted-foreground tracking-[1.5px] uppercase">
                  {group.name}
                </h3>
                <CaretDown
                  className={cn(
                    "size-3 text-muted-foreground transition-transform",
                    isCollapsed && "-rotate-90"
                  )}
                />
              </button>
              {!isCollapsed && (
                <div className="space-y-0.5">
                  {facets.map((facet) => {
                    const isChecked = selected.includes(facet.slug);
                    return (
                      <button
                        key={facet.id}
                        onClick={() => onFacetToggle(paramName, facet.slug)}
                        className={cn(
                          "w-full text-left px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-colors",
                          isChecked
                            ? "bg-muted/70 text-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                      >
                        <div
                          className={cn(
                            "size-3.5 border rounded flex items-center justify-center shrink-0 transition-colors",
                            isChecked ? "bg-primary border-primary" : "border-border"
                          )}
                        >
                          {isChecked && (
                            <svg className="size-2.5 text-primary-foreground" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <span className="flex-1 truncate text-[13px]">{facet.name}</span>
                        {facet.article_count > 0 && (
                          <span className="text-[11px] text-muted-foreground/60">({facet.article_count})</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
