"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  ChatCircle,
  Article,
  Note,
  Wrench,
  BookOpen,
} from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";
import { ActivityItem, ActivityItemType } from "@/lib/types";
import * as api from "../pointstack-api";

interface ActivityFeedProps {
  userId: string;
}

const ACTIVITY_ICONS: Record<ActivityItemType, React.ElementType> = {
  post: Article,
  comment: ChatCircle,
  babel_contribution: Wrench,
  equipment_submission: Wrench,
  equipment_note: Note,
  wiki_article: BookOpen,
};

const ACTIVITY_COLORS: Record<ActivityItemType, string> = {
  post: "text-blue-500 bg-blue-500/10",
  comment: "text-green-500 bg-green-500/10",
  babel_contribution: "text-orange-500 bg-orange-500/10",
  equipment_submission: "text-purple-500 bg-purple-500/10",
  equipment_note: "text-yellow-500 bg-yellow-500/10",
  wiki_article: "text-cyan-500 bg-cyan-500/10",
};

export function ActivityFeed({ userId }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      setLoading(true);
      try {
        const data = await api.fetchUserActivity(userId, 30);
        setActivities(data);
      } catch (error) {
        console.error("Error fetching activity:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No recent activity.
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {activities.map((activity) => {
        const Icon = ACTIVITY_ICONS[activity.type] || Article;
        const colorClass = ACTIVITY_COLORS[activity.type] || "text-muted-foreground bg-muted";

        const content = (
          <div className="flex gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colorClass}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{activity.title}</p>
              {activity.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                  {activity.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        );

        if (activity.link) {
          return (
            <Link key={activity.id} href={activity.link}>
              {content}
            </Link>
          );
        }

        return <div key={activity.id}>{content}</div>;
      })}
    </div>
  );
}
