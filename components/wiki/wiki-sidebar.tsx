"use client";

import Link from "next/link";
import { WikiCategory, WikiTag } from "@/lib/types";
import { getIcon } from "@/lib/icons";
import { ROUTES } from "@/lib/routes";
import { BookOpen, Tag, CaretRight, House } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

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
  const renderCategory = (cat: WikiCategory, depth = 0) => {
    const isSelected = selectedCategoryId === cat.id;
    const hasChildren = cat.children && cat.children.length > 0;

    return (
      <div key={cat.id}>
        <button
          onClick={() => onCategorySelect(cat)}
          className={cn(
            "w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors",
            isSelected
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
        >
          <span className="size-4 flex items-center justify-center shrink-0">
            {cat.icon_name ? (
              getIcon(cat.icon_name, "size-3.5")
            ) : (
              <BookOpen className="size-3.5" />
            )}
          </span>
          <span className="flex-1 truncate">{cat.name}</span>
          {hasChildren && <CaretRight className="size-3 text-muted-foreground" />}
        </button>

        {hasChildren && (
          <div>
            {cat.children!
              .sort((a, b) => a.display_order - b.display_order)
              .map((child) => renderCategory(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

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
            {categories.map((cat) => renderCategory(cat))}
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
