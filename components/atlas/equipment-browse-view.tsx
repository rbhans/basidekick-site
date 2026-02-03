"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MagnifyingGlass, ArrowRight } from "@phosphor-icons/react";
import { SectionLabel } from "@/components/section-label";
import { CircuitBackground } from "@/components/circuit-background";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAtlasAll } from "./use-atlas-data";
import { ROUTES } from "@/lib/routes";
import { createClient } from "@/lib/supabase/client";
import type { AtlasModel } from "@/lib/types";

export function EquipmentBrowseView() {
  const { data, categories, loading, error } = useAtlasAll();
  const [query, setQuery] = useState("");
  const [popularModels, setPopularModels] = useState<AtlasModel[]>([]);
  const [popularCounts, setPopularCounts] = useState<Record<string, number>>({});

  const brandById = useMemo(() => {
    return new Map(data?.brands.map((b) => [b.id, b]) || []);
  }, [data]);

  const typeById = useMemo(() => {
    return new Map(data?.types.map((t) => [t.id, t]) || []);
  }, [data]);

  const brandCards = useMemo(() => {
    if (!data) return [];
    if (categories?.brands) {
      return categories.brands.map((brand) => ({
        ...brand,
        logo_url: brandById.get(brand.id)?.logo_url || "",
      }));
    }

    return data.brands.map((brand) => ({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      count: data.models.filter((m) => m.brand === brand.id).length,
      types: [],
      logo_url: brand.logo_url || "",
    }));
  }, [data, categories, brandById]);

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

    const brands = data.brands.filter((brand) =>
      brand.name.toLowerCase().includes(lower) ||
      brand.id.toLowerCase().includes(lower) ||
      (brand.slug || "").toLowerCase().includes(lower)
    ).slice(0, 4);

    const models = data.models.filter((model) => {
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
    }).slice(0, 6);

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
      {/* Header */}
      <section className="relative py-12 overflow-hidden">
        <CircuitBackground opacity={0.15} colorGradient />
        <div className="container mx-auto px-4 relative z-10">
          <SectionLabel variant="resources">resources</SectionLabel>

          <h1 className="mt-6 text-3xl md:text-4xl font-semibold tracking-tight">BAS Atlas</h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            A community-driven equipment database for BAS professionals. Browse by brand and type,
            track what you&apos;ve worked with, and share field notes.
          </p>
        </div>
      </section>

      {/* Search */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <div className="relative max-w-xl">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
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
                            href={ROUTES.EQUIPMENT_BRAND(brand.slug || brand.id)}
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
                              href={ROUTES.EQUIPMENT_MODEL(brand.slug || brand.id, type.slug || type.id, model.slug || model.id)}
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

      {/* Brand Grid */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Brands</h2>
            <Link href={ROUTES.EQUIPMENT_ADD} className="text-sm text-primary hover:underline">
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
                  href={ROUTES.EQUIPMENT_BRAND(brand.slug || brand.id)}
                  className="group p-4 border border-border bg-card hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {brand.logo_url ? (
                      <img src={brand.logo_url} alt={brand.name} className="size-8 object-contain" />
                    ) : (
                      <div className="size-8 rounded bg-muted flex items-center justify-center text-sm font-semibold">
                        {brand.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium group-hover:text-primary transition-colors">
                        {brand.name}
                      </p>
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

      {/* Recently added */}
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
                    href={ROUTES.EQUIPMENT_MODEL(brand.slug || brand.id, type.slug || type.id, model.slug || model.id)}
                    className="p-4 border border-border bg-card hover:border-primary/30 transition-colors"
                  >
                    <p className="text-sm font-semibold">{model.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{brand.name} · {type.name}</p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Most popular */}
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
                    href={ROUTES.EQUIPMENT_MODEL(brand.slug || brand.id, type.slug || type.id, model.slug || model.id)}
                    className="p-4 border border-border bg-card hover:border-primary/30 transition-colors"
                  >
                    <p className="text-sm font-semibold">{model.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{brand.name} · {type.name}</p>
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
