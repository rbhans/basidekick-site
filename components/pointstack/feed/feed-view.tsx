"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useAtlasData } from "@/components/atlas/use-atlas-data";
import { usePointStackStore } from "../pointstack-store";
import { FeedCard } from "./feed-card";
import { FeedFilters } from "./feed-filters";
import { CreatePostDialog } from "./create-post-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/lib/routes";
import {
  PencilSimple,
  WarningCircle,
  MagnifyingGlass,
} from "@phosphor-icons/react";

export function PointStackFeedView() {
  const { user } = useAuth();
  const {
    posts,
    feedLoading,
    feedError,
    hasMorePosts,
    feedFilter,
    fetchFeed,
    loadMorePosts,
    setFeedFilter,
  } = usePointStackStore();

  const [searchQuery, setSearchQuery] = useState("");
  const { data: atlasData } = useAtlasData();

  const brandById = useMemo(
    () => new Map(atlasData?.brands.map((b) => [b.id, b]) || []),
    [atlasData],
  );
  const typeById = useMemo(
    () => new Map(atlasData?.types.map((t) => [t.id, t]) || []),
    [atlasData],
  );
  const modelById = useMemo(
    () => new Map(atlasData?.models.map((m) => [m.id, m]) || []),
    [atlasData],
  );

  const getEquipmentLinks = (ids: string[] = []) => {
    if (!atlasData) return [];
    return ids
      .map((id) => {
        const model = modelById.get(id);
        if (!model) return null;
        const brand = brandById.get(model.brand);
        const type = typeById.get(model.type);
        if (!brand || !type) return null;
        return {
          id,
          name: model.name,
          href: ROUTES.ATLAS_EQUIPMENT_MODEL(
            brand.slug || brand.id,
            type.slug || type.id,
            model.slug || model.id,
          ),
        };
      })
      .filter(Boolean) as { id: string; name: string; href: string }[];
  };

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const handleTagClick = useCallback(
    (tag: string) => {
      const currentTags = feedFilter.tags || [];
      if (currentTags.includes(tag)) return;
      setFeedFilter({
        ...feedFilter,
        tags: [...currentTags, tag],
      });
    },
    [feedFilter, setFeedFilter],
  );

  // Client-side search filtering
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    const q = searchQuery.toLowerCase();
    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(q) ||
        (post.content || "").toLowerCase().includes(q) ||
        (post.tags || []).some((tag) => tag.toLowerCase().includes(q)),
    );
  }, [posts, searchQuery]);

  return (
    <section className="container mx-auto max-w-[880px] px-4 sm:px-6 lg:px-16 py-10">
      {/* Tagline */}
      <p className="font-heading italic text-[17px] text-muted-foreground text-center mb-8 leading-[1.5]">
        A quiet place to talk shop with people who actually <em className="text-accent not-italic font-medium">know</em>.
      </p>

      {/* Compose box */}
      {user && (
        <CreatePostDialog
          trigger={
            <div className="border-[1.5px] border-foreground rounded-md bg-card p-4 mb-5 cursor-pointer hover:border-accent transition-colors">
              <div className="flex items-center gap-3">
                <PencilSimple className="w-4 h-4 text-muted-foreground shrink-0" />
                <p className="font-heading italic text-[15px] text-muted-foreground/70 flex-1">
                  Share something with the community…
                </p>
                <span className="font-mono text-[10px] uppercase tracking-[1.2px] text-accent shrink-0 hidden sm:inline">
                  New post →
                </span>
              </div>
            </div>
          }
        />
      )}

      {/* Search */}
      <div className="relative border border-border rounded-md bg-card focus-within:border-foreground transition-colors mb-5">
        <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search posts by title, content, or tag…"
          className="w-full bg-transparent border-none outline-none font-sans text-[14px] text-foreground placeholder:text-muted-foreground/60 placeholder:italic py-3 pl-11 pr-4"
          aria-label="Search community posts"
        />
      </div>

      {/* Filters */}
      <FeedFilters
        currentFilter={feedFilter}
        onFilterChange={setFeedFilter}
        className="mb-9"
      />

      {/* Error state */}
      {feedError && (
        <div className="flex flex-col items-center gap-3 p-6 mb-6 border border-border rounded-md bg-card text-center">
          <WarningCircle className="w-8 h-8 text-destructive" />
          <div>
            <p className="font-heading italic text-[16px] mb-1">Something went wrong.</p>
            <p className="text-sm text-muted-foreground">{feedError}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => fetchFeed()}>
              Try again
            </Button>
          </div>
        </div>
      )}

      {/* Loading */}
      {feedLoading && posts.length === 0 && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <FeedCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Feed */}
      {filteredPosts.length > 0 && (
        <div className="space-y-3">
          {filteredPosts.map((post) => (
            <FeedCard
              key={post.id}
              post={post}
              equipmentLinks={getEquipmentLinks(post.equipment_ids || [])}
              onTagClick={handleTagClick}
            />
          ))}

          {hasMorePosts && (
            <div className="flex flex-col items-center gap-2 pt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={loadMorePosts}
                disabled={feedLoading}
              >
                {feedLoading ? "Loading…" : "Load more"}
              </Button>
              {searchQuery.trim() && (
                <p className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground">
                  Search filters loaded posts only
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Search empty state */}
      {!feedLoading && searchQuery.trim() && filteredPosts.length === 0 && posts.length > 0 && (
        <div className="py-20 text-center font-heading italic text-[18px] text-muted-foreground">
          <span className="block font-mono not-italic text-[28px] mb-3">⌕</span>
          Nothing matches &ldquo;{searchQuery}&rdquo;. Try a different term.
        </div>
      )}

      {/* Welcome / empty state */}
      {!feedLoading && posts.length === 0 && !feedError && !searchQuery.trim() && (
        <div className="py-16 text-center">
          <p className="font-heading italic text-[22px] text-foreground mb-3">
            Welcome to the community.
          </p>
          <p className="text-[14px] text-muted-foreground max-w-md mx-auto mb-7 leading-[1.55]">
            This is where BAS professionals share knowledge, ask questions, showcase projects, and connect with each other. Start a conversation to get things going.
          </p>
          {user && (
            <CreatePostDialog
              trigger={
                <Button size="lg" className="rounded-md">
                  <PencilSimple className="w-4 h-4 mr-2" />
                  Create the first post
                </Button>
              }
            />
          )}
        </div>
      )}
    </section>
  );
}

function FeedCardSkeleton() {
  return (
    <div className="border border-border rounded-md bg-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-5 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}
