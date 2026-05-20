"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MapPin, Briefcase, Plus, House, WarningCircle } from "@phosphor-icons/react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/lib/routes";
import { PointStackJob } from "@/lib/types";
import * as api from "../pointstack-api";
import { CreateJobDialog } from "./create-job-dialog";

const JOB_TYPES: { key: string | undefined; label: string }[] = [
  { key: undefined, label: "All" },
  { key: "full-time", label: "Full-time" },
  { key: "part-time", label: "Part-time" },
  { key: "contract", label: "Contract" },
  { key: "freelance", label: "Freelance" },
];

export function PointStackJobsView() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<PointStackJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobType, setJobType] = useState<string | undefined>();
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.fetchJobs({
        jobType,
        isRemote: remoteOnly ? true : undefined,
      });
      setJobs(data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setError("Failed to load jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [jobType, remoteOnly]);

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  const formatSalary = (job: PointStackJob): string | null => {
    if (!job.salary_min && !job.salary_max) return null;
    if (job.salary_min && job.salary_max) {
      return `$${(job.salary_min / 1000).toFixed(0)}K – $${(job.salary_max / 1000).toFixed(0)}K`;
    }
    if (job.salary_min) return `From $${(job.salary_min / 1000).toFixed(0)}K`;
    return `Up to $${(job.salary_max! / 1000).toFixed(0)}K`;
  };

  return (
    <section className="container mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-16 py-10">
      {/* Section heading */}
      <div className="flex items-baseline gap-3.5 pb-3.5 border-b border-foreground mb-6">
        <span className="font-mono text-[11px] text-accent tracking-[1px]">01 /</span>
        <h1 className="font-heading font-semibold text-[26px] leading-none text-foreground">
          Job board
        </h1>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground tabular-nums">
          {jobs.length} {jobs.length === 1 ? "opening" : "openings"}
        </span>
        {user && (
          <CreateJobDialog
            onCreated={async () => {
              await loadJobs();
            }}
            trigger={
              <button className="ml-3 font-mono text-[10px] uppercase tracking-[1.2px] text-foreground hover:text-accent transition-colors inline-flex items-center gap-1">
                <Plus className="w-3 h-3" />
                Post job
              </button>
            }
          />
        )}
      </div>

      <p className="italic text-[15px] text-muted-foreground mb-7">
        Open BAS roles — posted by the community, for the community.
      </p>

      {/* Filter chips */}
      <div className="flex items-center gap-3 mb-8 flex-wrap font-mono text-[11px] uppercase tracking-[1.2px] text-muted-foreground">
        <span>Filter</span>
        {JOB_TYPES.map((type) => (
          <button
            key={type.label}
            onClick={() => setJobType(type.key)}
            className={`px-3 py-1.5 border rounded-sm transition-colors ${
              (jobType || undefined) === type.key
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
            }`}
          >
            {type.label}
          </button>
        ))}
        <span className="w-px h-4 bg-border mx-1" />
        <button
          onClick={() => setRemoteOnly(!remoteOnly)}
          className={`px-3 py-1.5 border rounded-sm inline-flex items-center gap-1.5 transition-colors ${
            remoteOnly
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
          }`}
        >
          <House className="w-3 h-3" />
          Remote only
        </button>
      </div>

      {/* Error */}
      {error && !loading && (
        <div className="p-6 mb-6 border border-border rounded-md bg-card text-center">
          <WarningCircle className="w-7 h-7 text-destructive mx-auto mb-2" />
          <p className="italic text-[16px] mb-1">Something went wrong.</p>
          <p className="text-sm text-muted-foreground mb-3">{error}</p>
          <Button variant="outline" size="sm" onClick={() => loadJobs()}>
            Try again
          </Button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="grid grid-cols-[48px_1fr_60px] gap-4 items-start py-5 px-2 border-b border-muted">
              <Skeleton className="h-12 w-12 rounded-sm" />
              <div>
                <Skeleton className="h-5 w-56 mb-2" />
                <Skeleton className="h-4 w-40 mb-2" />
                <Skeleton className="h-3 w-60" />
              </div>
              <Skeleton className="h-3 w-12 self-center" />
            </div>
          ))}
        </div>
      )}

      {/* Jobs list */}
      {!loading && jobs.length > 0 && (
        <div className="space-y-0">
          {jobs.map((job) => {
            const salary = formatSalary(job);
            return (
              <Link
                key={job.id}
                href={ROUTES.POINTSTACK_JOB(job.slug)}
                className="group grid grid-cols-[48px_1fr_auto] gap-4 items-start py-5 px-2 border-b border-muted hover:bg-muted/40 transition-colors"
              >
                {job.company?.logo_url ? (
                  <img
                    src={job.company.logo_url}
                    alt={job.company.name}
                    className="w-12 h-12 rounded-sm object-cover border border-border"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-sm bg-muted flex items-center justify-center border border-border">
                    <Briefcase className="w-5 h-5 text-foreground" />
                  </div>
                )}

                <div className="min-w-0">
                  <h3 className="font-heading font-semibold text-[17px] leading-[1.25] text-foreground group-hover:text-accent transition-colors">
                    {job.title}
                  </h3>
                  {job.company && (
                    <p className="font-mono text-[11px] text-foreground mt-0.5">
                      {job.company.name}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground">
                    <span className="text-accent">{job.job_type.replace("-", " ")}</span>
                    {job.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {job.location}
                      </span>
                    )}
                    {job.is_remote && <span className="text-accent">Remote OK</span>}
                    {salary && <span className="tabular-nums">{salary}</span>}
                  </div>
                  <div className="mt-1.5 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground">
                    <span>
                      Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                    </span>
                    <span className="text-muted-foreground/40">·</span>
                    <span className="tabular-nums">{job.view_count} views</span>
                    <span className="text-muted-foreground/40">·</span>
                    <span className="tabular-nums">
                      {job.application_count} {job.application_count === 1 ? "applicant" : "applicants"}
                    </span>
                  </div>
                </div>

                <span className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground group-hover:text-accent transition-colors self-center">
                  View →
                </span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!loading && jobs.length === 0 && !error && (
        <div className="py-20 text-center italic text-[18px] text-muted-foreground">
          {remoteOnly || jobType
            ? "No jobs match these filters. Try loosening them."
            : "No jobs posted yet."}
        </div>
      )}
    </section>
  );
}
