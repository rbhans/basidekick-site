"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BabelContribution,
  EquipmentSubmission,
  WikiArticle,
} from "@/lib/types";
import { ROUTES } from "@/lib/routes";
import * as api from "../pointstack-api";
import type {
  UserWikiContributionRow,
  UserNewsSubmission,
} from "../pointstack-api";

interface ContributionsTabProps {
  userId: string;
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "text-accent" },
  approved: { label: "Approved", className: "text-accent" },
  rejected: { label: "Rejected", className: "text-destructive" },
};

export function ContributionsTab({ userId }: ContributionsTabProps) {
  const [loading, setLoading] = useState(true);
  const [babelContributions, setBabelContributions] = useState<BabelContribution[]>([]);
  const [equipmentSubmissions, setEquipmentSubmissions] = useState<EquipmentSubmission[]>([]);
  const [wikiArticles, setWikiArticles] = useState<WikiArticle[]>([]);
  const [wikiContributions, setWikiContributions] = useState<UserWikiContributionRow[]>([]);
  const [newsSubmissions, setNewsSubmissions] = useState<UserNewsSubmission[]>([]);

  useEffect(() => {
    const fetchContributions = async () => {
      setLoading(true);
      try {
        const [babel, equipment, wiki, wikiContribs, news] = await Promise.all([
          api.fetchUserBabelContributions(userId).catch(() => []),
          api.fetchUserEquipmentSubmissions(userId).catch(() => []),
          api.fetchUserWikiArticles(userId).catch(() => []),
          api.fetchUserApprovedWikiContributions(userId).catch(() => []),
          api.fetchUserNewsSubmissions(userId).catch(() => []),
        ]);
        // Filter babel/equipment to approved-only for public-facing tab
        setBabelContributions(babel.filter((c) => c.status === "approved"));
        setEquipmentSubmissions(equipment.filter((s) => s.review_status === "approved"));
        setWikiArticles(wiki);
        setWikiContributions(wikiContribs);
        setNewsSubmissions(news);
      } catch (error) {
        console.error("Error fetching contributions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContributions();
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <Skeleton className="h-6 w-48 mb-3" />
            <div className="space-y-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const totalContributions =
    babelContributions.length +
    equipmentSubmissions.length +
    wikiArticles.length +
    wikiContributions.length +
    newsSubmissions.length;

  if (totalContributions === 0) {
    return (
      <div className="py-16 text-center italic text-[16px] text-muted-foreground">
        No contributions yet.
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Wiki articles authored (also published from new_entry submissions) */}
      {/* — block 01 placement to follow visual numbering */}

      {/* Atlas Terms Contributions */}
      {babelContributions.length > 0 && (
        <ContributionSection num="01" title="Atlas terms" count={babelContributions.length}>
          {babelContributions.map((contribution, idx) => {
            const status = STATUS_LABELS[contribution.status];
            return (
              <ContributionRow
                key={contribution.id}
                idx={idx}
                title={contribution.title}
                description={contribution.description}
                meta={[
                  formatDistanceToNow(new Date(contribution.created_at), { addSuffix: true }),
                  contribution.entry_type
                    ? `${contribution.type} (${contribution.entry_type})`
                    : contribution.type,
                ]}
                statusLabel={status?.label}
                statusClass={status?.className}
              />
            );
          })}
        </ContributionSection>
      )}

      {/* Equipment Submissions */}
      {equipmentSubmissions.length > 0 && (
        <ContributionSection num="02" title="Equipment submissions" count={equipmentSubmissions.length}>
          {equipmentSubmissions.map((submission, idx) => {
            const status = STATUS_LABELS[submission.review_status];
            return (
              <ContributionRow
                key={submission.id}
                idx={idx}
                title={submission.model_name || submission.brand_name || "Equipment submission"}
                description={
                  submission.type === "new_entry"
                    ? "New entry"
                    : submission.type === "edit"
                    ? "Edit suggestion"
                    : "Error report"
                }
                meta={[
                  formatDistanceToNow(new Date(submission.created_at), { addSuffix: true }),
                  submission.brand_name || undefined,
                ]}
                statusLabel={status?.label}
                statusClass={status?.className}
              />
            );
          })}
        </ContributionSection>
      )}

      {/* Wiki Articles */}
      {wikiArticles.length > 0 && (
        <ContributionSection num="03" title="Wiki articles" count={wikiArticles.length}>
          {wikiArticles.map((article, idx) => (
            <Link
              key={article.id}
              href={ROUTES.WIKI_ARTICLE(article.slug)}
              className="group grid grid-cols-[28px_1fr_auto] gap-4 items-start py-4 px-2 border-b border-muted hover:bg-muted/40 transition-colors"
            >
              <span className="font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground tabular-nums mt-1">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <h4 className="font-heading font-semibold text-[15px] leading-[1.3] text-foreground group-hover:text-accent transition-colors truncate">
                  {article.title}
                </h4>
                {article.summary && (
                  <p className="italic text-[13px] text-muted-foreground mt-1 line-clamp-2 leading-[1.5]">
                    {article.summary}
                  </p>
                )}
                <div className="mt-2 font-mono text-[9px] uppercase tracking-[1.1px] text-muted-foreground">
                  {article.category?.name && (
                    <span className="text-accent">{article.category.name}</span>
                  )}
                  {article.category?.name && " · "}
                  <span className="tabular-nums">
                    {formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground group-hover:text-accent transition-colors self-center">
                View →
              </span>
            </Link>
          ))}
        </ContributionSection>
      )}

      {/* Wiki edits + new entries (approved contributions) */}
      {wikiContributions.length > 0 && (
        <ContributionSection num="04" title="Wiki edits & new entries" count={wikiContributions.length}>
          {wikiContributions.map((c, idx) => {
            const target = c.approved_article || c.target_article;
            const href = target ? ROUTES.WIKI_ARTICLE(target.slug) : undefined;
            const titleText = target?.title || c.title;
            const label = c.type === "edit" ? "Edit applied" : "New entry";
            const Row = (
              <div className="grid grid-cols-[28px_1fr_auto] gap-4 items-start py-4 px-2 border-b border-muted">
                <span className="font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground tabular-nums mt-1">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <div className="font-heading font-semibold text-[15px] leading-[1.3] text-foreground truncate">
                    {titleText}
                  </div>
                  <div className="mt-2 font-mono text-[9px] uppercase tracking-[1.1px] text-muted-foreground">
                    <span className="text-accent">{label}</span>
                    {" · "}
                    <span className="tabular-nums">
                      {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                {href && (
                  <span className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground self-center">
                    View →
                  </span>
                )}
              </div>
            );
            return href ? (
              <Link
                key={c.id}
                href={href}
                className="group hover:bg-muted/40 transition-colors block"
              >
                {Row}
              </Link>
            ) : (
              <div key={c.id}>{Row}</div>
            );
          })}
        </ContributionSection>
      )}

      {/* News submissions */}
      {newsSubmissions.length > 0 && (
        <ContributionSection num="05" title="News submissions" count={newsSubmissions.length}>
          {newsSubmissions.map((n, idx) => (
            <Link
              key={n.id}
              href={ROUTES.NEWS_ARTICLE(n.slug)}
              className="group grid grid-cols-[28px_1fr_auto] gap-4 items-start py-4 px-2 border-b border-muted hover:bg-muted/40 transition-colors"
            >
              <span className="font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground tabular-nums mt-1">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <h4 className="font-heading font-semibold text-[15px] leading-[1.3] text-foreground group-hover:text-accent transition-colors truncate">
                  {n.title}
                </h4>
                <div className="mt-2 font-mono text-[9px] uppercase tracking-[1.1px] text-muted-foreground">
                  <span className="text-accent">{n.source_domain}</span>
                  {" · "}
                  <span className="tabular-nums">{n.upvote_count} ↑</span>
                  {" · "}
                  <span className="tabular-nums">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground group-hover:text-accent transition-colors self-center">
                View →
              </span>
            </Link>
          ))}
        </ContributionSection>
      )}
    </div>
  );
}

function ContributionSection({
  num,
  title,
  count,
  children,
}: {
  num: string;
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline gap-3.5 pb-3.5 border-b border-foreground mb-4">
        <span className="font-mono text-[11px] text-accent tracking-[1px]">{num} /</span>
        <h3 className="font-heading font-semibold text-[20px] leading-none text-foreground">
          {title}
        </h3>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground tabular-nums">
          {count}
        </span>
      </div>
      <div className="space-y-0">{children}</div>
    </div>
  );
}

function ContributionRow({
  idx,
  title,
  description,
  meta,
  statusLabel,
  statusClass,
}: {
  idx: number;
  title: string;
  description?: string;
  meta: (string | undefined)[];
  statusLabel?: string;
  statusClass?: string;
}) {
  return (
    <div className="grid grid-cols-[28px_1fr_auto] gap-4 items-start py-4 px-2 border-b border-muted">
      <span className="font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground tabular-nums mt-1">
        {String(idx + 1).padStart(2, "0")}
      </span>
      <div className="min-w-0">
        <div className="font-heading font-semibold text-[15px] leading-[1.3] text-foreground truncate">
          {title}
        </div>
        {description && (
          <p className="italic text-[13px] text-muted-foreground mt-1 line-clamp-2 leading-[1.5]">
            {description}
          </p>
        )}
        <div className="mt-2 font-mono text-[9px] uppercase tracking-[1.1px] text-muted-foreground">
          {meta.filter(Boolean).join(" · ")}
        </div>
      </div>
      {statusLabel && (
        <span
          className={`font-mono text-[9px] uppercase tracking-[1.2px] border border-current px-1.5 py-0.5 rounded-sm self-start ${statusClass}`}
        >
          {statusLabel}
        </span>
      )}
    </div>
  );
}
