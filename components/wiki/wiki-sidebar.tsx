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
          className={`w-full text-left px-4 py-2 rounded-lg text-[13px] flex items-center gap-2 transition-colors ${
            isSelected ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
          style={{ paddingLeft: `${16 + depth * 16}px` }}
        >
          <span className="size-4 flex items-center justify-center shrink-0">
            {cat.icon_name ? (
              getIcon(cat.icon_name, "size-3.5 text-muted-foreground")
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
    <aside className="w-full lg:w-[240px] shrink-0">
      <div className="bg-card border border-border rounded-xl p-6">
        {/* All Articles */}
        <button
          onClick={() => onCategorySelect(null)}
          className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold mb-4 transition-colors ${
            selectedCategoryId === null
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          All Articles
        </button>

        {/* Categories */}
        <div className="mb-6">
          <h4 className="font-mono text-[11px] font-bold text-muted-foreground tracking-[2px] uppercase px-4 mb-3">
            CATEGORIES
          </h4>
          {categories.map((cat) => renderCategory(cat))}
        </div>

        {/* Popular Tags */}
        {popularTags.length > 0 && (
          <div>
            <h4 className="font-mono text-[11px] font-bold text-muted-foreground tracking-[2px] uppercase px-4 mb-3">
              POPULAR TAGS
            </h4>
            <div className="flex flex-wrap gap-2 px-4">
              {popularTags.map((tag) => (
                <Link
                  key={tag.id}
                  href={ROUTES.WIKI_TAG(tag.slug)}
                  className="px-3 py-1 rounded-full border border-border text-[11px] font-mono text-muted-foreground hover:border-muted-foreground hover:text-foreground transition-colors"
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
