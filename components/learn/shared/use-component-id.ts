"use client";

import { useId, useMemo } from "react";

/**
 * Returns a stable id for a learn-component. Authors can supply an
 * explicit `componentId` in MDX to keep progress associations stable
 * across edits; otherwise React's useId acts as a fallback that is
 * stable across re-renders within a session but not across reloads.
 */
export function useComponentId(
  explicitId: string | undefined,
  prefix = "lc",
): string {
  const fallback = useId();
  return useMemo(
    () => explicitId ?? `${prefix}.${fallback}`,
    [explicitId, fallback, prefix],
  );
}
