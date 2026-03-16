"use client";

import { useState, useEffect, useRef } from "react";
import type { BabelData, BabelCategoriesData } from "@/lib/types";

// Combined hook that fetches both data and categories in parallel
export function useBabelAll() {
  const [data, setData] = useState<BabelData | null>(null);
  const [categories, setCategories] = useState<BabelCategoriesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    async function fetchAll() {
      try {
        const [dataRes, categoriesRes] = await Promise.all([
          fetch("/api/atlas/babel", { signal }),
          fetch("/api/atlas/babel/categories", { signal }),
        ]);

        if (!dataRes.ok) throw new Error(`Failed to fetch data: ${dataRes.status}`);
        if (!categoriesRes.ok) throw new Error(`Failed to fetch categories: ${categoriesRes.status}`);

        const [dataJson, categoriesJson] = await Promise.all([
          dataRes.json() as Promise<BabelData>,
          categoriesRes.json() as Promise<BabelCategoriesData>,
        ]);

        if (!signal.aborted) {
          setData(dataJson);
          setCategories(categoriesJson);
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

export function useBabelData() {
  const [data, setData] = useState<BabelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchData() {
      try {
        const res = await fetch("/api/atlas/babel", { signal: controller.signal });
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        const json = await res.json() as BabelData;
        if (!controller.signal.aborted) {
          setData(json);
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

export function useBabelCategories() {
  const [categories, setCategories] = useState<BabelCategoriesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchCategories() {
      try {
        const res = await fetch("/api/atlas/babel/categories", { signal: controller.signal });
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        const json = await res.json() as BabelCategoriesData;
        if (!controller.signal.aborted) {
          setCategories(json);
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

    fetchCategories();
    return () => controller.abort();
  }, []);

  return { categories, loading, error };
}
