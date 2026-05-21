"use client";

import { motion } from "motion/react";
import {
  COLOR,
  EQUIPMENT_VARIANT,
  type EquipmentVariant,
  RADIUS,
  STROKE,
  MOTION,
} from "./tokens";

interface EquipmentBlockProps {
  x: number;
  y: number;
  width: number;
  height: number;
  /** Single-line kicker above title (mono uppercase). */
  kicker?: string;
  /** Title text inside the block. */
  title?: string;
  /** Secondary text below the title (e.g. state, value, runtime). */
  sub?: string;
  variant?: EquipmentVariant;
  /**
   * When false, the block renders as outline-only — cream fill, variant
   * color reduced to a thin outline, text muted. Active = full color fill.
   */
  active?: boolean;
}

/**
 * The base equipment block used by every illustration. Pass coordinates +
 * dimensions in the parent SVG's viewBox space. Active vs inactive uses
 * filled-vs-outlined to make state unambiguous (not just dimmed color).
 */
export function EquipmentBlock({
  x,
  y,
  width,
  height,
  kicker,
  title,
  sub,
  variant = "neutral",
  active = true,
}: EquipmentBlockProps) {
  const v = EQUIPMENT_VARIANT[variant];
  // Off state: fill stays the variant color but at low opacity (color hint
  // remains) while stroke holds at full opacity so the outline reads sharp.
  const fillOpacity = active ? 1 : 0.25;
  const textOpacity = active ? 1 : 0.55;

  return (
    <g>
      <motion.rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={RADIUS.block}
        fill={v.fill}
        stroke={v.stroke}
        initial={false}
        animate={{ fillOpacity }}
        transition={{ duration: MOTION.stateTransitionMs / 1000 }}
        strokeWidth={STROKE.default}
      />
      {kicker ? (
        <text
          x={x + width / 2}
          y={y + 14}
          fontSize="9"
          textAnchor="middle"
          style={{
            fill: v.text,
            opacity: 0.7 * textOpacity,
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          {kicker}
        </text>
      ) : null}
      {title ? (
        <text
          x={x + width / 2}
          y={y + (kicker ? 32 : height / 2 + 4)}
          fontSize="13"
          textAnchor="middle"
          style={{
            fill: v.text,
            opacity: textOpacity,
            fontFamily: "var(--font-sans)",
            fontWeight: 700,
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </text>
      ) : null}
      {sub ? (
        <text
          x={x + width / 2}
          y={y + height - 8}
          fontSize="10"
          textAnchor="middle"
          style={{
            fill: v.text,
            opacity: 0.7 * textOpacity,
            fontFamily: "var(--font-mono)",
          }}
        >
          {sub}
        </text>
      ) : null}
    </g>
  );
}
