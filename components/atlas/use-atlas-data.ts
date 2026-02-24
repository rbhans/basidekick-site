"use client";

import { useState, useEffect, useRef } from "react";
import type { AtlasData, AtlasCategoriesData } from "@/lib/types";

const LOCAL_DATA_URL = "/data/atlas/index.json";
const DATA_URLS = [
  LOCAL_DATA_URL,
  "https://raw.githubusercontent.com/rbhans/bas-atlas/main/dist/catalog/index.json",
  "https://raw.githubusercontent.com/rbhans/bas-babel/main/dist/catalog/index.json",
];

const LOCAL_CATEGORIES_URL = "/data/atlas/categories.json";
const CATEGORIES_URLS = [
  LOCAL_CATEGORIES_URL,
  "https://raw.githubusercontent.com/rbhans/bas-atlas/main/dist/catalog/categories.json",
  "https://raw.githubusercontent.com/rbhans/bas-babel/main/dist/catalog/categories.json",
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
        const [dataJson, categoriesJson] = await Promise.all([
          fetchJsonWithFallback<AtlasData>(DATA_URLS, signal, "atlas data"),
          fetchJsonWithFallback<AtlasCategoriesData>(CATEGORIES_URLS, signal, "atlas categories"),
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

export function useAtlasData() {
  const [data, setData] = useState<AtlasData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchData() {
      try {
        const json = await fetchJsonWithFallback<AtlasData>(DATA_URLS, controller.signal, "atlas data");
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
