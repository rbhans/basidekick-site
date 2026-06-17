"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  DownloadSimple,
  Plus,
  Heart,
  ChatCircle,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/lib/routes";
import { PointStackResourceListing, PointStackResourceCategory } from "@/lib/types";
import * as api from "../pointstack-api";
import { CreateResourceDialog } from "./create-resource-dialog";

const CATEGORY_LABELS: Record<PointStackResourceCategory, string> = {
  template: "Templates",
  script: "Scripts",
  document: "Documents",
  guide: "Guides",
  tool: "Projects",
  other: "Other",
};

const CATEGORY_CHIPS: { key: string | undefined; label: string }[] = [
  { key: undefined, label: "All" },
  { key: "template", label: "Templates" },
  { key: "script", label: "Scripts" },
  { key: "document", label: "Documents" },
  { key: "guide", label: "Guides" },
  { key: "tool", label: "Projects" },
];

export function PointStackResourcesView() {
  const { user } = useAuth();
  const [resources, setResources] = useState<PointStackResourceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");

  const loadResources = useCallback(async () => {
    setLoading(true);
    try {
      let data = await api.fetchResources(category);
      data = await api.enrichResourcesWithVotes(data, user ?? null);
      setResources(data);
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setLoading(false);
    }
  }, [category, user]);

  useEffect(() => {
    void loadResources();
  }, [loadResources]);

  const filteredResources = useMemo(() => {
    if (!searchQuery.trim()) return resources;
    const q = searchQuery.toLowerCase();
    return resources.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.tags.some((tag) => tag.toLowerCase().includes(q)),
    );
  }, [resources, searchQuery]);

  const availableTags = useMemo(
    () => Array.from(new Set(resources.flatMap((resource) => resource.tags))).sort(),
    [resources],
  );

  return (
    <section className="container mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-16 py-10">
      {/* Section heading */}
      <div className="flex items-baseline gap-3.5 pb-3.5 border-b border-foreground mb-6">
        <span className="font-mono text-[11px] text-accent tracking-[1px]">01 /</span>
        <h1 className="font-heading font-semibold text-[26px] leading-none text-foreground">
          Resources
        </h1>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground tabular-nums">
          {filteredResources.length} {filteredResources.length === 1 ? "item" : "items"}
        </span>
        {user && (
          <CreateResourceDialog
            suggestedTags={availableTags}
            onCreated={async () => {
              await loadResources();
            }}
            trigger={
              <button className="ml-3 font-mono text-[10px] uppercase tracking-[1.2px] text-foreground hover:text-accent transition-colors inline-flex items-center gap-1">
                <Plus className="w-3 h-3" />
                Share
              </button>
            }
          />
        )}
      </div>

      <p className="italic text-[15px] text-muted-foreground mb-7">
        Templates, scripts, references, files, and project links the community has shared.
      </p>

      {/* Search */}
      <div className="relative border border-border rounded-md bg-card focus-within:border-foreground transition-colors mb-5">
        <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by title or description…"
          className="w-full bg-transparent border-none outline-none font-sans text-[14px] text-foreground placeholder:text-muted-foreground/60 placeholder:italic py-3 pl-11 pr-4"
          aria-label="Search resources"
        />
      </div>

      {/* Category chips */}
      <div className="flex items-center gap-3 mb-8 flex-wrap font-mono text-[11px] uppercase tracking-[1.2px] text-muted-foreground">
        <span>Kind</span>
        {CATEGORY_CHIPS.map((chip) => (
          <button
            key={chip.label}
            onClick={() => setCategory(chip.key)}
            className={`px-3 py-1.5 border rounded-sm transition-colors ${
              category === chip.key
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-[1fr_auto] gap-4 py-4 px-2 border-b border-muted">
              <div>
                <Skeleton className="h-5 w-60 mb-2" />
                <Skeleton className="h-4 w-full max-w-md mb-2" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-4 w-16 self-center" />
            </div>
          ))}
        </div>
      )}

      {/* Resources list */}
      {!loading && filteredResources.length > 0 && (
        <div className="space-y-0">
          {filteredResources.map((resource) => (
            <Link
              key={resource.id}
              href={ROUTES.POINTSTACK_RESOURCE(resource.slug)}
              className="group grid grid-cols-[1fr_auto] gap-5 items-start py-4 px-2 border-b border-muted hover:bg-muted/40 transition-colors"
            >
              <div className="min-w-0">
                <div className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground mb-1 flex items-center gap-2">
                  <span className="text-accent">{CATEGORY_LABELS[resource.category]}</span>
                  {resource.is_free ? (
                    <span>· Free</span>
                  ) : (
                    <span className="text-accent">· Premium</span>
                  )}
                </div>
                <h3 className="font-heading font-semibold text-[17px] leading-[1.25] text-foreground group-hover:text-accent transition-colors line-clamp-2">
                  {resource.title}
                </h3>
                {resource.description && (
                  <p className="text-[13px] text-muted-foreground leading-[1.5] mt-1 line-clamp-2 max-w-[640px]">
                    {resource.description}
                  </p>
                )}
                {resource.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {resource.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-sm border border-border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[1.1px] text-muted-foreground"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-2 flex items-center gap-4 font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1 tabular-nums">
                    <Heart
                      className="w-3 h-3"
                      weight={resource.user_vote === 1 ? "fill" : "regular"}
                    />
                    {resource.upvote_count}
                  </span>
                  <span className="inline-flex items-center gap-1 tabular-nums">
                    <ChatCircle className="w-3 h-3" />
                    {resource.comment_count}
                  </span>
                  <span className="inline-flex items-center gap-1 tabular-nums">
                    <DownloadSimple className="w-3 h-3" />
                    {resource.download_count}
                  </span>
                </div>
              </div>

              <span className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground group-hover:text-accent transition-colors self-center">
                Open →
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredResources.length === 0 && (
        <div className="py-20 text-center italic text-[18px] text-muted-foreground">
          {searchQuery
            ? `Nothing matches "${searchQuery}".`
            : category
              ? "No resources in that category yet."
              : "No resources shared yet."}
        </div>
      )}
    </section>
  );
}
