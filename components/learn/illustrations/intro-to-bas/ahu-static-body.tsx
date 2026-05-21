import {
  Controller,
  CoolingCoil,
  Damper,
  Duct,
  Fan,
  Filter,
  HeatingCoil,
  COLOR,
} from "@/components/learn/shapes";

/**
 * Shared static AHU body used by ahu-anatomy, ahu-find-the-spot, and
 * ahu-label-match. All three render the same paused AHU; only the overlay
 * layer differs.
 *
 * Geometry mirrors the AHU startup sequence so the same component centers
 * line up across every variant.
 */

// ============ LAYOUT CONSTANTS (mirror ahu-startup-sequence.tsx) ============
export const AHU_W = 820;
export const AHU_H = 380;
export const AHU_DUCT_X = 30;
export const AHU_DUCT_Y = 180;
export const AHU_DUCT_H = 70;
export const AHU_DUCT_W = AHU_W - AHU_DUCT_X * 2;
export const AHU_DUCT_MID = AHU_DUCT_Y + AHU_DUCT_H / 2;
export const AHU_CTRL_X = 540;
export const AHU_CTRL_Y = 25;
export const AHU_CTRL_W = 160;
export const AHU_CTRL_H = 50;
export const AHU_OA_CX = 70;
export const AHU_RA_CX = 200;
export const AHU_RA_BOX_X = AHU_RA_CX - 30;
export const AHU_RA_BOX_Y = 80;
export const AHU_RA_BOX_W = 60;
export const AHU_RA_BOX_H = AHU_DUCT_Y - AHU_RA_BOX_Y;
export const AHU_RA_CY = AHU_RA_BOX_Y + AHU_RA_BOX_H / 2;
export const AHU_FLT_X = 270;
export const AHU_CC_X = 370;
export const AHU_HC_X = 470;
export const AHU_COMP_W = 70;
export const AHU_FAN_CX = 620;

/** Component center coordinates in viewBox space (820x380). */
export const AHU_CENTERS = {
  oaDamper: { cx: AHU_OA_CX, cy: AHU_DUCT_MID },
  raDamper: { cx: AHU_RA_CX, cy: AHU_RA_CY },
  filter: { cx: AHU_FLT_X + AHU_COMP_W / 2, cy: AHU_DUCT_MID },
  coolingCoil: { cx: AHU_CC_X + AHU_COMP_W / 2, cy: AHU_DUCT_MID },
  heatingCoil: { cx: AHU_HC_X + AHU_COMP_W / 2, cy: AHU_DUCT_MID },
  supplyFan: { cx: AHU_FAN_CX, cy: AHU_DUCT_MID },
} as const;

export type AhuComponentKey = keyof typeof AHU_CENTERS;

/** Renders the static AHU body inside a parent <svg>. */
export function AhuStaticBody({ withController = true }: { withController?: boolean } = {}) {
  return (
    <>
      {/* Duct */}
      <Duct
        x={AHU_DUCT_X}
        y={AHU_DUCT_Y}
        width={AHU_DUCT_W}
        height={AHU_DUCT_H}
        topOpenings={[[AHU_RA_BOX_X, AHU_RA_BOX_X + AHU_RA_BOX_W]]}
      />

      {/* RA enclosure */}
      <rect
        x={AHU_RA_BOX_X}
        y={AHU_RA_BOX_Y}
        width={AHU_RA_BOX_W}
        height={AHU_RA_BOX_H}
        fill={COLOR.cream}
      />
      <line
        x1={AHU_RA_BOX_X}
        y1={AHU_RA_BOX_Y}
        x2={AHU_RA_BOX_X}
        y2={AHU_RA_BOX_Y + AHU_RA_BOX_H}
        stroke={COLOR.ink}
        strokeWidth={1.6}
      />
      <line
        x1={AHU_RA_BOX_X + AHU_RA_BOX_W}
        y1={AHU_RA_BOX_Y}
        x2={AHU_RA_BOX_X + AHU_RA_BOX_W}
        y2={AHU_RA_BOX_Y + AHU_RA_BOX_H}
        stroke={COLOR.ink}
        strokeWidth={1.6}
      />

      {/* Controller (inactive, no pulse) */}
      {withController ? (
        <Controller
          x={AHU_CTRL_X}
          y={AHU_CTRL_Y}
          width={AHU_CTRL_W}
          height={AHU_CTRL_H}
          title="AHU-1"
          active={false}
        />
      ) : null}

      {/* OA damper (mid-open) */}
      <Damper
        cx={AHU_OA_CX}
        cy={AHU_DUCT_MID}
        position={0.5}
        blades={4}
        ductDirection="horizontal"
        acrossDuct={AHU_DUCT_H - 10}
        alongDuct={40}
        animated={false}
      />

      {/* RA damper (mid-open) */}
      <Damper
        cx={AHU_RA_CX}
        cy={AHU_RA_CY}
        position={0.5}
        blades={3}
        ductDirection="vertical"
        acrossDuct={AHU_RA_BOX_W - 10}
        alongDuct={28}
        animated={false}
      />

      {/* Filter */}
      <Filter
        x={AHU_FLT_X}
        y={AHU_DUCT_Y + 6}
        width={AHU_COMP_W}
        height={AHU_DUCT_H - 12}
      />

      {/* Cooling coil */}
      <CoolingCoil
        x={AHU_CC_X}
        y={AHU_DUCT_Y + 6}
        width={AHU_COMP_W}
        height={AHU_DUCT_H - 12}
      />

      {/* Heating coil */}
      <HeatingCoil
        x={AHU_HC_X}
        y={AHU_DUCT_Y + 6}
        width={AHU_COMP_W}
        height={AHU_DUCT_H - 12}
      />

      {/* Supply fan (still) */}
      <Fan cx={AHU_FAN_CX} cy={AHU_DUCT_MID} r={26} spinning={false} />
    </>
  );
}
