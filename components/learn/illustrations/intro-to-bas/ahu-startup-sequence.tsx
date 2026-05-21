"use client";

import {
  Controller,
  CoolingCoil,
  Damper,
  Duct,
  Fan,
  Filter,
  HeatingCoil,
  LabeledSchematic,
  Pipe,
  COLOR,
} from "@/components/learn/shapes";

interface AhuStartupSequenceProps {
  frame: number; // 0..5
}

interface FrameState {
  title: string;
  detail: string;
  oaDamperOpen: number;
  raDamperOpen: number;
  filterActive: boolean;
  coolingActive: boolean;
  heatingActive: boolean;
  fanOn: boolean;
}

const FRAMES: FrameState[] = [
  {
    title: "Off",
    detail: "AHU is dark. Dampers closed, fan off, valves at neutral.",
    oaDamperOpen: 0,
    raDamperOpen: 0,
    filterActive: false,
    coolingActive: false,
    heatingActive: false,
    fanOn: false,
  },
  {
    title: "Schedule trigger",
    detail: "Occupied schedule fires. Controller commands the startup sequence.",
    oaDamperOpen: 0,
    raDamperOpen: 0,
    filterActive: false,
    coolingActive: false,
    heatingActive: false,
    fanOn: false,
  },
  {
    title: "Dampers open",
    detail: "OA + RA dampers move to startup position. End-switches prove open.",
    oaDamperOpen: 0.4,
    raDamperOpen: 0.6,
    filterActive: false,
    coolingActive: false,
    heatingActive: false,
    fanOn: false,
  },
  {
    title: "Fan starts",
    detail: "Supply fan ramps. Static-pressure control comes online. VAVs unlock.",
    oaDamperOpen: 0.5,
    raDamperOpen: 0.5,
    filterActive: true,
    coolingActive: false,
    heatingActive: false,
    fanOn: true,
  },
  {
    title: "Cooling stages",
    detail: "Discharge-air control engages. Cooling valve opens to hold setpoint.",
    oaDamperOpen: 0.5,
    raDamperOpen: 0.5,
    filterActive: true,
    coolingActive: true,
    heatingActive: false,
    fanOn: true,
  },
  {
    title: "Steady state",
    detail: "Discharge holding setpoint. Zones report satisfied. Trim + respond active.",
    oaDamperOpen: 0.5,
    raDamperOpen: 0.5,
    filterActive: true,
    coolingActive: true,
    heatingActive: false,
    fanOn: true,
  },
];

/**
 * AHU startup sequence. Hand-tuned inline coords.
 *
 *              ┌────────────────────────┐
 *              │  DDC CONTROLLER AHU-1  │
 *              └──┬───┬─────┬─────┬──┬──┘
 *                 :   :     :     :  :
 *      ┌──────┐   :   :     :     :  :
 *      │ RA   ├───┐   :     :     :  :
 *      └──┬───┘   │   :     :     :  :
 *         │       ▼   ▼     ▼     ▼  ▼
 *   OA──[▎]──────[FLT]══[CC]══[HC]══(F)───► SA
 *                                        (Supply fan)
 */
