"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MagnifyingGlass, MapPin, Briefcase } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "../shared/user-avatar";
import { ROUTES } from "@/lib/routes";
import { PointStackProfile } from "@/lib/types";
import * as api from "../pointstack-api";

export function PointStackPeopleView() {
  const [profiles, setProfiles] = useState<PointStackProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      try {
        const data = await api.fetchProfiles(search || undefined);
        setProfiles(data);
      } catch (error) {
        console.error("Error fetching profiles:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchProfiles, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-heading font-bold">People</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Discover and connect with BAS professionals.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name..."
          className="w-full h-11 bg-card border border-border rounded-md pl-11 pr-4 text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors"
        />
      </div>

      {/* Loading state */}
      {loading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <PersonCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* People grid */}
      {!loading && profiles.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => (
            <PersonCard key={profile.id} profile={profile} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && profiles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {search ? "No users found matching your search." : "No users yet."}
          </p>
        </div>
      )}
    </div>
  );
}

function PersonCard({ profile }: { profile: PointStackProfile }) {
  return (
    <Link
      href={ROUTES.POINTSTACK_PROFILE(profile.display_name || profile.id)}
      className="block p-4 border border-border rounded-md bg-card hover:border-foreground transition-colors"
    >
      <div className="flex items-start gap-3">
        <UserAvatar
          displayName={profile.display_name}
          avatarUrl={profile.avatar_url}
          size="lg"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{profile.display_name || "Anonymous"}</h3>
          {profile.headline && (
            <p className="text-sm text-muted-foreground truncate">{profile.headline}</p>
          )}
          {profile.location && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <MapPin className="w-3 h-3" />
              <span>{profile.location}</span>
            </div>
          )}
        </div>
        {profile.availability_status === "available" && (
          <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600">
            Available
          </Badge>
        )}
      </div>

      {/* Skills */}
      {profile.skills && profile.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {profile.skills.slice(0, 4).map((skill) => (
            <Badge key={skill} variant="outline" className="text-xs">
              {skill}
            </Badge>
          ))}
          {profile.skills.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{profile.skills.length - 4}
            </Badge>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
        <span>{profile.reputation_score} reputation</span>
        <span>{profile.post_count} posts</span>
      </div>
    </Link>
  );
}

function PersonCardSkeleton() {
  return (
    <div className="p-4 border border-border rounded-md bg-card">
      <div className="flex items-start gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-32 mb-1" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="flex gap-1.5 mt-3">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-16" />
      </div>
    </div>
  );
}
