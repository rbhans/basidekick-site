"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Plus, Heart, Eye, MapPin, WarningCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/lib/routes";
import { PointStackPost } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { CreatePostDialog } from "../feed/create-post-dialog";
import { useAtlasData } from "@/components/atlas/use-atlas-data";
import * as api from "../pointstack-api";

export function PointStackProjectsView() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<PointStackPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          href: ROUTES.EQUIPMENT_MODEL(brand.slug || brand.id, type.slug || type.id, model.slug || model.id),
        };
      })
      .filter(Boolean) as { id: string; name: string; href: string }[];
  };

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.fetchShowcaseProjects();
      setProjects(data);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Project Showcase</h1>
          <p className="text-muted-foreground">
            Explore BAS projects from professionals in the community.
          </p>
        </div>
        {user && (
          <CreatePostDialog
            defaultType="project"
            trigger={(
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Project
              </Button>
            )}
          />
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="flex flex-col items-center gap-3 p-6 mb-6 border border-border rounded-lg bg-card text-center">
          <WarningCircle className="w-8 h-8 text-destructive" />
          <div>
            <p className="font-medium mb-1">Something went wrong</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={fetchProjects}>
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      )}

      {/* Projects grid */}
      {!loading && projects.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={ROUTES.POINTSTACK_PROJECT(project.slug)}
              className="group block border border-border rounded-lg overflow-hidden hover:border-primary/30 transition-colors"
            >
              {/* Cover image */}
              <div className="aspect-video bg-muted relative overflow-hidden">
                {project.cover_image_url || project.images?.length ? (
                  <img
                    src={project.cover_image_url || project.images?.[0] || ""}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    No image
                  </div>
                )}
                {project.is_featured && (
                  <Badge className="absolute top-2 left-2 bg-primary">Featured</Badge>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                  {project.title}
                </h3>
                {project.content && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {project.content}
                  </p>
                )}

                {/* Tags */}
                {project.systems && project.systems.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {project.systems.slice(0, 3).map((system) => (
                      <Badge key={system} variant="secondary" className="text-xs">
                        {system}
                      </Badge>
                    ))}
                  </div>
                )}

                {(() => {
                  const equipmentLinks = getEquipmentLinks(project.equipment_ids || []);
                  if (equipmentLinks.length === 0) return null;
                  return (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {equipmentLinks.slice(0, 3).map((item) => (
                        <Badge key={item.id} variant="secondary" className="text-xs">
                          {item.name}
                        </Badge>
                      ))}
                    </div>
                  );
                })()}

                {/* Meta */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    {project.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{project.location}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      <span>{project.upvote_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{project.view_count}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && projects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            No projects yet. Be the first to showcase your work!
          </p>
          {user && (
            <CreatePostDialog
              defaultType="project"
              trigger={(
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Project
                </Button>
              )}
            />
          )}
        </div>
      )}
    </div>
  );
}
