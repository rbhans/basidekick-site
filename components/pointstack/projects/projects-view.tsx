"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Plus, Heart, Eye, MapPin, WarningCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getPointStackPostRoute } from "@/lib/routes";
import { PointStackPost } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { CreatePostDialog } from "../feed/create-post-dialog";
import * as api from "../pointstack-api";

export function PointStackProjectsView() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<PointStackPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <section className="container mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-16 py-10">
      {/* Section heading */}
      <div className="flex items-baseline gap-3.5 pb-3.5 border-b border-foreground mb-6">
        <span className="font-mono text-[11px] text-accent tracking-[1px]">01 /</span>
        <h1 className="font-heading font-semibold text-[26px] leading-none text-foreground">
          Project showcase
        </h1>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground tabular-nums">
          {projects.length} {projects.length === 1 ? "project" : "projects"}
        </span>
        {user && (
          <CreatePostDialog
            defaultType="project"
            trigger={
              <button className="ml-3 font-mono text-[10px] uppercase tracking-[1.2px] text-foreground hover:text-accent transition-colors inline-flex items-center gap-1">
                <Plus className="w-3 h-3" />
                Add
              </button>
            }
          />
        )}
      </div>

      <p className="font-heading italic text-[15px] text-muted-foreground mb-7">
        Real BAS projects from the community — the things you&apos;re proud of.
      </p>

      {/* Error */}
      {error && (
        <div className="p-6 mb-6 border border-border rounded-md bg-card text-center">
          <WarningCircle className="w-7 h-7 text-destructive mx-auto mb-2" />
          <p className="font-heading italic text-[16px] mb-1">Something went wrong.</p>
          <p className="text-sm text-muted-foreground mb-3">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchProjects}>
            Try again
          </Button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[260px] rounded-md" />
          ))}
        </div>
      )}

      {/* Projects grid */}
      {!loading && projects.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={getPointStackPostRoute(project.post_type, project.slug)}
              className="group block border border-border rounded-md overflow-hidden bg-card hover:border-foreground transition-colors flex flex-col"
            >
              {/* Cover image */}
              <div className="aspect-video bg-muted relative overflow-hidden border-b border-border">
                {project.cover_image_url || project.images?.length ? (
                  <img
                    src={project.cover_image_url || project.images?.[0] || ""}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center font-mono text-[10px] uppercase tracking-[1px] text-muted-foreground"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(45deg, transparent, transparent 6px, hsl(from var(--border) h s l / 0.8) 6px, hsl(from var(--border) h s l / 0.8) 7px)",
                    }}
                  >
                    No image
                  </div>
                )}
                {project.is_featured && (
                  <span className="absolute top-3 left-3 font-mono text-[9px] uppercase tracking-[1px] bg-accent text-accent-foreground border border-foreground px-1.5 py-0.5 rounded-sm">
                    Featured
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-4 flex-1 flex flex-col">
                <div className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground mb-1">
                  Project · @{project.author?.display_name || "anonymous"}
                </div>
                <h3 className="font-heading font-semibold text-[16px] leading-[1.25] text-foreground group-hover:text-accent transition-colors mb-1.5">
                  {project.title}
                </h3>
                {project.content && (
                  <p className="text-[12px] text-muted-foreground leading-[1.5] line-clamp-2 mb-3">
                    {project.content}
                  </p>
                )}

                <div className="mt-auto flex items-center gap-3 pt-2 border-t border-muted font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground">
                  {project.location && (
                    <span className="inline-flex items-center gap-1 truncate max-w-[140px]">
                      <MapPin className="w-3 h-3" />
                      {project.location}
                    </span>
                  )}
                  <span className="ml-auto inline-flex items-center gap-1 tabular-nums">
                    <Heart className="w-3 h-3" />
                    {project.upvote_count}
                  </span>
                  <span className="inline-flex items-center gap-1 tabular-nums">
                    <Eye className="w-3 h-3" />
                    {project.view_count}
                  </span>
                </div>
                <div className="mt-1 font-mono text-[9px] text-muted-foreground/60">
                  {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && projects.length === 0 && !error && (
        <div className="py-20 text-center font-heading italic text-[18px] text-muted-foreground">
          No projects yet. Be the first to showcase your work.
        </div>
      )}
    </section>
  );
}
