"use client";

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckIcon,
  XIcon,
  DotIcon,
} from "@phosphor-icons/react/dist/ssr";
import { useComponentId } from "@/components/learn/shared/use-component-id";
import { useComponentProgress } from "@/components/learn/shared/use-component-progress";

export interface MCOption {
  text: ReactNode;
  correct: boolean;
  explanation?: ReactNode;
}

interface MultipleChoiceProps {
  question: ReactNode;
  options: MCOption[];
  multi?: boolean;
  componentId?: string;
}

interface MCState {
  selected: number[];
  submitted: boolean;
}

export function MultipleChoice({
  question,
  options,
  multi = false,
  componentId,
}: MultipleChoiceProps) {
  const id = useComponentId(componentId, "mc");
  const [state, setState] = useComponentProgress<MCState>(id, {
    selected: [],
    submitted: false,
  });
  const [pulse, setPulse] = useState<number | null>(null);

  const allCorrect =
    state.submitted &&
    options.every((opt, i) =>
      opt.correct
        ? state.selected.includes(i)
        : !state.selected.includes(i),
    );

  const onSelect = (idx: number) => {
    if (multi) {
      setState((prev) => ({
        ...prev,
        selected: prev.selected.includes(idx)
          ? prev.selected.filter((i) => i !== idx)
          : [...prev.selected, idx],
      }));
    } else {
      setState({ selected: [idx], submitted: true });
      setPulse(idx);
      setTimeout(() => setPulse(null), 300);
    }
  };

  const onSubmit = () => {
    setState((prev) => ({ ...prev, submitted: true }));
  };

  const reset = () => {
    setState({ selected: [], submitted: false });
  };

  return (
    <section className="my-10 rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-muted)] p-6">
      <p className="mb-1 text-xs uppercase tracking-[0.16em] text-[color:var(--color-fg-subtle)]">
        Knowledge check{multi ? " · select all that apply" : ""}
      </p>
      <div className="font-serif text-lg font-semibold leading-snug tracking-tight text-[color:var(--color-fg)]">
        {question}
      </div>

      <ul className="mt-5 space-y-2">
        {options.map((opt, i) => {
          const isSelected = state.selected.includes(i);
          const isSubmitted = state.submitted;
          const showCorrect = isSubmitted && opt.correct;
          const showWrong = isSubmitted && isSelected && !opt.correct;
          const showMissed = isSubmitted && !isSelected && opt.correct;
          const styles = showCorrect
            ? "border-[color:var(--color-feedback-correct-border)] bg-[color:var(--color-feedback-correct-bg)] text-[color:var(--color-feedback-correct-fg)]"
            : showWrong
              ? "border-[color:var(--color-feedback-incorrect-border)] bg-[color:var(--color-feedback-incorrect-bg)] text-[color:var(--color-feedback-incorrect-fg)]"
              : showMissed
                ? "border-[color:var(--color-feedback-partial-border)] bg-[color:var(--color-feedback-partial-bg)] text-[color:var(--color-feedback-partial-fg)]"
                : isSelected
                  ? "border-[color:var(--punch)] bg-[color:var(--punch-soft)] text-[color:var(--ink)]"
                  : "border-[color:var(--color-border)] bg-[color:var(--color-bg)] text-[color:var(--color-fg)] hover:border-[color:var(--color-border-strong)]";
          return (
            <li key={i}>
              <motion.button
                type="button"
                onClick={() => onSelect(i)}
                disabled={isSubmitted && !multi}
                animate={pulse === i ? { scale: [1, 1.02, 1] } : undefined}
                transition={{ duration: 0.25 }}
                className={`flex w-full items-start gap-3 rounded-[var(--radius-control)] border px-4 py-3 text-left transition ${styles} ${isSubmitted && !multi ? "cursor-default" : ""}`}
                aria-pressed={isSelected}
              >
                <span
                  aria-hidden="true"
                  className={
                    "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border " +
                    (isSelected
                      ? "border-current"
                      : "border-[color:var(--color-border-strong)]")
                  }
                >
                  {isSelected ? (
                    <span className="block h-2.5 w-2.5 rounded-full bg-current" />
                  ) : null}
                </span>
                <span className="flex-1">{opt.text}</span>
                {isSubmitted ? (
                  <span aria-hidden="true" className="inline-flex">
                    {showCorrect ? (
                      <CheckIcon weight="bold" size={16} />
                    ) : showWrong ? (
                      <XIcon weight="bold" size={16} />
                    ) : showMissed ? (
                      <DotIcon weight="fill" size={16} />
                    ) : null}
                  </span>
                ) : null}
              </motion.button>
              <AnimatePresence>
                {isSubmitted && opt.explanation && (showCorrect || showWrong || showMissed) ? (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-1 overflow-hidden px-4 text-sm text-[color:var(--color-fg-muted)]"
                  >
                    {opt.explanation}
                  </motion.p>
                ) : null}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>

      <div className="mt-5 flex items-center justify-between gap-3">
        {multi && !state.submitted ? (
          <button
            type="button"
            onClick={onSubmit}
            disabled={state.selected.length === 0}
            className="inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[color:var(--color-accent)] px-4 py-2 text-sm font-medium text-[color:var(--color-accent-fg)] transition hover:bg-[color:var(--color-accent-strong)] disabled:opacity-50"
          >
            Check answers
          </button>
        ) : <span />}
        {state.submitted ? (
          <div className="flex items-center gap-4">
            <span
              className={
                allCorrect
                  ? "text-sm font-medium text-[color:var(--color-feedback-correct-fg)]"
                  : "text-sm font-medium text-[color:var(--color-feedback-incorrect-fg)]"
              }
            >
              {allCorrect ? "Correct" : "Not quite — review the highlights"}
            </span>
            <button
              type="button"
              onClick={reset}
              className="text-sm text-[color:var(--color-fg-subtle)] underline-offset-4 hover:text-[color:var(--color-fg)] hover:underline"
            >
              Try again
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
