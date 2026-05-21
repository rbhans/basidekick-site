"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface KeyTermProps {
  term: string;
  definition: ReactNode;
  children?: ReactNode;
}

export function KeyTerm({ term, definition, children }: KeyTermProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLSpanElement | null>(null);
  const popoverId = useId();

  useEffect(() => {
    if (!open) return;
    const onClickAway = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClickAway);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickAway);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <span ref={wrapperRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onFocus={() => setOpen(true)}
        onBlur={(e) => {
          if (!wrapperRef.current?.contains(e.relatedTarget as Node)) {
            setOpen(false);
          }
        }}
        aria-expanded={open}
        aria-describedby={open ? popoverId : undefined}
        className="cursor-help border-b border-dashed border-[color:var(--color-fg-subtle)] font-medium text-[color:var(--color-fg)] underline-offset-4 transition hover:border-[color:var(--punch)] hover:text-[color:var(--punch)] focus-visible:outline-none focus-visible:border-[color:var(--punch)] focus-visible:text-[color:var(--punch)]"
      >
        {children ?? term}
      </button>
      {open ? (
        <span
          id={popoverId}
          role="tooltip"
          onMouseLeave={() => setOpen(false)}
          className="absolute left-1/2 top-[calc(100%+0.5rem)] z-20 w-72 max-w-[min(90vw,18rem)] -translate-x-1/2 rounded-[var(--radius-card)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] p-4 text-left text-sm leading-relaxed text-[color:var(--color-fg)] shadow-[0_8px_24px_-12px_rgba(0,0,0,0.25)] dark:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)]"
        >
          <span className="mb-1 block font-serif text-base font-semibold tracking-tight">
            {term}
          </span>
          <span className="block text-[color:var(--color-fg-muted)]">
            {definition}
          </span>
        </span>
      ) : null}
    </span>
  );
}
