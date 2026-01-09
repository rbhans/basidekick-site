"use client";

import { useState, useEffect, useRef } from "react";
import type { BabelData, BabelCategoriesData } from "@/lib/types";

// For development, use local data. For production, use GitHub raw (jsDelivr has cache issues)
const DATA_URL = process.env.NODE_ENV === "development"
  ? "/data/babel/index.json"
  : "https://raw.githubusercontent.com/rbhans/bas-babel/main/dist/index.json";

const CATEGORIES_URL = process.env.NODE_ENV === "development"
  ? "/data/babel/categories.json"
  : "https://raw.githubusercontent.com/rbhans/bas-babel/main/dist/categories.json";

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
        // Fetch both in parallel
        const [dataResponse, categoriesResponse] = await Promise.all([
          fetch(DATA_URL, { signal }),
          fetch(CATEGORIES_URL, { signal }),
        ]);

        if (!dataResponse.ok) {
          throw new Error(`Failed to fetch babel data: ${dataResponse.status}`);
        }
        if (!categoriesResponse.ok) {
          throw new Error(`Failed to fetch categories: ${categoriesResponse.status}`);
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
        if (err instanceof Error && err.name === "AbortError") {
          return; // Ignore abort errors
        }
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
        const response = await fetch(DATA_URL, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Failed to fetch babel data: ${response.status}`);
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

export function useBabelCategories() {
  const [categories, setCategories] = useState<BabelCategoriesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchCategories() {
      try {
        const response = await fetch(CATEGORIES_URL, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.status}`);
        }
        const json = await response.json();
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
