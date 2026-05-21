"use client";

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useComponentId } from "@/components/learn/shared/use-component-id";
import { useComponentProgress } from "@/components/learn/shared/use-component-progress";

export interface ToggleOption {
  value: string;
  label: string;
  content: ReactNode;
}

interface ToggleProps {
  options: ToggleOption[];
  initialValue?: string;
  componentId?: string;
  label?: string;
}

export function Toggle({
  options,
  initialValue,
  componentId,
  label,
}: ToggleProps) {
  const id = useComponentId(componentId, "toggle");
  const fallback = options[0]?.value ?? "";
  const [storedValue, setValue, hydrated] = useComponentProgress<string>(
    id,
    initialValue ?? fallback,
  );
  const [localValue, setLocalValue] = useState(initialValue ?? fallback);
  const value = hydrated ? storedValue : localValue;
  const onChange = (next: string) => {
    setLocalValue(next);
    setValue(next);
  };

  return (
    <figure className="my-10 overflow-hidden rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-muted)]">
      <div className="flex items-center justify-between gap-3 border-b border-[color:var(--color-border)] px-5 py-3">
        {label ? (
          <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-fg-subtle)]">
            {label}
          </p>
        ) : <span />}
        <div
          role="group"
          aria-label={label ?? "Toggle options"}
          className="inline-flex rounded-[var(--radius-control)] border border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-0.5"
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              aria-pressed={value === opt.value}
              className={
                value === opt.value
                  ? "rounded-[calc(var(--radius-control)-0.125rem)] bg-[color:var(--punch-soft)] px-3 py-1 text-sm font-semibold text-[color:var(--punch)]"
                  : "rounded-[calc(var(--radius-control)-0.125rem)] px-3 py-1 text-sm text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)]"
              }
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="relative min-h-[8rem] bg-[color:var(--color-bg)] p-6">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={value}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {options.find((o) => o.value === value)?.content}
          </motion.div>
        </AnimatePresence>
      </div>
    </figure>
  );
}
