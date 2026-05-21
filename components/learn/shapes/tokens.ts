/**
 * Shape-kit tokens.
 *
 * Single source of truth for the colors, sizes, and durations used by every
 * primitive in `components/learn/shapes/`. Stay consistent across every
 * illustration — if you reach for a hex or a magic number in an illustration,
 * pull it from here instead.
 *
 * Brand reference: docs/brand-guidelines.md (in basidekick-site repo).
 */

// ---------- semantic colors ----------
// All values resolve via CSS variables in globals.css so dark mode works.

/** Concrete colors for fluid mediums. Industry convention: lighter shade =
 * supply, darker shade = return. CHW blue, HW red, CW green. */
export const COLOR_RAW = {
  ink: "#0a0a0a",
  sand: "#fafaf8",
  cream: "#f5f5f5",
  punch: "#d11a36",
  punchSoft: "rgba(209, 26, 54, 0.12)",

  // Chilled water (blue) — lighter supply, darker return
  chwsBlue: "#60a5fa",
  chwrBlue: "#1d4ed8",
  // Hot water (red) — lighter supply, darker return
  hwsRed: "#f87171",
  hwrRed: "#991b1b",
  // Condenser water (green) — lighter supply, darker return
  cwsGreen: "#4ade80",
  cwrGreen: "#15803d",
  // Refrigerant (plum)
  refrigerant: "#7c3aed",

  // Legacy supporting palette (kept for non-fluid uses)
  moss: "#3a7a3a", // status: proven / OK
  ochre: "#b8762a", // generic heating accent (e.g. equipment block tint)
  slate: "#3d5a80", // generic cooling accent
  teal: "#2d6e6e", // generic condenser accent
  plum: "#6b3a5e",

  borderStrong: "rgba(10, 10, 10, 0.18)",
  inkMuted: "rgba(10, 10, 10, 0.64)",
  inkSubtle: "rgba(10, 10, 10, 0.44)",
} as const;

export const COLOR = {
  ink: "var(--ink)",
  sand: "var(--sand)",
  cream: "var(--cream)",
  punch: "var(--punch)",
  punchSoft: "var(--punch-soft)",
  moss: "var(--moss)",
  borderStrong: "var(--border-strong)",
  inkMuted: "var(--ink-2)",
  inkSubtle: "var(--ink-3)",

  // Fluid mediums (raw hex — semantic across light + dark mode)
  chwsBlue: COLOR_RAW.chwsBlue,
  chwrBlue: COLOR_RAW.chwrBlue,
  hwsRed: COLOR_RAW.hwsRed,
  hwrRed: COLOR_RAW.hwrRed,
  cwsGreen: COLOR_RAW.cwsGreen,
  cwrGreen: COLOR_RAW.cwrGreen,
  refrigerant: COLOR_RAW.refrigerant,

  // Equipment-block tints (legacy supporting palette)
  slate: COLOR_RAW.slate,
  ochre: COLOR_RAW.ochre,
  teal: COLOR_RAW.teal,
  plum: COLOR_RAW.plum,
} as const;

// ---------- semantic medium → color ----------
// "Medium" = what flows through a pipe/duct. Same medium always uses same
// color across every illustration. Industry convention: lighter = supply,
// darker = return.
export const MEDIUM = {
  air: { fill: COLOR.cream, stroke: COLOR.ink, label: "AIR" },
  chws: { fill: COLOR.chwsBlue, stroke: COLOR.chwsBlue, label: "CHWS" },
  chwr: { fill: COLOR.chwrBlue, stroke: COLOR.chwrBlue, label: "CHWR" },
  hws: { fill: COLOR.hwsRed, stroke: COLOR.hwsRed, label: "HWS" },
  hwr: { fill: COLOR.hwrRed, stroke: COLOR.hwrRed, label: "HWR" },
  cws: { fill: COLOR.cwsGreen, stroke: COLOR.cwsGreen, label: "CWS" },
  cwr: { fill: COLOR.cwrGreen, stroke: COLOR.cwrGreen, label: "CWR" },
  refrigerant: {
    fill: COLOR.refrigerant,
    stroke: COLOR.refrigerant,
    label: "REF",
  },
  control: { fill: COLOR.ink, stroke: COLOR.ink, label: "CTRL" },
} as const;

export type Medium = keyof typeof MEDIUM;

// ---------- equipment variant → color ----------
// Equipment blocks default to neutral; named variants get a semantic tint.
export const EQUIPMENT_VARIANT = {
  neutral: { fill: COLOR.cream, stroke: COLOR.borderStrong, text: COLOR.ink },
  air: { fill: COLOR.cream, stroke: COLOR.borderStrong, text: COLOR.ink },
  cooling: {
    fill: COLOR.chwrBlue,
    stroke: COLOR.chwrBlue,
    text: COLOR.cream,
  },
  heating: { fill: COLOR.hwrRed, stroke: COLOR.hwrRed, text: COLOR.cream },
  refrigerant: {
    fill: COLOR.refrigerant,
    stroke: COLOR.refrigerant,
    text: COLOR.cream,
  },
  control: { fill: COLOR.ink, stroke: COLOR.ink, text: COLOR.cream },
  active: { fill: COLOR.punch, stroke: COLOR.punch, text: COLOR.cream },
  proven: { fill: COLOR.moss, stroke: COLOR.moss, text: COLOR.sand },
} as const;

export type EquipmentVariant = keyof typeof EQUIPMENT_VARIANT;

// ---------- sizing ----------
export const STROKE = {
  hairline: 1,
  default: 1.6,
  bold: 2.4,
  pipe: 3,
  duct: 1.6,
} as const;

export const RADIUS = {
  block: 6,
  chip: 4,
  controller: 4,
} as const;

export const FONT = {
  label: { size: 10, weight: 600, family: "var(--font-mono)" },
  blockHeader: { size: 9, weight: 600, family: "var(--font-mono)" },
  blockTitle: { size: 13, weight: 700, family: "var(--font-sans)" },
  small: { size: 9, weight: 500, family: "var(--font-mono)" },
} as const;

// ---------- motion ----------
export const MOTION = {
  /** Duration of a flow dot traversing 100px of path. Multiply by path length. */
  flowDotPxPerSecond: 120,
  /** Generic state transition (color/opacity changes). */
  stateTransitionMs: 350,
  /** Fan / pump rotation period in ms. */
  spinPeriodMs: 1400,
} as const;
