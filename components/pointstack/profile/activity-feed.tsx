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

const ACTIVITY_LABELS: Record<ActivityItemType, string> = {
  post: "Post",
  comment: "Comment",
  babel_contribution: "Atlas",
  equipment_submission: "Equipment",
  equipment_note: "Note",
  wiki_article: "Wiki",
};

export function ActivityFeed({ userId }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchActivity = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.fetchUserActivity(userId, 30);
        setActivities(data);
      } catch (error) {
        console.error("Error fetching activity:", error);
        setError("Failed to load activity. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [userId, retryCount]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="w-8 h-8" />
            <div className="flex-1">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="italic text-[15px] text-destructive mb-4">{error}</p>
        <button
          onClick={() => setRetryCount((c) => c + 1)}
          className="px-4 py-2 border border-foreground bg-card text-foreground font-mono text-[10px] uppercase tracking-[1.2px] hover:bg-muted transition-colors"
        >
          Try again →
        </button>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="py-16 text-center italic text-[16px] text-muted-foreground">
        No recent activity.
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {activities.map((activity, idx) => {
        const Icon = ACTIVITY_ICONS[activity.type] || Article;
        const label = ACTIVITY_LABELS[activity.type] || "Activity";

        const content = (
          <div className="group grid grid-cols-[28px_32px_1fr_auto] gap-4 items-start py-4 px-2 border-b border-muted hover:bg-muted/40 transition-colors">
            <span className="font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground tabular-nums mt-1">
              {String(idx + 1).padStart(2, "0")}
            </span>
            <div className="w-8 h-8 border border-border bg-card flex items-center justify-center">
              <Icon className="w-4 h-4 text-accent" />
            </div>
            <div className="min-w-0">
              <div className="font-mono text-[9px] uppercase tracking-[1.2px] text-accent mb-0.5">
                {label}
              </div>
              <p className="font-heading text-[15px] text-foreground leading-[1.3] truncate group-hover:text-accent transition-colors">
                {activity.title}
              </p>
              {activity.description && (
                <p className="text-[13px] text-muted-foreground line-clamp-2 mt-1 leading-[1.5]">
                  {activity.description}
                </p>
              )}
              <p className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground mt-1.5 tabular-nums">
                {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
              </p>
            </div>
            {activity.link && (
              <span className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground group-hover:text-accent transition-colors self-center">
                View →
              </span>
            )}
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
