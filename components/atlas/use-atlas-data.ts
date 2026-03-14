"use client";

import { useState, useEffect, useRef } from "react";
import type { AtlasData, AtlasCategoriesData } from "@/lib/types";

export function useAtlasAll() {
  const [data, setData] = useState<AtlasData | null>(null);
  const [categories, setCategories] = useState<AtlasCategoriesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    async function fetchAll() {
      try {
        const [brandsRes, typesRes, modelsRes, statsRes] = await Promise.all([
          fetch("/api/atlas/brands", { signal }),
          fetch("/api/atlas/types", { signal }),
          fetch("/api/atlas/models", { signal }),
          fetch("/api/atlas/stats", { signal }),
        ]);

        const [brandsData, typesData, modelsData, statsData] = await Promise.all([
          brandsRes.json(),
          typesRes.json(),
          modelsRes.json(),
          statsRes.json(),
        ]);

        if (!signal.aborted) {
          const atlasData: AtlasData = {
            version: "1.0.0",
            lastUpdated: new Date().toISOString(),
            totalBrands: brandsData.brands.length,
            totalTypes: typesData.types.length,
            totalModels: modelsData.models.length,
            brands: brandsData.brands,
            types: typesData.types,
            models: modelsData.models,
          };
          setData(atlasData);

          // Build categories from the API data
          const brandCategories = brandsData.brands.map((b: Record<string, unknown>) => ({
            id: b.id,
            name: b.name,
            slug: b.slug,
            count: b.model_count || 0,
            types: [],
          }));

          const typeCategories = typesData.types.map((t: Record<string, unknown>) => ({
            id: t.id,
            name: t.name,
            slug: t.slug,
            count: t.model_count || 0,
          }));

          setCategories({
            version: "1.0.0",
            brands: brandCategories,
            types: typeCategories,
          });
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchAll();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return { data, categories, loading, error };
}

export function useAtlasData() {
  const [data, setData] = useState<AtlasData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchData() {
      try {
        const [brandsRes, typesRes, modelsRes] = await Promise.all([
          fetch("/api/atlas/brands", { signal: controller.signal }),
          fetch("/api/atlas/types", { signal: controller.signal }),
          fetch("/api/atlas/models", { signal: controller.signal }),
        ]);

        const [brandsData, typesData, modelsData] = await Promise.all([
          brandsRes.json(),
          typesRes.json(),
          modelsRes.json(),
        ]);

        if (!controller.signal.aborted) {
          setData({
            version: "1.0.0",
            lastUpdated: new Date().toISOString(),
            totalBrands: brandsData.brands.length,
            totalTypes: typesData.types.length,
            totalModels: modelsData.models.length,
            brands: brandsData.brands,
            types: typesData.types,
            models: modelsData.models,
          });
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => controller.abort();
  }, []);

  return { data, loading, error };
}
