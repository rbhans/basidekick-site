"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useAtlasAll } from "./use-atlas-data";
import { getBrandBySlug } from "./atlas-utils";
import { ROUTES } from "@/lib/routes";
import { createClient } from "@/lib/supabase/client";
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

  if (!brand) {
    return (
      <div className="py-24 text-center font-heading italic text-[18px] text-muted-foreground">
        Brand not found.
      </div>
    );
  }

  return (
    <section className="container mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-16 py-10">
      {/* Back link */}
      <Link
        href={ROUTES.ATLAS_EQUIPMENT}
        className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[1.2px] text-muted-foreground hover:text-accent transition-colors mb-6"
      >
        <span className="text-accent">←</span>
        Back to equipment
      </Link>

      {/* Header — brand logo + name */}
      <div className="pb-5 border-b border-foreground mb-8">
        <div className="flex items-start gap-5">
          <div className="size-16 border border-border bg-card shrink-0 flex items-center justify-center">
            <AtlasBrandLogo
              brand={brand}
              className="max-w-[52px] max-h-[52px]"
              fallbackClassName="w-full h-full flex items-center justify-center font-heading font-semibold text-[22px] text-foreground"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-mono text-[10px] uppercase tracking-[1.3px] text-muted-foreground mb-2">
              Brand · Equipment
            </div>
            <h1 className="font-heading font-semibold text-[32px] md:text-[38px] leading-[1.05] text-foreground">
              {brand.name}
            </h1>
            <p className="font-heading italic text-[15px] text-muted-foreground mt-2">
              {models.length} model{models.length === 1 ? "" : "s"} across {typeCards.length} type
              {typeCards.length === 1 ? "" : "s"}
              {peopleCount > 0 && (
                <> · {peopleCount} {peopleCount === 1 ? "person has" : "people have"} worked with this brand</>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Numbered section: Types */}
      <div className="flex items-baseline gap-3.5 pb-3.5 border-b border-foreground mb-5">
        <span className="font-mono text-[11px] text-accent tracking-[1px]">01 /</span>
        <h2 className="font-heading font-semibold text-[22px] leading-none text-foreground">
          Equipment types
        </h2>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground tabular-nums">
          {typeCards.length} {typeCards.length === 1 ? "type" : "types"}
        </span>
      </div>

      {typeCards.length === 0 ? (
        <div className="py-12 text-center font-heading italic text-[16px] text-muted-foreground">
          No types yet for this brand.
        </div>
      ) : (
        <div className="space-y-0">
          {typeCards.map((type, idx) => (
            <Link
              key={type.id}
              href={ROUTES.ATLAS_EQUIPMENT_TYPE(brand.slug || brand.id, type.slug || type.id)}
              className="group grid grid-cols-[28px_1fr_auto_60px] gap-4 items-center py-4 px-2 border-b border-muted hover:bg-muted/40 transition-colors"
            >
              <span className="font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground tabular-nums">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span className="font-heading font-semibold text-[17px] leading-[1.25] text-foreground group-hover:text-accent transition-colors truncate">
                {type.name}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground tabular-nums">
                {type.count} {type.count === 1 ? "model" : "models"}
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
