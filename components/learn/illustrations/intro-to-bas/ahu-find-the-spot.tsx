"use client";

import {
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { motion, AnimatePresence } from "motion/react";
import { LabeledSchematic, COLOR } from "@/components/learn/shapes";
import { useComponentId } from "@/components/learn/shared/use-component-id";
import { useComponentProgress } from "@/components/learn/shared/use-component-progress";
import {
  AHU_W,
  AHU_H,
  AHU_CENTERS,
  AhuStaticBody,
  type AhuComponentKey,
} from "./ahu-static-body";

interface AhuFindTheSpotProps {
  prompt: ReactNode;
  /** Which AHU component is the right answer. */
  target: AhuComponentKey;
  /** Hit-radius in percent of container width. Default 6. */
  radius?: number;
  explanation?: ReactNode;
  componentId?: string;
}

interface State {
  clicks: Array<{ x: number; y: number; correct: boolean }>;
  submitted: boolean;
}

export function AhuFindTheSpot({
  prompt,
  target,
  radius = 6,
  explanation,
  componentId,
}: AhuFindTheSpotProps) {
  const id = useComponentId(componentId, "ahu-find-the-spot");
  const [state, setState] = useComponentProgress<State>(id, {
    clicks: [],
    submitted: false,
  });
  const overlayRef = useRef<HTMLDivElement | null>(null);

  const targetCenter = AHU_CENTERS[target];
  const targetXPct = (targetCenter.cx / AHU_W) * 100;
  const targetYPct = (targetCenter.cy / AHU_H) * 100;

  const registerHit = (x: number, y: number) => {
    const dx = x - targetXPct;
    const dy = y - targetYPct;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const correct = dist <= radius;
    setState((prev) => ({
      clicks: [...prev.clicks, { x, y, correct }],
      submitted: true,
    }));
  };

  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    if (state.submitted) return;
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    registerHit(x, y);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (state.submitted) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setState((prev) => ({ ...prev, submitted: true }));
    }
  };

  const reset = () => setState({ clicks: [], submitted: false });
  const lastClick = state.clicks.at(-1);
  const lastCorrect = lastClick?.correct ?? null;

  const overlay = (
    <div
      ref={overlayRef}
      onClick={onClick}
      onKeyDown={onKeyDown}
      role="button"
      tabIndex={0}
      aria-label="Click to identify the target. Press Enter to reveal the answer."
      className={
        state.submitted
          ? "absolute inset-0 pointer-events-auto"
          : "absolute inset-0 pointer-events-auto cursor-crosshair"
      }
    >
      {state.clicks.map((click, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          style={{ left: `${click.x}%`, top: `${click.y}%` }}
          className={
            click.correct
              ? "pointer-events-none absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[color:var(--color-feedback-correct-border)] bg-[color:var(--color-feedback-correct-bg)] text-sm font-semibold text-[color:var(--color-feedback-correct-fg)]"
              : "pointer-events-none absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[color:var(--color-feedback-incorrect-border)] bg-[color:var(--color-feedback-incorrect-bg)] text-sm font-semibold text-[color:var(--color-feedback-incorrect-fg)]"
          }
        >
          {click.correct ? "✓" : "✗"}
        </motion.span>
      ))}
      {state.submitted && lastCorrect !== true ? (
        <motion.span
          aria-hidden="true"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          style={{
            left: `${targetXPct}%`,
            top: `${targetYPct}%`,
            width: `${radius * 2}%`,
            aspectRatio: "1 / 1",
          }}
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-[color:var(--punch)]"
        />
      ) : null}
    </div>
  );

  return (
    <section className="my-10 rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-muted)] p-6">
      <p className="mb-1 text-xs uppercase tracking-[0.16em] text-[color:var(--color-fg-subtle)]">
        Find the spot
      </p>
      <p className="text-lg leading-snug tracking-tight text-[color:var(--color-fg)]">
        {prompt}
      </p>

      <LabeledSchematic
        width={AHU_W}
        height={AHU_H}
        kicker="AHU · FIND IT"
        legend={[
          { color: COLOR.chwsBlue, label: "CHW" },
          { color: COLOR.hwsRed, label: "HW" },
        ]}
        overlay={overlay}
      >
        <AhuStaticBody />
      </LabeledSchematic>

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
