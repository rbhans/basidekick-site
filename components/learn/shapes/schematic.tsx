"use client";

import type { ReactNode } from "react";
import { COLOR } from "./tokens";
import { Pipe } from "./pipe";
import {
  PRIMITIVE_ANCHORS,
  STANDARD_ANCHORS,
  type AnchorTable,
} from "./anchors";
import { routePipe, type AnchorDirection } from "./pipe-router";
import type { Medium } from "./tokens";

// ===================================================================
//                       PUBLIC TYPES
// ===================================================================

export interface BBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LaneDef {
  /** Unique lane id. */
  id: string;
  /** Lane height in viewBox units. */
  height: number;
  /** Optional fill behind the lane (for debug or theming). */
  background?: string;
}

export interface SlotDef {
  /** Unique slot id used for connect lookups. */
  id: string;
  /** Lane id the slot lives in. */
  lane: string;
  /** Starting column (1-indexed). */
  col: number;
  /** How many columns the slot spans. Defaults to 1. */
  span?: number;
  /** Render callback receives the computed bbox. */
  render: (bbox: BBox) => ReactNode;
  /** Anchor table override. Defaults to STANDARD_ANCHORS. */
  anchors?: AnchorTable;
  /** Optional vertical alignment within lane. Defaults to "center". */
  align?: "start" | "center" | "end";
}

export interface ConnectDef {
  /** "slotId.anchorName" — e.g. "ctrl.S" or "rh-coil.hwsIn". */
  from: string;
  to: string;
  medium: Medium;
  dash?: string;
  strokeWidth?: number;
  flowing?: boolean;
  label?: string;
  /** Override gutter Y / X for the middle leg. */
  midY?: number;
  midX?: number;
}

export interface LabelDef {
  /** Either a slotId (label aligns to slot center) OR an x viewBox coord. */
  slot?: string;
  x?: number;
  anchor?: "start" | "middle" | "end";
  text: string;
}

export interface LegendItem {
  color: string;
  label: string;
  dashed?: boolean;
}

interface SchematicProps {
  width: number;
  /** Number of columns the canvas is divided into. Defaults to 12. */
  columns?: number;
  /** Horizontal padding (gutter) inside the canvas. Defaults to 20. */
  padX?: number;
  /** Vertical padding above/below the lanes. Defaults to 16. */
  padY?: number;
  lanes: LaneDef[];
  slots: SlotDef[];
  connects?: ConnectDef[];
  labels?: LabelDef[];
  legend?: LegendItem[];
  /** Title strip kicker text. */
  kicker?: string;
  /** Title strip right-aligned tag. */
  tag?: string;
  /** Optional caption rendered beneath the legend. */
  caption?: ReactNode;
}

// ===================================================================
//                       INTERNAL HELPERS
// ===================================================================

interface ComputedSlot extends SlotDef {
  bbox: BBox;
  anchorTable: AnchorTable;
}

function buildLayout(
  width: number,
  columns: number,
  padX: number,
  padY: number,
  lanes: LaneDef[],
  slots: SlotDef[],
) {
  const innerW = width - padX * 2;
  const colW = innerW / columns;
  const laneY: Record<string, number> = {};
  let cursor = padY;
  for (const lane of lanes) {
    laneY[lane.id] = cursor;
    cursor += lane.height;
  }
  const totalHeight = cursor + padY;

  const computedSlots: Record<string, ComputedSlot> = {};
  for (const s of slots) {
    const lane = lanes.find((l) => l.id === s.lane);
    if (!lane) {
      throw new Error(`Schematic: slot "${s.id}" references unknown lane "${s.lane}"`);
    }
    const span = s.span ?? 1;
    const x = padX + (s.col - 1) * colW;
    const y = laneY[s.lane];
    const bbox: BBox = {
      x,
      y,
      width: colW * span,
      height: lane.height,
    };
    if (computedSlots[s.id]) {
      throw new Error(`Schematic: duplicate slot id "${s.id}"`);
    }
    computedSlots[s.id] = {
      ...s,
      bbox,
      anchorTable: s.anchors ?? STANDARD_ANCHORS,
    };
  }
  return { totalHeight, laneY, computedSlots, colW };
}

