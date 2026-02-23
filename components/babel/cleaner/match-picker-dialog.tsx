"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MagnifyingGlass, Plus } from "@phosphor-icons/react";
import type { BabelData, BabelPointEntry } from "@/lib/types";

interface MatchPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  originalName: string;
  data: BabelData;
  onPickMatch: (pointId: string, pointName: string) => void;
  onFlagNew: () => void;
}

export function MatchPickerDialog({
  open,
  onOpenChange,
  originalName,
  data,
  onPickMatch,
  onFlagNew,
}: MatchPickerDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPoints = useMemo(() => {
    if (!searchQuery.trim()) return data.points.slice(0, 20);

    const query = searchQuery.toLowerCase().trim();
    return data.points
      .filter((point) => {
        if (point.concept.name.toLowerCase().includes(query)) return true;
        if (point.concept.id.includes(query)) return true;
        if (point.concept.haystack?.tagString.toLowerCase().includes(query)) return true;
        return point.aliases.common.some((a) => a.toLowerCase().includes(query));
      })
      .slice(0, 20);
  }, [data.points, searchQuery]);

  const handlePick = (point: BabelPointEntry) => {
    onPickMatch(point.concept.id, point.concept.name);
    onOpenChange(false);
    setSearchQuery("");
  };

  const handleFlagNew = () => {
    onFlagNew();
    onOpenChange(false);
    setSearchQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-lg flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Match</DialogTitle>
          <DialogDescription>
            Choose the correct match for <span className="font-medium text-foreground">&ldquo;{originalName}&rdquo;</span>,
            or flag it as a new entry.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search points..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 max-h-[40vh] space-y-1">
          {filteredPoints.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No points found. Try a different search or flag as new.
            </p>
          ) : (
            filteredPoints.map((point) => (
              <button
                key={point.concept.id}
                onClick={() => handlePick(point)}
                className="w-full text-left rounded px-3 py-2 hover:bg-muted transition-colors"
              >
                <p className="text-sm font-medium">{point.concept.name}</p>
                <p className="text-xs text-muted-foreground">
                  {point.concept.category} &middot; {point.concept.point_function ?? "point"}
                  {point.concept.haystack && ` \u00B7 ${point.concept.haystack.tagString}`}
                </p>
              </button>
            ))
          )}
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <Button variant="outline" onClick={handleFlagNew}>
            <Plus className="size-4 mr-1.5" />
            Flag as New Entry
          </Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
