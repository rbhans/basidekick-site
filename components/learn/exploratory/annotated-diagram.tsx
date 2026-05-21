"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";

export interface AnnotatedHotspot {
  x: number; // percentage 0-100
  y: number;
  label: string;
  detail: ReactNode;
}

interface AnnotatedDiagramProps {
  /** Image source. EITHER pass `src` for a static image OR `children` for a
   *  React-composed illustration (shape-kit composites, etc.). */
  src?: string;
  alt: string;
  /** Alternative to `src` — pass a React node (e.g. a shape-kit illustration)
   *  to render as the base image. Hotspots overlay this content. */
  children?: ReactNode;
  hotspots: AnnotatedHotspot[];
  caption?: ReactNode;
  aspectRatio?: string; // e.g. "16 / 9"
}

export function AnnotatedDiagram({
  src,
  alt,
  children,
  hotspots,
  caption,
  aspectRatio = "16 / 9",
}: AnnotatedDiagramProps) {
  const [active, setActive] = useState<number | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (active === null) return;
    const onAway = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setActive(null);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    document.addEventListener("mousedown", onAway);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onAway);
      document.removeEventListener("keydown", onEsc);
    };
  }, [active]);

  return (
    <figure className="my-10">
      <div
        ref={wrapperRef}
        className="relative"
        style={{ aspectRatio }}
      >
        <div className="absolute inset-0 overflow-hidden rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-muted)]">
          {children ? (
            <div
              role="img"
              aria-label={alt}
              className="absolute inset-0 flex h-full w-full items-center justify-center"
            >
              {children}
            </div>
          ) : src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={alt}
              className="absolute inset-0 h-full w-full object-contain"
            />
          ) : null}
        </div>
        {hotspots.map((spot, idx) => {
          const flipUp = spot.y > 65;
          // Horizontal anchor: clamp tooltip so it doesn't bleed off the diagram edges.
          const anchorLeft = spot.x < 22;
          const anchorRight = spot.x > 78;
          const tooltipLeft = anchorLeft ? "0%" : anchorRight ? "100%" : "50%";
          const tooltipTransform = anchorLeft
            ? "translateX(0)"
            : anchorRight
              ? "translateX(-100%)"
              : "translateX(-50%)";
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setActive((cur) => (cur === idx ? null : idx))}
              onMouseEnter={() => setActive(idx)}
              onFocus={() => setActive(idx)}
              onBlur={(e) => {
                if (
                  !wrapperRef.current?.contains(e.relatedTarget as Node)
                ) {
                  setActive(null);
                }
              }}
              aria-label={spot.label}
              aria-expanded={active === idx}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
            >
              <span
                className={
                  active === idx
                    ? "relative inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-[color:var(--color-accent-strong)] bg-[color:var(--color-accent)] text-xs font-semibold text-[color:var(--color-accent-fg)] shadow-md"
                    : "relative inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] text-xs font-semibold text-[color:var(--color-fg)] shadow-sm transition hover:border-[color:var(--punch)] hover:text-[color:var(--punch)]"
                }
              >
                {idx + 1}
                {active !== idx ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 -z-10 animate-ping rounded-full bg-[color:var(--color-accent)]/30"
                  />
                ) : null}
              </span>
              <AnimatePresence>
                {active === idx ? (
                  <span
                    role="tooltip"
                    style={{ left: tooltipLeft, transform: tooltipTransform }}
                    className={
                      flipUp
                        ? "absolute bottom-[calc(100%+0.5rem)] z-20 w-64 max-w-[min(85vw,16rem)]"
                        : "absolute top-[calc(100%+0.5rem)] z-20 w-64 max-w-[min(85vw,16rem)]"
                    }
                  >
                    <motion.span
                      initial={{ opacity: 0, y: flipUp ? 4 : -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: flipUp ? 4 : -4 }}
                      transition={{ duration: 0.15 }}
                      className="block rounded-[var(--radius-card)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] p-3 text-left text-sm shadow-lg"
                    >
                      <span className="block font-serif text-sm font-semibold tracking-tight text-[color:var(--color-fg)]">
                        {spot.label}
                      </span>
                      <span className="mt-1 block text-sm leading-snug text-[color:var(--color-fg-muted)]">
                        {spot.detail}
                      </span>
                    </motion.span>
                  </span>
                ) : null}
              </AnimatePresence>
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-4">
        {caption ? (
          <figcaption className="text-sm text-[color:var(--color-fg-muted)]">
            {caption}
          </figcaption>
        ) : null}
        <p className="ml-auto text-xs uppercase tracking-[0.14em] text-[color:var(--color-fg-subtle)]">
          {hotspots.length} hotspots — tap to inspect
        </p>
      </div>
    </figure>
  );
}
