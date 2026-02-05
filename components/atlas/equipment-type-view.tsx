"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SectionLabel } from "@/components/section-label";
import { CircuitBackground } from "@/components/circuit-background";
import { Skeleton } from "@/components/ui/skeleton";
import { useAtlasAll } from "./use-atlas-data";
import { getBrandBySlug, getTypeBySlug } from "./atlas-utils";
import { ROUTES } from "@/lib/routes";
import { createClient } from "@/lib/supabase/client";

interface EquipmentTypeViewProps {
  brandSlug: string;
  typeSlug: string;
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
          <h1 className="mt-4 text-2xl md:text-3xl font-semibold">{type.name}</h1>
          <p className="text-sm text-muted-foreground">{brand.name}</p>
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
