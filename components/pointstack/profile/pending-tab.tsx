"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/lib/routes";
import * as api from "../pointstack-api";
import type { UserPendingItem } from "../pointstack-api";

interface PendingTabProps {
  userId: string;
}

const SOURCE_LABEL: Record<string, { label: string; bucket: string }> = {
  wiki: { label: "Wiki", bucket: "Wiki submission" },
  babel: { label: "Atlas terms", bucket: "Atlas term contribution" },
  equipment: { label: "Atlas equipment", bucket: "Equipment submission" },
  wiki_draft: { label: "Wiki draft", bucket: "Approved — awaiting publish" },
};

export function PendingTab({ userId }: PendingTabProps) {
  const [items, setItems] = useState<UserPendingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .fetchUserPendingContributions(userId)
      .then((rows) => {
        if (!cancelled) setItems(rows);
      })
      .catch((err) => console.error("Failed to fetch pending contributions", err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-12 text-center italic text-[15px] text-muted-foreground border border-dashed border-border">
        Nothing waiting on review.{" "}
        <Link
          href={ROUTES.WIKI_CONTRIBUTE}
          className="text-foreground underline decoration-accent underline-offset-[3px] hover:text-accent not-italic font-sans"
        >
          Propose a wiki article →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      <p className="font-mono text-[10px] uppercase tracking-[1.3px] text-muted-foreground mb-4">
        Only visible to you. Admins review submissions in the order received.
      </p>
      {items.map((item, idx) => {
        const meta = SOURCE_LABEL[item.source] || { label: item.source, bucket: item.type };
        const Row = (
          <div className="grid grid-cols-[28px_1fr_auto] gap-4 items-start py-4 px-2 border-b border-muted">
            <span className="font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground tabular-nums mt-1">
              {String(idx + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <div className="font-heading font-semibold text-[15px] leading-[1.3] text-foreground truncate">
                {item.title}
              </div>
              <div className="mt-2 font-mono text-[9px] uppercase tracking-[1.1px] text-muted-foreground">
                <span className="text-accent">{meta.label}</span>
                {" · "}
                {meta.bucket}
                {" · "}
                <span className="tabular-nums">
                  {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
            <span className="font-mono text-[9px] uppercase tracking-[1.2px] text-accent border border-accent px-1.5 py-0.5 rounded-sm self-start">
              {item.source === "wiki_draft" ? "Draft" : "Pending"}
            </span>
          </div>
        );
        return item.link ? (
          <Link key={`${item.source}-${item.id}`} href={item.link} className="block hover:bg-muted/40 transition-colors">
            {Row}
          </Link>
        ) : (
          <div key={`${item.source}-${item.id}`}>{Row}</div>
        );
      })}
    </div>
  );
}
