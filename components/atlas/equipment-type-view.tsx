"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SectionLabel } from "@/components/section-label";
import { CircuitBackground } from "@/components/circuit-background";
import { Skeleton } from "@/components/ui/skeleton";
import { getBabelIdsForAtlasType } from "@/lib/data/atlas-babel-map";
import { useAtlasAll } from "./use-atlas-data";
import { useBabelData } from "@/components/babel/use-babel-data";
import { getBrandBySlug, getTypeBySlug } from "./atlas-utils";
import { ROUTES } from "@/lib/routes";
import { createClient } from "@/lib/supabase/client";
import { AtlasBreadcrumb } from "./atlas-breadcrumb";

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

  if (linkedEquipment.length === 1) {
    const entry = linkedEquipment[0];
    return (
      <p className="mt-3 text-sm text-muted-foreground">
        {entry.isBroken ? (
          <>
            Point standards mapping for <span className="text-destructive">{entry.name}</span> is broken.
          </>
        ) : (
          <>
            View point naming standards for{" "}
            <Link href={ROUTES.BABEL_ENTRY(entry.id)} className="text-primary hover:underline">
              {entry.name}
            </Link>{" "}
            in BAS Babel.
          </>
        )}
      </p>
    );
  }

  return (
    <p className="mt-3 text-sm text-muted-foreground">
      View point naming standards in BAS Babel:{" "}
      {linkedEquipment.map((entry, index) => (
        <span key={entry.id}>
          {entry.isBroken ? (
            <span className="text-destructive">{entry.name} (broken mapping)</span>
          ) : (
            <Link href={ROUTES.BABEL_ENTRY(entry.id)} className="text-primary hover:underline">
              {entry.name}
            </Link>
          )}
          {index < linkedEquipment.length - 1 ? ", " : ""}
        </span>
      ))}
      .
    </p>
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
      <div className="min-h-full flex items-center justify-center">
        <p className="text-muted-foreground">Failed to load BAS Atlas data</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-4 w-64 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (!brand || !type) {
    return (
      <div className="container mx-auto px-4 py-12 text-center text-muted-foreground">
        Type not found.
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <section className="relative py-10 overflow-hidden">
        <CircuitBackground opacity={0.12} colorGradient />
        <div className="container mx-auto px-4 relative z-10">
          <SectionLabel variant="resources">equipment</SectionLabel>
          <AtlasBreadcrumb
            items={[
              { label: brand.name, href: ROUTES.EQUIPMENT_BRAND(brand.slug || brand.id) },
              { label: type.name },
            ]}
          />
          <h1 className="mt-4 text-2xl md:text-3xl font-semibold">{type.name}</h1>
          {getBabelIdsForAtlasType(type.id).length > 0 ? (
            <BabelTypeLink atlasTypeId={type.id} />
          ) : null}
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Models</h2>
            <Link href={ROUTES.EQUIPMENT_ADD} className="text-sm text-primary hover:underline">
              Add model
            </Link>
          </div>

          {models.length === 0 ? (
            <p className="text-sm text-muted-foreground">No models yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {models.map((model) => (
                <Link
                  key={model.id}
                  href={ROUTES.EQUIPMENT_MODEL(brand.slug || brand.id, type.slug || type.id, model.slug || model.id)}
                  className="p-4 border border-border bg-card shadow-sm hover:border-primary/30 transition-colors"
                >
                  <p className="text-sm font-semibold">{model.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {counts[model.id] || 0} people worked with this
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
