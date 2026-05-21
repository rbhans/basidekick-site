"use client";

import {
  EquipmentBlock,
  Fan,
  Pump,
  Schematic,
  centered,
  spanned,
  fitRadius,
  COLOR,
  PRIMITIVE_ANCHORS,
} from "@/components/learn/shapes";

interface ChillerPlantSchematicProps {
  frame: number; // 0..4
}

interface FrameState {
  title: string;
  detail: string;
  chwPumps: boolean;
  cwPumps: boolean;
  towerFan: boolean;
  chiller1: boolean;
  chiller2: boolean;
}

const FRAMES: FrameState[] = [
  {
    title: "Plant off",
    detail: "All pumps idle, both chillers off, tower fan off.",
    chwPumps: false,
    cwPumps: false,
    towerFan: false,
    chiller1: false,
    chiller2: false,
  },
  {
    title: "Plant enable",
    detail: "Load crosses enable threshold. CHW pumps start.",
    chwPumps: true,
    cwPumps: false,
    towerFan: false,
    chiller1: false,
    chiller2: false,
  },
  {
    title: "Flow proven",
    detail: "Differential pressure confirms flow. CW pumps start.",
    chwPumps: true,
    cwPumps: true,
    towerFan: false,
    chiller1: false,
    chiller2: false,
  },
  {
    title: "Lead chiller on",
    detail: "Chiller 1 ramps. Tower fan stages with it.",
    chwPumps: true,
    cwPumps: true,
    towerFan: true,
    chiller1: true,
    chiller2: false,
  },
  {
    title: "Trim + reset",
    detail: "Load builds. Second chiller stages. BAS trims setpoints.",
    chwPumps: true,
    cwPumps: true,
    towerFan: true,
    chiller1: true,
    chiller2: true,
  },
];

/**
 * Chilled-water plant startup. Five frames driven by `frame` prop.
 * Composed declaratively on the Schematic engine.
 */
export function ChillerPlantSchematic({ frame }: ChillerPlantSchematicProps) {
  const f = FRAMES[Math.min(frame, FRAMES.length - 1)] ?? FRAMES[0];

  return (
    <Schematic
      width={820}
      columns={12}
      kicker={`PLANT · ${f.title.toUpperCase()}`}
      tag={`FRAME ${frame + 1} / ${FRAMES.length}`}
      caption={f.detail}
      lanes={[
        { id: "equip", height: 130 },
        { id: "pumps", height: 80 },
      ]}
      slots={[
        // ---- Equipment lane ----
        {
          id: "tower",
          lane: "equip",
          col: 1,
          span: 2,
          render: (b) => (
            <>
              <EquipmentBlock
                {...spanned(b)}
                variant="neutral"
                kicker="COOLING TOWER"
                title="CT-1"
                active={f.towerFan}
              />
              <Fan
                cx={b.x + b.width / 2}
                cy={b.y + b.height * 0.65}
                r={fitRadius(b, 0.18)}
                spinning={f.towerFan}
                color={COLOR.ink}
              />
            </>
          ),
        },
        {
          id: "ch1",
          lane: "equip",
          col: 5,
          span: 3,
          render: (b) => (
            <EquipmentBlock
              x={b.x}
              y={b.y}
              width={b.width}
              height={b.height * 0.45}
              variant="cooling"
              kicker="CHILLER"
              title="CH-1"
              sub={f.chiller1 ? "ON" : "OFF"}
              active={f.chiller1}
            />
          ),
        },
        {
          id: "ch2",
          lane: "equip",
          col: 5,
          span: 3,
          render: (b) => (
            <EquipmentBlock
              x={b.x}
              y={b.y + b.height * 0.55}
              width={b.width}
              height={b.height * 0.45}
              variant="cooling"
              kicker="CHILLER"
              title="CH-2"
              sub={f.chiller2 ? "ON" : "OFF"}
              active={f.chiller2}
            />
          ),
        },
        {
          id: "load",
          lane: "equip",
          col: 11,
          span: 2,
          render: (b) => (
            <EquipmentBlock
              {...spanned(b)}
              variant="neutral"
              kicker="LOAD"
              title="BLDG"
              sub={f.chiller1 || f.chiller2 ? "COOLING" : "IDLE"}
              active={f.chiller1 || f.chiller2}
            />
          ),
        },
        // ---- Pumps lane ----
        {
          id: "cw-pump",
          lane: "pumps",
          col: 3,
          span: 1,
          anchors: PRIMITIVE_ANCHORS.pump,
          render: (b) => {
            const c = centered(b);
            return (
              <Pump
                {...c}
                r={fitRadius(b, 0.35)}
                spinning={f.cwPumps}
                label="CW-P"
              />
            );
          },
        },
        {
          id: "chw-pump",
          lane: "pumps",
          col: 9,
          span: 1,
          anchors: PRIMITIVE_ANCHORS.pump,
          render: (b) => {
            const c = centered(b);
            return (
              <Pump
                {...c}
                r={fitRadius(b, 0.35)}
                spinning={f.chwPumps}
                label="CHW-P"
              />
            );
          },
        },
      ]}
      connects={[
        // CW LOOP (green) — tower ↔ chillers via dedicated lane below.
        // Supply: tower.S → cw-pump → chiller west side (mid-Y = lane gutter).
        { from: "tower.S", to: "cw-pump.W", medium: "cws", flowing: f.cwPumps },
        { from: "cw-pump.N", to: "ch1.W", medium: "cws", flowing: f.cwPumps },
        // Return: chillers top → up + over the canvas → tower top.
        {
          from: "ch1.N",
          to: "tower.N",
          medium: "cwr",
          flowing: f.cwPumps,
          midY: 8,
        },

        // CHW LOOP (blue) — chillers ↔ building, routed through the pump lane.
        // Supply: chillers east → down → CHW pump → building.
        {
          from: "ch1.E",
          to: "chw-pump.N",
          medium: "chws",
          flowing: f.chwPumps,
          midX: 580,
        },
        { from: "chw-pump.E", to: "load.W", medium: "chws", flowing: f.chwPumps },
        // Return: building south → bottom gutter → chiller south.
        {
          from: "load.S",
          to: "ch2.S",
          medium: "chwr",
          flowing: f.chwPumps,
          midY: 250,
        },
      ]}
      labels={[
        { slot: "tower", text: "COOLING TOWER" },
        { slot: "ch1", text: "CHILLERS" },
        { slot: "chw-pump", text: "CHW PUMP" },
        { slot: "cw-pump", text: "CW PUMP" },
        { slot: "load", text: "BUILDING" },
      ]}
      legend={[
        { color: COLOR.chwsBlue, label: "CHW SUPPLY" },
        { color: COLOR.chwrBlue, label: "CHW RETURN" },
        { color: COLOR.cwsGreen, label: "CW SUPPLY" },
        { color: COLOR.cwrGreen, label: "CW RETURN" },
      ]}
    />
  );
}
