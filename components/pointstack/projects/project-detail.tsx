"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Heart, MapPin, Calendar, Ruler, DotsThree, PencilSimple, Trash } from "@phosphor-icons/react";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { useAtlasData } from "@/components/atlas/use-atlas-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UserAvatar } from "../shared/user-avatar";
import { ROUTES } from "@/lib/routes";
import { PointStackPost } from "@/lib/types";
import { EditPostDialog } from "../feed/edit-post-dialog";
import * as api from "../pointstack-api";

interface ProjectDetailProps {
  slug: string;
}

export function PointStackProjectDetail({ slug }: ProjectDetailProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [project, setProject] = useState<PointStackPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data: atlasData } = useAtlasData();

  const brandById = useMemo(() => new Map(atlasData?.brands.map((b) => [b.id, b]) || []), [atlasData]);
  const typeById = useMemo(() => new Map(atlasData?.types.map((t) => [t.id, t]) || []), [atlasData]);
  const modelById = useMemo(() => new Map(atlasData?.models.map((m) => [m.id, m]) || []), [atlasData]);

  const equipmentLinks = useMemo(() => {
    if (!atlasData || !project?.equipment_ids) return [];
    return project.equipment_ids
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
  }, [atlasData, project, brandById, typeById, modelById]);

  const getDocumentName = (url: string) => {
    const clean = url.split("?")[0] || "";
    const name = clean.split("/").pop() || "Document";
    return decodeURIComponent(name);
  };

  useEffect(() => {
    const fetchVote = async () => {
      if (!user || !project) return;
      const supabase = createClient();
      if (!supabase) return;

      const { data } = await supabase
        .from("pointstack_post_votes")
        .select("vote_type")
        .eq("user_id", user.id)
        .eq("post_id", project.id)
        .maybeSingle();

      setLiked(data?.vote_type === 1);
    };

    fetchVote().catch(console.error);
  }, [project, user]);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const data = await api.fetchShowcaseProjectBySlug(slug);
        setProject(data);
        if (data) {
          setLikeCount(data.upvote_count);
        }
        if (data) {
          api.incrementPostViewCount(data.id).catch(() => {});
        }
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [slug]);

  const handleLike = async () => {
    if (!project || !user) return;
    try {
      await api.votePost(project.id, 1);
      const nextLiked = !liked;
      setLiked(nextLiked);
      setLikeCount((c) => (nextLiked ? c + 1 : Math.max(0, c - 1)));
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleDelete = async () => {
    if (!project) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await api.deletePost(project.id);
      setDeleteOpen(false);
      router.push(`${ROUTES.POINTSTACK}/projects`);
    } catch (error) {
      console.error("Error deleting project:", error);
      setDeleteError("Failed to delete project. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <section className="container mx-auto max-w-[880px] px-4 sm:px-6 lg:px-16 py-10">
        <Skeleton className="h-4 w-24 mb-6" />
        <Skeleton className="aspect-video rounded-md mb-6" />
        <Skeleton className="h-10 w-3/4 mb-3" />
        <Skeleton className="h-4 w-full" />
      </section>
    );
  }

  if (!project) {
    return (
      <section className="container mx-auto max-w-[880px] px-4 sm:px-6 lg:px-16 py-16 text-center">
        <p className="font-heading italic text-[20px] text-muted-foreground mb-5">
          This project isn&apos;t in the set.
        </p>
        <Link
          href={`${ROUTES.POINTSTACK}/projects`}
          className="font-mono text-[11px] uppercase tracking-[1.2px] text-foreground hover:text-accent transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3 h-3 text-accent" />
          Back to projects
        </Link>
      </section>
    );
  }

  const isAuthor = user?.id === project.author_id;

  return (
    <section className="container mx-auto max-w-[880px] px-4 sm:px-6 lg:px-16 py-10">
      {/* Back link */}
      <Link
        href={`${ROUTES.POINTSTACK}/projects`}
        className="font-mono text-[11px] uppercase tracking-[1.2px] text-muted-foreground hover:text-accent transition-colors inline-flex items-center gap-1.5 mb-6"
      >
        <ArrowLeft className="w-3 h-3 text-accent" />
        Back to projects
      </Link>

      {/* Kind label */}
      <div className="font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground mb-3">
        <span className="text-accent mr-1">Project</span>
        <span className="text-muted-foreground/40 mx-2">·</span>
        <Link
          href={ROUTES.POINTSTACK_PROFILE(project.author?.display_name || "")}
          className="text-foreground font-medium hover:text-accent transition-colors"
        >
          @{project.author?.display_name || "anonymous"}
        </Link>
      </div>

      {/* Title */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <h1 className="font-heading font-semibold text-[32px] md:text-[38px] leading-[1.1] tracking-[-0.015em] text-foreground max-w-[720px]">
          {project.title}
        </h1>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleLike}
            disabled={!user}
            className="inline-flex items-center gap-1.5 border-[1.5px] border-foreground px-3.5 py-2 rounded-md font-mono text-[11px] uppercase tracking-[1.2px] text-foreground hover:border-accent hover:text-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed tabular-nums"
          >
            <Heart className="w-3.5 h-3.5" weight={liked ? "fill" : "regular"} />
            {likeCount}
          </button>
          {isAuthor && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Project options">
                  <DotsThree className="w-4 h-4" weight="bold" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <PencilSimple className="w-3.5 h-3.5 mr-2" />
                  Edit project
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => {
                    setDeleteError(null);
                    setDeleteOpen(true);
                  }}
                >
                  <Trash className="w-3.5 h-3.5 mr-2" />
                  Delete project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-4 mb-6 font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground">
        {project.location && (
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="w-3 h-3" />
            {project.location}
          </span>
        )}
        {project.completion_date && (
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="w-3 h-3" />
            {new Date(project.completion_date).getFullYear()}
          </span>
        )}
        {project.square_footage && (
          <span className="inline-flex items-center gap-1.5 tabular-nums">
            <Ruler className="w-3 h-3" />
            {project.square_footage.toLocaleString()} sq ft
          </span>
        )}
        {project.company && (
          <>
            <span className="text-muted-foreground/40">·</span>
            <Link
              href={ROUTES.POINTSTACK_COMPANY(project.company.slug)}
              className="text-foreground hover:text-accent transition-colors"
            >
              {project.company.name}
            </Link>
          </>
        )}
      </div>

      {/* Cover image */}
      {(project.cover_image_url || project.images?.length) && (
        <div className="aspect-video rounded-md overflow-hidden mb-8 border border-border">
          <img
            src={project.cover_image_url || project.images?.[0] || ""}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Tags */}
      {(project.building_types?.length ||
        project.systems?.length ||
        project.technologies?.length ||
        equipmentLinks.length > 0) && (
        <div className="flex flex-wrap gap-2 mb-8">
          {project.building_types?.map((type) => (
            <span
              key={type}
              className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground border border-border px-2 py-0.5 rounded-sm"
            >
              {type}
            </span>
          ))}
          {project.systems?.map((system) => (
            <span
              key={system}
              className="font-mono text-[10px] uppercase tracking-[1.1px] text-foreground border border-border bg-card px-2 py-0.5 rounded-sm"
            >
              {system}
            </span>
          ))}
          {project.technologies?.map((tech) => (
            <span
              key={tech}
              className="font-mono text-[10px] uppercase tracking-[1.1px] text-accent border border-accent px-2 py-0.5 rounded-sm"
            >
              {tech}
            </span>
          ))}
          {equipmentLinks.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground border border-border px-2 py-0.5 rounded-sm hover:border-accent hover:text-accent transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}

      {/* Content */}
      {project.content && (
        <div className="max-w-[680px] mb-10">
          <div className="font-mono text-[10px] uppercase tracking-[1.4px] text-muted-foreground mb-3.5 pb-2.5 border-b border-foreground">
            <span className="text-accent mr-1.5">01 /</span>
            Overview
          </div>
          <div className="text-[15px] md:text-[16px] leading-[1.7] text-foreground">
            {project.content.split("\n").map((paragraph, i) =>
              paragraph.trim() ? (
                <p key={i} className="mb-4">
                  {paragraph}
                </p>
              ) : null,
            )}
          </div>
        </div>
      )}

      {/* Image gallery */}
      {project.images && project.images.length > 0 && (
        <div className="mb-10">
          <div className="font-mono text-[10px] uppercase tracking-[1.4px] text-muted-foreground mb-3.5 pb-2.5 border-b border-foreground">
            <span className="text-accent mr-1.5">02 /</span>
            Gallery
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {project.images.map((image, i) => (
              <img
                key={i}
                src={image}
                alt={`${project.title} image ${i + 1}`}
                className="rounded-sm border border-border w-full"
              />
            ))}
          </div>
        </div>
      )}

      {/* Documents */}
      {project.documents && project.documents.length > 0 && (
        <div className="mb-10">
          <div className="font-mono text-[10px] uppercase tracking-[1.4px] text-muted-foreground mb-3.5 pb-2.5 border-b border-foreground">
            <span className="text-accent mr-1.5">03 /</span>
            Documents
          </div>
          <div className="space-y-2">
            {project.documents.map((doc) => (
              <a
                key={doc}
                href={doc}
                target="_blank"
                rel="noopener noreferrer"
                className="block font-mono text-[12px] text-foreground hover:text-accent transition-colors"
              >
                → {getDocumentName(doc)}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Credits */}
      {project.credits && project.credits.length > 0 && (
        <div className="mb-10">
          <div className="font-mono text-[10px] uppercase tracking-[1.4px] text-muted-foreground mb-3.5 pb-2.5 border-b border-foreground">
            <span className="text-accent mr-1.5">04 /</span>
            Project team
          </div>
          <div className="space-y-0">
            {project.credits.map((credit) => (
              <div
                key={credit.id}
                className="flex items-center gap-3 py-3 border-b border-muted"
              >
                <UserAvatar
                  displayName={credit.display_name || credit.user?.display_name || null}
                  avatarUrl={credit.user?.avatar_url}
                  size="md"
                />
                <div className="min-w-0">
                  <p className="font-heading font-semibold text-[14px] text-foreground leading-tight">
                    {credit.display_name || credit.user?.display_name || "Unknown"}
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground mt-0.5">
                    {credit.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <EditPostDialog
        post={project}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={(updatedProject) => {
          setProject(updatedProject);
          setLikeCount(updatedProject.upvote_count);
        }}
      />

      <AlertDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeleteError(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this project post and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <p className="text-sm text-destructive">{deleteError}</p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
