"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Heart, MapPin, Calendar, Ruler } from "@phosphor-icons/react";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { useAtlasData } from "@/components/atlas/use-atlas-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "../shared/user-avatar";
import { ROUTES } from "@/lib/routes";
import { PointStackPost } from "@/lib/types";
import * as api from "../pointstack-api";

interface ProjectDetailProps {
  slug: string;
}

export function PointStackProjectDetail({ slug }: ProjectDetailProps) {
  const { user } = useAuth();
  const [project, setProject] = useState<PointStackPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

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
          href: ROUTES.EQUIPMENT_MODEL(brand.slug || brand.id, type.slug || type.id, model.slug || model.id),
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

    fetchVote();
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Skeleton className="h-4 w-24 mb-6" />
        <Skeleton className="h-96 rounded-lg mb-6" />
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Project not found</h2>
          <p className="text-muted-foreground mb-4">This project doesn&apos;t exist.</p>
          <Button asChild>
            <Link href={`${ROUTES.POINTSTACK}/projects`}>Back to Projects</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <Link
        href={`${ROUTES.POINTSTACK}/projects`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Projects
      </Link>

      {/* Cover image */}
      {(project.cover_image_url || project.images?.length) && (
        <div className="aspect-video rounded-lg overflow-hidden mb-6">
          <img
            src={project.cover_image_url || project.images?.[0] || ""}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {project.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{project.location}</span>
                </div>
              )}
              {project.completion_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(project.completion_date).getFullYear()}</span>
                </div>
              )}
              {project.square_footage && (
                <div className="flex items-center gap-1">
                  <Ruler className="w-4 h-4" />
                  <span>{project.square_footage.toLocaleString()} sq ft</span>
                </div>
              )}
            </div>
          </div>

          <Button
            variant={liked ? "default" : "outline"}
            onClick={handleLike}
            disabled={!user}
          >
            <Heart className="w-4 h-4 mr-2" weight={liked ? "fill" : "regular"} />
            {likeCount}
          </Button>
        </div>

        {/* Author */}
        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
          <Link href={ROUTES.POINTSTACK_PROFILE(project.author?.display_name || "")}>
            <UserAvatar
              displayName={project.author?.display_name || null}
              avatarUrl={project.author?.avatar_url}
              size="md"
            />
          </Link>
          <div>
            <Link
              href={ROUTES.POINTSTACK_PROFILE(project.author?.display_name || "")}
              className="font-medium hover:underline"
            >
              {project.author?.display_name || "Anonymous"}
            </Link>
            {project.company && (
              <Link
                href={ROUTES.POINTSTACK_COMPANY(project.company.slug)}
                className="block text-sm text-muted-foreground hover:underline"
              >
                {project.company.name}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {project.building_types?.map((type) => (
          <Badge key={type} variant="outline">{type}</Badge>
        ))}
        {project.systems?.map((system) => (
          <Badge key={system} variant="secondary">{system}</Badge>
        ))}
        {project.technologies?.map((tech) => (
          <Badge key={tech}>{tech}</Badge>
        ))}
        {equipmentLinks.map((item) => (
          <Link key={item.id} href={item.href}>
            <Badge variant="secondary">{item.name}</Badge>
          </Link>
        ))}
      </div>

      {/* Content */}
      {project.content && (
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {project.content.split("\n").map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      )}

      {/* Image gallery */}
      {project.images && project.images.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Gallery</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {project.images.map((image, i) => (
              <img
                key={i}
                src={image}
                alt={`${project.title} image ${i + 1}`}
                className="rounded-lg"
              />
            ))}
          </div>
        </div>
      )}

      {/* Documents */}
      {project.documents && project.documents.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Documents</h2>
          <div className="space-y-2">
            {project.documents.map((doc) => (
              <a
                key={doc}
                href={doc}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-primary hover:underline"
              >
                {getDocumentName(doc)}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Credits */}
      {project.credits && project.credits.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Project Team</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {project.credits.map((credit) => (
              <div key={credit.id} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                <UserAvatar
                  displayName={credit.display_name || credit.user?.display_name || null}
                  avatarUrl={credit.user?.avatar_url}
                  size="sm"
                />
                <div>
                  <p className="font-medium">{credit.display_name || credit.user?.display_name || "Unknown"}</p>
                  <p className="text-sm text-muted-foreground">{credit.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
