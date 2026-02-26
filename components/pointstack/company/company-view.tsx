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
      <div className="max-w-4xl mx-auto p-6">
        <Skeleton className="h-4 w-24 mb-6" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Company not found</h2>
          <p className="text-muted-foreground mb-4">This company doesn&apos;t exist.</p>
          <Button asChild>
            <Link href={`${ROUTES.POINTSTACK}/companies`}>Back to Companies</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <Link
        href={`${ROUTES.POINTSTACK}/companies`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Companies
      </Link>

      {/* Company header */}
      <div className="border border-border/40 rounded-xl bg-card p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          {company.logo_url ? (
            <img
              src={company.logo_url}
              alt={company.name}
              className="w-24 h-24 rounded-lg object-cover mx-auto md:mx-0"
            />
          ) : (
            <div className="w-24 h-24 rounded-lg bg-primary/10 flex items-center justify-center mx-auto md:mx-0">
              <span className="text-3xl font-bold text-primary">
                {company.name.charAt(0)}
              </span>
            </div>
          )}

          <div className="flex-1 text-center md:text-left">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <h1 className="text-2xl font-bold">{company.name}</h1>
                {company.is_verified && (
                  <Badge variant="secondary">Verified</Badge>
                )}
              </div>
              {canEditCompany && (
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={() => setEditDialogOpen(true)}
                >
                  <PencilSimple className="w-4 h-4 mr-1.5" />
                  Edit
                </Button>
              )}
            </div>

            {company.industry && (
              <p className="text-lg text-muted-foreground mb-2">{company.industry}</p>
            )}

            <div className="flex items-center gap-4 justify-center md:justify-start text-sm text-muted-foreground">
              {company.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{company.location}</span>
                </div>
              )}
              {company.size_range && (
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{company.size_range} employees</span>
                </div>
              )}
              {company.website_url && (
                <a
                  href={company.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  <Globe className="w-4 h-4" />
                  <span>Website</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {company.description && (
          <div className="mt-6 pt-6 border-t border-border/40">
            <p className="text-muted-foreground">{company.description}</p>
          </div>
        )}

        {showJoinActions && (
          <div className="mt-6 pt-6 border-t border-border/40">
            <div className="flex flex-wrap items-center gap-2">
              {joinRequest?.status === "pending" && (
                <>
                  <Badge variant="secondary">Request Pending</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelJoinRequest}
                    disabled={joinSubmitting}
                  >
                    {joinSubmitting ? "Canceling..." : "Cancel Request"}
                  </Button>
                </>
              )}

              {joinRequest?.status === "approved" && (
                <Badge variant="secondary">Request Approved</Badge>
              )}

              {joinRequest?.status === "rejected" && (
                <Badge variant="destructive">Request Declined</Badge>
              )}

              {!joinRequest && (
                <Button onClick={handleOpenJoinDialog}>
                  Request to Join
                </Button>
              )}
            </div>

            {joinActionError && (
              <p className="mt-2 text-sm text-destructive">{joinActionError}</p>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="team">
        <TabsList>
          <TabsTrigger value="team">Team ({company.members?.length || 0})</TabsTrigger>
          <TabsTrigger value="projects">Projects ({companyProjects.length})</TabsTrigger>
          <TabsTrigger value="jobs">Jobs ({companyJobs.length})</TabsTrigger>
          {canManageRequests && (
            <TabsTrigger value="requests">Requests ({pendingRequests.length})</TabsTrigger>
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
                      className="flex items-center gap-3 p-3 border border-border/40 rounded-xl bg-card hover:border-primary/30"
                    >
                      {memberContent}
                    </Link>
                  );
                }

                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-3 border border-border/40 rounded-xl bg-card"
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
                  className="block rounded-xl border border-border/40 bg-card hover:border-primary/30 transition-colors p-4"
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
                  className="block rounded-xl border border-border/40 bg-card hover:border-primary/30 transition-colors p-4"
                >
                  <div className="flex items-start gap-3">
                    {job.company?.logo_url ? (
                      <img
                        src={job.company.logo_url}
                        alt={job.company.name}
                        className="w-10 h-10 rounded object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center shrink-0">
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
                      className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 p-4 border border-border/40 rounded-xl bg-card"
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
    </div>
  );
}
