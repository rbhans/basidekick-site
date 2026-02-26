"use client";

import Link from "next/link";
import { WikiCategory, WikiTag } from "@/lib/types";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { getWikiCategoryColor } from "@/lib/wiki-colors";

interface WikiSidebarProps {
  categories: WikiCategory[];
  popularTags: WikiTag[];
  selectedCategoryId: string | null;
  onCategorySelect: (category: WikiCategory | null) => void;
}

export function WikiSidebar({
  categories,
  popularTags,
  selectedCategoryId,
  onCategorySelect,
}: WikiSidebarProps) {
  return (
    <aside className="w-full lg:w-56 shrink-0">
      <div className="sticky top-20 space-y-6">
        {/* All Articles */}
        <button
          onClick={() => onCategorySelect(null)}
          className={cn(
            "w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors",
            selectedCategoryId === null
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
              const isSelected = selectedCategoryId === cat.id;
              const color = getWikiCategoryColor(cat.name);

              return (
                <button
                  key={cat.id}
                  onClick={() => onCategorySelect(cat)}
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
                </button>
              );
            })}
          </div>
        </div>

        {/* Popular Tags */}
        {popularTags.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-3">
              Popular Tags
            </h3>
            <div className="flex flex-wrap gap-1.5 px-3">
              {popularTags.map((tag) => (
                <Link
                  key={tag.id}
                  href={ROUTES.WIKI_TAG(tag.slug)}
                  className="px-2.5 py-1 rounded-full border border-border text-[11px] font-mono text-muted-foreground hover:border-primary/30 hover:text-foreground transition-colors"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
