"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, Users, Globe, ArrowLeft } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserAvatar } from "../shared/user-avatar";
import { ROUTES } from "@/lib/routes";
import { PointStackCompany } from "@/lib/types";
import * as api from "../pointstack-api";

interface CompanyViewProps {
  slug: string;
}

export function PointStackCompanyView({ slug }: CompanyViewProps) {
  const [company, setCompany] = useState<PointStackCompany | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      setLoading(true);
      try {
        const data = await api.fetchCompanyBySlug(slug);
        setCompany(data);
      } catch (error) {
        console.error("Error fetching company:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [slug]);

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
      <div className="border border-border rounded-lg p-6 mb-6">
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
            <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
              <h1 className="text-2xl font-bold">{company.name}</h1>
              {company.is_verified && (
                <Badge variant="secondary">Verified</Badge>
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
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-muted-foreground">{company.description}</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="team">
        <TabsList>
          <TabsTrigger value="team">Team ({company.members?.length || 0})</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
        </TabsList>

        <TabsContent value="team" className="mt-6">
          {company.members && company.members.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {company.members.map((member) => (
                <Link
                  key={member.id}
                  href={ROUTES.POINTSTACK_PROFILE(member.profile?.display_name || "")}
                  className="flex items-center gap-3 p-3 border border-border rounded-lg hover:border-primary/30"
                >
                  <UserAvatar
                    displayName={member.profile?.display_name || null}
                    avatarUrl={member.profile?.avatar_url}
                    size="md"
                  />
                  <div>
                    <p className="font-medium">{member.profile?.display_name || "Anonymous"}</p>
                    <p className="text-sm text-muted-foreground">{member.title || member.role}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No team members yet.
            </div>
          )}
        </TabsContent>

        <TabsContent value="projects" className="mt-6">
          <div className="text-center py-12 text-muted-foreground">
            No projects yet.
          </div>
        </TabsContent>

        <TabsContent value="jobs" className="mt-6">
          <div className="text-center py-12 text-muted-foreground">
            No open positions.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
