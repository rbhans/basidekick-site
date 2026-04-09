"use client";

import { useState } from "react";
import { WikiCategory, WikiFacetGroup } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CaretDown, X, Check } from "@phosphor-icons/react";

interface WikiSidebarProps {
  categories: WikiCategory[];
  facetGroups: WikiFacetGroup[];
  selectedCategorySlug: string | null;
  selectedFacets: Record<string, string[]>;
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

function categoryGlyph(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "·";
  return trimmed[0].toUpperCase();
}

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
    <aside className="w-full lg:w-60 shrink-0">
      <div className="sticky top-20 space-y-8">
        {/* Active Filter Pills */}
        {hasActiveFilters && (
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
              <h3 className="font-mono text-[10px] uppercase tracking-[1.3px] text-muted-foreground">
                <span className="text-accent mr-1.5">·</span>
                Active filters
              </h3>
              <button
                onClick={onClearFacets}
                className="font-mono text-[9px] uppercase tracking-[1.1px] text-muted-foreground hover:text-accent transition-colors"
              >
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selectedCategorySlug && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-card border border-foreground font-mono text-[10px] text-foreground">
                  {categories.find((c) => c.slug === selectedCategorySlug)?.name || selectedCategorySlug}
                  <button
                    onClick={() => onCategorySelect(null)}
                    className="hover:text-accent"
                    aria-label="Clear category"
                  >
                    <X className="w-2.5 h-2.5" weight="bold" />
                  </button>
                </span>
              )}
              {activePills.map((pill) => (
                <span
                  key={`${pill.paramName}-${pill.slug}`}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-card border border-border font-mono text-[10px] text-foreground"
                >
                  {pill.label}
                  <button
                    onClick={() => onFacetToggle(pill.paramName, pill.slug)}
                    className="hover:text-accent"
                    aria-label="Remove filter"
                  >
                    <X className="w-2.5 h-2.5" weight="bold" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* All Articles */}
        <div>
          <h3 className="font-mono text-[10px] uppercase tracking-[1.3px] text-muted-foreground mb-3 pb-2 border-b border-border">
            <span className="text-accent mr-1.5">·</span>
            Categories
          </h3>
          <button
            onClick={() => onCategorySelect(null)}
            className={cn(
              "group w-full text-left flex items-center gap-2.5 py-2 px-1 border-b border-muted transition-colors",
              selectedCategorySlug === null
                ? "text-accent"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span className="w-6 h-6 bg-muted rounded-sm flex items-center justify-center shrink-0 font-mono text-[11px] font-bold text-foreground">
              ·
            </span>
            <span className="flex-1 font-heading text-[14px] font-semibold">
              All articles
            </span>
          </button>

          {/* Categories */}
          <div>
            {categories.map((cat) => {
              const isSelected = selectedCategorySlug === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => onCategorySelect(cat.slug)}
                  className={cn(
                    "w-full text-left flex items-center gap-2.5 py-2 px-1 border-b border-muted transition-colors",
                    isSelected
                      ? "text-accent"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "w-6 h-6 rounded-sm flex items-center justify-center shrink-0 font-mono text-[11px] font-bold transition-colors",
                      isSelected ? "bg-accent text-accent-foreground" : "bg-muted text-foreground",
                    )}
                  >
                    {categoryGlyph(cat.name)}
                  </span>
                  <span className="flex-1 font-heading text-[14px] font-semibold truncate text-foreground">
                    {cat.name}
                  </span>
                  {cat.article_count != null && (
                    <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
                      {cat.article_count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

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
                className="w-full flex items-center justify-between mb-3 pb-2 border-b border-border"
              >
                <h3 className="font-mono text-[10px] uppercase tracking-[1.3px] text-muted-foreground">
                  <span className="text-accent mr-1.5">·</span>
                  {group.name}
                </h3>
                <CaretDown
                  className={cn(
                    "w-3 h-3 text-muted-foreground transition-transform",
                    isCollapsed && "-rotate-90",
                  )}
                />
              </button>
              {!isCollapsed && (
                <div>
                  {facets.map((facet) => {
                    const isChecked = selected.includes(facet.slug);
                    return (
                      <button
                        key={facet.id}
                        onClick={() => onFacetToggle(paramName, facet.slug)}
                        className="w-full text-left flex items-center gap-2.5 py-1.5 px-1 hover:text-accent transition-colors"
                      >
                        <div
                          className={cn(
                            "w-3.5 h-3.5 border rounded-sm flex items-center justify-center shrink-0 transition-colors",
                            isChecked
                              ? "bg-accent border-foreground"
                              : "border-border",
                          )}
                        >
                          {isChecked && (
                            <Check
                              className="w-2.5 h-2.5 text-accent-foreground"
                              weight="bold"
                            />
                          )}
                        </div>
                        <span
                          className={cn(
                            "flex-1 truncate text-[13px]",
                            isChecked ? "text-foreground font-medium" : "text-muted-foreground",
                          )}
                        >
                          {facet.name}
                        </span>
                        {facet.article_count > 0 && (
                          <span className="font-mono text-[9px] text-muted-foreground tabular-nums">
                            {facet.article_count}
                          </span>
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
