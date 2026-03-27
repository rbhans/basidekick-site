"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { UserPlus, Check } from "@phosphor-icons/react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserAvatar } from "../shared/user-avatar";
import { PointStackProfile } from "@/lib/types";
import { ROUTES } from "@/lib/routes";
import * as api from "../pointstack-api";

interface FollowersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  initialTab?: "followers" | "following";
  followerCount: number;
  followingCount: number;
}

export function FollowersDialog({
  open,
  onOpenChange,
  userId,
  initialTab = "followers",
  followerCount,
  followingCount,
}: FollowersDialogProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"followers" | "following">(initialTab);
  const [followers, setFollowers] = useState<PointStackProfile[]>([]);
  const [following, setFollowing] = useState<PointStackProfile[]>([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const [followingState, setFollowingState] = useState<Record<string, boolean>>({});

  // Reset tab when dialog opens
  useEffect(() => {
    if (open) {
      setActiveTab(initialTab);
    }
  }, [open, initialTab]);

  // Fetch followers when tab is active
  useEffect(() => {
    if (!open || activeTab !== "followers") return;

    const fetchFollowers = async () => {
      setLoadingFollowers(true);
      try {
        const data = await api.fetchFollowers(userId);
        setFollowers(data);

        // Batch check if current user follows each follower
        if (user) {
          const ids = data.map((f) => f.id).filter((id) => id !== user.id);
          const states = await api.isFollowingBatch(ids);
          setFollowingState((prev) => ({ ...prev, ...states }));
        }
      } catch (error) {
        console.error("Error fetching followers:", error);
      } finally {
        setLoadingFollowers(false);
      }
    };

    fetchFollowers();
  }, [open, activeTab, userId, user]);

  // Fetch following when tab is active
  useEffect(() => {
    if (!open || activeTab !== "following") return;

    const fetchFollowing = async () => {
      setLoadingFollowing(true);
      try {
        const data = await api.fetchFollowing(userId);
        setFollowing(data);

        // Batch check if current user follows each profile
        if (user) {
          const ids = data.map((p) => p.id).filter((id) => id !== user.id);
          const states = await api.isFollowingBatch(ids);
          setFollowingState((prev) => ({ ...prev, ...states }));
        }
      } catch (error) {
        console.error("Error fetching following:", error);
      } finally {
        setLoadingFollowing(false);
      }
    };

    fetchFollowing();
  }, [open, activeTab, userId, user]);

  const handleFollow = async (profileId: string) => {
    if (!user) return;

    try {
      if (followingState[profileId]) {
        await api.unfollowUser(profileId);
        setFollowingState((prev) => ({ ...prev, [profileId]: false }));
      } else {
        await api.followUser(profileId);
        setFollowingState((prev) => ({ ...prev, [profileId]: true }));
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  const renderProfile = (profile: PointStackProfile) => {
    const isCurrentUser = user?.id === profile.id;
    const isFollowing = followingState[profile.id];

    return (
      <div
        key={profile.id}
        className="flex items-center justify-between p-3 rounded-md hover:bg-muted/50 transition-colors"
      >
        <Link
          href={ROUTES.POINTSTACK_PROFILE(profile.display_name || profile.id)}
          className="flex items-center gap-3 flex-1 min-w-0"
          onClick={() => onOpenChange(false)}
        >
          <UserAvatar
            displayName={profile.display_name}
            avatarUrl={profile.avatar_url}
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="font-medium text-sm truncate">
                {profile.display_name || "Anonymous"}
              </p>
              {profile.is_verified && (
                <Badge className="gap-0.5 px-1 py-0 text-[10px] bg-blue-500/10 text-blue-600 border-blue-500/20">
                  <Check className="w-2.5 h-2.5" />
                </Badge>
              )}
            </div>
            {profile.headline && (
              <p className="text-xs text-muted-foreground truncate">
                {profile.headline}
              </p>
            )}
          </div>
        </Link>

        {user && !isCurrentUser && (
          <Button
            size="sm"
            variant={isFollowing ? "outline" : "default"}
            onClick={() => handleFollow(profile.id)}
            className="shrink-0 ml-2"
          >
            {isFollowing ? (
              <>
                <Check className="w-3 h-3 mr-1" />
                Following
              </>
            ) : (
              <>
                <UserPlus className="w-3 h-3 mr-1" />
                Follow
              </>
            )}
          </Button>
        )}
      </div>
    );
  };

  const renderLoading = () => (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Connections</DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "followers" | "following")}
        >
          <TabsList className="w-full">
            <TabsTrigger value="followers" className="flex-1">
              Followers ({followerCount})
            </TabsTrigger>
            <TabsTrigger value="following" className="flex-1">
              Following ({followingCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="followers" className="mt-4 max-h-[50vh] overflow-y-auto">
            {loadingFollowers ? (
              renderLoading()
            ) : followers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No followers yet.
              </div>
            ) : (
              <div className="space-y-1">{followers.map(renderProfile)}</div>
            )}
          </TabsContent>

          <TabsContent value="following" className="mt-4 max-h-[50vh] overflow-y-auto">
            {loadingFollowing ? (
              renderLoading()
            ) : following.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Not following anyone yet.
              </div>
            ) : (
              <div className="space-y-1">{following.map(renderProfile)}</div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
