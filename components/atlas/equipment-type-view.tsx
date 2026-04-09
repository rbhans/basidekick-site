"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { getBabelIdsForAtlasType } from "@/lib/data/atlas-babel-map";
import { useAtlasAll } from "./use-atlas-data";
import { useBabelData } from "@/components/babel/use-babel-data";
import { getBrandBySlug, getTypeBySlug } from "./atlas-utils";
import { ROUTES } from "@/lib/routes";
import { createClient } from "@/lib/supabase/client";

interface EquipmentTypeViewProps {
  brandSlug: string;
  typeSlug: string;
}

function formatBabelEquipmentLabel(babelId: string): string {
  return babelId
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function BabelTypeLink({ atlasTypeId }: { atlasTypeId: string }) {
  const babelIds = useMemo(() => getBabelIdsForAtlasType(atlasTypeId), [atlasTypeId]);
  const { data: babelData, loading: babelLoading } = useBabelData();

  const linkedEquipment = useMemo(() => {
    const equipmentById = new Map(
      (babelData?.equipment ?? []).map((entry) => [entry.id, entry] as const)
    );
    return babelIds.map((babelId) => {
      const entry = equipmentById.get(babelId);
      return {
        id: babelId,
        name: entry?.name ?? formatBabelEquipmentLabel(babelId),
        isBroken: !babelLoading && !entry,
      };
    });
  }, [babelData, babelIds, babelLoading]);

  if (babelIds.length === 0) return null;

  return (
    <div className="font-heading italic text-[14px] text-muted-foreground leading-[1.5]">
      Point standards:{" "}
      {linkedEquipment.map((entry, index) => (
        <span key={entry.id}>
          {entry.isBroken ? (
            <span className="text-destructive">{entry.name} (broken mapping)</span>
          ) : (
            <Link
              href={ROUTES.ATLAS_ENTRY(entry.id)}
              className="text-foreground underline decoration-accent underline-offset-[3px] hover:text-accent transition-colors not-italic"
            >
              {entry.name}
            </Link>
          )}
          {index < linkedEquipment.length - 1 ? ", " : ""}
        </span>
      ))}
    </div>
  );
}

export function EquipmentTypeView({ brandSlug, typeSlug }: EquipmentTypeViewProps) {
  const { data, loading, error } = useAtlasAll();
  const [counts, setCounts] = useState<Record<string, number>>({});

  const brand = data ? getBrandBySlug(data, brandSlug) : undefined;
  const type = data ? getTypeBySlug(data, typeSlug) : undefined;

  const models = useMemo(() => {
    if (!data || !brand || !type) return [];
    return data.models.filter((model) => model.brand === brand.id && model.type === type.id);
  }, [data, brand, type]);

  useEffect(() => {
    const fetchCounts = async () => {
      if (!models.length) return;
      const supabase = createClient();
      if (!supabase) return;

      const { data: rows, error: fetchError } = await supabase
        .from("equipment_experience")
        .select("equipment_id")
        .in("equipment_id", models.map((m) => m.id));

      if (fetchError || !rows) return;
      const next: Record<string, number> = {};
      for (const row of rows) {
        next[row.equipment_id] = (next[row.equipment_id] || 0) + 1;
      }
      setCounts(next);
    };

    fetchCounts();
  }, [models]);

  if (error) {
    return (
      <div className="min-h-full flex items-center justify-center py-24">
        <p className="font-heading italic text-[17px] text-muted-foreground">
          Failed to load BAS Atlas data
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <section className="container mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-16 py-10">
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-10 w-80 mb-8" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </section>
    );
  }

  if (!brand || !type) {
    return (
      <div className="py-24 text-center font-heading italic text-[18px] text-muted-foreground">
        Type not found.
      </div>
    );
  }

  return (
    <section className="container mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-16 py-10">
      {/* Back link */}
      <Link
        href={ROUTES.ATLAS_EQUIPMENT_BRAND(brand.slug || brand.id)}
        className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[1.2px] text-muted-foreground hover:text-accent transition-colors mb-6"
      >
        <span className="text-accent">←</span>
        Back to {brand.name}
      </Link>

      {/* Header */}
      <div className="pb-5 border-b border-foreground mb-8">
        <div className="font-mono text-[10px] uppercase tracking-[1.3px] text-muted-foreground mb-2">
          {brand.name} · Type
        </div>
        <h1 className="font-heading font-semibold text-[32px] md:text-[38px] leading-[1.05] text-foreground">
          {type.name}
        </h1>
        <div className="mt-3">
          {getBabelIdsForAtlasType(type.id).length > 0 ? (
            <BabelTypeLink atlasTypeId={type.id} />
          ) : (
            <p className="font-heading italic text-[14px] text-muted-foreground">
              {models.length} model{models.length === 1 ? "" : "s"} in this type.
            </p>
          )}
        </div>
      </div>

      {/* Numbered section: Models */}
      <div className="flex items-baseline gap-3.5 pb-3.5 border-b border-foreground mb-5">
        <span className="font-mono text-[11px] text-accent tracking-[1px]">01 /</span>
        <h2 className="font-heading font-semibold text-[22px] leading-none text-foreground">
          Models
        </h2>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground tabular-nums">
          {models.length} {models.length === 1 ? "model" : "models"}
        </span>
        <Link
          href={ROUTES.ATLAS_EQUIPMENT_ADD}
          className="ml-3.5 font-mono text-[10px] uppercase tracking-[1.2px] text-accent hover:text-foreground transition-colors"
        >
          + Add model
        </Link>
      </div>

      {models.length === 0 ? (
        <div className="py-12 text-center font-heading italic text-[16px] text-muted-foreground">
          No models yet. Be the first to add one.
        </div>
      ) : (
        <div className="space-y-0">
          {models.map((model, idx) => (
            <Link
              key={model.id}
              href={ROUTES.ATLAS_EQUIPMENT_MODEL(
                brand.slug || brand.id,
                type.slug || type.id,
                model.slug || model.id
              )}
              className="group grid grid-cols-[28px_1fr_auto_60px] gap-4 items-center py-4 px-2 border-b border-muted hover:bg-muted/40 transition-colors"
            >
              <span className="font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground tabular-nums">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <div className="font-heading font-semibold text-[17px] leading-[1.25] text-foreground group-hover:text-accent transition-colors truncate">
                  {model.name}
                </div>
                {model.model_numbers && model.model_numbers.length > 0 && (
                  <div className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground mt-1 truncate">
                    {model.model_numbers.slice(0, 3).join(" · ")}
                  </div>
                )}
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground tabular-nums">
                {counts[model.id] || 0} worked
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground group-hover:text-accent transition-colors text-right">
                View →
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
