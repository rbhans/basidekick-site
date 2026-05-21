"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import type { Progress, CourseProgress } from "@/lib/courses";

const STORAGE_KEY = "basidekick.progress.v1";
const SYNC_DEBOUNCE_MS = 600;

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
// Module-level store. Lives outside React so useSyncExternalStore can
// observe it directly. The server snapshot returns an empty value so
// SSR and the first client render agree (we hydrate from localStorage
// after mount via the `hydrated` flag).
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

function update(
  updater: (prev: Progress) => Progress,
  options: { touchedCourse?: string } = {},
) {
  ensureInitialized();
  const next = updater(currentProgress);
  if (next === currentProgress) return;
  currentProgress = next;
  saveToStorage(currentProgress);
  listeners.forEach((l) => l());
  if (options.touchedCourse) {
    queueRemoteSync(options.touchedCourse);
  }
}

// ──────────────────────────────────────────────────────────────────────
// Supabase sync layer. The current signed-in user id and a Supabase
// client are stashed in module state by <ProgressSync /> below. When a
// course is mutated we debounce a per-course upsert. When the user
// signs in we fetch remote rows, merge with local, and push back the
// unioned state.
// ──────────────────────────────────────────────────────────────────────

type RemoteClient = NonNullable<ReturnType<typeof createClient>>;

let remoteUserId: string | null = null;
let remoteClient: RemoteClient | null = null;
const pendingFlush = new Map<string, ReturnType<typeof setTimeout>>();

function queueRemoteSync(courseSlug: string) {
  if (!remoteUserId || !remoteClient) return;
  const existing = pendingFlush.get(courseSlug);
  if (existing) clearTimeout(existing);
  const timer = setTimeout(() => {
    pendingFlush.delete(courseSlug);
    void flushCourse(courseSlug);
  }, SYNC_DEBOUNCE_MS);
  pendingFlush.set(courseSlug, timer);
}

async function flushCourse(courseSlug: string) {
  const userId = remoteUserId;
  const client = remoteClient;
  if (!userId || !client) return;
  const course = currentProgress.courses[courseSlug];
  if (!course) {
    // Course was reset — remove the row.
    await client
      .from("course_progress")
      .delete()
      .eq("user_id", userId)
      .eq("course_slug", courseSlug);
    return;
  }
  await client.from("course_progress").upsert(
    {
      user_id: userId,
      course_slug: courseSlug,
      lessons_completed: course.lessonsCompleted,
      last_lesson_slug: course.lastLessonSlug,
      started_at: new Date(course.startedAt).toISOString(),
      last_active_at: new Date(course.lastActiveAt).toISOString(),
    },
    { onConflict: "user_id,course_slug" },
  );
}

interface RemoteCourseRow {
  course_slug: string;
  lessons_completed: string[] | null;
  last_lesson_slug: string | null;
  started_at: string;
  last_active_at: string;
}

function rowToCourse(row: RemoteCourseRow): CourseProgress {
  return {
    lessonsCompleted: row.lessons_completed ?? [],
    lastLessonSlug: row.last_lesson_slug,
    startedAt: Date.parse(row.started_at),
    lastActiveAt: Date.parse(row.last_active_at),
  };
}

function mergeCourse(local: CourseProgress, remote: CourseProgress): CourseProgress {
  const completed = new Set([
    ...local.lessonsCompleted,
    ...remote.lessonsCompleted,
  ]);
  const lastLesson =
    local.lastActiveAt >= remote.lastActiveAt
      ? local.lastLessonSlug
      : remote.lastLessonSlug;
  return {
    lessonsCompleted: Array.from(completed),
    lastLessonSlug: lastLesson,
    startedAt: Math.min(local.startedAt, remote.startedAt),
    lastActiveAt: Math.max(local.lastActiveAt, remote.lastActiveAt),
  };
}

async function pullAndMerge(userId: string, client: RemoteClient) {
  const { data, error } = await client
    .from("course_progress")
    .select("course_slug, lessons_completed, last_lesson_slug, started_at, last_active_at")
    .eq("user_id", userId);
  if (error || !data) return;

  ensureInitialized();
  const merged: Record<string, CourseProgress> = { ...currentProgress.courses };
  const touched = new Set<string>();

  // Remote rows: merge into local.
  for (const row of data as RemoteCourseRow[]) {
    const remote = rowToCourse(row);
    const local = merged[row.course_slug];
    if (!local) {
      merged[row.course_slug] = remote;
    } else {
      const next = mergeCourse(local, remote);
      // Only mark touched if the merge actually adds something the
      // remote doesn't already have. Avoids needless writes.
      const remoteLessons = new Set(remote.lessonsCompleted);
      const hasLocalOnly = next.lessonsCompleted.some(
        (s) => !remoteLessons.has(s),
      );
      const drifted =
        hasLocalOnly ||
        next.lastLessonSlug !== remote.lastLessonSlug ||
        next.lastActiveAt !== remote.lastActiveAt;
      merged[row.course_slug] = next;
      if (drifted) touched.add(row.course_slug);
    }
  }

  // Local-only courses: need to be pushed.
  const remoteSlugs = new Set(
    (data as RemoteCourseRow[]).map((row) => row.course_slug),
  );
  for (const slug of Object.keys(merged)) {
    if (!remoteSlugs.has(slug)) {
      touched.add(slug);
    }
  }

  currentProgress = {
    ...currentProgress,
    userId,
    courses: merged,
  };
  saveToStorage(currentProgress);
  listeners.forEach((l) => l());

  // Push the unioned state back for every drifted/new course.
  for (const slug of touched) {
    void flushCourse(slug);
  }
}

function setLocalUserId(userId: string | null) {
  if (currentProgress.userId === userId) return;
  ensureInitialized();
  currentProgress = { ...currentProgress, userId };
  saveToStorage(currentProgress);
  listeners.forEach((l) => l());
}

// ──────────────────────────────────────────────────────────────────────
// Public API
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

function ProgressSync() {
  const { user } = useAuth();
  const lastUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const client = createClient();
    if (!client) return;
    remoteClient = client;

    const userId = user?.id ?? null;
    remoteUserId = userId;
    setLocalUserId(userId);

    if (userId && userId !== lastUserIdRef.current) {
      lastUserIdRef.current = userId;
      void pullAndMerge(userId, client);
    } else if (!userId) {
      lastUserIdRef.current = null;
    }
  }, [user]);

  return null;
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  return (
    <>
      <ProgressSync />
      {children}
    </>
  );
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
      update(
        (prev) => {
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
        },
        { touchedCourse: courseSlug },
      );
    },
    [],
  );

  const unmarkLessonComplete = useCallback(
    (courseSlug: string, lessonSlug: string) => {
      update(
        (prev) => {
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
        },
        { touchedCourse: courseSlug },
      );
    },
    [],
  );

  const setLastLesson = useCallback(
    (courseSlug: string, lessonSlug: string) => {
      update(
        (prev) => {
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
        },
        { touchedCourse: courseSlug },
      );
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
    update(
      (prev) => {
        const nextCourses = { ...prev.courses };
        delete nextCourses[courseSlug];
        return { ...prev, courses: nextCourses };
      },
      { touchedCourse: courseSlug },
    );
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
