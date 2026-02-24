"use client";

import { useState, useEffect, useRef } from "react";
import type { BabelData, BabelCategoriesData } from "@/lib/types";

const DATA_URLS = [
  "/data/atlas-terms/index.json",
  "/data/babel/index.json",
  "https://raw.githubusercontent.com/rbhans/bas-atlas/main/dist/atlas/index.json",
  "https://raw.githubusercontent.com/rbhans/bas-babel/main/dist/atlas/index.json",
];

const CATEGORIES_URLS = [
  "/data/atlas-terms/categories.json",
  "/data/babel/categories.json",
  "https://raw.githubusercontent.com/rbhans/bas-atlas/main/dist/atlas/categories.json",
  "https://raw.githubusercontent.com/rbhans/bas-babel/main/dist/atlas/categories.json",
];

function isAbortError(err: unknown): boolean {
  return err instanceof Error && err.name === "AbortError";
}

async function fetchJsonWithFallback<T>(
  urls: string[],
  signal: AbortSignal,
  label: string
): Promise<T> {
  let lastError: Error | null = null;

  for (const url of urls) {
    try {
      const response = await fetch(url, { signal });
      if (!response.ok) {
        throw new Error(`Failed to fetch ${label} from ${url}: ${response.status}`);
      }
      return (await response.json()) as T;
    } catch (err) {
      if (isAbortError(err)) throw err;
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError ?? new Error(`Failed to fetch ${label}`);
}

// Combined hook that fetches both data and categories in parallel
export function useBabelAll() {
  const [data, setData] = useState<BabelData | null>(null);
  const [categories, setCategories] = useState<BabelCategoriesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Cancel any in-flight requests
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    async function fetchAll() {
      try {
        const [dataJson, categoriesJson] = await Promise.all([
          fetchJsonWithFallback<BabelData>(DATA_URLS, signal, "atlas terms data"),
          fetchJsonWithFallback<BabelCategoriesData>(CATEGORIES_URLS, signal, "atlas terms categories"),
        ]);

        if (!signal.aborted) {
          setData(dataJson);
          setCategories(categoriesJson);
        }
      } catch (err) {
        if (isAbortError(err)) return;
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

// Keep individual hooks for backward compatibility, but they use cached data from useBabelAll
export function useBabelData() {
  const [data, setData] = useState<BabelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchData() {
      try {
        const json = await fetchJsonWithFallback<BabelData>(
          DATA_URLS,
          controller.signal,
          "atlas terms data"
        );
        if (!controller.signal.aborted) {
          setData(json);
        }
      } catch (err) {
        if (isAbortError(err)) return;
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
        const json = await fetchJsonWithFallback<BabelCategoriesData>(
          CATEGORIES_URLS,
          controller.signal,
          "atlas terms categories"
        );
        if (!controller.signal.aborted) {
          setCategories(json);
        }
      } catch (err) {
        if (isAbortError(err)) return;
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
