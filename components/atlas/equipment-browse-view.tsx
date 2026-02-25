"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MagnifyingGlass, ArrowRight } from "@phosphor-icons/react";
import { SiteBadge } from "@/components/site-badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import { ROUTES } from "@/lib/routes";
import type { AtlasModel } from "@/lib/types";
import { AtlasBreadcrumb } from "./atlas-breadcrumb";
import { AtlasBrandLogo } from "./atlas-brand-logo";
import { useAtlasAll } from "./use-atlas-data";
import { PageHero } from "@/components/page-hero";

interface EquipmentBrowseViewShellProps {
  showHeader: boolean;
}

function EquipmentBrowseViewShell({ showHeader }: EquipmentBrowseViewShellProps) {
  const { data, categories, loading, error } = useAtlasAll();
  const [query, setQuery] = useState("");
  const [popularModels, setPopularModels] = useState<AtlasModel[]>([]);
  const [popularCounts, setPopularCounts] = useState<Record<string, number>>({});

  const brandById = useMemo(() => new Map(data?.brands.map((brand) => [brand.id, brand]) || []), [data]);
  const typeById = useMemo(() => new Map(data?.types.map((type) => [type.id, type]) || []), [data]);

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

    const categoryBrandById = new Map((categories?.brands || []).map((brand) => [brand.id, brand]));

    return data.brands.map((brand) => {
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
    });
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
          (brand.slug || "").toLowerCase().includes(lower),
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

      const sorted = [...data.models].sort((a, b) => (counts[b.id] || 0) - (counts[a.id] || 0));
      setPopularCounts(counts);
      setPopularModels(sorted.slice(0, 6));
    };

    fetchPopular();
  }, [data]);

  if (error) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load BAS Atlas data</p>
          <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      {showHeader && (
                <PageHero>
            <SiteBadge label="RESOURCES" />
            <AtlasBreadcrumb items={[]} />

            <h1 className="mt-4 text-3xl md:text-4xl font-heading font-bold tracking-tight">BAS Atlas Equipment</h1>
            <p className="mt-3 text-muted-foreground max-w-2xl">
              Community-driven equipment catalog for BAS professionals. Browse by brand and type, track what
              you&apos;ve worked with, and share field notes.
            </p>
        </PageHero>
      )}

      <section className="py-6">
        <div className="container mx-auto px-4">
          <div className="relative max-w-xl">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by brand or model..."
              className="pl-9"
            />
          </div>

          {query.trim() && (
            <div className="mt-4 border border-border rounded-lg overflow-hidden bg-card">
              {searchResults.brands.length === 0 && searchResults.models.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground">No results found.</div>
              ) : (
                <div className="divide-y divide-border">
                  {searchResults.brands.length > 0 && (
                    <div className="p-4">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Brands</p>
                      <div className="flex flex-col gap-2">
                        {searchResults.brands.map((brand) => (
                          <Link
                            key={brand.id}
                            href={ROUTES.ATLAS_EQUIPMENT_BRAND(brand.slug || brand.id)}
                            className="flex items-center justify-between text-sm hover:text-primary"
                          >
                            {brand.name}
                            <ArrowRight className="size-3" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.models.length > 0 && (
                    <div className="p-4">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Models</p>
                      <div className="flex flex-col gap-2">
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
                                model.slug || model.id,
                              )}
                              className="flex items-center justify-between text-sm hover:text-primary"
                            >
                              <span>{model.name}</span>
                              <span className="text-xs text-muted-foreground">{brand.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Brands</h2>
            <Link href={ROUTES.ATLAS_EQUIPMENT_ADD} className="text-sm text-primary hover:underline">
              Add equipment
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {brandCards.map((brand) => (
                <Link
                  key={brand.id}
                  href={ROUTES.ATLAS_EQUIPMENT_BRAND(brand.slug || brand.id)}
                  className="group p-4 border border-border bg-card shadow-sm hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <AtlasBrandLogo
                      brand={brand}
                      className="size-8"
                      fallbackClassName="size-8 rounded bg-muted flex items-center justify-center text-sm font-semibold"
                    />
                    <div>
                      <p className="text-sm font-medium group-hover:text-primary transition-colors">{brand.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {brand.count} model{brand.count === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-semibold mb-4">Recently added</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentModels.map((model) => {
                const brand = brandById.get(model.brand);
                const type = typeById.get(model.type);
                if (!brand || !type) return null;
                return (
                  <Link
                    key={model.id}
                    href={ROUTES.ATLAS_EQUIPMENT_MODEL(
                      brand.slug || brand.id,
                      type.slug || type.id,
                      model.slug || model.id,
                    )}
                    className="p-4 border border-border bg-card shadow-sm hover:border-primary/30 transition-colors"
                  >
                    <p className="text-sm font-semibold">{model.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {brand.name} · {type.name}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-semibold mb-4">Most popular</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularModels.map((model) => {
                const brand = brandById.get(model.brand);
                const type = typeById.get(model.type);
                if (!brand || !type) return null;
                return (
                  <Link
                    key={model.id}
                    href={ROUTES.ATLAS_EQUIPMENT_MODEL(
                      brand.slug || brand.id,
                      type.slug || type.id,
                      model.slug || model.id,
                    )}
                    className="p-4 border border-border bg-card shadow-sm hover:border-primary/30 transition-colors"
                  >
                    <p className="text-sm font-semibold">{model.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {brand.name} · {type.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {popularCounts[model.id] || 0} people worked with this
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
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
