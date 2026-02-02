"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { usePointStackStore } from "../pointstack-store";
import { FeedCard } from "./feed-card";
import { FeedFilters } from "./feed-filters";
import { CreatePostDialog } from "./create-post-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PencilSimple, WarningCircle } from "@phosphor-icons/react";

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

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      {/* Create post prompt */}
      {user && (
        <div className="mb-6">
          <CreatePostDialog
            trigger={
              <button className="w-full flex items-center gap-3 p-4 border border-border rounded-lg bg-card hover:bg-muted/50 transition-colors text-left">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <PencilSimple className="w-5 h-5 text-primary" />
                </div>
                <span className="text-muted-foreground">Share something with the community...</span>
              </button>
            }
          />
        </div>
      )}

      {/* Filters */}
      <FeedFilters
        currentFilter={feedFilter}
        onFilterChange={setFeedFilter}
        className="mb-6"
      />

      {/* Error state */}
      {feedError && (
        <div className="flex items-center gap-2 p-4 mb-6 border border-destructive/50 rounded-lg bg-destructive/10 text-destructive">
          <WarningCircle className="w-5 h-5" />
          <span>{feedError}</span>
          <Button variant="outline" size="sm" onClick={() => fetchFeed()} className="ml-auto">
            Retry
          </Button>
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
      {posts.length > 0 && (
        <div className="space-y-4">
          {posts.map((post) => (
            <FeedCard key={post.id} post={post} />
          ))}

          {/* Load more */}
          {hasMorePosts && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={loadMorePosts}
                disabled={feedLoading}
              >
                {feedLoading ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!feedLoading && posts.length === 0 && !feedError && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            No posts yet. Be the first to share something!
          </p>
          {user && (
            <CreatePostDialog
              trigger={
                <Button>
                  <PencilSimple className="w-4 h-4 mr-2" />
                  Create Post
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
    <div className="p-5 border border-border rounded-lg">
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
