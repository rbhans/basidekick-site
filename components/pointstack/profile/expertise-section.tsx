"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, Plus } from "@phosphor-icons/react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  getProfileEndorsements,
  toggleEndorsement,
} from "@/lib/endorsements/api";
import { TopicScore, tierFor } from "@/lib/schemas/endorsements";
import { Skeleton } from "@/components/ui/skeleton";

interface ExpertiseSectionProps {
  profileId: string;
  isOwnProfile: boolean;
}

export function ExpertiseSection({
  profileId,
  isOwnProfile,
}: ExpertiseSectionProps) {
  const { user } = useAuth();
  const [rows, setRows] = useState<TopicScore[] | null>(null);
  const [pending, setPending] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    try {
      const data = await getProfileEndorsements(profileId);
      setRows(data);
    } catch (e) {
      console.error("Failed to load endorsements", e);
      setRows([]);
    }
  }, [profileId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggle = async (topicId: string) => {
    if (!user) {
      toast.error("Sign in to endorse.");
      return;
    }
    if (isOwnProfile) return;
    setPending((s) => new Set(s).add(topicId));
    try {
      const { endorsed, score } = await toggleEndorsement({
        endorseeId: profileId,
        topicId,
      });
      setRows((prev) =>
        prev
          ? prev.map((row) =>
              row.topic.id === topicId
                ? { ...row, score, viewer_has_endorsed: endorsed }
                : row
            )
          : prev
      );
      toast.success(endorsed ? "Endorsement added." : "Endorsement removed.");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Endorsement failed.";
      toast.error(message);
    } finally {
      setPending((s) => {
        const next = new Set(s);
        next.delete(topicId);
        return next;
      });
    }
  };

  if (!rows) {
    return (
      <div className="mb-10">
        <SectionHeader />
        <div className="space-y-2">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-3/4" />
        </div>
      </div>
    );
  }

  // Always show scored rows; hide zero rows unless viewer is logged-in non-owner
  // (so they can endorse in topics the profile hasn't been endorsed for yet).
  const canEndorse = Boolean(user) && !isOwnProfile;
  const visible = canEndorse
    ? rows
    : rows.filter((r) => r.score > 0);

  if (visible.length === 0) {
    return null;
  }

  return (
    <div className="mb-10">
      <SectionHeader />
      <ul className="divide-y divide-border border border-border rounded-sm bg-card">
        {visible.map((row) => {
          const tier = tierFor(row.score);
          const isPending = pending.has(row.topic.id);
          return (
            <li
              key={row.topic.id}
              className="flex items-center gap-3 px-3 py-2"
            >
              <Link
                href={`/experts/${row.topic.slug}`}
                className="flex-1 min-w-0 flex items-center gap-2 text-sm text-foreground hover:text-accent transition-colors"
              >
                <span className="font-mono text-[11px] uppercase tracking-[1.1px]">
                  {row.topic.name}
                </span>
                {tier && (
                  <span className="font-mono text-[9px] uppercase tracking-[1.1px] text-accent border border-accent/40 bg-accent/5 px-1.5 py-0.5 rounded-sm">
                    {tier.label}
                  </span>
                )}
              </Link>
              <span className="font-mono text-xs tabular-nums text-muted-foreground w-10 text-right">
                {row.score}
              </span>
              {canEndorse && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleToggle(row.topic.id)}
                  className={cn(
                    "shrink-0 h-7 px-2 inline-flex items-center gap-1 rounded-sm border font-mono text-[10px] uppercase tracking-[1.1px] transition-colors",
                    row.viewer_has_endorsed
                      ? "border-accent text-accent bg-accent/5 hover:bg-accent/10"
                      : "border-border text-foreground hover:border-accent hover:text-accent",
                    isPending && "opacity-50 cursor-wait"
                  )}
                  aria-pressed={row.viewer_has_endorsed}
                  aria-label={
                    row.viewer_has_endorsed
                      ? `Remove endorsement for ${row.topic.name}`
                      : `Endorse for ${row.topic.name}`
                  }
                >
                  {row.viewer_has_endorsed ? (
                    <>
                      <CheckCircle className="h-3 w-3" weight="fill" />
                      Endorsed
                    </>
                  ) : (
                    <>
                      <Plus className="h-3 w-3" />
                      Endorse
                    </>
                  )}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SectionHeader() {
  return (
    <div className="font-mono text-[10px] uppercase tracking-[1.4px] text-muted-foreground mb-3 pb-2.5 border-b border-border">
      <span className="text-accent mr-1.5">·</span>
      Expertise
    </div>
  );
}
