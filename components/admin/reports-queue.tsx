"use client";

import { useMemo, useState } from "react";
import { CheckCircle, XCircle, ArrowCounterClockwise, Flag, CircleNotch, Link as LinkIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

export interface AdminContentReport {
  id: string;
  user_id: string | null;
  target_type: "atlas_point" | "atlas_equipment" | "wiki_article" | "new_atlas_entry";
  target_id: string | null;
  target_label: string | null;
  target_url: string | null;
  message: string;
  status: "pending" | "resolved" | "dismissed";
  admin_notes: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  submitter: { display_name: string | null } | null;
}

interface ReportsQueueProps {
  reports: AdminContentReport[];
}

const TARGET_LABELS: Record<AdminContentReport["target_type"], string> = {
  atlas_point: "Atlas point",
  atlas_equipment: "Atlas equipment",
  wiki_article: "Wiki article",
  new_atlas_entry: "New Atlas entry",
};

type StatusFilter = "all" | "pending" | "resolved" | "dismissed";
type TypeFilter = "all" | AdminContentReport["target_type"];

export function ReportsQueue({ reports: initial }: ReportsQueueProps) {
  const [reports, setReports] = useState(initial);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (typeFilter !== "all" && r.target_type !== typeFilter) return false;
      return true;
    });
  }, [reports, statusFilter, typeFilter]);

  const counts = useMemo(() => ({
    pending: reports.filter((r) => r.status === "pending").length,
    resolved: reports.filter((r) => r.status === "resolved").length,
    dismissed: reports.filter((r) => r.status === "dismissed").length,
    all: reports.length,
  }), [reports]);

  const handleAction = async (
    id: string,
    action: "resolve" | "dismiss" | "reopen"
  ) => {
    setBusyId(id);
    try {
      const supabase = createClient();
      if (!supabase) throw new Error("Supabase not configured");

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const res = await fetch(`/api/content-reports/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action,
          admin_notes: notesDraft[id] || undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Failed to update report");
      }

      const { report } = await res.json();
      setReports((prev) => prev.map((r) => (r.id === id ? { ...r, ...report } : r)));
    } catch (err) {
      console.error("report action error:", err);
      alert(err instanceof Error ? err.message : "Failed to update report");
    } finally {
      setBusyId(null);
    }
  };

  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-xs font-mono uppercase tracking-[1.2px]">
        <span className="text-muted-foreground mr-2">Status</span>
        {(["pending", "all", "resolved", "dismissed"] as StatusFilter[]).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-2 py-1 border ${
              statusFilter === s
                ? "border-accent text-foreground"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {s} <span className="ml-1 tabular-nums">({counts[s]})</span>
          </button>
        ))}
        <span className="text-muted-foreground ml-4 mr-2">Type</span>
        {(["all", "atlas_point", "atlas_equipment", "wiki_article", "new_atlas_entry"] as TypeFilter[]).map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-2 py-1 border ${
              typeFilter === t
                ? "border-accent text-foreground"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "all" ? "All" : TARGET_LABELS[t as AdminContentReport["target_type"]]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="border border-border bg-card p-12 text-center">
          <Flag className="size-6 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No reports match these filters.</p>
        </div>
      ) : (
        <div className="border border-border bg-card divide-y divide-border">
          {filtered.map((r) => {
            const expanded = expandedId === r.id;
            const busy = busyId === r.id;
            return (
              <div key={r.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-muted-foreground">
                    <Flag className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-mono uppercase tracking-[1px] text-foreground">
                        {TARGET_LABELS[r.target_type]}
                      </span>
                      <span>·</span>
                      <span>{r.submitter?.display_name || "Anonymous"}</span>
                      <span>·</span>
                      <span>{formatDate(r.created_at)}</span>
                      <span>·</span>
                      <span className={
                        r.status === "pending" ? "text-accent" :
                        r.status === "resolved" ? "text-foreground" : "text-muted-foreground"
                      }>
                        {r.status}
                      </span>
                    </div>
                    {r.target_label && (
                      <div className="mt-1 text-sm font-medium flex items-center gap-1.5 min-w-0">
                        <span className="truncate">{r.target_label}</span>
                        {r.target_url && (
                          <a
                            href={r.target_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-accent flex-shrink-0"
                            title="Open target"
                          >
                            <LinkIcon className="size-3.5" />
                          </a>
                        )}
                      </div>
                    )}
                    <p className={`mt-1 text-sm whitespace-pre-wrap ${expanded ? "" : "line-clamp-2"}`}>
                      {r.message}
                    </p>

                    {expanded && (
                      <div className="mt-3 space-y-3">
                        {r.admin_notes && (
                          <div className="text-xs">
                            <div className="font-mono uppercase tracking-[1px] text-muted-foreground mb-1">
                              Admin notes
                            </div>
                            <div className="whitespace-pre-wrap">{r.admin_notes}</div>
                          </div>
                        )}
                        <Textarea
                          placeholder="Admin notes (optional, saved on resolve/dismiss)"
                          value={notesDraft[r.id] ?? r.admin_notes ?? ""}
                          onChange={(e) =>
                            setNotesDraft((prev) => ({ ...prev, [r.id]: e.target.value }))
                          }
                          className="min-h-16 text-sm"
                          maxLength={5000}
                        />
                        <div className="flex flex-wrap gap-2">
                          {r.status !== "resolved" && (
                            <Button
                              size="sm"
                              onClick={() => handleAction(r.id, "resolve")}
                              disabled={busy}
                            >
                              {busy ? <CircleNotch className="size-4 animate-spin mr-1" /> : <CheckCircle className="size-4 mr-1" />}
                              Resolve
                            </Button>
                          )}
                          {r.status !== "dismissed" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAction(r.id, "dismiss")}
                              disabled={busy}
                            >
                              <XCircle className="size-4 mr-1" />
                              Dismiss
                            </Button>
                          )}
                          {r.status !== "pending" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleAction(r.id, "reopen")}
                              disabled={busy}
                            >
                              <ArrowCounterClockwise className="size-4 mr-1" />
                              Reopen
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setExpandedId(expanded ? null : r.id)}
                    className="text-xs font-mono uppercase tracking-[1px] text-muted-foreground hover:text-foreground whitespace-nowrap"
                  >
                    {expanded ? "Collapse" : "Expand"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
