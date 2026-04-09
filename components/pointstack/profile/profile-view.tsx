"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  MapPin,
  Globe,
  LinkedinLogo,
  GithubLogo,
  UserPlus,
  Check,
  PencilSimple,
} from "@phosphor-icons/react";
import { useAuth } from "@/hooks/use-auth";
import { useAtlasAll } from "@/components/atlas/use-atlas-data";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "../shared/user-avatar";
import { FeedCard } from "../feed/feed-card";
import { ProfileEditDialog } from "./profile-edit-dialog";
import { FollowersDialog } from "./followers-dialog";
import { ActivityFeed } from "./activity-feed";
import { ContributionsTab } from "./contributions-tab";
import { PointStackProfile, PointStackPost } from "@/lib/types";
import { ROUTES } from "@/lib/routes";
import { usePointStackStore } from "../pointstack-store";
import * as api from "../pointstack-api";
import { toast } from "sonner";

interface ProfileViewProps {
  username: string;
}

export function PointStackProfileView({ username }: ProfileViewProps) {
  const { user } = useAuth();
  const { messageUser } = usePointStackStore();
  const [profile, setProfile] = useState<PointStackProfile | null>(null);
  const [posts, setPosts] = useState<PointStackPost[]>([]);
  const [showcaseProjects, setShowcaseProjects] = useState<PointStackPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [equipmentIds, setEquipmentIds] = useState<string[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [followersDialogOpen, setFollowersDialogOpen] = useState(false);
  const [followersDialogTab, setFollowersDialogTab] = useState<"followers" | "following">("followers");
  const { data: atlasData } = useAtlasAll();

  const brandById = useMemo(() => new Map(atlasData?.brands.map((b) => [b.id, b]) || []), [atlasData]);
  const typeById = useMemo(() => new Map(atlasData?.types.map((t) => [t.id, t]) || []), [atlasData]);
  const modelById = useMemo(() => new Map(atlasData?.models.map((m) => [m.id, m]) || []), [atlasData]);

  const isOwnProfile = user && profile && user.id === profile.id;

  const equipmentByBrand = useMemo(() => {
    if (!atlasData || equipmentIds.length === 0) return [];
    const brandById = new Map(atlasData.brands.map((b) => [b.id, b]));
    const typeById = new Map(atlasData.types.map((t) => [t.id, t]));

    const grouped = new Map<string, { brandName: string; brandSlug: string; items: { id: string; name: string; href: string }[] }>();

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

    return Array.from(grouped.values()).map((group) => ({
      ...group,
      items: group.items.sort((a, b) => a.name.localeCompare(b.name)),
    })).sort((a, b) => a.brandName.localeCompare(b.brandName));
  }, [atlasData, equipmentIds]);

  const getEquipmentLinks = (ids: string[] = []) => {
    if (!atlasData) return [];
    return ids
      .map((id) => {
        const model = modelById.get(id);
        if (!model) return null;
        const brand = brandById.get(model.brand);
        const type = typeById.get(model.type);
        if (!brand || !type) return null;
        return {
          id,
          name: model.name,
          href: ROUTES.ATLAS_EQUIPMENT_MODEL(brand.slug || brand.id, type.slug || type.id, model.slug || model.id),
        };
      })
      .filter(Boolean) as { id: string; name: string; href: string }[];
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const profileData = await api.fetchProfileByUsername(username);
        setProfile(profileData);

        if (profileData) {
          const [followers, following] = await Promise.all([
            api.getFollowerCount(profileData.id),
            api.getFollowingCount(profileData.id),
          ]);
          setFollowerCount(followers);
          setFollowingCount(following);

          if (user && user.id !== profileData.id) {
            const following = await api.isFollowing(profileData.id);
            setIsFollowing(following);
          }

          // Fetch user's posts
          const userPosts = await api.fetchUserPosts(profileData.id);
          setPosts(userPosts);

          // Fetch showcase projects
          const projects = await api.fetchUserShowcaseProjects(profileData.id);
          setShowcaseProjects(projects);

          // Fetch equipment experience
          const supabase = createClient();
          if (supabase) {
            const { data: experienceRows } = await supabase
              .from("equipment_experience")
              .select("equipment_id")
              .eq("user_id", profileData.id);

            setEquipmentIds((experienceRows || []).map((row: { equipment_id: string }) => row.equipment_id));
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username, user]);

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
      <section className="container mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-16 py-16 text-center">
        <p className="font-heading italic text-[20px] text-muted-foreground mb-5">
          This person isn&apos;t in the set.
        </p>
        <Link
          href={ROUTES.POINTSTACK}
          className="font-mono text-[11px] uppercase tracking-[1.2px] text-foreground hover:text-accent transition-colors"
        >
          ← Back to PointStack
        </Link>
      </section>
    );
  }

  return (
    <section className="container mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-16 py-10">
      {/* Profile header */}
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-6 items-start pb-6 mb-8 border-b border-foreground">
        {/* Avatar */}
        <UserAvatar
          displayName={profile.display_name}
          avatarUrl={profile.avatar_url}
          size="xl"
        />

        {/* Info */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h1 className="font-heading font-semibold text-[30px] md:text-[36px] leading-[1.1] tracking-[-0.015em] text-foreground">
              {profile.display_name || "Anonymous"}
            </h1>
            {profile.is_verified && (
              <span className="font-mono text-[9px] uppercase tracking-[1px] text-accent border border-accent px-1.5 py-0.5 rounded-sm inline-flex items-center gap-1">
                <Check className="w-2.5 h-2.5" weight="bold" />
                Verified
              </span>
            )}
            {profile.availability_status === "available" && (
              <span className="font-mono text-[9px] uppercase tracking-[1px] text-accent border border-accent px-1.5 py-0.5 rounded-sm">
                Available for work
              </span>
            )}
          </div>

          {profile.headline && (
            <p className="font-heading italic text-[17px] text-muted-foreground leading-[1.4] mb-3 max-w-[620px]">
              {profile.headline}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 font-mono text-[11px] uppercase tracking-[1.2px] text-muted-foreground mb-4">
            {profile.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-3 h-3" />
                {profile.location}
              </span>
            )}
            <span className="tabular-nums">
              <span className="text-foreground font-bold">{profile.reputation_score}</span> rep
            </span>
            <button
              onClick={() => {
                setFollowersDialogTab("followers");
                setFollowersDialogOpen(true);
              }}
              className="hover:text-accent transition-colors"
            >
              <span className="text-foreground font-bold tabular-nums">{followerCount}</span> followers
            </button>
            <button
              onClick={() => {
                setFollowersDialogTab("following");
                setFollowersDialogOpen(true);
              }}
              className="hover:text-accent transition-colors"
            >
              <span className="text-foreground font-bold tabular-nums">{followingCount}</span> following
            </button>
          </div>

          {/* Social links */}
          {(profile.website_url || profile.linkedin_url || profile.github_url) && (
            <div className="flex items-center gap-3">
              {profile.website_url && (
                <a
                  href={profile.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 border border-border rounded-sm flex items-center justify-center text-muted-foreground hover:border-foreground hover:text-accent transition-colors"
                  aria-label="Visit website"
                >
                  <Globe className="w-4 h-4" />
                </a>
              )}
              {profile.linkedin_url && (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 border border-border rounded-sm flex items-center justify-center text-muted-foreground hover:border-foreground hover:text-accent transition-colors"
                  aria-label="LinkedIn profile"
                >
                  <LinkedinLogo className="w-4 h-4" />
                </a>
              )}
              {profile.github_url && (
                <a
                  href={profile.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 border border-border rounded-sm flex items-center justify-center text-muted-foreground hover:border-foreground hover:text-accent transition-colors"
                  aria-label="GitHub profile"
                >
                  <GithubLogo className="w-4 h-4" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 shrink-0">
          {isOwnProfile ? (
            <button
              onClick={() => setEditDialogOpen(true)}
              className="inline-flex items-center gap-2 border-[1.5px] border-foreground px-4 py-2.5 rounded-md font-mono text-[11px] uppercase tracking-[1.2px] text-foreground hover:border-accent hover:text-accent transition-colors"
            >
              <PencilSimple className="w-3 h-3" />
              Edit profile
            </button>
          ) : user ? (
            <>
              <button
                onClick={handleFollow}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-md font-mono text-[11px] uppercase tracking-[1.2px] transition-colors ${
                  isFollowing
                    ? "border-[1.5px] border-foreground text-foreground hover:border-accent hover:text-accent"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                {isFollowing ? (
                  <>
                    <Check className="w-3 h-3" />
                    Following
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3 h-3" />
                    Follow
                  </>
                )}
              </button>
              <button
                onClick={() => profile && messageUser(profile.id)}
                className="border-[1.5px] border-foreground px-4 py-2.5 rounded-md font-mono text-[11px] uppercase tracking-[1.2px] text-foreground hover:border-accent hover:text-accent transition-colors"
              >
                Message
              </button>
            </>
          ) : null}
        </div>
      </div>

      {/* Skills */}
      {profile.skills && profile.skills.length > 0 && (
        <div className="mb-10">
          <div className="font-mono text-[10px] uppercase tracking-[1.4px] text-muted-foreground mb-3 pb-2.5 border-b border-border">
            <span className="text-accent mr-1.5">·</span>
            Skills
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <span
                key={skill}
                className="font-mono text-[10px] uppercase tracking-[1.1px] text-foreground border border-border bg-card px-2 py-1 rounded-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="posts">
        <TabsList className="flex-wrap h-auto gap-1 bg-transparent border-b border-border rounded-none p-0 mb-6">
          <TabsTrigger
            value="posts"
            className="font-mono text-[11px] uppercase tracking-[1.2px] data-[state=active]:text-accent data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:-mb-px data-[state=active]:rounded-none rounded-none pb-2"
          >
            Posts ({posts.length})
          </TabsTrigger>
          <TabsTrigger
            value="equipment"
            className="font-mono text-[11px] uppercase tracking-[1.2px] data-[state=active]:text-accent data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:-mb-px data-[state=active]:rounded-none rounded-none pb-2"
          >
            Equipment
          </TabsTrigger>
          <TabsTrigger
            value="projects"
            className="font-mono text-[11px] uppercase tracking-[1.2px] data-[state=active]:text-accent data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:-mb-px data-[state=active]:rounded-none rounded-none pb-2"
          >
            Projects ({showcaseProjects.length})
          </TabsTrigger>
          <TabsTrigger
            value="contributions"
            className="font-mono text-[11px] uppercase tracking-[1.2px] data-[state=active]:text-accent data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:-mb-px data-[state=active]:rounded-none rounded-none pb-2"
          >
            Contributions
          </TabsTrigger>
          <TabsTrigger
            value="activity"
            className="font-mono text-[11px] uppercase tracking-[1.2px] data-[state=active]:text-accent data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:-mb-px data-[state=active]:rounded-none rounded-none pb-2"
          >
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-4">
          {posts.length > 0 ? (
            <div className="space-y-3">
              {posts.map((post) => (
                <FeedCard
                  key={post.id}
                  post={post}
                  equipmentLinks={getEquipmentLinks(post.equipment_ids || [])}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center font-heading italic text-[18px] text-muted-foreground">
              No posts yet.
            </div>
          )}
        </TabsContent>

        <TabsContent value="equipment" className="mt-4">
          {equipmentByBrand.length === 0 ? (
            <div className="py-16 text-center font-heading italic text-[18px] text-muted-foreground">
              No equipment experience yet.
            </div>
          ) : (
            <div className="space-y-6">
              {equipmentByBrand.map((group) => (
                <div key={group.brandSlug}>
                  <h3 className="font-mono text-[10px] uppercase tracking-[1.3px] text-muted-foreground mb-3 pb-2 border-b border-border">
                    <span className="text-accent mr-1.5">·</span>
                    {group.brandName}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <Link
                        key={item.id}
                        href={item.href}
                        className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground border border-border bg-card px-2 py-1 rounded-sm hover:border-accent hover:text-accent transition-colors"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="projects" className="mt-4">
          {showcaseProjects.length > 0 ? (
            <div className="space-y-3">
              {showcaseProjects.map((project) => (
                <FeedCard
                  key={project.id}
                  post={project}
                  equipmentLinks={getEquipmentLinks(project.equipment_ids || [])}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center font-heading italic text-[18px] text-muted-foreground">
              No showcase projects yet.
            </div>
          )}
        </TabsContent>

        <TabsContent value="contributions" className="mt-4">
          <ContributionsTab userId={profile.id} />
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <ActivityFeed userId={profile.id} />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      {isOwnProfile && (
        <ProfileEditDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          profile={profile}
          onSave={(updatedProfile) => setProfile(updatedProfile)}
        />
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
    <section className="container mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-16 py-10">
      <div className="grid grid-cols-[auto_1fr] gap-6 pb-6 mb-8 border-b border-foreground">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div>
          <Skeleton className="h-9 w-60 mb-2" />
          <Skeleton className="h-5 w-80 mb-3" />
          <Skeleton className="h-3 w-60" />
        </div>
      </div>
      <Skeleton className="h-10 w-full mb-4" />
      <Skeleton className="h-32 w-full" />
    </section>
  );
}
