"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useComponentId } from "@/components/learn/shared/use-component-id";
import { useComponentProgress } from "@/components/learn/shared/use-component-progress";

interface StepThroughProps {
  /** Pre-rendered frames. Length determines frame count. */
  frames: ReactNode[];
  captions?: ReactNode[];
  label?: string;
  componentId?: string;
  autoAdvance?: boolean;
  intervalMs?: number;
}

export function StepThrough({
  frames,
  captions,
  label,
  componentId,
  autoAdvance = false,
  intervalMs = 1400,
}: StepThroughProps) {
  const id = useComponentId(componentId, "step");
  const total = frames.length;
  const [frame, setFrame] = useComponentProgress<number>(id, 0);
  const [playing, setPlaying] = useState(autoAdvance);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!playing) return;
    timerRef.current = setInterval(() => {
      setFrame((f) => {
        if (f >= total - 1) {
          setPlaying(false);
          return f;
        }
        return f + 1;
      });
    }, intervalMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [playing, total, intervalMs, setFrame]);

  if (total === 0) return null;
  const safeFrame = Math.max(0, Math.min(total - 1, frame));
  const atStart = safeFrame === 0;
  const atEnd = safeFrame === total - 1;

  return (
    <figure className="my-10 overflow-hidden rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-muted)]">
      <div className="relative min-h-[14rem] bg-[color:var(--color-bg)] p-6">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={safeFrame}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {frames[safeFrame]}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="border-t border-[color:var(--color-border)] px-6 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setPlaying(false);
                setFrame(0);
              }}
              aria-label="Reset to first frame"
              className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-control)] border border-[color:var(--color-border)] text-[color:var(--color-fg-muted)] transition hover:text-[color:var(--color-fg)] hover:border-[color:var(--color-border-strong)] disabled:opacity-40"
              disabled={atStart && !playing}
            >
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
                className="h-4 w-4"
              >
                <path
                  fillRule="evenodd"
                  d="M4 4a.75.75 0 0 1 .75.75v3.532l9.78-3.586a.75.75 0 0 1 1.012.703v9.202a.75.75 0 0 1-1.012.703l-9.78-3.585V15.25a.75.75 0 0 1-1.5 0v-10.5A.75.75 0 0 1 4 4Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => {
                setPlaying(false);
                setFrame((f) => Math.max(0, f - 1));
              }}
              aria-label="Previous frame"
              disabled={atStart}
              className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-control)] border border-[color:var(--color-border)] text-[color:var(--color-fg-muted)] transition hover:text-[color:var(--color-fg)] hover:border-[color:var(--color-border-strong)] disabled:opacity-40"
            >
              <span aria-hidden="true">‹</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (atEnd) {
                  setFrame(0);
                  setPlaying(true);
                } else {
                  setPlaying((p) => !p);
                }
              }}
              aria-label={playing ? "Pause" : "Play"}
              className="inline-flex h-9 items-center gap-2 rounded-[var(--radius-control)] bg-[color:var(--color-accent)] px-3 text-sm font-medium text-[color:var(--color-accent-fg)] transition hover:bg-[color:var(--color-accent-strong)]"
            >
              {playing ? (
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                  className="h-4 w-4"
                >
                  <rect x="5" y="4" width="3" height="12" rx="1" />
                  <rect x="12" y="4" width="3" height="12" rx="1" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                  className="h-4 w-4"
                >
                  <path d="M6.3 4.1A1 1 0 0 0 5 5v10a1 1 0 0 0 1.555.832l7-5a1 1 0 0 0 0-1.664l-7-5A1 1 0 0 0 6.3 4.1Z" />
                </svg>
              )}
              {playing ? "Pause" : atEnd ? "Replay" : "Play"}
            </button>
            <button
              type="button"
              onClick={() => {
                setPlaying(false);
                setFrame((f) => Math.min(total - 1, f + 1));
              }}
              aria-label="Next frame"
              disabled={atEnd}
              className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-control)] border border-[color:var(--color-border)] text-[color:var(--color-fg-muted)] transition hover:text-[color:var(--color-fg)] hover:border-[color:var(--color-border-strong)] disabled:opacity-40"
            >
              <span aria-hidden="true">›</span>
            </button>
          </div>

          <span className="text-xs tabular-nums uppercase tracking-[0.14em] text-[color:var(--color-fg-subtle)]">
            {label ? `${label} · ` : ""}
            {safeFrame + 1} / {total}
          </span>
        </div>

        <div
          className="mt-3 flex h-1 gap-1 overflow-hidden rounded-full"
          aria-hidden="true"
        >
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={
                i <= safeFrame
                  ? "flex-1 bg-[color:var(--color-accent)]"
                  : "flex-1 bg-[color:var(--color-border)]"
              }
            />
          ))}
        </div>

        {captions?.[safeFrame] ? (
          <figcaption className="mt-3 text-sm text-[color:var(--color-fg-muted)]">
            {captions[safeFrame]}
          </figcaption>
        ) : null}
      </div>
    </figure>
  );
}
