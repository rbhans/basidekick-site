"use client";

import Link from "next/link";
import { WikiCategory, WikiTag } from "@/lib/types";
import { getIcon } from "@/lib/icons";
import { ROUTES } from "@/lib/routes";
import { BookOpen, Tag, CaretRight, House } from "@phosphor-icons/react";

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
          className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-accent/50 transition-colors ${
            isSelected ? "bg-accent text-primary" : ""
          }`}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
        >
          <span className="size-4 flex items-center justify-center shrink-0">
            {cat.icon_name ? (
              getIcon(cat.icon_name, "size-4")
            ) : (
              <BookOpen className="size-4" />
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
    <aside className="w-full lg:w-[240px] shrink-0">
      <div className="border border-border bg-card">
        {/* Categories Section */}
        <div className="p-3 border-b border-border">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Categories
          </h3>
        </div>

        <div className="py-1">
          {/* All Articles option */}
          <button
            onClick={() => onCategorySelect(null)}
            className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-accent/50 transition-colors ${
              selectedCategoryId === null ? "bg-accent text-primary" : ""
            }`}
          >
            <House className="size-4" />
            <span>All Articles</span>
          </button>

          {/* Category Tree */}
          {categories.map((cat) => renderCategory(cat))}
        </div>

        {/* Popular Tags Section */}
        {popularTags.length > 0 && (
          <>
            <div className="p-3 border-t border-border">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Popular Tags
              </h3>
            </div>
            <div className="p-3 pt-0 flex flex-wrap gap-1">
              {popularTags.map((tag) => (
                <Link
                  key={tag.id}
                  href={ROUTES.WIKI_TAG(tag.slug)}
                  className="px-2 py-1 text-xs border border-border hover:bg-accent/50 transition-colors flex items-center gap-1"
                >
                  <Tag className="size-3" />
                  {tag.name}
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
