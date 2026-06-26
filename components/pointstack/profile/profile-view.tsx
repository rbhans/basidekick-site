"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useAtlasAll } from "@/components/atlas/use-atlas-data";
import { createClient } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileHero } from "./profile-hero";
import { StatLedger } from "./stat-ledger";
import { AboutSection } from "./about-section";
import { ExperienceSection } from "./experience-section";
import { ProjectsSection } from "./projects-section";
import { ContributionsSection } from "./contributions-section";
import { OwnerStrip } from "./owner-strip";
import { ProfileEditDialog } from "./profile-edit-dialog";
import { FollowersDialog } from "./followers-dialog";
import { WorkExperienceManager } from "./work-experience-manager";
import type { CompletionsCatalogEntry } from "./completions-tab";
import { PointStackProfile, PointStackPost, WorkExperience } from "@/lib/types";
import { ROUTES } from "@/lib/routes";
import { usePointStackStore } from "../pointstack-store";
import * as api from "../pointstack-api";
import type { ContributionFeedItem } from "../pointstack-api";
import { toast } from "sonner";

interface ProfileViewProps {
  username: string;
  coursesCatalog?: CompletionsCatalogEntry[];
}

export function PointStackProfileView({ username, coursesCatalog = [] }: ProfileViewProps) {
  const { user } = useAuth();
  const { messageUser } = usePointStackStore();
  const { data: atlasData } = useAtlasAll();

  const [profile, setProfile] = useState<PointStackProfile | null>(null);
  const [showcaseProjects, setShowcaseProjects] = useState<PointStackPost[]>([]);
  const [equipmentIds, setEquipmentIds] = useState<string[]>([]);
  const [workExperience, setWorkExperience] = useState<WorkExperience[]>([]);
  const [contributionFeed, setContributionFeed] = useState<ContributionFeedItem[]>([]);
  const [solutionsCount, setSolutionsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [workManagerOpen, setWorkManagerOpen] = useState(false);
  const [followersDialogOpen, setFollowersDialogOpen] = useState(false);
  const [followersDialogTab, setFollowersDialogTab] = useState<"followers" | "following">("followers");

  const isOwnProfile = Boolean(user && profile && user.id === profile.id);

  const equipmentByBrand = useMemo(() => {
    if (!atlasData || equipmentIds.length === 0) return [];
    const brandById = new Map(atlasData.brands.map((b) => [b.id, b]));
    const typeById = new Map(atlasData.types.map((t) => [t.id, t]));

    const grouped = new Map<
      string,
      { brandName: string; brandSlug: string; items: { id: string; name: string; href: string }[] }
    >();

    for (const id of equipmentIds) {
      const model = atlasData.models.find((m) => m.id === id);
      if (!model) continue;
      const brand = brandById.get(model.brand);
      const type = typeById.get(model.type);
      if (!brand || !type) continue;

      const entry = grouped.get(brand.id) || {
        brandName: brand.name,
        brandSlug: brand.slug || brand.id,
        items: [],
      };
      entry.items.push({
        id: model.id,
        name: model.name,
        href: ROUTES.ATLAS_EQUIPMENT_MODEL(brand.slug || brand.id, type.slug || type.id, model.slug || model.id),
      });
      grouped.set(brand.id, entry);
    }

    return Array.from(grouped.values())
      .map((group) => ({ ...group, items: group.items.sort((a, b) => a.name.localeCompare(b.name)) }))
      .sort((a, b) => a.brandName.localeCompare(b.brandName));
  }, [atlasData, equipmentIds]);

  useEffect(() => {
    let cancelled = false;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const profileData = await api.fetchProfileByUsername(username);
        if (cancelled) return;
        setProfile(profileData);
        if (!profileData) return;

        const supabase = createClient();
        const [followers, following, projects, equipment, work, feed, solutions, followingState] = await Promise.all([
          api.getFollowerCount(profileData.id).catch(() => 0),
          api.getFollowingCount(profileData.id).catch(() => 0),
          api.fetchUserShowcaseProjects(profileData.id).catch(() => []),
          supabase
            ? supabase
                .from("equipment_experience")
                .select("equipment_id")
                .eq("user_id", profileData.id)
                .then(({ data }: { data: { equipment_id: string }[] | null }) =>
                  (data || []).map((r) => r.equipment_id)
                )
                .catch(() => [] as string[])
            : Promise.resolve<string[]>([]),
          api.fetchUserWorkExperience(profileData.id).catch(() => []),
          api.fetchUserContributionFeed(profileData.id).catch(() => []),
          api.getAcceptedAnswerCount(profileData.id).catch(() => 0),
          user && user.id !== profileData.id
            ? api.isFollowing(profileData.id).catch(() => false)
            : Promise.resolve(false),
        ]);

        if (cancelled) return;
        setFollowerCount(followers);
        setFollowingCount(following);
        setShowcaseProjects(projects);
        setEquipmentIds(equipment);
        setWorkExperience(work);
        setContributionFeed(feed);
        setSolutionsCount(solutions);
        setIsFollowing(followingState);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProfile();
    return () => {
      cancelled = true;
    };
  }, [username, user]);

  const refreshWorkExperience = async () => {
    if (!profile) return;
    try {
      const work = await api.fetchUserWorkExperience(profile.id);
      setWorkExperience(work);
    } catch (error) {
      console.error("Error refreshing work experience:", error);
    }
  };

  const handleFollow = async () => {
    if (!profile) return;
    const wasFollowing = isFollowing;
    const prevCount = followerCount;
    try {
      if (isFollowing) {
        setIsFollowing(false);
        setFollowerCount((c) => Math.max(0, c - 1));
        await api.unfollowUser(profile.id);
      } else {
        setIsFollowing(true);
        setFollowerCount((c) => c + 1);
        await api.followUser(profile.id);
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      setIsFollowing(wasFollowing);
      setFollowerCount(prevCount);
      toast.error("Failed to update follow status. Please try again.");
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return (
      <section className="mx-auto max-w-[1060px] px-4 py-16 text-center sm:px-6 lg:px-14">
        <p className="mb-5 text-[20px] italic text-muted-foreground">This person isn&apos;t in the set.</p>
        <Link
          href={ROUTES.POINTSTACK}
          className="font-mono text-[11px] uppercase tracking-[1.2px] text-foreground transition-colors hover:text-accent"
        >
          ← Back to PointStack
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-[1060px] px-4 pb-20 pt-7 sm:px-6 lg:px-14">
      <ProfileHero
        profile={profile}
        isOwnProfile={isOwnProfile}
        viewerLoggedIn={Boolean(user)}
        isFollowing={isFollowing}
        onFollow={handleFollow}
        onMessage={() => messageUser(profile.id)}
        onEdit={() => setEditDialogOpen(true)}
      />

      <StatLedger
        reputation={profile.reputation_score || 0}
        contributions={contributionFeed.length}
        solutions={solutionsCount}
        followers={followerCount}
        following={followingCount}
        onShowFollowers={() => {
          setFollowersDialogTab("followers");
          setFollowersDialogOpen(true);
        }}
        onShowFollowing={() => {
          setFollowersDialogTab("following");
          setFollowersDialogOpen(true);
        }}
      />

      <AboutSection profile={profile} isOwnProfile={isOwnProfile} />

      <ExperienceSection
        entries={workExperience}
        equipmentByBrand={equipmentByBrand}
        isOwnProfile={isOwnProfile}
        onManage={() => setWorkManagerOpen(true)}
      />

      <ProjectsSection projects={showcaseProjects} />

      <ContributionsSection items={contributionFeed} />

      {isOwnProfile && <OwnerStrip userId={profile.id} coursesCatalog={coursesCatalog} />}

      {isOwnProfile && (
        <>
          <ProfileEditDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            profile={profile}
            onSave={(updatedProfile) => setProfile(updatedProfile)}
          />
          <WorkExperienceManager
            open={workManagerOpen}
            onOpenChange={setWorkManagerOpen}
            entries={workExperience}
            onChanged={refreshWorkExperience}
          />
        </>
      )}

      <FollowersDialog
        open={followersDialogOpen}
        onOpenChange={setFollowersDialogOpen}
        userId={profile.id}
        initialTab={followersDialogTab}
        followerCount={followerCount}
        followingCount={followingCount}
      />
    </section>
  );
}

function ProfileSkeleton() {
  return (
    <section className="mx-auto max-w-[1060px] px-4 pb-20 pt-7 sm:px-6 lg:px-14">
      <Skeleton className="h-[150px] w-full rounded-t-lg" />
      <div className="rounded-b-lg border border-t-0 border-[var(--sand-line-2)] px-7 pb-6">
        <div className="-mt-[46px] flex items-end gap-5">
          <Skeleton className="h-[104px] w-[104px] rounded-lg" />
          <div className="flex-1 pb-2">
            <Skeleton className="mb-2 h-8 w-60" />
            <Skeleton className="h-4 w-80" />
          </div>
        </div>
      </div>
      <Skeleton className="mt-4 h-16 w-full rounded-md" />
      <Skeleton className="mt-11 h-40 w-full" />
    </section>
  );
}
