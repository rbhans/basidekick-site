"use client";

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useComponentId } from "@/components/learn/shared/use-component-id";
import { useComponentProgress } from "@/components/learn/shared/use-component-progress";

interface FillInBlankProps {
  prompt: ReactNode;
  /** Accepted answers — first one is shown when revealed. */
  answers: string[];
  caseSensitive?: boolean;
  /** Max Levenshtein distance for fuzzy match. 0 disables fuzzy match. */
  fuzzy?: number;
  explanation?: ReactNode;
  width?: string;
  componentId?: string;
}

interface FIBState {
  value: string;
  submitted: boolean;
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const matrix: number[][] = Array.from({ length: b.length + 1 }, () =>
    new Array(a.length + 1).fill(0),
  );
  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + cost,
      );
    }
  }
  return matrix[b.length][a.length];
}

function isAccepted(
  input: string,
  answers: string[],
  caseSensitive: boolean,
  fuzzy: number,
): boolean {
  const normalize = (s: string) =>
    (caseSensitive ? s : s.toLowerCase()).trim();
  const target = normalize(input);
  if (!target) return false;
  return answers.some((ans) => {
    const norm = normalize(ans);
    if (norm === target) return true;
    if (fuzzy > 0 && levenshtein(target, norm) <= fuzzy) return true;
    return false;
  });
}

export function FillInBlank({
  prompt,
  answers,
  caseSensitive = false,
  fuzzy = 1,
  explanation,
  width = "12ch",
  componentId,
}: FillInBlankProps) {
  const id = useComponentId(componentId, "fib");
  const [state, setState] = useComponentProgress<FIBState>(id, {
    value: "",
    submitted: false,
  });
  const [revealed, setRevealed] = useState(false);

  const accepted = state.submitted
    ? isAccepted(state.value, answers, caseSensitive, fuzzy)
    : false;

  return (
    <section className="my-10 rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-muted)] p-6">
      <p className="mb-1 text-xs uppercase tracking-[0.16em] text-[color:var(--color-fg-subtle)]">
        Fill in the blank
      </p>
      <div className="font-serif text-lg leading-snug tracking-tight text-[color:var(--color-fg)]">
        {typeof prompt === "string" && prompt.includes("___") ? (
          <BlankInline
            prompt={prompt}
            value={state.value}
            onChange={(v) =>
              setState({ value: v, submitted: false })
            }
            onSubmit={() => setState((s) => ({ ...s, submitted: true }))}
            disabled={state.submitted && accepted}
            accepted={state.submitted ? accepted : null}
            width={width}
          />
        ) : (
          <div>
            {prompt}
            <div className="mt-3">
              <input
                type="text"
                value={state.value}
                onChange={(e) =>
                  setState({ value: e.target.value, submitted: false })
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    setState((s) => ({ ...s, submitted: true }));
                  }
                }}
                disabled={state.submitted && accepted}
                style={{ width }}
                className={
                  state.submitted
                    ? accepted
                      ? "rounded-[var(--radius-control)] border border-[color:var(--color-feedback-correct-border)] bg-[color:var(--color-feedback-correct-bg)] px-3 py-1 font-mono text-base text-[color:var(--color-feedback-correct-fg)]"
                      : "rounded-[var(--radius-control)] border border-[color:var(--color-feedback-incorrect-border)] bg-[color:var(--color-feedback-incorrect-bg)] px-3 py-1 font-mono text-base text-[color:var(--color-feedback-incorrect-fg)]"
                    : "rounded-[var(--radius-control)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] px-3 py-1 font-mono text-base text-[color:var(--color-fg)]"
                }
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setState((s) => ({ ...s, submitted: true }))}
          disabled={!state.value || (state.submitted && accepted)}
          className="inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[color:var(--color-accent)] px-4 py-2 text-sm font-medium text-[color:var(--color-accent-fg)] transition hover:bg-[color:var(--color-accent-strong)] disabled:opacity-50"
        >
          Check
        </button>

        <div className="flex items-center gap-4 text-sm">
          {state.submitted ? (
            <span
              className={
                accepted
                  ? "font-medium text-[color:var(--color-feedback-correct-fg)]"
                  : "font-medium text-[color:var(--color-feedback-incorrect-fg)]"
              }
            >
              {accepted ? "Correct" : "Not quite"}
            </span>
          ) : null}
          {state.submitted && !accepted ? (
            <button
              type="button"
              onClick={() => setRevealed((v) => !v)}
              className="text-[color:var(--color-fg-subtle)] underline-offset-4 hover:text-[color:var(--color-fg)] hover:underline"
            >
              {revealed ? "Hide answer" : "Reveal answer"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => {
              setState({ value: "", submitted: false });
              setRevealed(false);
            }}
            className="text-[color:var(--color-fg-subtle)] underline-offset-4 hover:text-[color:var(--color-fg)] hover:underline"
          >
            Reset
          </button>
        </div>
      </div>

      <AnimatePresence>
        {revealed && state.submitted && !accepted ? (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 overflow-hidden text-sm text-[color:var(--color-fg-muted)]"
          >
            Accepted answer: <span className="font-mono">{answers[0]}</span>
          </motion.p>
        ) : null}
      </AnimatePresence>

      {state.submitted && explanation ? (
        <p className="mt-3 text-sm text-[color:var(--color-fg-muted)]">
          {explanation}
        </p>
      ) : null}
    </section>
  );
}

interface BlankInlineProps {
  prompt: string;
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  accepted: boolean | null;
  width: string;
}

function BlankInline({
  prompt,
  value,
  onChange,
  onSubmit,
  disabled,
  accepted,
  width,
}: BlankInlineProps) {
  const parts = prompt.split("___");
  return (
    <span>
      {parts[0]}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSubmit();
          }
        }}
        disabled={disabled}
        style={{ width }}
        className={
          accepted === true
            ? "mx-1 rounded-[var(--radius-control)] border border-[color:var(--color-feedback-correct-border)] bg-[color:var(--color-feedback-correct-bg)] px-2 py-0.5 font-mono text-[0.95em] text-[color:var(--color-feedback-correct-fg)]"
            : accepted === false
              ? "mx-1 rounded-[var(--radius-control)] border border-[color:var(--color-feedback-incorrect-border)] bg-[color:var(--color-feedback-incorrect-bg)] px-2 py-0.5 font-mono text-[0.95em] text-[color:var(--color-feedback-incorrect-fg)]"
              : "mx-1 rounded-[var(--radius-control)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] px-2 py-0.5 font-mono text-[0.95em] text-[color:var(--color-fg)]"
        }
      />
      {parts.slice(1).join("___")}
    </span>
  );
}
