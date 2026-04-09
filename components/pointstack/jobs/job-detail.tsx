"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Clock,
  Globe,
  Envelope,
} from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/lib/routes";
import { PointStackJob } from "@/lib/types";
import * as api from "../pointstack-api";

interface JobDetailProps {
  slug: string;
}

export function PointStackJobDetail({ slug }: JobDetailProps) {
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
      <section className="container mx-auto max-w-[880px] px-4 sm:px-6 lg:px-16 py-10">
        <Skeleton className="h-4 w-24 mb-6" />
        <div className="flex gap-5 mb-6">
          <Skeleton className="h-16 w-16 rounded-sm" />
          <div className="flex-1">
            <Skeleton className="h-8 w-2/3 mb-2" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <Skeleton className="h-5 w-full mb-2" />
        <Skeleton className="h-5 w-full mb-2" />
        <Skeleton className="h-5 w-3/4" />
      </section>
    );
  }

  if (!job) {
    return (
      <section className="container mx-auto max-w-[880px] px-4 sm:px-6 lg:px-16 py-16 text-center">
        <p className="font-heading italic text-[20px] text-muted-foreground mb-5">
          This job isn&apos;t in the set.
        </p>
        <Link
          href={`${ROUTES.POINTSTACK}/jobs`}
          className="font-mono text-[11px] uppercase tracking-[1.2px] text-foreground hover:text-accent transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3 h-3 text-accent" />
          Back to jobs
        </Link>
      </section>
    );
  }

  const formatSalary = (): string | null => {
    if (!job.salary_min && !job.salary_max) return null;
    if (job.salary_min && job.salary_max) {
      return `$${(job.salary_min / 1000).toFixed(0)}K – $${(job.salary_max / 1000).toFixed(0)}K`;
    }
    if (job.salary_min) return `From $${(job.salary_min / 1000).toFixed(0)}K`;
    return `Up to $${(job.salary_max! / 1000).toFixed(0)}K`;
  };

  return (
    <section className="container mx-auto max-w-[880px] px-4 sm:px-6 lg:px-16 py-10">
      {/* Back link */}
      <Link
        href={`${ROUTES.POINTSTACK}/jobs`}
        className="font-mono text-[11px] uppercase tracking-[1.2px] text-muted-foreground hover:text-accent transition-colors inline-flex items-center gap-1.5 mb-6"
      >
        <ArrowLeft className="w-3 h-3 text-accent" />
        Back to jobs
      </Link>

      {/* Kind label */}
      <div className="font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground mb-3">
        <span className="text-accent mr-1">Job</span>
        <span className="text-muted-foreground/40 mx-2">·</span>
        <span>Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
      </div>

      {/* Company + title */}
      <div className="flex items-start gap-4 mb-6">
        {job.company?.logo_url ? (
          <img
            src={job.company.logo_url}
            alt={job.company.name}
            className="w-16 h-16 rounded-sm object-cover border border-border shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-sm bg-muted flex items-center justify-center border border-border shrink-0">
            <Briefcase className="w-7 h-7 text-foreground" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h1 className="font-heading font-semibold text-[32px] md:text-[38px] leading-[1.1] tracking-[-0.015em] text-foreground mb-1.5">
            {job.title}
          </h1>
          {job.company && (
            <Link
              href={ROUTES.POINTSTACK_COMPANY(job.company.slug)}
              className="font-heading italic text-[17px] text-muted-foreground hover:text-accent transition-colors"
            >
              {job.company.name}
            </Link>
          )}
        </div>
      </div>

      {/* Meta row */}
      <div className="mb-8 flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[1.2px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 text-accent border border-accent px-2 py-1 rounded-sm">
          <Briefcase className="w-3 h-3" />
          {job.job_type.replace("-", " ")}
        </span>
        {job.experience_level && (
          <span className="inline-flex items-center gap-1.5 border border-border px-2 py-1 rounded-sm">
            <Clock className="w-3 h-3" />
            {job.experience_level}
          </span>
        )}
        {job.location && (
          <span className="inline-flex items-center gap-1.5 border border-border px-2 py-1 rounded-sm">
            <MapPin className="w-3 h-3" />
            {job.location}
          </span>
        )}
        {job.is_remote && (
          <span className="border border-accent text-accent px-2 py-1 rounded-sm">Remote OK</span>
        )}
        {formatSalary() && (
          <span className="border border-border px-2 py-1 rounded-sm tabular-nums">
            {formatSalary()} / year
          </span>
        )}
      </div>

      {/* Description */}
      <div className="mb-8 max-w-[680px]">
        <div className="font-mono text-[10px] uppercase tracking-[1.4px] text-muted-foreground mb-3.5 pb-2.5 border-b border-foreground">
          <span className="text-accent mr-1.5">01 /</span>
          About this role
        </div>
        <div className="text-[15px] md:text-[16px] leading-[1.7] text-foreground">
          {job.description.split("\n").map((paragraph, i) =>
            paragraph.trim() ? (
              <p key={i} className="mb-4">
                {paragraph}
              </p>
            ) : null,
          )}
        </div>
      </div>

      {/* Requirements */}
      {job.requirements && (
        <div className="mb-8 max-w-[680px]">
          <div className="font-mono text-[10px] uppercase tracking-[1.4px] text-muted-foreground mb-3.5 pb-2.5 border-b border-foreground">
            <span className="text-accent mr-1.5">02 /</span>
            Requirements
          </div>
          <div className="text-[15px] md:text-[16px] leading-[1.7] text-foreground">
            {job.requirements.split("\n").map((line, i) =>
              line.trim() ? (
                <p key={i} className="mb-2">
                  {line}
                </p>
              ) : null,
            )}
          </div>
        </div>
      )}

      {/* Apply */}
      <div className="max-w-[680px]">
        <div className="font-mono text-[10px] uppercase tracking-[1.4px] text-muted-foreground mb-3.5 pb-2.5 border-b border-foreground">
          <span className="text-accent mr-1.5">03 /</span>
          How to apply
        </div>
        <div className="flex flex-wrap gap-3">
          {job.application_url && (
            <a
              href={job.application_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-md font-mono text-[11px] uppercase tracking-[1.2px] font-medium hover:bg-primary/90 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              Apply on website
            </a>
          )}
          {job.application_email && (
            <a
              href={`mailto:${job.application_email}`}
              className="inline-flex items-center gap-2 border-[1.5px] border-foreground text-foreground px-5 py-3 rounded-md font-mono text-[11px] uppercase tracking-[1.2px] font-medium hover:border-accent hover:text-accent transition-colors"
            >
              <Envelope className="w-3.5 h-3.5" />
              Email application
            </a>
          )}
        </div>
      </div>

      {/* Meta */}
      <div className="mt-10 pt-6 border-t border-border font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground flex items-center gap-5">
        <span className="tabular-nums">{job.view_count} views</span>
        <span className="text-muted-foreground/40">·</span>
        <span className="tabular-nums">
          {job.application_count} {job.application_count === 1 ? "applicant" : "applicants"}
        </span>
      </div>
    </section>
  );
}
