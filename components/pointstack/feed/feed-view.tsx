"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useAtlasData } from "@/components/atlas/use-atlas-data";
import { usePointStackStore } from "../pointstack-store";
import { FeedCard } from "./feed-card";
import { FeedFilters } from "./feed-filters";
import { CreatePostDialog } from "./create-post-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/lib/routes";
import {
  PencilSimple,
  WarningCircle,
  MagnifyingGlass,
  Chats,
  Question,
  Lightbulb,
  Wrench,
  UsersThree,
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

  const brandById = useMemo(() => new Map(atlasData?.brands.map((b) => [b.id, b]) || []), [atlasData]);
  const typeById = useMemo(() => new Map(atlasData?.types.map((t) => [t.id, t]) || []), [atlasData]);
  const modelById = useMemo(() => new Map(atlasData?.models.map((m) => [m.id, m]) || []), [atlasData]);

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
          href: ROUTES.ATLAS_EQUIPMENT_MODEL(brand.slug || brand.id, type.slug || type.id, model.slug || model.id),
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
    [feedFilter, setFeedFilter]
  );

  // Client-side search filtering
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    const q = searchQuery.toLowerCase();
    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(q) ||
        (post.content || "").toLowerCase().includes(q) ||
        (post.tags || []).some((tag) => tag.toLowerCase().includes(q))
    );
  }, [posts, searchQuery]);

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      {/* Create post prompt */}
      {user && (
        <div className="mb-6">
          <CreatePostDialog
            trigger={
              <button className="w-full flex items-center gap-3 p-4 border border-border/50 rounded-xl bg-card hover:bg-muted/50 transition-colors text-left group">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                  <PencilSimple className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-muted-foreground block">Share something with the community...</span>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground/60">
                      <Chats className="w-3 h-3" /> Discussion
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground/60">
                      <Question className="w-3 h-3" /> Question
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground/60">
                      <Lightbulb className="w-3 h-3" /> Tip
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground/60 hidden sm:inline-flex">
                      <Wrench className="w-3 h-3" /> Project
                    </span>
                  </div>
                </div>
              </button>
            }
          />
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search posts by title, content, or tag..."
          className="pl-9 h-9"
        />
      </div>

      {/* Filters */}
      <FeedFilters
        currentFilter={feedFilter}
        onFilterChange={setFeedFilter}
        className="mb-6"
      />

      {/* Error state */}
      {feedError && (
        <div className="flex flex-col items-center gap-3 p-6 mb-6 border border-border/50 rounded-xl bg-card text-center">
          <WarningCircle className="w-8 h-8 text-destructive" />
          <div>
            <p className="font-medium mb-1">Something went wrong</p>
            <p className="text-sm text-muted-foreground">{feedError}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => fetchFeed()}>
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {feedLoading && posts.length === 0 && (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <FeedCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Feed */}
      {filteredPosts.length > 0 && (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <FeedCard
              key={post.id}
              post={post}
              equipmentLinks={getEquipmentLinks(post.equipment_ids || [])}
              onTagClick={handleTagClick}
            />
          ))}

          {/* Load more */}
          {hasMorePosts && (
            <div className="flex flex-col items-center gap-2 pt-4">
              <Button
                variant="outline"
                onClick={loadMorePosts}
                disabled={feedLoading}
              >
                {feedLoading ? "Loading..." : "Load More"}
              </Button>
              {searchQuery.trim() && (
                <p className="text-xs text-muted-foreground">
                  Search filters loaded posts only. Load more to expand results.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Search empty state */}
      {!feedLoading && searchQuery.trim() && filteredPosts.length === 0 && posts.length > 0 && (
        <div className="text-center py-12">
          <MagnifyingGlass className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground mb-2">
            No matches for &ldquo;{searchQuery}&rdquo; in loaded posts
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery("")}
            >
              Clear search
            </Button>
            {hasMorePosts && (
              <Button
                variant="outline"
                size="sm"
                onClick={loadMorePosts}
                disabled={feedLoading}
              >
                {feedLoading ? "Loading..." : "Load more posts"}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!feedLoading && posts.length === 0 && !feedError && !searchQuery.trim() && (
        <div className="text-center py-16 px-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <UsersThree className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Welcome to the Community</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6 leading-relaxed">
            This is where BAS professionals share knowledge, ask questions,
            showcase projects, and connect with each other. Start a conversation
            to get things going.
          </p>
          {user && (
            <CreatePostDialog
              trigger={
                <Button size="lg">
                  <PencilSimple className="w-4 h-4 mr-2" />
                  Create the first post
                </Button>
              }
            />
          )}
        </div>
      )}
    </div>
  );
}

function FeedCardSkeleton() {
  return (
    <div className="p-5 border border-border/50 rounded-xl">
      <div className="flex items-start gap-3 mb-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-32 mb-1" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-5 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-2/3 mb-4" />
      <div className="flex gap-4">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}