function resolveAnchor(
  slots: Record<string, ComputedSlot>,
  ref: string,
): { x: number; y: number; dir: AnchorDirection } {
  const [slotId, anchorName = "C"] = ref.split(".");
  const slot = slots[slotId];
  if (!slot) throw new Error(`Schematic: connect references missing slot "${slotId}"`);
  const offsets = slot.anchorTable[anchorName] ?? STANDARD_ANCHORS[anchorName];
  if (!offsets) {
    throw new Error(
      `Schematic: slot "${slotId}" has no anchor "${anchorName}". Available: ${Object.keys(slot.anchorTable).join(", ")}`,
    );
  }
  const x = slot.bbox.x + slot.bbox.width * offsets.x;
  const y = slot.bbox.y + slot.bbox.height * offsets.y;
  const dir: AnchorDirection =
    anchorName === "N" || anchorName === "S" || anchorName === "E" || anchorName === "W"
      ? (anchorName as AnchorDirection)
      : offsets.y < 0.5
        ? "N"
        : offsets.y > 0.5
          ? "S"
          : offsets.x < 0.5
            ? "W"
            : "E";
  return { x, y, dir };
}

// ===================================================================
//                       PUBLIC COMPONENT
// ===================================================================

/**
 * Lane + column-slot grid schematic engine.
 *
 * Author declares lanes, slots, connections, labels. The engine computes
 * every coord. No raw x/y in user code. Two slots in the same (lane, col)
 * throw a build-time error. Pipes route via Manhattan path through gutters.
 *
 * See `components/learn/shapes/README.md` for the full design.
 */
export function Schematic({
  width,
  columns = 12,
  padX = 20,
  padY = 16,
  lanes,
  slots,
  connects = [],
  labels = [],
  legend = [],
  kicker,
  tag,
  caption,
}: SchematicProps) {
  const { totalHeight, computedSlots } = buildLayout(
    width,
    columns,
    padX,
    padY,
    lanes,
    slots,
  );

  return (
    <figure className="my-8 overflow-hidden rounded-[var(--radius-card)] border border-[color:var(--border)] bg-[color:var(--cream)] p-4">
      {/* Title strip */}
      {(kicker || tag) ? (
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
      ) : null}

      {/* Canvas */}
      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${totalHeight}`}
          className="block h-auto w-full"
          role="img"
        >
          {/* Optional lane backgrounds */}
          {lanes.map((l) =>
            l.background ? (
              <rect
                key={l.id}
                x={0}
                y={Object.values(computedSlots).find((s) => s.lane === l.id)?.bbox.y ?? 0}
                width={width}
                height={l.height}
                fill={l.background}
              />
            ) : null,
          )}

          {/* Slot content (computed bbox passed to each renderer) */}
          {slots.map((s) => {
            const cs = computedSlots[s.id];
            return <g key={s.id}>{s.render(cs.bbox)}</g>;
          })}

          {/* Connections */}
          {connects.map((c, i) => {
            const a = resolveAnchor(computedSlots, c.from);
            const b = resolveAnchor(computedSlots, c.to);
            const points = routePipe(a, b, { midY: c.midY, midX: c.midX });
            return (
              <Pipe
                key={i}
                medium={c.medium}
                points={points}
                flowing={c.flowing}
                dash={c.dash}
                strokeWidth={c.strokeWidth}
                label={c.label}
              />
            );
          })}
        </svg>

        {/* Label strip */}
        {labels.length > 0 ? (
          <div className="relative mt-2 h-5" aria-hidden="true">
            {labels.map((l, i) => {
              const cs = l.slot ? computedSlots[l.slot] : null;
              const xCoord = cs
                ? cs.bbox.x + cs.bbox.width / 2
                : (l.x ?? 0);
              const pct = (xCoord / width) * 100;
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

      {/* Optional plain caption */}
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

// Re-export anchor tables for primitive authors.
export { PRIMITIVE_ANCHORS };

// ===================================================================
//                       LAYOUT HELPERS
// ===================================================================
// Slot render callbacks receive a bbox. Use these helpers to derive the
// coords the primitives expect.

/** Return cx/cy of bbox center. */
export function centered(b: BBox): { cx: number; cy: number } {
  return { cx: b.x + b.width / 2, cy: b.y + b.height / 2 };
}

/** Return x/y/width/height matching bbox exactly. */
export function spanned(b: BBox): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  return { x: b.x, y: b.y, width: b.width, height: b.height };
}

/** Inset a bbox by `pad` on every side. */
export function inset(b: BBox, pad: number): BBox {
  return {
    x: b.x + pad,
    y: b.y + pad,
    width: Math.max(0, b.width - pad * 2),
    height: Math.max(0, b.height - pad * 2),
  };
}

/** Default radius for centered circular primitives (fan, pump, sensor). */
export function fitRadius(b: BBox, fraction = 0.4): number {
  return Math.min(b.width, b.height) * fraction;
}
