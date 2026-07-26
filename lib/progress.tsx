"use client";

import { useCallback, useSyncExternalStore, type ReactNode } from "react";

type InteractionProgress = {
  interactions: Record<string, unknown>;
};

const STORAGE_KEY = "basidekick.course-interactions.v1";
const EMPTY_PROGRESS: InteractionProgress = { interactions: {} };
let currentProgress = EMPTY_PROGRESS;
let initialized = false;
const listeners = new Set<() => void>();

function loadProgress(): InteractionProgress {
  if (typeof window === "undefined") return EMPTY_PROGRESS;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return EMPTY_PROGRESS;
    const parsed = JSON.parse(stored) as Partial<InteractionProgress>;
    return { interactions: parsed.interactions ?? {} };
  } catch {
    return EMPTY_PROGRESS;
  }
}

function initialize() {
  if (initialized || typeof window === "undefined") return;
  currentProgress = loadProgress();
  initialized = true;
}

function subscribe(listener: () => void) {
  initialize();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  initialize();
  return currentProgress;
}

function getServerSnapshot() {
  return EMPTY_PROGRESS;
}

function subscribeHydration(listener: () => void) {
  initialize();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getHydratedSnapshot() {
  initialize();
  return initialized;
}

function setInteraction(key: string, value: unknown) {
  initialize();
  currentProgress = {
    interactions: {
      ...currentProgress.interactions,
      [key]: value,
    },
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(currentProgress));
  } catch {
    // The interactions still work when browser storage is unavailable.
  }
  listeners.forEach((listener) => listener());
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  return children;
}

export function useProgress() {
  const progress = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    getHydratedSnapshot,
    () => false,
  );
  const getInteraction = useCallback(
    (key: string) => progress.interactions[key],
    [progress],
  );
  return { hydrated, getInteraction, setInteraction };
}
