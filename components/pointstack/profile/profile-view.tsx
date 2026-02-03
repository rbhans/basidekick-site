"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
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
import { PointStackProfile, PointStackPost } from "@/lib/types";
import { ROUTES } from "@/lib/routes";
import * as api from "../pointstack-api";

interface ProfileViewProps {
  username: string;
}

export function PointStackProfileView({ username }: ProfileViewProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<PointStackProfile | null>(null);
  const [posts, setPosts] = useState<PointStackPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [equipmentIds, setEquipmentIds] = useState<string[]>([]);
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
        href: ROUTES.EQUIPMENT_MODEL(brand.slug || brand.id, type.slug || type.id, model.slug || model.id),
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
          href: ROUTES.EQUIPMENT_MODEL(brand.slug || brand.id, type.slug || type.id, model.slug || model.id),
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
          const userPosts = await api.fetchPosts({ following: false }, 20, 0);
          setPosts(userPosts.filter((p) => p.author_id === profileData.id));

          // Fetch equipment experience
          const supabase = createClient();
          if (supabase) {
            const { data: experienceRows } = await supabase
              .from("equipment_experience")
              .select("equipment_id")
              .eq("user_id", profileData.id);

            setEquipmentIds((experienceRows || []).map((row) => row.equipment_id));
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
    try {
      if (isFollowing) {
        await api.unfollowUser(profile.id);
        setIsFollowing(false);
        setFollowerCount((c) => Math.max(0, c - 1));
      } else {
        await api.followUser(profile.id);
        setIsFollowing(true);
        setFollowerCount((c) => c + 1);
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">User not found</h2>
          <p className="text-muted-foreground mb-4">This user doesn&apos;t exist or has been removed.</p>
          <Button asChild>
            <Link href={ROUTES.POINTSTACK}>Back to PointStack</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {/* Profile header */}
      <div className="border border-border rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <UserAvatar
            displayName={profile.display_name}
            avatarUrl={profile.avatar_url}
            size="xl"
            className="mx-auto md:mx-0"
          />

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold">{profile.display_name || "Anonymous"}</h1>
              {profile.is_verified && (
                <Badge className="gap-1 bg-blue-500/10 text-blue-600 border-blue-500/20 w-fit mx-auto md:mx-0">
                  <Check className="w-3 h-3" />
                  Verified
                </Badge>
              )}
              {profile.availability_status === "available" && (
                <Badge className="gap-1 bg-green-500/10 text-green-600 border-green-500/20 w-fit mx-auto md:mx-0">
                  Available for work
                </Badge>
              )}
            </div>

            {profile.headline && (
              <p className="text-lg text-muted-foreground mb-2">{profile.headline}</p>
            )}

            {profile.location && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground justify-center md:justify-start mb-4">
                <MapPin className="w-4 h-4" />
                <span>{profile.location}</span>
              </div>
            )}

            {/* Social links */}
            <div className="flex items-center gap-2 justify-center md:justify-start mb-4">
              {profile.website_url && (
                <a
                  href={profile.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-muted rounded-md"
                >
                  <Globe className="w-5 h-5" />
                </a>
              )}
              {profile.linkedin_url && (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-muted rounded-md"
                >
                  <LinkedinLogo className="w-5 h-5" />
                </a>
              )}
              {profile.github_url && (
                <a
                  href={profile.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-muted rounded-md"
                >
                  <GithubLogo className="w-5 h-5" />
                </a>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm justify-center md:justify-start">
              <div>
                <span className="font-semibold">{profile.reputation_score}</span>
                <span className="text-muted-foreground ml-1">reputation</span>
              </div>
              <div>
                <span className="font-semibold">{followerCount}</span>
                <span className="text-muted-foreground ml-1">followers</span>
              </div>
              <div>
                <span className="font-semibold">{followingCount}</span>
                <span className="text-muted-foreground ml-1">following</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            {isOwnProfile ? (
              <Button asChild variant="outline">
                <Link href={ROUTES.ACCOUNT}>
                  <PencilSimple className="w-4 h-4 mr-2" />
                  Edit Profile
                </Link>
              </Button>
            ) : user ? (
              <>
                <Button onClick={handleFollow} variant={isFollowing ? "outline" : "default"}>
                  {isFollowing ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Follow
                    </>
                  )}
                </Button>
                <Button variant="outline" asChild>
                  <Link href={ROUTES.POINTSTACK_MESSAGES}>Message</Link>
                </Button>
              </>
            ) : null}
          </div>
        </div>

        {/* Skills */}
        {profile.skills && profile.skills.length > 0 && (
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="text-sm font-medium mb-2">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="posts">
        <TabsList>
          <TabsTrigger value="posts">Posts ({posts.length})</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-6">
          {posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post) => (
                <FeedCard
                  key={post.id}
                  post={post}
                  equipmentLinks={getEquipmentLinks(post.equipment_ids || [])}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No posts yet.
            </div>
          )}
        </TabsContent>

        <TabsContent value="equipment" className="mt-6">
          {equipmentByBrand.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No equipment experience yet.
            </div>
          ) : (
            <div className="space-y-6">
              {equipmentByBrand.map((group) => (
                <div key={group.brandSlug}>
                  <h3 className="text-sm font-semibold mb-2">{group.brandName}</h3>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <Link key={item.id} href={item.href}>
                        <Badge variant="secondary" className="text-xs">
                          {item.name}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="projects" className="mt-6">
          <div className="text-center py-12 text-muted-foreground">
            No projects yet.
          </div>
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <div className="text-center py-12 text-muted-foreground">
            No recent activity.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="border border-border rounded-lg p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <Skeleton className="h-16 w-16 rounded-full mx-auto md:mx-0" />
          <div className="flex-1">
            <Skeleton className="h-8 w-48 mb-2 mx-auto md:mx-0" />
            <Skeleton className="h-5 w-64 mb-4 mx-auto md:mx-0" />
            <Skeleton className="h-4 w-32 mx-auto md:mx-0" />
          </div>
        </div>
      </div>
    </div>
  );
}
