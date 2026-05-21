"use client";

import {
  Controller,
  Damper,
  Duct,
  LabeledSchematic,
  Pipe,
  ReheatCoil,
  SensorDot,
  Valve,
  COLOR,
} from "@/components/learn/shapes";

/**
 * VAV terminal unit with hot-water reheat.
 *
 * Hand-tuned inline coords against the shape kit. No layout engine — every
 * (x, y) is set by eyeball so the diagram reads cleanly.
 *
 *                   ┌───────────────┐                       (T)── ZN-T
 *                   │ DDC: VAV-1    │
 *                   └──┬────┬───┬───┘
 *   PRIMARY AIR ──►   :    :   :      ┌────────────┐    ──► TO ZONE
 *  ─────────────────────────────────────────────────────────────────
 *     [damper]     (F sensor)          REHEAT  HW COIL
 *  ─────────────────────────────────────────────────────────────────
 *                                            │  │
 *                                          [M]
 *                                          (▼)
 *                                          HWS  HWR
 */
export function VavReheat() {
  // --- canvas + layout constants -------------------------------------
  const W = 820;
  const H = 380;

  // Duct band
  const DUCT_Y = 160;
  const DUCT_H = 80;
  const DUCT_X = 30;
  const DUCT_W = W - DUCT_X * 2;
  const DUCT_MID = DUCT_Y + DUCT_H / 2;

  // Component positions inside the duct
  const DPR_CX = 110;
  const AFMS_CX = 240;
  const COIL_X = 380;
  const COIL_W = 130;

  // Water-side
  const HWS_X = COIL_X + 28; // supply pipe column
  const HWR_X = COIL_X + COIL_W - 28; // return pipe column
  const WATER_BOTTOM = 340;
  const VALVE_CY = 285;
  const ACT_Y = 257; // top of M actuator
  const ACT_H = 20;

  // Controller + zone sensor
  const CTRL_X = 30;
  const CTRL_Y = 30;
  const CTRL_W = 150;
  const CTRL_H = 60;
  const ZN_T_CX = 770;
  const ZN_T_CY = 60;

  return (
    <LabeledSchematic
      width={W}
      height={H}
      kicker="VAV BOX · HOT-WATER REHEAT"
      tag="VAV-1"
      labels={[
        { x: DPR_CX, text: "VAV DAMPER" },
        { x: AFMS_CX, text: "AIRFLOW" },
        { x: COIL_X + COIL_W / 2, text: "REHEAT COIL" },
      ]}
      legend={[
        { color: COLOR.hwsRed, label: "HW SUPPLY" },
        { color: COLOR.hwrRed, label: "HW RETURN" },
        { color: COLOR.ink, label: "CONTROL", dashed: true },
        { color: COLOR.punch, label: "AIRFLOW" },
      ]}
    >
      {/* ===== DUCT (background-most) ===== */}
      <Duct x={DUCT_X} y={DUCT_Y} width={DUCT_W} height={DUCT_H} flowing />

      {/* ===== CONTROL WIRES (drawn early so components paint on top) =====
       *  Each wire takes a distinct route so they don't merge or hide.
       *  Two "gutters" between controller bottom (y=90) and duct top (y=160)
       *  give each wire its own horizontal lane:
       *    GUTTER_TOP    — y=110  damper wire
       *    GUTTER_BOT    — y=140  AFMS wire
       *  Valve-actuator wire routes far-right around the coil.
       *  ZN-T wire runs along the very top of the canvas. */}
      {/* Controller → VAV damper (terminates AT the damper pivot) */}
      <Pipe
        medium="control"
        points={[
          [CTRL_X + 40, CTRL_Y + CTRL_H],
          [CTRL_X + 40, 110],
          [DPR_CX, 110],
          [DPR_CX, DUCT_MID],
        ]}
        dash="4 3"
        strokeWidth={1.2}
      />
      {/* Controller → AFMS (terminates AT the sensor center) */}
      <Pipe
        medium="control"
        points={[
          [CTRL_X + 90, CTRL_Y + CTRL_H],
          [CTRL_X + 90, 140],
          [AFMS_CX, 140],
          [AFMS_CX, DUCT_MID],
        ]}
        dash="4 3"
        strokeWidth={1.2}
      />
      {/* Controller → valve actuator (routes around the coil right side and
       *  terminates AT the M block center) */}
      <Pipe
        medium="control"
        points={[
          [CTRL_X + CTRL_W, CTRL_Y + CTRL_H - 12],
          [COIL_X + COIL_W + 30, CTRL_Y + CTRL_H - 12],
          [COIL_X + COIL_W + 30, ACT_Y + ACT_H / 2],
          [HWS_X, ACT_Y + ACT_H / 2],
        ]}
        dash="4 3"
        strokeWidth={1.2}
      />
      {/* Controller → zone temp sensor (terminates AT the sensor center) */}
      <Pipe
        medium="control"
        points={[
          [CTRL_X + CTRL_W, CTRL_Y + 16],
          [ZN_T_CX, CTRL_Y + 16],
          [ZN_T_CX, ZN_T_CY],
        ]}
        dash="4 3"
        strokeWidth={1.2}
      />

      {/* ===== DDC CONTROLLER (top-left) ===== */}
      <Controller
        x={CTRL_X}
        y={CTRL_Y}
        width={CTRL_W}
        height={CTRL_H}
        title="VAV-1"
      />

      {/* ===== ZONE TEMP SENSOR (top-right) ===== */}
      <SensorDot
        cx={ZN_T_CX}
        cy={ZN_T_CY}
        kind="T"
        label="ZN-T"
        labelPos="right"
        color={COLOR.ink}
      />

      {/* ===== VAV DAMPER (single butterfly blade inside duct) ===== */}
      <Damper
        cx={DPR_CX}
        cy={DUCT_MID}
        position={0.6}
        blades={1}
        ductDirection="horizontal"
        acrossDuct={DUCT_H - 12}
        alongDuct={36}
      />

      {/* ===== AIRFLOW SENSOR (inside duct, downstream of damper) ===== */}
      <SensorDot cx={AFMS_CX} cy={DUCT_MID} kind="F" color={COLOR.ink} />

      {/* ===== REHEAT COIL (inset from duct walls so the duct lines stay
       *  visible past the component) ===== */}
      <ReheatCoil
        x={COIL_X}
        y={DUCT_Y + 6}
        width={COIL_W}
        height={DUCT_H - 12}
      />

      {/* ===== HW SUPPLY pipe (red, flowing UP into coil) ===== */}
      <Pipe
        medium="hws"
        points={[
          [HWS_X, WATER_BOTTOM],
          [HWS_X, VALVE_CY + 14],
          [HWS_X, DUCT_Y + DUCT_H],
        ]}
        flowing
      />

      {/* ===== HW RETURN pipe (dark red, flowing DOWN from coil) ===== */}
      <Pipe
        medium="hwr"
        points={[
          [HWR_X, DUCT_Y + DUCT_H],
          [HWR_X, WATER_BOTTOM],
        ]}
        flowing
      />

      {/* ===== TWO-WAY VALVE on HW supply ===== */}
      <Valve cx={HWS_X} cy={VALVE_CY} position={0.55} kind="two-way" />

      {/* ===== MODULATING ACTUATOR (M block above the valve) ===== */}
      <rect
        x={HWS_X - 14}
        y={ACT_Y}
        width={28}
        height={ACT_H}
        rx={3}
        fill={COLOR.ink}
      />
      <text
        x={HWS_X}
        y={ACT_Y + 14}
        fontSize="10"
        textAnchor="middle"
        style={{
          fill: COLOR.cream,
          fontFamily: "var(--font-mono)",
          fontWeight: 700,
        }}
      >
        M
      </text>

      {/* ===== HWS / HWR pipe labels at bottom ===== */}
      <text
        x={HWS_X}
        y={WATER_BOTTOM + 18}
        fontSize="10"
        textAnchor="middle"
        style={{
          fill: COLOR.hwsRed,
          fontFamily: "var(--font-mono)",
          fontWeight: 600,
          letterSpacing: "0.14em",
        }}
      >
        HWS
      </text>
      <text
        x={HWR_X}
        y={WATER_BOTTOM + 18}
        fontSize="10"
        textAnchor="middle"
        style={{
          fill: COLOR.hwrRed,
          fontFamily: "var(--font-mono)",
          fontWeight: 600,
          letterSpacing: "0.14em",
        }}
      >
        HWR
      </text>
    </LabeledSchematic>
  );
}
