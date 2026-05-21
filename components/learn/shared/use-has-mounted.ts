"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Returns true once the component has mounted client-side.
 *
 * Implemented with useSyncExternalStore so React picks the server
 * snapshot (false) during SSR and the client snapshot (true) after
 * hydration — no setState-in-effect, no double render, no
 * `react-hooks/set-state-in-effect` lint complaints. Used to gate
 * libraries (dnd-kit, next-themes) whose own SSR/CSR output diverges.
 */
export function useHasMounted(): boolean {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
