"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MapPin, Briefcase, CurrencyDollar, Plus, House, WarningCircle } from "@phosphor-icons/react";
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
import { PointStackJob } from "@/lib/types";
import * as api from "../pointstack-api";
import { CreateJobDialog } from "./create-job-dialog";

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

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Job Board</h1>
          <p className="text-muted-foreground">
            Find BAS jobs and career opportunities.
          </p>
        </div>
        {user && (
          <CreateJobDialog
            onCreated={async () => {
              await loadJobs();
            }}
            trigger={
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Post Job
              </Button>
            }
          />
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Select value={jobType || "all"} onValueChange={(v) => setJobType(v === "all" ? undefined : v)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Job Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="full-time">Full-time</SelectItem>
            <SelectItem value="part-time">Part-time</SelectItem>
            <SelectItem value="contract">Contract</SelectItem>
            <SelectItem value="freelance">Freelance</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant={remoteOnly ? "default" : "outline"}
          size="sm"
          onClick={() => setRemoteOnly(!remoteOnly)}
        >
          <House className="w-4 h-4 mr-2" />
          Remote Only
        </Button>
      </div>

      {/* Error */}
      {error && !loading && (
        <div className="flex flex-col items-center gap-3 p-6 mb-6 border border-border rounded-lg bg-card text-center">
          <WarningCircle className="w-8 h-8 text-destructive" />
          <div>
            <p className="font-medium mb-1">Something went wrong</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => loadJobs()}>
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
      )}

      {/* Jobs list */}
      {!loading && jobs.length > 0 && (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={ROUTES.POINTSTACK_JOB(job.slug)}
              className="block p-5 border border-border rounded-lg hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* Company logo */}
                {job.company?.logo_url ? (
                  <img
                    src={job.company.logo_url}
                    alt={job.company.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-primary" />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="text-lg font-semibold hover:text-primary">
                        {job.title}
                      </h3>
                      {job.company && (
                        <p className="text-muted-foreground">{job.company.name}</p>
                      )}
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      {job.job_type.replace("-", " ")}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                    {job.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{job.location}</span>
                      </div>
                    )}
                    {job.is_remote && (
                      <Badge variant="secondary" className="text-xs">
                        <House className="w-3 h-3 mr-1" />
                        Remote
                      </Badge>
                    )}
                    {(job.salary_min || job.salary_max) && (
                      <div className="flex items-center gap-1">
                        <CurrencyDollar className="w-4 h-4" />
                        <span>
                          {job.salary_min && job.salary_max
                            ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
                            : job.salary_min
                            ? `From $${job.salary_min.toLocaleString()}`
                            : `Up to $${job.salary_max?.toLocaleString()}`}
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {job.description.slice(0, 200)}
                    {job.description.length > 200 && "..."}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
                    <span>{job.view_count} views</span>
                    <span>{job.application_count} applications</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && jobs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            No jobs found. {remoteOnly ? "Try removing the remote filter." : "Check back later!"}
          </p>
        </div>
      )}
    </div>
  );
}
