"use client";

import { useCallback } from "react";
import { useProgress } from "@/lib/progress";

/**
 * Bind a learn-component's interaction state to the global progress store
 * under a stable key. Returns `[value, setValue]` so the component can
 * persist things like "this card was revealed" or "scrub at step 3".
 */
export function useComponentProgress<T>(
  componentId: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void, boolean] {
  const { hydrated, getInteraction, setInteraction } = useProgress();
  const stored = getInteraction(componentId) as T | undefined;
  const value = hydrated && stored !== undefined ? stored : initialValue;

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved =
        typeof next === "function"
          ? (next as (prev: T) => T)(
              (getInteraction(componentId) as T | undefined) ?? initialValue,
            )
          : next;
      setInteraction(componentId, resolved);
    },
    [componentId, initialValue, getInteraction, setInteraction],
  );

  return [value, setValue, hydrated];
}
