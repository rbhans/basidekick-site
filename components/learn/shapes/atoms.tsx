"use client";

import { motion } from "motion/react";
import { COLOR, STROKE, MOTION, RADIUS } from "./tokens";

// ---------- SensorDot ----------

interface SensorDotProps {
  cx: number;
  cy: number;
  /** Single-letter code shown inside the dot (T, P, F, CO₂, etc.). */
  kind: string;
  /** Optional label drawn next to the dot. */
  label?: string;
  /** Where the label sits relative to the dot. */
  labelPos?: "right" | "left" | "above" | "below";
  /** Color override; defaults to ink. */
  color?: string;
}

export function SensorDot({
  cx,
  cy,
  kind,
  label,
  labelPos = "right",
  color = COLOR.ink,
}: SensorDotProps) {
  const r = 11;
  const labelDX = labelPos === "right" ? r + 6 : labelPos === "left" ? -(r + 6) : 0;
  const labelDY = labelPos === "above" ? -(r + 8) : labelPos === "below" ? r + 14 : 4;
  const anchor =
    labelPos === "left"
      ? "end"
      : labelPos === "right"
        ? "start"
        : "middle";
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={COLOR.sand}
        stroke={color}
        strokeWidth={STROKE.default}
      />
      <text
        x={cx}
        y={cy + 4}
        fontSize="11"
        textAnchor="middle"
        style={{
          fill: color,
          fontFamily: "var(--font-mono)",
          fontWeight: 700,
        }}
      >
        {kind}
      </text>
      {label ? (
        <text
          x={cx + labelDX}
          y={cy + labelDY}
          fontSize="9"
          textAnchor={anchor}
          style={{
            fill: color,
            fontFamily: "var(--font-mono)",
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </text>
      ) : null}
    </g>
  );
}

// ---------- Damper ----------

interface DamperProps {
  cx: number;
  cy: number;
  /** 0 = closed (blade fully blocks duct cross-section), 1 = open. */
  position: number;
  /**
   * Number of blades. Single-blade ("butterfly") is the VAV default. Use
   * 3–6 for parallel/opposed dampers on AHU outdoor-air, return-air, etc.
   */
  blades?: number;
  /**
   * Duct orientation. Determines which way the blade(s) rotate.
   *   "horizontal" (default) — duct runs left-right, blades pivot on shafts
   *      that span top-to-bottom across the duct; closed blade sits vertical.
   *   "vertical" — duct runs top-bottom, blades pivot on shafts that span
   *      left-to-right; closed blade sits horizontal.
   */
  ductDirection?: "horizontal" | "vertical";
  /**
   * Damper cross-section dimensions (across the duct AND along the duct).
   * In a horizontal duct, `acrossDuct` = duct height, `alongDuct` = damper
   * footprint along the airflow axis (controls multi-blade stacking).
   */
  acrossDuct?: number;
  alongDuct?: number;
  /** "parallel" all blades rotate together. "opposed" alternate counter-rotate. */
  kind?: "parallel" | "opposed";
  /** Optional caption near the damper. */
  label?: string;
  /** Color override; defaults to ink. */
  color?: string;
  /** Smoothly animate position changes. */
  animated?: boolean;
}

/**
 * Damper drawn in side view, pivoting around shafts oriented perpendicular
 * to the duct.
 *
 *  - VAV terminals use a single-blade ("butterfly") damper. That's the
 *    default — pass `blades=1` (default).
 *  - AHU outdoor-air, return-air, mixing-box dampers use parallel- or
 *    opposed-blade multi-blade dampers. Pass `blades=4` (or more) and
 *    `kind="parallel"` / `"opposed"`. Blades stack ACROSS the duct,
 *    not along it — each blade is a short segment of the duct cross-
 *    section, rotating on its own shaft.
 *
 * Closed (position=0): blade(s) align with the duct cross-section, fully
 * blocking airflow. Open (position=1): blade(s) align with the duct axis,
 * letting air pass.
 */
export function Damper({
  cx,
  cy,
  position,
  blades = 1,
  ductDirection = "horizontal",
  acrossDuct = 60,
  alongDuct,
  kind = "parallel",
  label,
  color = COLOR.ink,
  animated = true,
}: DamperProps) {
  const isHorizontal = ductDirection === "horizontal";
  // Default damper footprint along the duct = enough for the blade arc.
  const along = alongDuct ?? Math.max(16, (acrossDuct / blades) * 0.9);
  const across = acrossDuct;
  // Blade length (= length of one blade segment when laid flat).
  const bladeLen = (across / blades) * 0.95;
  // Closed = blade lies ACROSS the duct (covers cross-section).
  // Open  = blade lies ALONG the duct (parallel to airflow).
  // For a horizontal duct, "across" = vertical, "along" = horizontal.
  // angleDeg = how much the blade has rotated FROM closed.
  const angleDeg = position * 90; // 0 closed → 90 open
  const transitionDuration = animated ? MOTION.stateTransitionMs / 1000 : 0;

  // Lay out blade shafts evenly across the duct cross-section.
  const shaftPositions = Array.from({ length: blades }, (_, i) =>
    -across / 2 + (across / blades) * (i + 0.5),
  );

  return (
    <g>
      {shaftPositions.map((shaftOffset, i) => {
        // Shaft passes through the duct cross-section. Pivot point = where
        // the shaft crosses the duct centerline.
        const pivot = isHorizontal
          ? { px: cx, py: cy + shaftOffset } // shaft is vertical, stacked along duct length? wait
          : { px: cx + shaftOffset, py: cy };
        // Correction: in a HORIZONTAL duct, blade shafts run perpendicular
        // to flow which means they're oriented INTO the page (we see the
        // pivot end-on as a dot). Multiple blades stack ACROSS the duct
        // CROSS-SECTION — i.e. along the vertical axis when viewed from the
        // side. So pivot positions in side-view are at different Y values.
        // For a VERTICAL duct, pivots stack along the X axis.
        const piv = isHorizontal
          ? { px: cx, py: cy + shaftOffset }
          : { px: cx + shaftOffset, py: cy };

        const dir = kind === "opposed" && i % 2 === 1 ? -1 : 1;
        const rot = angleDeg * dir;

        // Blade laid flat (closed) along the duct cross-section.
        // In horizontal duct: closed blade is VERTICAL (along Y).
        // In vertical duct: closed blade is HORIZONTAL (along X).
        const halfBlade = bladeLen / 2;
        const x1 = isHorizontal ? piv.px : piv.px - halfBlade;
        const y1 = isHorizontal ? piv.py - halfBlade : piv.py;
        const x2 = isHorizontal ? piv.px : piv.px + halfBlade;
        const y2 = isHorizontal ? piv.py + halfBlade : piv.py;

        return (
          <g key={i}>
            {/* Pivot point */}
            <circle cx={piv.px} cy={piv.py} r={1.8} fill={color} />
            <motion.line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={color}
              strokeWidth={STROKE.bold}
              strokeLinecap="round"
              initial={false}
              animate={{ rotate: rot }}
              transition={{
                duration: transitionDuration,
                ease: "easeInOut",
              }}
              style={{ transformOrigin: `${piv.px}px ${piv.py}px` }}
            />
          </g>
        );
      })}
      {label ? (
        <text
          x={cx}
          y={isHorizontal ? cy + across / 2 + 16 : cy + along / 2 + 16}
          fontSize="9"
          textAnchor="middle"
          style={{
            fill: color,
            fontFamily: "var(--font-mono)",
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </text>
      ) : null}
    </g>
  );
}

// ---------- Valve ----------

interface ValveProps {
  cx: number;
  cy: number;
  /** 0 = closed, 1 = full open. Affects fill intensity. */
  position: number;
  /** "two-way" = bow-tie. "three-way" = three triangles meeting at center. */
  kind?: "two-way" | "three-way";
  /**
   * Three-way port layout. Tells which side each triangle's outer base
   * points toward. Defaults to ["left","right","bottom"] for an inverted-T
   * mixing valve (two horizontal inlets, one downward outlet).
   */
  threeWayPorts?: Array<"left" | "right" | "top" | "bottom">;
  /** Color override; defaults to ink. */
  color?: string;
  label?: string;
}

/**
 * Two-way bow-tie or three-way three-triangle valve.
 *
 * Three-way is drawn as three triangles meeting at a central pivot, each
 * pointing OUT toward one of the four cardinal directions. `threeWayPorts`
 * picks which three of the four directions are used.
 */
export function Valve({
  cx,
  cy,
  position,
  kind = "two-way",
  threeWayPorts = ["left", "right", "bottom"],
  color = COLOR.ink,
  label,
}: ValveProps) {
  const w = 14;
  const fillOpacity = 0.25 + position * 0.55;

  if (kind === "two-way") {
    return (
      <g>
        <motion.polygon
          points={`${cx - w},${cy - w} ${cx + w},${cy + w} ${cx + w},${cy - w} ${cx - w},${cy + w}`}
          fill={color}
          stroke={color}
          strokeWidth={STROKE.default}
          strokeLinejoin="round"
          initial={false}
          animate={{ fillOpacity }}
          transition={{ duration: MOTION.stateTransitionMs / 1000 }}
        />
        {label ? (
          <text
            x={cx}
            y={cy + w + 14}
            fontSize="9"
            textAnchor="middle"
            style={{
              fill: color,
              fontFamily: "var(--font-mono)",
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            {label}
          </text>
        ) : null}
      </g>
    );
  }

  // Three-way: triangles point OUT from center. Each port direction maps
  // to a triangle whose tip touches center and whose base sits on the outer
  // edge in that direction.
  return (
    <g>
      {threeWayPorts.slice(0, 3).map((dir) => {
        // Build a triangle whose tip is at center, base on the chosen edge.
        let p1: [number, number];
        let p2: [number, number];
        let p3: [number, number];
        const tip: [number, number] = [cx, cy];
        switch (dir) {
          case "left":
            p1 = tip;
            p2 = [cx - w, cy - w];
            p3 = [cx - w, cy + w];
            break;
          case "right":
            p1 = tip;
            p2 = [cx + w, cy - w];
            p3 = [cx + w, cy + w];
            break;
          case "top":
            p1 = tip;
            p2 = [cx - w, cy - w];
            p3 = [cx + w, cy - w];
            break;
          case "bottom":
            p1 = tip;
            p2 = [cx - w, cy + w];
            p3 = [cx + w, cy + w];
            break;
        }
        return (
          <motion.polygon
            key={dir}
            points={`${p1[0]},${p1[1]} ${p2[0]},${p2[1]} ${p3[0]},${p3[1]}`}
            fill={color}
            stroke={color}
            strokeWidth={STROKE.default}
            strokeLinejoin="round"
            initial={false}
            animate={{ fillOpacity }}
            transition={{ duration: MOTION.stateTransitionMs / 1000 }}
          />
        );
      })}
      {label ? (
        <text
          x={cx}
          y={cy + w + 16}
          fontSize="9"
          textAnchor="middle"
          style={{
            fill: color,
            fontFamily: "var(--font-mono)",
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </text>
      ) : null}
    </g>
  );
}

// ---------- Fan ----------

interface FanProps {
  cx: number;
  cy: number;
  /** Radius. */
  r?: number;
  /** Whether the fan is spinning. */
  spinning?: boolean;
  /** Color override; defaults to ink. */
  color?: string;
  label?: string;
}

export function Fan({
  cx,
  cy,
  r = 18,
  spinning = false,
  color = COLOR.ink,
  label,
}: FanProps) {
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={COLOR.sand}
        stroke={color}
        strokeWidth={STROKE.default}
      />
      <motion.g
        animate={{ rotate: spinning ? 360 : 0 }}
        transition={
          spinning
            ? {
                duration: MOTION.spinPeriodMs / 1000,
                repeat: Infinity,
                ease: "linear",
              }
            : { duration: MOTION.stateTransitionMs / 1000 }
        }
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      >
        {[0, 60, 120].map((deg) => (
          <line
            key={deg}
            x1={cx}
            y1={cy - r * 0.8}
            x2={cx}
            y2={cy + r * 0.8}
            stroke={color}
            strokeWidth={STROKE.bold}
            strokeLinecap="round"
            transform={`rotate(${deg}, ${cx}, ${cy})`}
          />
        ))}
      </motion.g>
      <circle cx={cx} cy={cy} r={3} fill={color} />
      {label ? (
        <text
          x={cx}
          y={cy + r + 14}
          fontSize="9"
          textAnchor="middle"
          style={{
            fill: color,
            fontFamily: "var(--font-mono)",
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </text>
      ) : null}
    </g>
  );
}

// ---------- Pump (centrifugal) ----------

interface PumpProps {
  cx: number;
  cy: number;
  r?: number;
  spinning?: boolean;
  color?: string;
  /** Optional caption beneath. */
  label?: string;
}

/**
 * Centrifugal pump symbol: circle with a chord-line representing the volute
 * outlet at one o'clock, plus a small inlet stub at the left.
 * Animates rotation when `spinning`.
 */
export function Pump({
  cx,
  cy,
  r = 14,
  spinning = false,
  color = COLOR.ink,
  label,
}: PumpProps) {
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={COLOR.sand}
        stroke={color}
        strokeWidth={STROKE.default}
      />
      <motion.g
        animate={{ rotate: spinning ? 360 : 0 }}
        transition={
          spinning
            ? {
                duration: MOTION.spinPeriodMs / 1000,
                repeat: Infinity,
                ease: "linear",
              }
            : { duration: MOTION.stateTransitionMs / 1000 }
        }
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      >
        <line
          x1={cx - r * 0.7}
          y1={cy}
          x2={cx + r * 0.7}
          y2={cy}
          stroke={color}
          strokeWidth={STROKE.bold}
          strokeLinecap="round"
        />
      </motion.g>
      {/* Triangle "outlet" marker at the top */}
      <polygon
        points={`${cx - 3},${cy - r} ${cx + 3},${cy - r} ${cx},${cy - r - 5}`}
        fill={color}
      />
      {label ? (
        <text
          x={cx}
          y={cy + r + 14}
          fontSize="9"
          textAnchor="middle"
          style={{
            fill: color,
            fontFamily: "var(--font-mono)",
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </text>
      ) : null}
    </g>
  );
}

// ---------- Controller ----------

interface ControllerProps {
  x: number;
  y: number;
  width?: number;
  height?: number;
  kicker?: string;
  title: string;
  /** When true, indicator dot pulses crimson. */
  active?: boolean;
}

export function Controller({
  x,
  y,
  width = 120,
  height = 50,
  kicker = "CONTROLLER",
  title,
  active = true,
}: ControllerProps) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={RADIUS.controller}
        fill={COLOR.ink}
        stroke={COLOR.ink}
      />
      <text
        x={x + width / 2}
        y={y + 16}
        fontSize="9"
        textAnchor="middle"
        style={{
          fill: COLOR.cream,
          opacity: 0.7,
          fontFamily: "var(--font-mono)",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          fontWeight: 600,
        }}
      >
        {kicker}
      </text>
      <text
        x={x + width / 2}
        y={y + 36}
        fontSize="14"
        textAnchor="middle"
        style={{
          fill: COLOR.cream,
          fontFamily: "var(--font-mono)",
          fontWeight: 700,
        }}
      >
        {title}
      </text>
      {/* Active indicator */}
      <motion.circle
        cx={x + width - 10}
        cy={y + 10}
        r={3.5}
        fill={active ? COLOR.punch : COLOR.inkSubtle}
        initial={false}
        animate={{
          opacity: active ? [1, 0.45, 1] : 0.5,
        }}
        transition={
          active
            ? { duration: 1.4, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.3 }
        }
      />
    </g>
  );
}

// ---------- Label (mono uppercase tracked) ----------

interface LabelProps {
  x: number;
  y: number;
  text: string;
  anchor?: "start" | "middle" | "end";
  color?: string;
  size?: number;
}

export function Label({
  x,
  y,
  text,
  anchor = "start",
  color = COLOR.inkMuted,
  size = 9,
}: LabelProps) {
  return (
    <text
      x={x}
      y={y}
      fontSize={size}
      textAnchor={anchor}
      style={{
        fill: color,
        fontFamily: "var(--font-mono)",
        fontWeight: 600,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
      }}
    >
      {text}
    </text>
  );
}
