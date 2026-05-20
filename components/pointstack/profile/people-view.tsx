"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MagnifyingGlass, MapPin } from "@phosphor-icons/react";
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
    <section className="container mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-16 py-10">
      {/* Section heading */}
      <div className="flex items-baseline gap-3.5 pb-3.5 border-b border-foreground mb-6">
        <span className="font-mono text-[11px] text-accent tracking-[1px]">01 /</span>
        <h1 className="font-heading font-semibold text-[26px] leading-none text-foreground">
          People
        </h1>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground tabular-nums">
          {profiles.length} {profiles.length === 1 ? "person" : "people"}
        </span>
      </div>

      <p className="italic text-[15px] text-muted-foreground mb-7">
        Find BAS professionals by name, skill, or location.
      </p>

      {/* Search */}
      <div className="relative border border-border rounded-md bg-card focus-within:border-foreground transition-colors mb-8">
        <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, skill, or location…"
          className="w-full bg-transparent border-none outline-none font-sans text-[14px] text-foreground placeholder:text-muted-foreground/60 placeholder:italic py-3 pl-11 pr-4"
          aria-label="Search people"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-0">
          {Array.from({ length: 6 }).map((_, i) => (
            <PersonRowSkeleton key={i} />
          ))}
        </div>
      )}

      {/* People list */}
      {!loading && profiles.length > 0 && (
        <div className="space-y-0">
          {profiles.map((profile) => (
            <PersonRow key={profile.id} profile={profile} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && profiles.length === 0 && (
        <div className="py-20 text-center italic text-[18px] text-muted-foreground">
          {search
            ? `No one matches "${search}". Try a different name or skill.`
            : "No people yet."}
        </div>
      )}
    </section>
  );
}

function PersonRow({ profile }: { profile: PointStackProfile }) {
  const available = profile.availability_status === "available";

  return (
    <Link
      href={ROUTES.POINTSTACK_PROFILE(profile.display_name || profile.id)}
      className="group grid grid-cols-[48px_1fr_auto] gap-4 items-start py-4 px-2 border-b border-muted hover:bg-muted/40 transition-colors"
    >
      <UserAvatar
        displayName={profile.display_name}
        avatarUrl={profile.avatar_url}
        size="lg"
      />

      <div className="min-w-0">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h3 className="font-heading font-semibold text-[17px] leading-[1.25] text-foreground group-hover:text-accent transition-colors">
            {profile.display_name || "Anonymous"}
          </h3>
          {available && (
            <span className="font-mono text-[9px] uppercase tracking-[1px] text-accent border border-accent px-1.5 py-0.5 rounded-sm">
              Available
            </span>
          )}
        </div>
        {profile.headline && (
          <p className="text-[13px] text-muted-foreground leading-[1.5] mt-0.5 truncate max-w-[560px]">
            {profile.headline}
          </p>
        )}
        <div className="mt-2 flex items-center gap-4 font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground flex-wrap">
          {profile.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {profile.location}
            </span>
          )}
          <span className="tabular-nums">{profile.reputation_score ?? 0} rep</span>
          <span className="tabular-nums">{profile.post_count ?? 0} posts</span>
          {profile.skills && profile.skills.length > 0 && (
            <span className="normal-case tracking-normal text-[11px] text-muted-foreground truncate max-w-[280px]">
              {profile.skills.slice(0, 3).join(" · ")}
              {profile.skills.length > 3 && ` · +${profile.skills.length - 3}`}
            </span>
          )}
        </div>
      </div>

      <span className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground group-hover:text-accent transition-colors self-center">
        View →
      </span>
    </Link>
  );
}

function PersonRowSkeleton() {
  return (
    <div className="grid grid-cols-[48px_1fr_60px] gap-4 items-start py-4 px-2 border-b border-muted">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div>
        <Skeleton className="h-5 w-48 mb-2" />
        <Skeleton className="h-4 w-64 mb-2" />
        <Skeleton className="h-3 w-40" />
      </div>
      <Skeleton className="h-3 w-12 self-center" />
    </div>
  );
}
