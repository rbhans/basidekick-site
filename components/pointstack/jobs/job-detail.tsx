"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  CurrencyDollar,
  House,
  Clock,
  Globe,
  Envelope,
} from "@phosphor-icons/react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/lib/routes";
import { PointStackJob } from "@/lib/types";
import * as api from "../pointstack-api";

interface JobDetailProps {
  slug: string;
}

export function PointStackJobDetail({ slug }: JobDetailProps) {
  const { user } = useAuth();
  const [job, setJob] = useState<PointStackJob | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      try {
        const data = await api.fetchJobBySlug(slug);
        setJob(data);
      } catch (error) {
        console.error("Error fetching job:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Skeleton className="h-4 w-24 mb-6" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Job not found</h2>
          <p className="text-muted-foreground mb-4">This job posting may have been removed.</p>
          <Button asChild>
            <Link href={`${ROUTES.POINTSTACK}/jobs`}>Back to Jobs</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <Link
        href={`${ROUTES.POINTSTACK}/jobs`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Jobs
      </Link>

      <div className="border border-border rounded-lg p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          {job.company?.logo_url ? (
            <img
              src={job.company.logo_url}
              alt={job.company.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
              <Briefcase className="w-8 h-8 text-primary" />
            </div>
          )}

          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1">{job.title}</h1>
            {job.company && (
              <Link
                href={ROUTES.POINTSTACK_COMPANY(job.company.slug)}
                className="text-lg text-muted-foreground hover:underline"
              >
                {job.company.name}
              </Link>
            )}
          </div>
        </div>

        {/* Quick info */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Badge variant="outline" className="gap-1">
            <Briefcase className="w-3 h-3" />
            {job.job_type.replace("-", " ")}
          </Badge>
          {job.experience_level && (
            <Badge variant="outline" className="gap-1">
              <Clock className="w-3 h-3" />
              {job.experience_level}
            </Badge>
          )}
          {job.location && (
            <Badge variant="outline" className="gap-1">
              <MapPin className="w-3 h-3" />
              {job.location}
            </Badge>
          )}
          {job.is_remote && (
            <Badge variant="secondary" className="gap-1">
              <House className="w-3 h-3" />
              Remote
            </Badge>
          )}
        </div>

        {/* Salary */}
        {(job.salary_min || job.salary_max) && (
          <div className="flex items-center gap-2 mb-6 p-4 bg-muted/50 rounded-lg">
            <CurrencyDollar className="w-5 h-5 text-primary" />
            <span className="font-semibold">
              {job.salary_min && job.salary_max
                ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
                : job.salary_min
                ? `From $${job.salary_min.toLocaleString()}`
                : `Up to $${job.salary_max?.toLocaleString()}`}
            </span>
            <span className="text-muted-foreground">per year</span>
          </div>
        )}

        {/* Description */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">About this role</h2>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {job.description.split("\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>

        {/* Requirements */}
        {job.requirements && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Requirements</h2>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {job.requirements.split("\n").map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>
        )}

        {/* Apply */}
        <div className="pt-6 border-t border-border">
          <h2 className="text-lg font-semibold mb-3">How to Apply</h2>
          <div className="flex flex-wrap gap-3">
            {job.application_url && (
              <Button asChild>
                <a href={job.application_url} target="_blank" rel="noopener noreferrer">
                  <Globe className="w-4 h-4 mr-2" />
                  Apply on Website
                </a>
              </Button>
            )}
            {job.application_email && (
              <Button variant="outline" asChild>
                <a href={`mailto:${job.application_email}`}>
                  <Envelope className="w-4 h-4 mr-2" />
                  Email Application
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Meta */}
        <div className="mt-6 pt-6 border-t border-border text-sm text-muted-foreground">
          <p>Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</p>
          <p>{job.view_count} views &middot; {job.application_count} applications</p>
        </div>
      </div>
    </div>
  );
}
