"use client";

import { useCallback, useSyncExternalStore, type ReactNode } from "react";
import type { Progress, CourseProgress } from "@/lib/courses";

const STORAGE_KEY = "basidekick.progress.v1";

function emptyProgress(): Progress {
  return { userId: null, courses: {}, interactions: {} };
}

function emptyCourseProgress(): CourseProgress {
  const now = Date.now();
  return {
    lessonsCompleted: [],
    lastLessonSlug: null,
    startedAt: now,
    lastActiveAt: now,
  };
}

// ──────────────────────────────────────────────────────────────────────
// Module-level store. Lives outside React so we can use
// useSyncExternalStore properly — no setState-in-effect, no double
// render, server snapshot always returns the empty value so SSR and
// initial hydration agree.
// ──────────────────────────────────────────────────────────────────────

const EMPTY_PROGRESS: Progress = emptyProgress();
let currentProgress: Progress = EMPTY_PROGRESS;
let initialized = false;
const listeners = new Set<() => void>();

function loadFromStorage(): Progress {
  if (typeof window === "undefined") return emptyProgress();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress();
    const parsed = JSON.parse(raw) as Progress;
    return {
      userId: parsed.userId ?? null,
      courses: parsed.courses ?? {},
      interactions: parsed.interactions ?? {},
    };
  } catch {
    return emptyProgress();
  }
}

function saveToStorage(progress: Progress) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    /* quota or disabled storage — silent */
  }
}

function ensureInitialized() {
  if (initialized || typeof window === "undefined") return;
  currentProgress = loadFromStorage();
  initialized = true;
}

function subscribe(callback: () => void): () => void {
  ensureInitialized();
  listeners.add(callback);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      currentProgress = loadFromStorage();
      listeners.forEach((l) => l());
    }
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }
  return () => {
    listeners.delete(callback);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

function getSnapshot(): Progress {
  ensureInitialized();
  return currentProgress;
}

function getServerSnapshot(): Progress {
  return EMPTY_PROGRESS;
}

function subscribeHydrated(callback: () => void): () => void {
  ensureInitialized();
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}
function getHydratedSnapshot(): boolean {
  ensureInitialized();
  return initialized;
}
function getHydratedServerSnapshot(): boolean {
  return false;
}

function update(updater: (prev: Progress) => Progress) {
  ensureInitialized();
  const next = updater(currentProgress);
  if (next === currentProgress) return;
  currentProgress = next;
  saveToStorage(currentProgress);
  listeners.forEach((l) => l());
}

// ──────────────────────────────────────────────────────────────────────
// Public API. ProgressProvider is now a no-op pass-through, kept so
// layout-level composition (and future server-state integrations)
// stay unchanged.
// ──────────────────────────────────────────────────────────────────────

export interface ProgressStore {
  progress: Progress;
  hydrated: boolean;
  getCourse(courseSlug: string): CourseProgress;
  isLessonComplete(courseSlug: string, lessonSlug: string): boolean;
  markLessonComplete(courseSlug: string, lessonSlug: string): void;
  unmarkLessonComplete(courseSlug: string, lessonSlug: string): void;
  setLastLesson(courseSlug: string, lessonSlug: string): void;
  setInteraction(key: string, value: unknown): void;
  getInteraction(key: string): unknown;
  resetCourse(courseSlug: string): void;
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useProgress(): ProgressStore {
  const progress = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const hydrated = useSyncExternalStore(
    subscribeHydrated,
    getHydratedSnapshot,
    getHydratedServerSnapshot,
  );

  const getCourse = useCallback(
    (courseSlug: string): CourseProgress =>
      progress.courses[courseSlug] ?? emptyCourseProgress(),
    [progress],
  );

  const isLessonComplete = useCallback(
    (courseSlug: string, lessonSlug: string) => {
      const c = progress.courses[courseSlug];
      return !!c?.lessonsCompleted.includes(lessonSlug);
    },
    [progress],
  );

  const markLessonComplete = useCallback(
    (courseSlug: string, lessonSlug: string) => {
      update((prev) => {
        const current = prev.courses[courseSlug] ?? emptyCourseProgress();
        if (current.lessonsCompleted.includes(lessonSlug)) return prev;
        return {
          ...prev,
          courses: {
            ...prev.courses,
            [courseSlug]: {
              ...current,
              lessonsCompleted: [...current.lessonsCompleted, lessonSlug],
              lastActiveAt: Date.now(),
            },
          },
        };
      });
    },
    [],
  );

  const unmarkLessonComplete = useCallback(
    (courseSlug: string, lessonSlug: string) => {
      update((prev) => {
        const current = prev.courses[courseSlug];
        if (!current) return prev;
        return {
          ...prev,
          courses: {
            ...prev.courses,
            [courseSlug]: {
              ...current,
              lessonsCompleted: current.lessonsCompleted.filter(
                (s) => s !== lessonSlug,
              ),
              lastActiveAt: Date.now(),
            },
          },
        };
      });
    },
    [],
  );

  const setLastLesson = useCallback(
    (courseSlug: string, lessonSlug: string) => {
      update((prev) => {
        const current = prev.courses[courseSlug] ?? emptyCourseProgress();
        if (current.lastLessonSlug === lessonSlug) {
          return {
            ...prev,
            courses: {
              ...prev.courses,
              [courseSlug]: { ...current, lastActiveAt: Date.now() },
            },
          };
        }
        return {
          ...prev,
          courses: {
            ...prev.courses,
            [courseSlug]: {
              ...current,
              lastLessonSlug: lessonSlug,
              lastActiveAt: Date.now(),
            },
          },
        };
      });
    },
    [],
  );

  const setInteraction = useCallback((key: string, value: unknown) => {
    update((prev) => ({
      ...prev,
      interactions: { ...prev.interactions, [key]: value },
    }));
  }, []);

  const getInteraction = useCallback(
    (key: string) => progress.interactions[key],
    [progress],
  );

  const resetCourse = useCallback((courseSlug: string) => {
    update((prev) => {
      const nextCourses = { ...prev.courses };
      delete nextCourses[courseSlug];
      return { ...prev, courses: nextCourses };
    });
  }, []);

  return {
    progress,
    hydrated,
    getCourse,
    isLessonComplete,
    markLessonComplete,
    unmarkLessonComplete,
    setLastLesson,
    setInteraction,
    getInteraction,
    resetCourse,
  };
}