export function AhuStartupSequence({ frame }: AhuStartupSequenceProps) {
  const f = FRAMES[Math.min(frame, FRAMES.length - 1)] ?? FRAMES[0];

  // ============ LAYOUT CONSTANTS ============
  const W = 820;
  const H = 380;

  // Duct band (main horizontal air path)
  const DUCT_X = 30;
  const DUCT_Y = 180;
  const DUCT_H = 70;
  const DUCT_W = W - DUCT_X * 2;
  const DUCT_MID = DUCT_Y + DUCT_H / 2;

  // Controller (top-center)
  const CTRL_X = 540;
  const CTRL_Y = 25;
  const CTRL_W = 160;
  const CTRL_H = 50;

  // OA damper (inlet, far-left)
  const OA_CX = 70;

  // RA damper (drops into mixing box from above as a T-junction)
  const RA_CX = 200;
  const RA_BOX_X = RA_CX - 30;
  const RA_BOX_Y = 80;
  const RA_BOX_W = 60;
  const RA_BOX_H = DUCT_Y - RA_BOX_Y; // extends down to duct top

  // Component slots inside the duct (laid out left → right with breathing room)
  const FLT_X = 270;
  const CC_X = 370;
  const HC_X = 470;
  const COMP_W = 70;
  const FAN_CX = 620;

  // Control wire gutters
  const TOP_GUTTER = 110; // damper wires
  const MID_GUTTER = 145; // coil wires

  return (
    <LabeledSchematic
      width={W}
      height={H}
      kicker={`AHU STARTUP · ${f.title.toUpperCase()}`}
      tag={`FRAME ${frame + 1} / ${FRAMES.length}`}
      labels={[
        { x: OA_CX, text: "OA DAMPER" },
        { x: RA_CX, text: "RA DAMPER" },
        { x: FLT_X + COMP_W / 2, text: "FILTER" },
        { x: CC_X + COMP_W / 2, text: "COOLING" },
        { x: HC_X + COMP_W / 2, text: "HEATING" },
        { x: FAN_CX, text: "SUPPLY FAN" },
      ]}
      legend={[
        { color: COLOR.chwsBlue, label: "CHW" },
        { color: COLOR.hwsRed, label: "HW" },
        { color: COLOR.ink, label: "CONTROL", dashed: true },
        { color: COLOR.punch, label: "AIRFLOW" },
      ]}
      caption={f.detail}
    >
      {/* ===== DUCT (background) — top wall has a gap where RA drops in ===== */}
      <Duct
        x={DUCT_X}
        y={DUCT_Y}
        width={DUCT_W}
        height={DUCT_H}
        flowing={f.fanOn}
        topOpenings={[[RA_BOX_X, RA_BOX_X + RA_BOX_W]]}
      />

      {/* ===== RA enclosure (small duct stub dropping into mixing box from above) ===== */}
      <rect
        x={RA_BOX_X}
        y={RA_BOX_Y}
        width={RA_BOX_W}
        height={RA_BOX_H}
        fill={COLOR.cream}
      />
      <line
        x1={RA_BOX_X}
        y1={RA_BOX_Y}
        x2={RA_BOX_X}
        y2={RA_BOX_Y + RA_BOX_H}
        stroke={COLOR.ink}
        strokeWidth={1.6}
      />
      <line
        x1={RA_BOX_X + RA_BOX_W}
        y1={RA_BOX_Y}
        x2={RA_BOX_X + RA_BOX_W}
        y2={RA_BOX_Y + RA_BOX_H}
        stroke={COLOR.ink}
        strokeWidth={1.6}
      />
      {/* ===== CONTROL WIRES (drawn early so components paint on top) ===== */}
      {/* Controller → OA damper */}
      <Pipe
        medium="control"
        points={[
          [CTRL_X + 20, CTRL_Y + CTRL_H],
          [CTRL_X + 20, TOP_GUTTER],
          [OA_CX, TOP_GUTTER],
          [OA_CX, DUCT_MID],
        ]}
        dash="4 3"
        strokeWidth={1.2}
      />
      {/* Controller → RA damper */}
      <Pipe
        medium="control"
        points={[
          [CTRL_X + 40, CTRL_Y + CTRL_H],
          [CTRL_X + 40, TOP_GUTTER + 10],
          [RA_CX, TOP_GUTTER + 10],
          [RA_CX, RA_BOX_Y + RA_BOX_H / 2],
        ]}
        dash="4 3"
        strokeWidth={1.2}
      />
      {/* Controller → cooling coil valve (terminates at coil TOP edge so the
       *  wire doesn't cross the text inside the block) */}
      <Pipe
        medium="control"
        points={[
          [CTRL_X + 80, CTRL_Y + CTRL_H],
          [CTRL_X + 80, MID_GUTTER],
          [CC_X + COMP_W / 2, MID_GUTTER],
          [CC_X + COMP_W / 2, DUCT_Y + 6],
        ]}
        dash="4 3"
        strokeWidth={1.2}
      />
      {/* Controller → heating coil valve (terminates at coil TOP edge) */}
      <Pipe
        medium="control"
        points={[
          [CTRL_X + 100, CTRL_Y + CTRL_H],
          [CTRL_X + 100, MID_GUTTER + 10],
          [HC_X + COMP_W / 2, MID_GUTTER + 10],
          [HC_X + COMP_W / 2, DUCT_Y + 6],
        ]}
        dash="4 3"
        strokeWidth={1.2}
      />
      {/* Controller → supply fan VFD */}
      <Pipe
        medium="control"
        points={[
          [CTRL_X + 130, CTRL_Y + CTRL_H],
          [CTRL_X + 130, TOP_GUTTER],
          [FAN_CX, TOP_GUTTER],
          [FAN_CX, DUCT_MID],
        ]}
        dash="4 3"
        strokeWidth={1.2}
      />

      {/* ===== DDC CONTROLLER ===== */}
      <Controller
        x={CTRL_X}
        y={CTRL_Y}
        width={CTRL_W}
        height={CTRL_H}
        title="AHU-1"
        active={f.fanOn}
      />

      {/* ===== OA DAMPER (at inlet) ===== */}
      <Damper
        cx={OA_CX}
        cy={DUCT_MID}
        position={f.oaDamperOpen}
        blades={4}
        ductDirection="horizontal"
        acrossDuct={DUCT_H - 10}
        alongDuct={40}
      />

      {/* ===== RA DAMPER (vertical orientation in the drop-in box) ===== */}
      <Damper
        cx={RA_CX}
        cy={RA_BOX_Y + RA_BOX_H / 2}
        position={f.raDamperOpen}
        blades={3}
        ductDirection="vertical"
        acrossDuct={RA_BOX_W - 10}
        alongDuct={28}
      />

      {/* Equipment blocks are inset from the duct walls so the duct's top
       *  and bottom lines stay visible past every component. */}
      {/* ===== FILTER ===== */}
      <Filter
        x={FLT_X}
        y={DUCT_Y + 6}
        width={COMP_W}
        height={DUCT_H - 12}
        active={f.filterActive}
      />

      {/* ===== COOLING COIL ===== */}
      <CoolingCoil
        x={CC_X}
        y={DUCT_Y + 6}
        width={COMP_W}
        height={DUCT_H - 12}
        active={f.coolingActive}
      />
      {/* CHW pipes below cooling coil */}
      <Pipe
        medium="chws"
        points={[
          [CC_X + 14, 320],
          [CC_X + 14, DUCT_Y + DUCT_H],
        ]}
        flowing={f.coolingActive}
      />
      <Pipe
        medium="chwr"
        points={[
          [CC_X + COMP_W - 14, DUCT_Y + DUCT_H],
          [CC_X + COMP_W - 14, 320],
        ]}
        flowing={f.coolingActive}
      />

      {/* ===== HEATING COIL ===== */}
      <HeatingCoil
        x={HC_X}
        y={DUCT_Y + 6}
        width={COMP_W}
        height={DUCT_H - 12}
        active={f.heatingActive}
      />
      {/* HW pipes below heating coil */}
      <Pipe
        medium="hws"
        points={[
          [HC_X + 14, 320],
          [HC_X + 14, DUCT_Y + DUCT_H],
        ]}
        flowing={f.heatingActive}
      />
      <Pipe
        medium="hwr"
        points={[
          [HC_X + COMP_W - 14, DUCT_Y + DUCT_H],
          [HC_X + COMP_W - 14, 320],
        ]}
        flowing={f.heatingActive}
      />

      {/* ===== SUPPLY FAN ===== */}
      <Fan cx={FAN_CX} cy={DUCT_MID} r={26} spinning={f.fanOn} />
    </LabeledSchematic>
  );
}
