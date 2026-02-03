"use client";

import { useState, useEffect, useRef } from "react";
import type { AtlasData, AtlasCategoriesData } from "@/lib/types";

const DATA_URL = process.env.NODE_ENV === "development"
  ? "/data/atlas/index.json"
  : "https://raw.githubusercontent.com/rbhans/bas-atlas/main/dist/index.json";

const CATEGORIES_URL = process.env.NODE_ENV === "development"
  ? "/data/atlas/categories.json"
  : "https://raw.githubusercontent.com/rbhans/bas-atlas/main/dist/categories.json";

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
        const [dataResponse, categoriesResponse] = await Promise.all([
          fetch(DATA_URL, { signal }),
          fetch(CATEGORIES_URL, { signal }),
        ]);

        if (!dataResponse.ok) {
          throw new Error(`Failed to fetch atlas data: ${dataResponse.status}`);
        }
        if (!categoriesResponse.ok) {
          throw new Error(`Failed to fetch atlas categories: ${categoriesResponse.status}`);
        }

        const [dataJson, categoriesJson] = await Promise.all([
          dataResponse.json(),
          categoriesResponse.json(),
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

export function useAtlasData() {
  const [data, setData] = useState<AtlasData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchData() {
      try {
        const response = await fetch(DATA_URL, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Failed to fetch atlas data: ${response.status}`);
        }
        const json = await response.json();
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
