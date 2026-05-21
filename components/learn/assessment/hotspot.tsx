"use client";

import {
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { motion, AnimatePresence } from "motion/react";
import { useComponentId } from "@/components/learn/shared/use-component-id";
import { useComponentProgress } from "@/components/learn/shared/use-component-progress";

interface HotspotProps {
  src: string;
  alt: string;
  prompt: ReactNode;
  /** Target region as percentages of image size. */
  target: { x: number; y: number; radius: number };
  aspectRatio?: string;
  explanation?: ReactNode;
  componentId?: string;
}

interface HotspotState {
  clicks: Array<{ x: number; y: number; correct: boolean }>;
  submitted: boolean;
}

export function Hotspot({
  src,
  alt,
  prompt,
  target,
  aspectRatio = "16 / 9",
  explanation,
  componentId,
}: HotspotProps) {
  const id = useComponentId(componentId, "hotspot");
  const [state, setState] = useComponentProgress<HotspotState>(id, {
    clicks: [],
    submitted: false,
  });
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const registerHit = (x: number, y: number) => {
    const dx = x - target.x;
    const dy = y - target.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const correct = dist <= target.radius;
    setState((prev) => ({
      clicks: [...prev.clicks, { x, y, correct }],
      submitted: true,
    }));
  };

  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    if (state.submitted) return;
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    registerHit(x, y);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (state.submitted) return;
    // Hotspot is fundamentally a pointer-based input — keyboard users get
    // a "reveal answer" affordance via Enter/Space: it submits with no
    // hit recorded, which surfaces the dashed target ring.
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setState((prev) => ({ ...prev, submitted: true }));
    }
  };

  const reset = () => setState({ clicks: [], submitted: false });
  const lastClick = state.clicks.at(-1);
  const lastCorrect = lastClick?.correct ?? null;

  return (
    <section className="my-10 rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-muted)] p-6">
      <p className="mb-1 text-xs uppercase tracking-[0.16em] text-[color:var(--color-fg-subtle)]">
        Find the spot
      </p>
      <p className="font-serif text-lg leading-snug tracking-tight text-[color:var(--color-fg)]">
        {prompt}
      </p>

      <div
        ref={wrapperRef}
        onClick={onClick}
        onKeyDown={onKeyDown}
        role="button"
        tabIndex={0}
        aria-label="Click to identify the target. Press Enter to reveal the answer."
        className={
          state.submitted
            ? "relative mt-5 overflow-hidden rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-bg)]"
            : "relative mt-5 cursor-crosshair overflow-hidden rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-bg)]"
        }
        style={{ aspectRatio }}
      >
        <img
          src={src}
          alt={alt}
          className="pointer-events-none absolute inset-0 h-full w-full object-contain"
        />
        {state.clicks.map((click, i) => (
          <motion.span
            key={i}
            aria-hidden="true"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            style={{ left: `${click.x}%`, top: `${click.y}%` }}
            className={
              click.correct
                ? "pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[color:var(--color-feedback-correct-border)] bg-[color:var(--color-feedback-correct-bg)] p-2 text-[color:var(--color-feedback-correct-fg)]"
                : "pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[color:var(--color-feedback-incorrect-border)] bg-[color:var(--color-feedback-incorrect-bg)] p-2 text-[color:var(--color-feedback-incorrect-fg)]"
            }
          >
            {click.correct ? "✓" : "✗"}
          </motion.span>
        ))}
        {state.submitted && lastCorrect !== true ? (
          <motion.span
            aria-hidden="true"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              left: `${target.x}%`,
              top: `${target.y}%`,
              width: `${target.radius * 2}%`,
              aspectRatio: "1 / 1",
            }}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-[color:var(--color-accent-strong)]"
          />
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <AnimatePresence>
          {state.submitted ? (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={
                lastCorrect === true
                  ? "text-sm font-medium text-[color:var(--color-feedback-correct-fg)]"
                  : lastCorrect === false
                    ? "text-sm font-medium text-[color:var(--color-feedback-incorrect-fg)]"
                    : "text-sm font-medium text-[color:var(--color-fg-muted)]"
              }
            >
              {lastCorrect === true
                ? "Correct"
                : lastCorrect === false
                  ? "Not quite — try the dashed circle."
                  : "Target revealed — click the dashed circle."}
            </motion.span>
          ) : (
            <motion.span
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-[color:var(--color-fg-subtle)]"
            >
              Click anywhere on the diagram.
            </motion.span>
          )}
        </AnimatePresence>
        <button
          type="button"
          onClick={reset}
          className="text-sm text-[color:var(--color-fg-subtle)] underline-offset-4 hover:text-[color:var(--color-fg)] hover:underline"
        >
          Reset
        </button>
      </div>

      {state.submitted && explanation ? (
        <p className="mt-3 text-sm text-[color:var(--color-fg-muted)]">
          {explanation}
        </p>
      ) : null}
    </section>
  );
}
