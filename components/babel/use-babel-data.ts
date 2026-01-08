"use client";

import { useState, useEffect } from "react";
import type { BabelData, BabelCategoriesData } from "@/lib/types";

// For development, use local data. For production, use CDN
const DATA_URL = process.env.NODE_ENV === "development"
  ? "/data/babel/index.json"
  : "https://cdn.jsdelivr.net/gh/rbhans/bas-babel@main/dist/index.json";

const CATEGORIES_URL = process.env.NODE_ENV === "development"
  ? "/data/babel/categories.json"
  : "https://cdn.jsdelivr.net/gh/rbhans/bas-babel@main/dist/categories.json";

export function useBabelData() {
  const [data, setData] = useState<BabelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(DATA_URL);
        if (!response.ok) {
          throw new Error(`Failed to fetch babel data: ${response.status}`);
        }
        const json = await response.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, loading, error };
}

export function useBabelCategories() {
  const [categories, setCategories] = useState<BabelCategoriesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch(CATEGORIES_URL);
        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.status}`);
        }
        const json = await response.json();
        setCategories(json);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return { categories, loading, error };
}
