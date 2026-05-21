"use client";

import { useCallback, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useComponentId } from "@/components/learn/shared/use-component-id";
import { useComponentProgress } from "@/components/learn/shared/use-component-progress";

interface ScrubControlProps {
  /** Pre-rendered frames. Length determines step count. */
  frames: ReactNode[];
  labels?: string[];
  captions?: ReactNode[];
  label?: string;
  componentId?: string;
  initialStep?: number;
}

export function ScrubControl({
  frames,
  labels,
  captions,
  label,
  componentId,
  initialStep = 0,
}: ScrubControlProps) {
  const id = useComponentId(componentId, "scrub");
  const steps = frames.length;
  const [step, setStep] = useComponentProgress<number>(id, initialStep);
  const clamp = useCallback(
    (n: number) => Math.max(0, Math.min(steps - 1, n)),
    [steps],
  );

  const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      setStep((s) => clamp(s + 1));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      setStep((s) => clamp(s - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      setStep(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setStep(steps - 1);
    }
  };

  if (steps === 0) return null;
  const safeStep = clamp(step);
  const pct = steps > 1 ? (safeStep / (steps - 1)) * 100 : 50;

  return (
    <figure
      className="my-10 overflow-hidden rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-muted)]"
      onKeyDown={onKey}
    >
      <div className="relative min-h-[12rem] bg-[color:var(--color-bg)] p-6">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={safeStep}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {frames[safeStep]}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="border-t border-[color:var(--color-border)] px-6 py-4">
        <div className="mb-2 flex items-baseline justify-between gap-3">
          {label ? (
            <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-fg-subtle)]">
              {label}
            </p>
          ) : (
            <span />
          )}
          <span className="text-sm tabular-nums text-[color:var(--color-fg-muted)]">
            {labels?.[safeStep] ?? `${safeStep + 1}/${steps}`}
          </span>
        </div>
        {/*
          The custom slider thumb is pinned to 14px so the label row's
          7px horizontal inset matches the thumb's center range exactly.
          That way `left: 0%` lines up with the thumb at value=min and
          `left: 100%` lines up with the thumb at value=max.
        */}
        <input
          type="range"
          min={0}
          max={steps - 1}
          value={safeStep}
          onChange={(e) => setStep(clamp(Number(e.target.value)))}
          role="slider"
          tabIndex={0}
          aria-valuemin={0}
          aria-valuemax={steps - 1}
          aria-valuenow={safeStep}
          aria-valuetext={labels?.[safeStep] ?? `Step ${safeStep + 1} of ${steps}`}
          aria-label={label ?? "Scrub through steps"}
          style={{ "--scrub-pct": `${pct}%` } as React.CSSProperties}
          className="scrub-input block w-full appearance-none bg-transparent focus:outline-none"
        />
        {labels ? (
          <div className="relative mx-[7px] mt-2 h-4 text-[10px] uppercase tracking-[0.14em] text-[color:var(--color-fg-subtle)]">
            {labels.map((l, i) => {
              const pct = steps > 1 ? (i / (steps - 1)) * 100 : 50;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setStep(i)}
                  style={{ left: `${pct}%`, transform: "translateX(-50%)" }}
                  className={
                    i === safeStep
                      ? "absolute top-0 whitespace-nowrap font-semibold text-[color:var(--punch)]"
                      : "absolute top-0 whitespace-nowrap hover:text-[color:var(--color-fg)]"
                  }
                >
                  {l}
                </button>
              );
            })}
          </div>
        ) : null}
        {captions?.[safeStep] ? (
          <figcaption className="mt-3 text-sm text-[color:var(--color-fg-muted)]">
            {captions[safeStep]}
          </figcaption>
        ) : null}
      </div>
    </figure>
  );
}
