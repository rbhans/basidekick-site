"use client";

import { useId, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useComponentId } from "@/components/learn/shared/use-component-id";
import { useComponentProgress } from "@/components/learn/shared/use-component-progress";

export interface TabItem {
  value: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  items: TabItem[];
  initialValue?: string;
  componentId?: string;
  label?: string;
}

export function Tabs({ items, initialValue, componentId, label }: TabsProps) {
  const id = useComponentId(componentId, "tabs");
  const fallback = items[0]?.value ?? "";
  const [stored, setStored, hydrated] = useComponentProgress<string>(
    id,
    initialValue ?? fallback,
  );
  const [local, setLocal] = useState(initialValue ?? fallback);
  const value = hydrated ? stored : local;
  const onChange = (next: string) => {
    setLocal(next);
    setStored(next);
  };
  const groupId = useId();

  return (
    <figure className="my-10 overflow-hidden rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-muted)]">
      <div
        role="tablist"
        aria-label={label ?? "Tabs"}
        className="flex border-b border-[color:var(--color-border)] bg-[color:var(--color-bg-muted)]"
      >
        {items.map((item) => {
          const isActive = item.value === value;
          return (
            <button
              key={item.value}
              type="button"
              role="tab"
              id={`${groupId}-tab-${item.value}`}
              aria-selected={isActive}
              aria-controls={`${groupId}-panel-${item.value}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onChange(item.value)}
              className={
                isActive
                  ? "relative px-5 py-3 text-sm font-medium text-[color:var(--color-fg)]"
                  : "relative px-5 py-3 text-sm text-[color:var(--color-fg-muted)] transition hover:text-[color:var(--color-fg)]"
              }
            >
              {item.label}
              {isActive ? (
                <motion.span
                  layoutId={`${groupId}-tab-underline`}
                  className="absolute inset-x-3 bottom-0 h-[2px] bg-[color:var(--color-accent-strong)]"
                  transition={{ duration: 0.22, ease: "easeOut" }}
                />
              ) : null}
            </button>
          );
        })}
      </div>
      <div className="bg-[color:var(--color-bg)] p-6">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={value}
            id={`${groupId}-panel-${value}`}
            role="tabpanel"
            aria-labelledby={`${groupId}-tab-${value}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {items.find((i) => i.value === value)?.content}
          </motion.div>
        </AnimatePresence>
      </div>
    </figure>
  );
}
