"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import { ROUTES } from "@/lib/routes";
import type { AtlasModel } from "@/lib/types";
import { AtlasBrandLogo } from "./atlas-brand-logo";
import { useAtlasAll } from "./use-atlas-data";

interface EquipmentBrowseViewShellProps {
  showHeader: boolean;
}

function EquipmentBrowseViewShell({ showHeader }: EquipmentBrowseViewShellProps) {
  const { data, categories, loading, error } = useAtlasAll();
  const [query, setQuery] = useState("");
  const [popularModels, setPopularModels] = useState<AtlasModel[]>([]);
  const [popularCounts, setPopularCounts] = useState<Record<string, number>>({});

  const brandById = useMemo(
    () => new Map(data?.brands.map((brand) => [brand.id, brand]) || []),
    [data]
  );
  const typeById = useMemo(
    () => new Map(data?.types.map((type) => [type.id, type]) || []),
    [data]
  );

  const modelCountByBrand = useMemo(() => {
    const counts = new Map<string, number>();
    if (!data) return counts;

    for (const model of data.models) {
      counts.set(model.brand, (counts.get(model.brand) || 0) + 1);
    }

    return counts;
  }, [data]);

  const brandCards = useMemo(() => {
    if (!data) return [];

    const categoryBrandById = new Map(
      (categories?.brands || []).map((brand) => [brand.id, brand])
    );

    return data.brands
      .map((brand) => {
        const categoryBrand = categoryBrandById.get(brand.id);
        return {
          id: brand.id,
          name: brand.name,
          slug: brand.slug,
          count: categoryBrand?.count ?? modelCountByBrand.get(brand.id) ?? 0,
          types: categoryBrand?.types || [],
          logo_url: brand.logo_url || "",
          website: brand.website || "",
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [data, categories, modelCountByBrand]);

  const recentModels = useMemo(() => {
    if (!data) return [];
    return [...data.models]
      .sort((a, b) => {
        const aDate = a.added_at ? new Date(a.added_at).getTime() : 0;
        const bDate = b.added_at ? new Date(b.added_at).getTime() : 0;
        return bDate - aDate;
      })
      .slice(0, 6);
  }, [data]);

  const searchResults = useMemo(() => {
    if (!data || !query.trim()) return { brands: [], models: [] };
    const lower = query.toLowerCase();

    const brands = data.brands
      .filter(
        (brand) =>
          brand.name.toLowerCase().includes(lower) ||
          brand.id.toLowerCase().includes(lower) ||
          (brand.slug || "").toLowerCase().includes(lower)
      )
      .slice(0, 4);

    const models = data.models
      .filter((model) => {
        const brandName = brandById.get(model.brand)?.name || "";
        const typeName = typeById.get(model.type)?.name || "";
        return (
          model.name.toLowerCase().includes(lower) ||
          model.id.toLowerCase().includes(lower) ||
          (model.slug || "").toLowerCase().includes(lower) ||
          (model.model_numbers || []).some((num) => num.toLowerCase().includes(lower)) ||
          brandName.toLowerCase().includes(lower) ||
          typeName.toLowerCase().includes(lower)
        );
      })
      .slice(0, 6);

    return { brands, models };
  }, [data, query, brandById, typeById]);

  useEffect(() => {
    const fetchPopular = async () => {
      if (!data) return;
      const supabase = createClient();
      if (!supabase) return;

      const { data: rows, error: fetchError } = await supabase
        .from("equipment_experience")
        .select("equipment_id");

      if (fetchError || !rows) return;

      const counts: Record<string, number> = {};
      for (const row of rows) {
        counts[row.equipment_id] = (counts[row.equipment_id] || 0) + 1;
      }

      const sorted = [...data.models].sort(
        (a, b) => (counts[b.id] || 0) - (counts[a.id] || 0)
      );
      setPopularCounts(counts);
      setPopularModels(sorted.slice(0, 6));
    };

    fetchPopular();
  }, [data]);

  if (error) {
    return (
      <div className="min-h-full flex items-center justify-center py-24">
        <div className="text-center">
          <p className="font-heading italic text-[17px] text-muted-foreground">
            Failed to load BAS Atlas data
          </p>
          <p className="font-mono text-[11px] text-muted-foreground mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  const totalBrands = data?.brands.length ?? 0;
  const totalModels = data?.models.length ?? 0;
  const totalTypes = data?.types.length ?? 0;

  return (
    <div className="min-h-full">
      {showHeader && (
        <>
          {/* Title block strip */}
          <div className="title-block">
            <div className="field">
              <span className="field-label">Drawing</span>
              <span className="field-value">Atlas</span>
            </div>
            <div className="field">
              <span className="field-label">Title</span>
              <span className="field-value">Equipment Catalog</span>
            </div>
            <div className="field">
              <span className="field-label">Brands</span>
              <span className="field-value tabular-nums">{totalBrands}</span>
            </div>
            <div className="field">
              <span className="field-label">Types</span>
              <span className="field-value tabular-nums">{totalTypes}</span>
            </div>
            <div className="field">
              <span className="field-label">Models</span>
              <span className="field-value tabular-nums">{totalModels}</span>
            </div>
            <div className="spacer" />
            <div className="field">
              <span className="field-label">Submit</span>
              <span className="field-value">
                <Link href={ROUTES.ATLAS_EQUIPMENT_ADD} className="hover:text-accent transition-colors">
                  + Add
                </Link>
              </span>
            </div>
          </div>

          <section className="container mx-auto px-4 sm:px-6 lg:px-16 pt-16 pb-10 max-w-[980px]">
            <p className="font-heading italic text-[17px] text-muted-foreground text-center leading-[1.5]">
              A community-kept catalog of BAS equipment — brand, type, protocols, field notes.
            </p>
          </section>
        </>
      )}

      {/* Search */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-16 pb-10 max-w-[980px]">
        <div className="relative border-[1.5px] border-foreground rounded-md bg-card focus-within:border-accent transition-colors">
          <MagnifyingGlass className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search brands, models, or part numbers…"
            className="w-full bg-transparent border-none outline-none font-heading text-[18px] md:text-[20px] text-foreground placeholder:text-muted-foreground/60 placeholder:italic placeholder:font-normal py-[18px] pl-[52px] pr-6"
            aria-label="Search equipment"
          />
        </div>

        {query.trim() && (
          <div className="mt-4 border border-foreground rounded-md bg-card overflow-hidden">
            {searchResults.brands.length === 0 && searchResults.models.length === 0 ? (
              <div className="p-5 font-heading italic text-[15px] text-muted-foreground">
                No results found.
              </div>
            ) : (
              <>
                {searchResults.brands.length > 0 && (
                  <div className="px-5 py-4 border-b border-border">
                    <div className="font-mono text-[10px] uppercase tracking-[1.3px] text-muted-foreground mb-3">
                      Brands
                    </div>
                    <div className="space-y-1">
                      {searchResults.brands.map((brand) => (
                        <Link
                          key={brand.id}
                          href={ROUTES.ATLAS_EQUIPMENT_BRAND(brand.slug || brand.id)}
                          className="flex items-center justify-between text-[14px] text-foreground hover:text-accent py-1 transition-colors"
                        >
                          <span>{brand.name}</span>
                          <span className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground">
                            →
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.models.length > 0 && (
                  <div className="px-5 py-4">
                    <div className="font-mono text-[10px] uppercase tracking-[1.3px] text-muted-foreground mb-3">
                      Models
                    </div>
                    <div className="space-y-1">
                      {searchResults.models.map((model) => {
                        const brand = brandById.get(model.brand);
                        const type = typeById.get(model.type);
                        if (!brand || !type) return null;
                        return (
                          <Link
                            key={model.id}
                            href={ROUTES.ATLAS_EQUIPMENT_MODEL(
                              brand.slug || brand.id,
                              type.slug || type.id,
                              model.slug || model.id
                            )}
                            className="flex items-center justify-between text-[14px] text-foreground hover:text-accent py-1 transition-colors"
                          >
                            <span>{model.name}</span>
                            <span className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground">
                              {brand.name}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </section>

      {/* 01 / Brands */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-16 pb-14 max-w-[1100px]">
        <div className="flex items-baseline gap-3.5 pb-3.5 border-b border-foreground mb-6">
          <span className="font-mono text-[11px] text-accent tracking-[1px]">01 /</span>
          <h2 className="font-heading font-semibold text-[22px] leading-none text-foreground">
            Brands
          </h2>
          <span className="ml-auto font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground tabular-nums">
            {totalBrands} {totalBrands === 1 ? "brand" : "brands"}
          </span>
          <Link
            href={ROUTES.ATLAS_EQUIPMENT_ADD}
            className="ml-3.5 font-mono text-[10px] uppercase tracking-[1.2px] text-accent hover:text-foreground transition-colors"
          >
            + Add equipment
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-14" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-1">
            {brandCards.map((brand) => (
              <Link
                key={brand.id}
                href={ROUTES.ATLAS_EQUIPMENT_BRAND(brand.slug || brand.id)}
                className="group flex items-center gap-3 py-3 border-b border-muted hover:border-foreground transition-colors"
              >
                <div className="size-8 shrink-0 flex items-center justify-center">
                  <AtlasBrandLogo
                    brand={brand}
                    className="max-w-[32px] max-h-[32px]"
                    fallbackClassName="w-8 h-8 border border-border flex items-center justify-center font-heading font-semibold text-[12px] text-foreground"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-heading font-semibold text-[14px] leading-[1.2] text-foreground group-hover:text-accent transition-colors truncate">
                    {brand.name}
                  </div>
                  <div className="font-mono text-[9px] uppercase tracking-[1px] text-muted-foreground tabular-nums mt-0.5">
                    {brand.count} {brand.count === 1 ? "model" : "models"}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 02 / Recently added */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-16 pb-14 max-w-[1100px]">
        <div className="flex items-baseline gap-3.5 pb-3.5 border-b border-foreground mb-5">
          <span className="font-mono text-[11px] text-accent tracking-[1px]">02 /</span>
          <h2 className="font-heading font-semibold text-[22px] leading-none text-foreground">
            Recently added
          </h2>
        </div>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-0">
            {recentModels.map((model, idx) => {
              const brand = brandById.get(model.brand);
              const type = typeById.get(model.type);
              if (!brand || !type) return null;
              return (
                <Link
                  key={model.id}
                  href={ROUTES.ATLAS_EQUIPMENT_MODEL(
                    brand.slug || brand.id,
                    type.slug || type.id,
                    model.slug || model.id
                  )}
                  className="group grid grid-cols-[28px_1fr_auto] gap-4 items-center py-3 px-2 border-b border-muted hover:bg-muted/40 transition-colors"
                >
                  <span className="font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground tabular-nums">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <div className="font-heading font-semibold text-[15px] leading-[1.25] text-foreground group-hover:text-accent transition-colors truncate">
                      {model.name}
                    </div>
                    <div className="font-mono text-[9px] uppercase tracking-[1.1px] text-muted-foreground mt-0.5 truncate">
                      {brand.name} · {type.name}
                    </div>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground group-hover:text-accent transition-colors">
                    View →
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* 03 / Most popular */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-16 pb-16 max-w-[1100px]">
        <div className="flex items-baseline gap-3.5 pb-3.5 border-b border-foreground mb-5">
          <span className="font-mono text-[11px] text-accent tracking-[1px]">03 /</span>
          <h2 className="font-heading font-semibold text-[22px] leading-none text-foreground">
            Most worked with
          </h2>
        </div>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : popularModels.length === 0 ? (
          <p className="font-heading italic text-[15px] text-muted-foreground">
            No experience data yet.
          </p>
        ) : (
          <div className="space-y-0">
            {popularModels.map((model, idx) => {
              const brand = brandById.get(model.brand);
              const type = typeById.get(model.type);
              if (!brand || !type) return null;
              return (
                <Link
                  key={model.id}
                  href={ROUTES.ATLAS_EQUIPMENT_MODEL(
                    brand.slug || brand.id,
                    type.slug || type.id,
                    model.slug || model.id
                  )}
                  className="group grid grid-cols-[28px_1fr_auto] gap-4 items-center py-3 px-2 border-b border-muted hover:bg-muted/40 transition-colors"
                >
                  <span className="font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground tabular-nums">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <div className="font-heading font-semibold text-[15px] leading-[1.25] text-foreground group-hover:text-accent transition-colors truncate">
                      {model.name}
                    </div>
                    <div className="font-mono text-[9px] uppercase tracking-[1.1px] text-muted-foreground mt-0.5 truncate">
                      {brand.name} · {type.name}
                    </div>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[1.1px] text-accent tabular-nums">
                    {popularCounts[model.id] || 0} worked
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export function EquipmentBrowseView() {
  return <EquipmentBrowseViewShell showHeader />;
}

export function EquipmentBrowseContent() {
  return <EquipmentBrowseViewShell showHeader={false} />;
}
