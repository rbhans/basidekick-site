"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Translate,
  HardDrives,
  BookOpen,
  Check,
  Clock,
  X,
  CaretDown,
  CaretUp,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BabelContribution,
  EquipmentSubmission,
  WikiArticle,
} from "@/lib/types";
import { ROUTES } from "@/lib/routes";
import * as api from "../pointstack-api";
import { cn } from "@/lib/utils";

interface ContributionsTabProps {
  userId: string;
}

type ContributionSection = "babel" | "equipment" | "wiki";

const SECTION_CONFIG: Record<
  ContributionSection,
  { label: string; icon: React.ElementType; color: string }
> = {
  babel: { label: "Atlas Terms Contributions", icon: Translate, color: "text-orange-500" },
  equipment: { label: "Equipment Submissions", icon: HardDrives, color: "text-purple-500" },
  wiki: { label: "Wiki Articles", icon: BookOpen, color: "text-cyan-500" },
};

const STATUS_BADGES: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  pending: { label: "Pending", className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", icon: Clock },
  approved: { label: "Approved", className: "bg-green-500/10 text-green-600 border-green-500/20", icon: Check },
  rejected: { label: "Rejected", className: "bg-red-500/10 text-red-600 border-red-500/20", icon: X },
};

export function ContributionsTab({ userId }: ContributionsTabProps) {
  const [loading, setLoading] = useState(true);
  const [babelContributions, setBabelContributions] = useState<BabelContribution[]>([]);
  const [equipmentSubmissions, setEquipmentSubmissions] = useState<EquipmentSubmission[]>([]);
  const [wikiArticles, setWikiArticles] = useState<WikiArticle[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<ContributionSection>>(
    new Set(["babel", "equipment", "wiki"])
  );

  useEffect(() => {
    const fetchContributions = async () => {
      setLoading(true);
      try {
        const [babel, equipment, wiki] = await Promise.all([
          api.fetchUserBabelContributions(userId).catch(() => []),
          api.fetchUserEquipmentSubmissions(userId).catch(() => []),
          api.fetchUserWikiArticles(userId).catch(() => []),
        ]);
        setBabelContributions(babel);
        setEquipmentSubmissions(equipment);
        setWikiArticles(wiki);
      } catch (error) {
        console.error("Error fetching contributions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContributions();
  }, [userId]);

  const toggleSection = (section: ContributionSection) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <Skeleton className="h-6 w-40 mb-3" />
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const totalContributions =
    babelContributions.length +
    equipmentSubmissions.length +
    wikiArticles.length;

  if (totalContributions === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No contributions yet.
      </div>
    );
  }

  const renderSectionHeader = (section: ContributionSection, count: number) => {
    const config = SECTION_CONFIG[section];
    const Icon = config.icon;
    const isExpanded = expandedSections.has(section);
    const ExpandIcon = isExpanded ? CaretUp : CaretDown;

    return (
      <button
        onClick={() => toggleSection(section)}
        className="flex items-center justify-between w-full p-2 rounded-md hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className={cn("w-5 h-5", config.color)} />
          <span className="font-medium">{config.label}</span>
          <Badge variant="secondary" className="ml-1">
            {count}
          </Badge>
        </div>
        <ExpandIcon className="w-4 h-4 text-muted-foreground" />
      </button>
    );
  };

  return (
    <div className="space-y-4">
      {/* Atlas Terms Contributions */}
      {babelContributions.length > 0 && (
        <div className="border border-border/30 rounded-xl bg-card/90">
          {renderSectionHeader("babel", babelContributions.length)}
          {expandedSections.has("babel") && (
            <div className="p-3 pt-0 space-y-2">
              {babelContributions.map((contribution) => {
                const status = STATUS_BADGES[contribution.status];
                const StatusIcon = status?.icon || Clock;
                return (
                  <div
                    key={contribution.id}
                    className="p-3 border border-border/30 rounded-lg bg-muted/15"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{contribution.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {contribution.description}
                        </p>
                      </div>
                      <Badge className={cn("gap-1 shrink-0", status?.className)}>
                        <StatusIcon className="w-3 h-3" />
                        {status?.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDistanceToNow(new Date(contribution.created_at), { addSuffix: true })}
                      {contribution.entry_type && (
                        <span> · {contribution.type} ({contribution.entry_type})</span>
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Equipment Submissions */}
      {equipmentSubmissions.length > 0 && (
        <div className="border border-border/30 rounded-xl bg-card/90">
          {renderSectionHeader("equipment", equipmentSubmissions.length)}
          {expandedSections.has("equipment") && (
            <div className="p-3 pt-0 space-y-2">
              {equipmentSubmissions.map((submission) => {
                const status = STATUS_BADGES[submission.review_status];
                const StatusIcon = status?.icon || Clock;
                return (
                  <div
                    key={submission.id}
                    className="p-3 border border-border/30 rounded-lg bg-muted/15"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {submission.model_name || submission.brand_name || "Equipment Submission"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {submission.type === "new_entry"
                            ? "New entry"
                            : submission.type === "edit"
                            ? "Edit suggestion"
                            : "Error report"}
                          {submission.brand_name && ` · ${submission.brand_name}`}
                        </p>
                      </div>
                      <Badge className={cn("gap-1 shrink-0", status?.className)}>
                        <StatusIcon className="w-3 h-3" />
                        {status?.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDistanceToNow(new Date(submission.created_at), { addSuffix: true })}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Wiki Articles */}
      {wikiArticles.length > 0 && (
        <div className="border border-border/30 rounded-xl bg-card/90">
          {renderSectionHeader("wiki", wikiArticles.length)}
          {expandedSections.has("wiki") && (
            <div className="p-3 pt-0 space-y-2">
              {wikiArticles.map((article) => (
                <Link
                  key={article.id}
                  href={ROUTES.WIKI_ARTICLE(article.slug)}
                  className="block p-3 border border-border/40 rounded-xl bg-card bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <p className="font-medium text-sm truncate">{article.title}</p>
                  {article.summary && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {article.summary}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {article.category && (
                      <Badge variant="secondary" className="text-xs">
                        {article.category.name}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
