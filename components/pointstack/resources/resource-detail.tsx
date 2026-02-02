"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, DownloadSimple, Link as LinkIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "../shared/user-avatar";
import { ROUTES } from "@/lib/routes";
import { PointStackResourceListing, PointStackResourceCategory } from "@/lib/types";
import * as api from "../pointstack-api";

interface ResourceDetailProps {
  slug: string;
}

const CATEGORY_LABELS: Record<PointStackResourceCategory, string> = {
  template: "Template",
  script: "Script",
  document: "Document",
  guide: "Guide",
  tool: "Tool",
  other: "Other",
};

export function PointStackResourceDetail({ slug }: ResourceDetailProps) {
  const [resource, setResource] = useState<PointStackResourceListing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResource = async () => {
      setLoading(true);
      try {
        const data = await api.fetchResourceBySlug(slug);
        setResource(data);
      } catch (error) {
        console.error("Error fetching resource:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResource();
  }, [slug]);

  const handleDownload = async () => {
    if (!resource) return;
    if (resource.file_url) {
      await api.incrementResourceDownloadCount(resource.id);
      window.open(resource.file_url, "_blank");
    } else if (resource.external_link) {
      await api.incrementResourceDownloadCount(resource.id);
      window.open(resource.external_link, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Skeleton className="h-4 w-24 mb-6" />
        <Skeleton className="h-64 rounded-lg mb-6" />
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Resource not found</h2>
          <p className="text-muted-foreground mb-4">This resource doesn&apos;t exist.</p>
          <Button asChild>
            <Link href={`${ROUTES.POINTSTACK}/resources`}>Back to Resources</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <Link
        href={`${ROUTES.POINTSTACK}/resources`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Resources
      </Link>

      {/* Preview images */}
      {resource.preview_images && resource.preview_images.length > 0 && (
        <div className="aspect-video rounded-lg overflow-hidden mb-6">
          <img
            src={resource.preview_images[0]}
            alt={resource.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="border border-border rounded-lg p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">{resource.title}</h1>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {CATEGORY_LABELS[resource.category]}
              </Badge>
              {resource.is_free ? (
                <Badge variant="secondary">Free</Badge>
              ) : (
                <Badge>Premium</Badge>
              )}
            </div>
          </div>

          <Button onClick={handleDownload}>
            {resource.external_link ? (
              <>
                <LinkIcon className="w-4 h-4 mr-2" />
                Visit Link
              </>
            ) : (
              <>
                <DownloadSimple className="w-4 h-4 mr-2" />
                Download
              </>
            )}
          </Button>
        </div>

        {/* Author */}
        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg mb-6">
          <Link href={ROUTES.POINTSTACK_PROFILE(resource.author?.display_name || "")}>
            <UserAvatar
              displayName={resource.author?.display_name || null}
              avatarUrl={resource.author?.avatar_url}
              size="md"
            />
          </Link>
          <div>
            <Link
              href={ROUTES.POINTSTACK_PROFILE(resource.author?.display_name || "")}
              className="font-medium hover:underline"
            >
              {resource.author?.display_name || "Anonymous"}
            </Link>
            <p className="text-sm text-muted-foreground">
              Shared {formatDistanceToNow(new Date(resource.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>

        {/* Description */}
        {resource.description && (
          <div className="prose prose-sm dark:prose-invert max-w-none mb-6">
            {resource.description.split("\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 pt-4 border-t border-border text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <DownloadSimple className="w-4 h-4" />
            <span>{resource.download_count} downloads</span>
          </div>
        </div>
      </div>

      {/* More preview images */}
      {resource.preview_images && resource.preview_images.length > 1 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Preview</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {resource.preview_images.slice(1).map((image, i) => (
              <img
                key={i}
                src={image}
                alt={`${resource.title} preview ${i + 2}`}
                className="rounded-lg"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
