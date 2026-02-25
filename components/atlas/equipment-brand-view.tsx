"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SiteBadge } from "@/components/site-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAtlasAll } from "./use-atlas-data";
import { getBrandBySlug } from "./atlas-utils";
import { ROUTES } from "@/lib/routes";
import { createClient } from "@/lib/supabase/client";
import { AtlasBreadcrumb } from "./atlas-breadcrumb";
import { AtlasBrandLogo } from "./atlas-brand-logo";

interface EquipmentBrandViewProps {
  brandSlug: string;
}

export function EquipmentBrandView({ brandSlug }: EquipmentBrandViewProps) {
  const { data, loading, error } = useAtlasAll();
  const [peopleCount, setPeopleCount] = useState(0);

  const brand = data ? getBrandBySlug(data, brandSlug) : undefined;

  const models = useMemo(() => {
    if (!data || !brand) return [];
    return data.models.filter((model) => model.brand === brand.id);
  }, [data, brand]);

  const typeCards = useMemo(() => {
    if (!data || !brand) return [];
    const counts: Record<string, number> = {};
    for (const model of models) {
      counts[model.type] = (counts[model.type] || 0) + 1;
    }

    return Object.entries(counts)
      .map(([typeId, count]) => {
        const type = data.types.find((t) => t.id === typeId);
        return {
          id: typeId,
          name: type?.name || typeId,
          slug: type?.slug || typeId,
          count,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data, brand, models]);

  useEffect(() => {
    const fetchPeopleCount = async () => {
      if (!data || !brand || models.length === 0) return;
      const supabase = createClient();
      if (!supabase) return;

      const { data: rows, error: fetchError } = await supabase
        .from("equipment_experience")
        .select("user_id")
        .in("equipment_id", models.map((m) => m.id));

      if (fetchError || !rows) return;
      const unique = new Set(rows.map((row: { user_id: string }) => row.user_id));
      setPeopleCount(unique.size);
    };

    fetchPeopleCount();
  }, [data, brand, models]);

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

  if (!brand) {
    return (
      <div className="container mx-auto px-4 py-12 text-center text-muted-foreground">
        Brand not found.
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <section className="relative py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-[-200px] left-[-100px] w-[600px] h-[600px] rounded-full opacity-[0.04]"
            style={{ background: "radial-gradient(circle, #C4F82A 0%, transparent 70%)" }}
          />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-20 relative z-10">
          <SiteBadge label="EQUIPMENT" />
          <AtlasBreadcrumb
            items={[{ label: brand.name }]}
          />
          <div className="flex items-center gap-4 mt-4">
            <AtlasBrandLogo
              brand={brand}
              className="size-12"
              fallbackClassName="size-12 rounded bg-muted flex items-center justify-center text-lg font-semibold"
            />
            <div>
              <h1 className="text-2xl md:text-3xl font-heading font-bold">{brand.name}</h1>
              <p className="text-sm text-muted-foreground">
                {peopleCount} people have worked with {brand.name} equipment
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-lg font-semibold mb-4">Types</h2>
          {typeCards.length === 0 ? (
            <p className="text-sm text-muted-foreground">No types yet for this brand.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {typeCards.map((type) => (
                <Link
                  key={type.id}
                  href={ROUTES.ATLAS_EQUIPMENT_TYPE(brand.slug || brand.id, type.slug || type.id)}
                  className="p-4 border border-border bg-card shadow-sm hover:border-primary/30 transition-colors"
                >
                  <p className="text-sm font-semibold">{type.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {type.count} model{type.count === 1 ? "" : "s"}
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
