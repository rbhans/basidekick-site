/**
 * Anchor tables — per-primitive points where pipes/wires attach.
 *
 * Each entry maps an anchor name to a (x, y) offset in 0..1 space inside the
 * primitive's bounding box. The Schematic engine multiplies these by the
 * slot's computed bbox to get absolute world coords.
 *
 * Standard anchors (every primitive supports):
 *   N — top middle (0.5, 0)
 *   S — bottom middle (0.5, 1)
 *   E — right middle (1, 0.5)
 *   W — left middle (0, 0.5)
 *   C — center (0.5, 0.5)
 *
 * Some primitives add semantic anchors (e.g. pump.outlet, coil.hwsIn).
 */
export type AnchorName = string;
export type AnchorOffset = { x: number; y: number };
export type AnchorTable = Record<AnchorName, AnchorOffset>;

export const STANDARD_ANCHORS: AnchorTable = {
  N: { x: 0.5, y: 0 },
  S: { x: 0.5, y: 1 },
  E: { x: 1, y: 0.5 },
  W: { x: 0, y: 0.5 },
  C: { x: 0.5, y: 0.5 },
};

/** Per-primitive overrides. Only need entries that ADD semantic anchors;
 *  standard anchors are inherited by default. */
export const PRIMITIVE_ANCHORS: Record<string, AnchorTable> = {
  pump: {
    ...STANDARD_ANCHORS,
    outlet: { x: 0.5, y: 0 },
    inlet: { x: 0, y: 0.5 },
  },
  coil: {
    ...STANDARD_ANCHORS,
    hwsIn: { x: 0.3, y: 1 },
    hwrOut: { x: 0.7, y: 1 },
    chwsIn: { x: 0.3, y: 1 },
    chwrOut: { x: 0.7, y: 1 },
  },
  fan: STANDARD_ANCHORS,
  damper: STANDARD_ANCHORS,
  valve: {
    ...STANDARD_ANCHORS,
    actuator: { x: 0.5, y: -0.5 }, // above the valve
  },
  sensor: STANDARD_ANCHORS,
  controller: STANDARD_ANCHORS,
  duct: STANDARD_ANCHORS,
  equipment: STANDARD_ANCHORS,
};
