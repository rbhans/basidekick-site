"use client";

import { useState } from "react";
import {
  PencilSimple,
  ArrowRight,
  CheckCircle,
  Warning,
  Question,
  Flag,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { MatchPickerDialog } from "./match-picker-dialog";
import type { BabelData } from "@/lib/types";
import type { CleanerRow } from "@/lib/babel-cleaner";

interface ResultsTableProps {
  results: CleanerRow[];
  data: BabelData;
  onUpdateMatch: (rowIndex: number, pointId: string, pointName: string) => void;
  onFlagNew: (rowIndex: number) => void;
  onUnflagNew: (rowIndex: number) => void;
}

function ConfidenceBadge({ confidence }: { confidence: string }) {
  const styles: Record<string, string> = {
    high: "bg-secondary text-foreground",
    medium: "bg-accent/15 text-accent",
    low: "bg-muted text-muted-foreground",
    none: "bg-destructive/10 text-destructive",
    manual: "bg-card border border-border text-foreground",
    new: "bg-accent/10 text-accent italic",
  };

  const icons: Record<string, typeof CheckCircle> = {
    high: CheckCircle,
    medium: CheckCircle,
    low: Warning,
    none: Question,
    manual: PencilSimple,
    new: Flag,
  };

  const Icon = icons[confidence] || Question;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${styles[confidence] || styles.none}`}>
      <Icon className="size-3" weight="bold" />
      {confidence}
    </span>
  );
}

export function ResultsTable({
  results,
  data,
  onUpdateMatch,
  onFlagNew,
  onUnflagNew,
}: ResultsTableProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerRowIndex, setPickerRowIndex] = useState<number | null>(null);

  const openPicker = (rowIndex: number) => {
    setPickerRowIndex(rowIndex);
    setPickerOpen(true);
  };

  const handlePickMatch = (pointId: string, pointName: string) => {
    if (pickerRowIndex !== null) {
      onUpdateMatch(pickerRowIndex, pointId, pointName);
    }
  };

  const handleFlagNew = () => {
    if (pickerRowIndex !== null) {
      onFlagNew(pickerRowIndex);
    }
  };

  const pickerRow = pickerRowIndex !== null ? results[pickerRowIndex] : null;

  return (
    <>
      <div className="overflow-x-auto rounded border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-3 py-2 text-left font-medium w-8">#</th>
              <th className="px-3 py-2 text-left font-medium">Original Name</th>
              <th className="px-3 py-2 text-center font-medium w-8"></th>
              <th className="px-3 py-2 text-left font-medium">Matched Name</th>
              <th className="px-3 py-2 text-left font-medium w-24">Confidence</th>
              <th className="px-3 py-2 text-right font-medium w-16">Action</th>
            </tr>
          </thead>
          <tbody>
            {results.map((row) => {
              const displayName = row.userOverride?.pointName
                ?? row.bestMatch?.pointName
                ?? null;
              const confidence = row.flaggedAsNew
                ? "new"
                : row.userOverride
                  ? "manual"
                  : (row.bestMatch?.confidence ?? "none");

              return (
                <tr key={row.rowIndex} className="border-b last:border-b-0 hover:bg-muted/30">
                  <td className="px-3 py-2 text-muted-foreground tabular-nums">
                    {row.rowIndex + 1}
                  </td>
                  <td className="px-3 py-2">
                    <div>
                      <span className="font-mono text-xs">{row.originalName}</span>
                      {row.strippedPrefix && (
                        <span className="text-[10px] text-muted-foreground ml-1.5">
                          (prefix: {row.strippedPrefix})
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <ArrowRight className="size-3.5 text-muted-foreground mx-auto" />
                  </td>
                  <td className="px-3 py-2">
                    {row.flaggedAsNew ? (
                      <span className="text-xs text-accent italic">
                        Flagged as new entry
                      </span>
                    ) : displayName ? (
                      <span className="text-sm font-medium">{displayName}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">
                        No match found
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <ConfidenceBadge confidence={confidence} />
                  </td>
                  <td className="px-3 py-2 text-right">
                    {row.flaggedAsNew ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onUnflagNew(row.rowIndex)}
                        className="h-7 text-xs"
                      >
                        Undo
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openPicker(row.rowIndex)}
                        className="h-7 text-xs"
                      >
                        <PencilSimple className="size-3 mr-1" />
                        Edit
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pickerRow && (
        <MatchPickerDialog
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          originalName={pickerRow.originalName}
          data={data}
          onPickMatch={handlePickMatch}
          onFlagNew={handleFlagNew}
        />
      )}
    </>
  );
}
