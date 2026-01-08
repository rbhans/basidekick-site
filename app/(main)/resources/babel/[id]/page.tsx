"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { SectionLabel } from "@/components/section-label";
import { CircuitBackground } from "@/components/circuit-background";
import { BabelEntryDetail } from "@/components/babel";
import { useBabelData } from "@/components/babel/use-babel-data";
import { Skeleton } from "@/components/ui/skeleton";
import type { BabelPointEntry, BabelEquipmentEntry } from "@/lib/types";

export default function BabelEntryPage() {
  const params = useParams();
  const id = params.id as string;

  const { data, loading, error } = useBabelData();
  const [entry, setEntry] = useState<{
    data: BabelPointEntry | BabelEquipmentEntry;
    type: "point" | "equipment";
  } | null>(null);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    if (!data || !id) return;

    // Search in points first
    const pointEntry = data.points.find((p) => p.concept.id === id);
    if (pointEntry) {
      setEntry({ data: pointEntry, type: "point" });
      return;
    }

    // Search in equipment
    const equipEntry = data.equipment.find((e) => e.id === id);
    if (equipEntry) {
      setEntry({ data: equipEntry, type: "equipment" });
      return;
    }

    // Not found
    setNotFoundState(true);
  }, [data, id]);

  if (error) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load babel data</p>
          <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
        </div>
      </div>
    );
  }

  if (notFoundState) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold">Entry not found</p>
          <p className="text-sm text-muted-foreground mt-1">
            The entry &quot;{id}&quot; doesn&apos;t exist in BAS Babel.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      {/* Header */}
      <section className="relative py-12 overflow-hidden">
        <CircuitBackground opacity={0.15} />
        <div className="container mx-auto px-4 relative z-10">
          <SectionLabel>bas babel</SectionLabel>
        </div>
      </section>

      {/* Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {loading || !entry ? (
            <div className="max-w-3xl mx-auto space-y-4">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-12 w-64" />
              <Skeleton className="h-6 w-full max-w-md" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <BabelEntryDetail entry={entry.data} type={entry.type} />
          )}
        </div>
      </section>
    </div>
  );
}
