"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { useComponentId } from "@/components/learn/shared/use-component-id";
import { useComponentProgress } from "@/components/learn/shared/use-component-progress";

interface RevealCardProps {
  front: ReactNode;
  back: ReactNode;
  componentId?: string;
  label?: string;
}

export function RevealCard({
  front,
  back,
  componentId,
  label,
}: RevealCardProps) {
  const id = useComponentId(componentId, "reveal");
  const [revealed, setRevealed] = useComponentProgress<boolean>(id, false);

  return (
    <div className="my-8">
      <button
        type="button"
        onClick={() => setRevealed((v) => !v)}
        aria-pressed={revealed}
        aria-label={
          revealed ? "Hide definition" : "Reveal definition"
        }
        className="relative block w-full max-w-md rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-muted)] p-6 text-left transition hover:border-[color:var(--color-border-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg)]"
        style={{ perspective: 1000 }}
      >
        <p className="mb-2 text-xs uppercase tracking-[0.16em] text-[color:var(--color-fg-subtle)]">
          {label ?? (revealed ? "Definition" : "Reveal card")}
        </p>
        <div className="relative min-h-[3rem]">
          <AnimatePresence mode="wait" initial={false}>
            {revealed ? (
              <motion.div
                key="back"
                initial={{ opacity: 0, rotateY: -90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: 90 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="font-serif text-lg leading-snug tracking-tight text-[color:var(--color-fg)]"
              >
                {back}
              </motion.div>
            ) : (
              <motion.div
                key="front"
                initial={{ opacity: 0, rotateY: -90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: 90 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="font-serif text-xl font-semibold tracking-tight text-[color:var(--color-fg)]"
              >
                {front}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <span className="mt-4 inline-flex items-center gap-1 text-xs uppercase tracking-[0.14em] text-[color:var(--color-fg-subtle)]">
          {revealed ? "Tap to hide" : "Tap to reveal"}
          <span aria-hidden="true">↻</span>
        </span>
      </button>
    </div>
  );
}
