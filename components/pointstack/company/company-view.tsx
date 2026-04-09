"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MapPin, Users, Globe, ArrowLeft, Briefcase, CurrencyDollar, House, PencilSimple } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "../shared/user-avatar";
import { ROUTES, getPointStackPostRoute } from "@/lib/routes";
import { PointStackCompany, PointStackCompanyJoinRequest, PointStackJob, PointStackPost } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { EditCompanyDialog } from "./edit-company-dialog";
import * as api from "../pointstack-api";

interface CompanyViewProps {
  slug: string;
}

export function PointStackCompanyView({ slug }: CompanyViewProps) {
  const { user } = useAuth();
  const [company, setCompany] = useState<PointStackCompany | null>(null);
  const [loading, setLoading] = useState(true);
  const [joinRequest, setJoinRequest] = useState<PointStackCompanyJoinRequest | null>(null);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");
  const [joinSubmitting, setJoinSubmitting] = useState(false);
  const [joinDialogError, setJoinDialogError] = useState<string | null>(null);
  const [joinActionError, setJoinActionError] = useState<string | null>(null);
  const [pendingRequests, setPendingRequests] = useState<PointStackCompanyJoinRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState<string | null>(null);
  const [reviewingRequestId, setReviewingRequestId] = useState<string | null>(null);
  const [companyProjects, setCompanyProjects] = useState<PointStackPost[]>([]);
  const [companyJobs, setCompanyJobs] = useState<PointStackJob[]>([]);
  const [companyContentLoading, setCompanyContentLoading] = useState(false);
  const [companyContentError, setCompanyContentError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const currentUserMember = useMemo(() => {
    if (!company || !user) return null;
    return company.members?.find((member) => member.user_id === user.id) || null;
  }, [company, user]);

  const isMember = Boolean(currentUserMember);
  const canEditCompany = Boolean(
    user &&
      company &&
      (
        company.owner_id === user.id ||
        currentUserMember?.role === "owner" ||
        currentUserMember?.role === "admin"
      )
  );
  const canManageRequests = canEditCompany;
  const showJoinActions = Boolean(user && company && !isMember && !canManageRequests);

  const fetchCompany = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }

    try {
      const data = await api.fetchCompanyBySlug(slug);
      setCompany(data);
    } catch (error) {
      console.error("Error fetching company:", error);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [slug]);

  const fetchJoinStatus = useCallback(async (companyId: string) => {
    if (!user) {
      setJoinRequest(null);
      return;
    }

    try {
      const status = await api.getUserJoinRequestStatus(companyId);
      setJoinRequest(status);
    } catch (error) {
      console.error("Error fetching join request status:", error);
    }
  }, [user]);

  const fetchPendingRequests = useCallback(async (companyId: string) => {
    setRequestsLoading(true);
    setRequestsError(null);

    try {
      const requests = await api.fetchJoinRequests(companyId, "pending");
      setPendingRequests(requests);
    } catch (error) {
      console.error("Error fetching join requests:", error);
      setRequestsError("Failed to load join requests.");
    } finally {
      setRequestsLoading(false);
    }
  }, []);

  const fetchCompanyContent = useCallback(async (companyId: string) => {
    setCompanyContentLoading(true);
    setCompanyContentError(null);

    try {
      const [projects, jobs] = await Promise.all([
        api.fetchCompanyProjects(companyId),
        api.fetchCompanyJobs(companyId),
      ]);
      setCompanyProjects(projects);
      setCompanyJobs(jobs);
    } catch (error) {
      console.error("Error fetching company projects/jobs:", error);
      setCompanyContentError("Failed to load company projects and jobs.");
    } finally {
      setCompanyContentLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCompany();
  }, [fetchCompany]);

  useEffect(() => {
    if (!company?.id || !showJoinActions) {
      setJoinRequest(null);
      return;
    }
    void fetchJoinStatus(company.id);
  }, [company?.id, showJoinActions, fetchJoinStatus]);

  useEffect(() => {
    if (!company?.id || !canManageRequests) {
      setPendingRequests([]);
      setRequestsError(null);
      return;
    }
    void fetchPendingRequests(company.id);
  }, [company?.id, canManageRequests, fetchPendingRequests]);

  useEffect(() => {
    if (!company?.id) {
      setCompanyProjects([]);
      setCompanyJobs([]);
      setCompanyContentError(null);
      return;
    }

    void fetchCompanyContent(company.id);
  }, [company?.id, fetchCompanyContent]);

  const handleOpenJoinDialog = () => {
    setJoinDialogError(null);
    setJoinActionError(null);
    setJoinDialogOpen(true);
  };

  const handleSubmitJoinRequest = async () => {
    if (!company) return;

    setJoinSubmitting(true);
    setJoinDialogError(null);
    setJoinActionError(null);

    try {
      const request = await api.requestToJoinCompany(
        company.id,
        joinMessage.trim() || undefined
      );
      setJoinRequest(request);
      setJoinDialogOpen(false);
      setJoinMessage("");
    } catch (error) {
      console.error("Error submitting join request:", error);
      setJoinDialogError(
        error instanceof Error ? error.message : "Failed to submit join request."
      );
    } finally {
      setJoinSubmitting(false);
    }
  };

  const handleCancelJoinRequest = async () => {
    if (!joinRequest) return;

    setJoinSubmitting(true);
    setJoinActionError(null);

    try {
      await api.cancelJoinRequest(joinRequest.id);
      setJoinRequest(null);
    } catch (error) {
      console.error("Error canceling join request:", error);
      setJoinActionError("Failed to cancel join request.");
    } finally {
      setJoinSubmitting(false);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    if (!company) return;

    setReviewingRequestId(requestId);
    setRequestsError(null);

    try {
      await api.approveJoinRequest(requestId);
      await fetchCompany(false);
      await fetchPendingRequests(company.id);
    } catch (error) {
      console.error("Error approving join request:", error);
      setRequestsError("Failed to approve join request.");
    } finally {
      setReviewingRequestId(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    if (!company) return;

    setReviewingRequestId(requestId);
    setRequestsError(null);

    try {
      await api.rejectJoinRequest(requestId);
      await fetchPendingRequests(company.id);
    } catch (error) {
      console.error("Error rejecting join request:", error);
      setRequestsError("Failed to reject join request.");
    } finally {
      setReviewingRequestId(null);
    }
  };

  if (loading) {
    return (
      <section className="container mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-16 py-10">
        <Skeleton className="h-4 w-24 mb-6" />
        <div className="grid grid-cols-[auto_1fr] gap-6">
          <Skeleton className="h-24 w-24 rounded-sm" />
          <div>
            <Skeleton className="h-9 w-60 mb-2" />
            <Skeleton className="h-5 w-48 mb-3" />
            <Skeleton className="h-4 w-72" />
          </div>
        </div>
      </section>
    );
  }

  if (!company) {
    return (
      <section className="container mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-16 py-16 text-center">
        <p className="font-heading italic text-[20px] text-muted-foreground mb-5">
          This company isn&apos;t in the set.
        </p>
        <Link
          href={`${ROUTES.POINTSTACK}/companies`}
          className="font-mono text-[11px] uppercase tracking-[1.2px] text-foreground hover:text-accent transition-colors"
        >
          ← Back to companies
        </Link>
      </section>
    );
  }

  return (
    <section className="container mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-16 py-10">
      <Link
        href={`${ROUTES.POINTSTACK}/companies`}
        className="font-mono text-[11px] uppercase tracking-[1.2px] text-muted-foreground hover:text-accent transition-colors inline-flex items-center gap-1.5 mb-6"
      >
        <ArrowLeft className="w-3 h-3 text-accent" />
        Back to companies
      </Link>

      {/* Company header */}
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-6 items-start pb-6 mb-8 border-b border-foreground">
        {company.logo_url ? (
          <img
            src={company.logo_url}
            alt={company.name}
            className="w-24 h-24 rounded-sm object-cover border border-border"
          />
        ) : (
          <div className="w-24 h-24 rounded-sm bg-muted flex items-center justify-center border border-border font-mono text-[32px] font-bold text-foreground">
            {company.name.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap mb-1">
            <h1 className="font-heading font-semibold text-[30px] md:text-[36px] leading-[1.1] tracking-[-0.015em] text-foreground">
              {company.name}
            </h1>
            {company.is_verified && (
              <span className="font-mono text-[9px] uppercase tracking-[1px] text-accent border border-accent px-1.5 py-0.5 rounded-sm">
                Verified
              </span>
            )}
          </div>

          {company.industry && (
            <p className="font-heading italic text-[17px] text-muted-foreground leading-[1.4] mb-3 max-w-[620px]">
              {company.industry}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 font-mono text-[11px] uppercase tracking-[1.2px] text-muted-foreground">
            {company.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-3 h-3" />
                {company.location}
              </span>
            )}
            {company.size_range && (
              <span className="inline-flex items-center gap-1.5">
                <Users className="w-3 h-3" />
                {company.size_range} employees
              </span>
            )}
            {company.website_url && (
              <a
                href={company.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-accent transition-colors"
              >
                <Globe className="w-3 h-3" />
                Website
              </a>
            )}
          </div>

          {company.description && (
            <p className="mt-4 text-[14px] text-muted-foreground leading-[1.6] max-w-[640px]">
              {company.description}
            </p>
          )}

          {showJoinActions && (
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {joinRequest?.status === "pending" && (
                <>
                  <span className="font-mono text-[10px] uppercase tracking-[1.1px] text-accent border border-accent px-2 py-1 rounded-sm">
                    Request pending
                  </span>
                  <button
                    onClick={handleCancelJoinRequest}
                    disabled={joinSubmitting}
                    className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground hover:text-accent transition-colors disabled:opacity-50"
                  >
                    {joinSubmitting ? "Canceling…" : "Cancel request"}
                  </button>
                </>
              )}

              {joinRequest?.status === "approved" && (
                <span className="font-mono text-[10px] uppercase tracking-[1.1px] text-accent border border-accent px-2 py-1 rounded-sm">
                  Approved
                </span>
              )}

              {joinRequest?.status === "rejected" && (
                <span className="font-mono text-[10px] uppercase tracking-[1.1px] text-destructive border border-destructive px-2 py-1 rounded-sm">
                  Declined
                </span>
              )}

              {!joinRequest && (
                <button
                  onClick={handleOpenJoinDialog}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-mono text-[11px] uppercase tracking-[1.2px] font-medium hover:bg-primary/90 transition-colors"
                >
                  Request to join
                </button>
              )}
            </div>
          )}

          {joinActionError && (
            <p className="mt-2 font-mono text-[11px] text-destructive">{joinActionError}</p>
          )}
        </div>

        {canEditCompany && (
          <button
            onClick={() => setEditDialogOpen(true)}
            className="inline-flex items-center gap-2 border-[1.5px] border-foreground px-4 py-2.5 rounded-md font-mono text-[11px] uppercase tracking-[1.2px] text-foreground hover:border-accent hover:text-accent transition-colors shrink-0"
          >
            <PencilSimple className="w-3 h-3" />
            Edit
          </button>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="team">
        <TabsList className="flex-wrap h-auto gap-1 bg-transparent border-b border-border rounded-none p-0 mb-6">
          <TabsTrigger
            value="team"
            className="font-mono text-[11px] uppercase tracking-[1.2px] data-[state=active]:text-accent data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:-mb-px data-[state=active]:rounded-none rounded-none pb-2"
          >
            Team ({company.members?.length || 0})
          </TabsTrigger>
          <TabsTrigger
            value="projects"
            className="font-mono text-[11px] uppercase tracking-[1.2px] data-[state=active]:text-accent data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:-mb-px data-[state=active]:rounded-none rounded-none pb-2"
          >
            Projects ({companyProjects.length})
          </TabsTrigger>
          <TabsTrigger
            value="jobs"
            className="font-mono text-[11px] uppercase tracking-[1.2px] data-[state=active]:text-accent data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:-mb-px data-[state=active]:rounded-none rounded-none pb-2"
          >
            Jobs ({companyJobs.length})
          </TabsTrigger>
          {canManageRequests && (
            <TabsTrigger
              value="requests"
              className="font-mono text-[11px] uppercase tracking-[1.2px] data-[state=active]:text-accent data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:-mb-px data-[state=active]:rounded-none rounded-none pb-2"
            >
              Requests ({pendingRequests.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="team" className="mt-6">
          {company.members && company.members.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {company.members.map((member) => {
                const memberContent = (
                  <>
                    <UserAvatar
                      displayName={member.profile?.display_name || null}
                      avatarUrl={member.profile?.avatar_url}
                      size="md"
                    />
                    <div>
                      <p className="font-medium">{member.profile?.display_name || "Anonymous"}</p>
                      <p className="text-sm text-muted-foreground">{member.title || member.role}</p>
                    </div>
                  </>
                );

                if (member.profile?.display_name) {
                  return (
                    <Link
                      key={member.id}
                      href={ROUTES.POINTSTACK_PROFILE(member.profile.display_name)}
                      className="flex items-center gap-3 p-3 border border-border rounded-md bg-card hover:border-foreground transition-colors"
                    >
                      {memberContent}
                    </Link>
                  );
                }

                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-3 border border-border rounded-md bg-card"
                  >
                    {memberContent}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No team members yet.
            </div>
          )}
        </TabsContent>

        <TabsContent value="projects" className="mt-6">
          {companyContentLoading && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-32 rounded-lg" />
              ))}
            </div>
          )}

          {!companyContentLoading && companyContentError && (
            <p className="text-sm text-destructive">{companyContentError}</p>
          )}

          {!companyContentLoading && !companyContentError && companyProjects.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No projects yet.
            </div>
          )}

          {!companyContentLoading && !companyContentError && companyProjects.length > 0 && (
            <div className="space-y-3">
              {companyProjects.map((project) => (
                <Link
                  key={project.id}
                  href={getPointStackPostRoute(project.post_type, project.slug)}
                  className="block rounded-md border border-border bg-card hover:border-foreground transition-colors p-4"
                >
                  <div className="flex gap-4">
                    {(project.cover_image_url || project.images?.[0]) ? (
                      <img
                        src={project.cover_image_url || project.images?.[0] || ""}
                        alt={project.title}
                        className="h-20 w-28 rounded object-cover shrink-0"
                      />
                    ) : (
                      <div className="h-20 w-28 rounded bg-muted shrink-0" />
                    )}

                    <div className="min-w-0">
                      <h3 className="font-semibold truncate">{project.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {project.content}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                        <span>{project.upvote_count} likes</span>
                        <span>{project.comment_count} comments</span>
                        <span>{project.view_count} views</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="jobs" className="mt-6">
          {companyContentLoading && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-32 rounded-lg" />
              ))}
            </div>
          )}

          {!companyContentLoading && companyContentError && (
            <p className="text-sm text-destructive">{companyContentError}</p>
          )}

          {!companyContentLoading && !companyContentError && companyJobs.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No open positions.
            </div>
          )}

          {!companyContentLoading && !companyContentError && companyJobs.length > 0 && (
            <div className="space-y-3">
              {companyJobs.map((job) => (
                <Link
                  key={job.id}
                  href={ROUTES.POINTSTACK_JOB(job.slug)}
                  className="block rounded-md border border-border bg-card hover:border-foreground transition-colors p-4"
                >
                  <div className="flex items-start gap-3">
                    {job.company?.logo_url ? (
                      <img
                        src={job.company.logo_url}
                        alt={job.company.name}
                        className="w-10 h-10 rounded object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center shrink-0">
                        <Briefcase className="w-5 h-5 text-primary" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-semibold truncate">{job.title}</h3>
                        <Badge variant="outline" className="shrink-0">
                          {job.job_type.replace("-", " ")}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                        {job.location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {job.location}
                          </span>
                        )}
                        {job.is_remote && (
                          <span className="inline-flex items-center gap-1">
                            <House className="w-3 h-3" />
                            Remote
                          </span>
                        )}
                        {(job.salary_min || job.salary_max) && (
                          <span className="inline-flex items-center gap-1">
                            <CurrencyDollar className="w-3 h-3" />
                            {job.salary_min && job.salary_max
                              ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
                              : job.salary_min
                              ? `From $${job.salary_min.toLocaleString()}`
                              : `Up to $${job.salary_max?.toLocaleString()}`}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                        {job.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        {canManageRequests && (
          <TabsContent value="requests" className="mt-6">
            {requestsLoading && (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-28 rounded-lg" />
                ))}
              </div>
            )}

            {!requestsLoading && requestsError && (
              <p className="text-sm text-destructive">{requestsError}</p>
            )}

            {!requestsLoading && !requestsError && pendingRequests.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No pending join requests.
              </div>
            )}

            {!requestsLoading && !requestsError && pendingRequests.length > 0 && (
              <div className="space-y-3">
                {pendingRequests.map((request) => {
                  const isReviewing = reviewingRequestId === request.id;
                  const profileHref = request.user?.display_name
                    ? ROUTES.POINTSTACK_PROFILE(request.user.display_name)
                    : ROUTES.POINTSTACK;
                  return (
                    <div
                      key={request.id}
                      className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 p-4 border border-border rounded-md bg-card"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <Link href={profileHref}>
                          <UserAvatar
                            displayName={request.user?.display_name || null}
                            avatarUrl={request.user?.avatar_url}
                            size="md"
                          />
                        </Link>
                        <div className="min-w-0">
                          <p className="font-medium truncate">
                            {request.user?.display_name || "Anonymous"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Requested{" "}
                            {formatDistanceToNow(new Date(request.created_at), {
                              addSuffix: true,
                            })}
                          </p>
                          {request.message && (
                            <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                              {request.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          onClick={() => handleApproveRequest(request.id)}
                          disabled={isReviewing}
                        >
                          {isReviewing ? "Saving..." : "Approve"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectRequest(request.id)}
                          disabled={isReviewing}
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>

      <Dialog
        open={joinDialogOpen}
        onOpenChange={(open) => {
          setJoinDialogOpen(open);
          if (!open) {
            setJoinMessage("");
            setJoinDialogError(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request to Join {company.name}</DialogTitle>
            <DialogDescription>
              Share a short note with the company team. This message is optional.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Textarea
              placeholder="Introduce yourself and why you'd like to join..."
              value={joinMessage}
              onChange={(event) => setJoinMessage(event.target.value)}
              rows={5}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {joinMessage.length} / 500
            </p>
            {joinDialogError && (
              <p className="text-sm text-destructive">{joinDialogError}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setJoinDialogOpen(false);
                setJoinDialogError(null);
              }}
              disabled={joinSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitJoinRequest} disabled={joinSubmitting}>
              {joinSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {canEditCompany && (
        <EditCompanyDialog
          company={company}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSaved={(updatedCompany) => {
            setCompany(updatedCompany);
          }}
        />
      )}
    </section>
  );
}
