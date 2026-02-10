"use client";

import { useMemo, useState } from "react";
import { DownloadSimple, PaperPlaneTilt, CircleNotch, Check, SignIn } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { exportResultsCsv } from "@/lib/babel-cleaner";
import type { BabelData } from "@/lib/types";
import type { CleanerRow } from "@/lib/babel-cleaner";

interface CleanerSummaryProps {
  results: CleanerRow[];
  data: BabelData;
  isAuthenticated: boolean;
  contributionsSubmitted: boolean;
  onContributionsSubmitted: () => void;
}

export function CleanerSummary({
  results,
  data,
  isAuthenticated,
  contributionsSubmitted,
  onContributionsSubmitted,
}: CleanerSummaryProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stats = useMemo(() => {
    let high = 0;
    let medium = 0;
    let low = 0;
    let unmatched = 0;
    let manual = 0;
    let flaggedNew = 0;

    for (const row of results) {
      if (row.flaggedAsNew) {
        flaggedNew++;
      } else if (row.userOverride) {
        manual++;
      } else if (row.bestMatch) {
        switch (row.bestMatch.confidence) {
          case "high": high++; break;
          case "medium": medium++; break;
          case "low": low++; break;
          default: unmatched++;
        }
      } else {
        unmatched++;
      }
    }

    return { high, medium, low, unmatched, manual, flaggedNew };
  }, [results]);

  const contributionRows = useMemo(() => {
    return results.filter((row) => row.userOverride || row.flaggedAsNew);
  }, [results]);

  const handleExport = () => {
    exportResultsCsv(results, data);
    toast.success("CSV exported");
  };

  const handleSubmitContributions = async () => {
    if (contributionRows.length === 0) return;

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      if (!supabase) {
        toast.error("Unable to connect to the database");
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be signed in to submit contributions");
        return;
      }

      const contributions = contributionRows.map((row) => {
        if (row.flaggedAsNew) {
          return {
            user_id: user.id,
            type: "new_entry" as const,
            entry_id: null,
            entry_type: null,
            entry_category: null,
            title: `New point: "${row.originalName}"`,
            description: `Point name "${row.originalName}" could not be matched to any existing BAS Babel entry during Point Name Cleaner import. Requesting a new entry.`,
            suggested_changes: {
              action: "new_entry",
              original_name: row.originalName,
              normalized_name: row.normalizedName,
              source: "point-name-cleaner",
            },
          };
        }

        // User override - suggest as new alias
        const matchedPoint = data.points.find(
          (p) => p.concept.id === row.userOverride!.pointId,
        );

        return {
          user_id: user.id,
          type: "edit" as const,
          entry_id: row.userOverride!.pointId,
          entry_type: "point" as const,
          entry_category: matchedPoint?.concept.category ?? null,
          title: `Add alias: "${row.normalizedName}"`,
          description: `Point name "${row.originalName}" (normalized: "${row.normalizedName}") was manually matched to "${row.userOverride!.pointName}" during Point Name Cleaner import. Suggesting this as a new alias.`,
          suggested_changes: {
            action: "add_alias",
            alias: row.normalizedName,
            original_name: row.originalName,
            source: "point-name-cleaner",
          },
        };
      });

      const { error } = await supabase
        .from("babel_contributions")
        .insert(contributions);

      if (error) {
        console.error("Submit error:", error);
        toast.error("Failed to submit contributions");
        return;
      }

      toast.success(`${contributions.length} contribution${contributions.length !== 1 ? "s" : ""} submitted`);
      onContributionsSubmitted();
    } catch (err) {
      console.error("Submit error:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex flex-wrap gap-3 text-sm">
        {stats.high > 0 && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-700 dark:text-green-400">
            <span className="size-2 rounded-full bg-green-500" />
            {stats.high} high
          </span>
        )}
        {stats.medium > 0 && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
            <span className="size-2 rounded-full bg-yellow-500" />
            {stats.medium} medium
          </span>
        )}
        {stats.low > 0 && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-700 dark:text-orange-400">
            <span className="size-2 rounded-full bg-orange-500" />
            {stats.low} low
          </span>
        )}
        {stats.unmatched > 0 && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-700 dark:text-red-400">
            <span className="size-2 rounded-full bg-red-500" />
            {stats.unmatched} unmatched
          </span>
        )}
        {stats.manual > 0 && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400">
            <span className="size-2 rounded-full bg-blue-500" />
            {stats.manual} manual
          </span>
        )}
        {stats.flaggedNew > 0 && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-400">
            <span className="size-2 rounded-full bg-purple-500" />
            {stats.flaggedNew} new
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={handleExport} variant="outline">
          <DownloadSimple className="size-4 mr-1.5" />
          Export CSV
        </Button>

        {contributionRows.length > 0 && !contributionsSubmitted && (
          isAuthenticated ? (
            <Button onClick={handleSubmitContributions} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <CircleNotch className="size-4 mr-1.5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <PaperPlaneTilt className="size-4 mr-1.5" />
                  Submit {contributionRows.length} Contribution{contributionRows.length !== 1 ? "s" : ""}
                </>
              )}
            </Button>
          ) : (
            <Button asChild>
              <a href="/signin">
                <SignIn className="size-4 mr-1.5" />
                Sign in to Submit Contributions
              </a>
            </Button>
          )
        )}

        {contributionsSubmitted && (
          <span className="inline-flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
            <Check className="size-4" weight="bold" />
            Contributions submitted
          </span>
        )}
      </div>
    </div>
  );
}
