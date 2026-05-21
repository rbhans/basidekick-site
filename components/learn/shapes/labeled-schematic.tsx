"use client";

import type { ReactNode } from "react";
import { COLOR } from "./tokens";

interface LabeledSchematicProps {
  /** SVG viewBox width. */
  width: number;
  /** SVG viewBox height. */
  height: number;
  /** Optional title strip above the SVG. */
  kicker?: string;
  /** Labels rendered OUTSIDE the SVG, beneath the canvas, positioned to
   *  match SVG x coordinates. Labels never overlap canvas content. */
  labels?: Array<{
    /** SVG-space x coord (the label aligns to this column). */
    x: number;
    /** Optional anchor — defaults to "middle". */
    anchor?: "start" | "middle" | "end";
    /** Text content. */
    text: string;
  }>;
  /** Legend swatches rendered in the footer strip. */
  legend?: Array<{
    color: string;
    label: string;
    dashed?: boolean;
  }>;
  /** Optional right-aligned tag in the title strip (e.g. "VAV-1"). */
  tag?: string;
  /** Optional italic caption rendered beneath the legend (e.g. frame detail). */
  caption?: ReactNode;
  /** Optional overlay layer positioned to match the SVG's bounding box exactly.
   *  Use this for HTML controls (hotspot pins, drop targets, click capture)
   *  whose percent-based coordinates must align with viewBox coordinates. */
  overlay?: ReactNode;
  /** SVG content. */
  children: ReactNode;
}

/**
 * Composite wrapper that keeps text OUT of the SVG canvas.
 *
 * Inline labels on schematics fight everything — they overlap pipes,
 * components, and each other, and rebalancing them every time is painful.
 * This component renders the schematic SVG as pure visuals, then lays out
 * labels and a legend in an HTML caption strip beneath the canvas. Each
 * label sits in a column whose left edge is calculated from the SVG-space
 * x coord, so labels always sit directly under the component they describe
 * — regardless of how the schematic is rearranged.
 *
 * Use:
 *   <LabeledSchematic
 *     width={800}
 *     height={300}
 *     kicker="VAV BOX · HOT-WATER REHEAT"
 *     tag="VAV-1"
 *     labels={[
 *       { x: 130, text: "VAV DAMPER" },
 *       { x: 260, text: "AIRFLOW" },
 *       { x: 430, text: "REHEAT COIL" },
 *       { x: 710, text: "DIFFUSER" },
 *     ]}
 *     legend={[
 *       { color: COLOR.hwsRed, label: "HW SUPPLY" },
 *       { color: COLOR.hwrRed, label: "HW RETURN" },
 *       { color: COLOR.ink, label: "CONTROL", dashed: true },
 *     ]}
 *   >
 *     SVG primitives go here — do NOT pass `label` props to them.
 *   </LabeledSchematic>
 */
export function LabeledSchematic({
  width,
  height,
  kicker,
  tag,
  labels = [],
  legend = [],
  caption,
  overlay,
  children,
}: LabeledSchematicProps) {
  return (
    <figure className="my-8 overflow-hidden rounded-[var(--radius-card)] border border-[color:var(--border)] bg-[color:var(--cream)] p-4">
      {/* Title strip */}
      <div className="mb-3 flex items-center justify-between gap-3">
        {kicker ? (
          <p
            className="brand-mono-label inline-flex items-center gap-2"
            style={{ color: "var(--ink-2)" }}
          >
            <span
              aria-hidden="true"
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: COLOR.punch }}
            />
            {kicker}
          </p>
        ) : <span />}
        {tag ? (
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--ink-3)]">
            {tag}
          </span>
        ) : null}
      </div>

      {/* Canvas */}
      <div className="relative">
        <div
          className="relative w-full"
          style={{ aspectRatio: `${width} / ${height}` }}
        >
          <svg
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="xMidYMid meet"
            className="absolute inset-0 h-full w-full"
            role="img"
          >
            {children}
          </svg>
          {overlay ? (
            <div className="pointer-events-none absolute inset-0">
              {overlay}
            </div>
          ) : null}
        </div>

        {/* Label strip — columns positioned to match SVG x coords. */}
        {labels.length > 0 ? (
          <div className="relative mt-2 h-5" aria-hidden="true">
            {labels.map((l, i) => {
              const pct = (l.x / width) * 100;
              const anchor = l.anchor ?? "middle";
              const translate =
                anchor === "start"
                  ? "translateX(0)"
                  : anchor === "end"
                    ? "translateX(-100%)"
                    : "translateX(-50%)";
              return (
                <span
                  key={i}
                  className="absolute top-0 whitespace-nowrap font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--ink-2)]"
                  style={{ left: `${pct}%`, transform: translate }}
                >
                  {l.text}
                </span>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* Legend */}
      {legend.length > 0 ? (
        <figcaption className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-xs text-[color:var(--ink-2)]">
          {legend.map((item, i) => (
            <LegendItem key={i} {...item} />
          ))}
        </figcaption>
      ) : null}

      {/* Caption */}
      {caption ? (
        <p className="mt-2 px-1 text-xs italic text-[color:var(--ink-2)]">
          {caption}
        </p>
      ) : null}
    </figure>
  );
}

function LegendItem({
  color,
  label,
  dashed,
}: {
  color: string;
  label: string;
  dashed?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <svg width="22" height="6" aria-hidden="true">
        <line
          x1={0}
          y1={3}
          x2={22}
          y2={3}
          stroke={color}
          strokeWidth={3}
          strokeDasharray={dashed ? "3 3" : undefined}
          strokeLinecap="round"
        />
      </svg>
      <span className="font-mono uppercase tracking-[0.14em] text-[10px]">
        {label}
      </span>
    </span>
  );
}
