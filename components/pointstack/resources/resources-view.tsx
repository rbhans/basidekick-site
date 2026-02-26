"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  DownloadSimple,
  Plus,
  File,
  Code,
  FileText,
  BookOpen,
  Wrench,
  Package,
} from "@phosphor-icons/react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROUTES } from "@/lib/routes";
import { PointStackResourceListing, PointStackResourceCategory } from "@/lib/types";
import * as api from "../pointstack-api";
import { CreateResourceDialog } from "./create-resource-dialog";

const CATEGORY_ICONS: Record<PointStackResourceCategory, typeof File> = {
  template: FileText,
  script: Code,
  document: File,
  guide: BookOpen,
  tool: Wrench,
  other: Package,
};

const CATEGORY_LABELS: Record<PointStackResourceCategory, string> = {
  template: "Templates",
  script: "Scripts",
  document: "Documents",
  guide: "Guides",
  tool: "Tools",
  other: "Other",
};

export function PointStackResourcesView() {
  const { user } = useAuth();
  const [resources, setResources] = useState<PointStackResourceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string | undefined>();

  const loadResources = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.fetchResources(category);
      setResources(data);
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    void loadResources();
  }, [loadResources]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-heading font-bold">Resource Library</h2>
          <p className="text-muted-foreground">
            Download templates, scripts, and resources shared by the community.
          </p>
        </div>
        {user && (
          <CreateResourceDialog
            onCreated={async () => {
              await loadResources();
            }}
            trigger={
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Share Resource
              </Button>
            }
          />
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <Select value={category || "all"} onValueChange={(v) => setCategory(v === "all" ? undefined : v)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      )}

      {/* Resources grid */}
      {!loading && resources.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => {
            const Icon = CATEGORY_ICONS[resource.category];
            return (
              <Link
                key={resource.id}
                href={ROUTES.POINTSTACK_RESOURCE(resource.slug)}
                className="block p-5 border border-border rounded-xl bg-card hover:border-[#3F3F46] transition-colors"
              >
                {/* Preview image or icon */}
                {resource.preview_images && resource.preview_images.length > 0 ? (
                  <div className="aspect-video rounded-lg overflow-hidden mb-4 bg-muted">
                    <img
                      src={resource.preview_images[0]}
                      alt={resource.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video rounded-lg mb-4 bg-muted/50 flex items-center justify-center">
                    <Icon className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}

                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold line-clamp-2">{resource.title}</h3>
                  {resource.is_free ? (
                    <Badge variant="secondary" className="shrink-0">Free</Badge>
                  ) : (
                    <Badge className="shrink-0">Premium</Badge>
                  )}
                </div>

                {resource.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {resource.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <Badge variant="outline">
                    {CATEGORY_LABELS[resource.category]}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <DownloadSimple className="w-3 h-3" />
                    <span>{resource.download_count}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!loading && resources.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            No resources found. {category ? "Try a different category." : "Be the first to share!"}
          </p>
          {user && (
            <CreateResourceDialog
              onCreated={async () => {
                await loadResources();
              }}
              trigger={
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Share Resource
                </Button>
              }
            />
          )}
        </div>
      )}
    </div>
  );
}
