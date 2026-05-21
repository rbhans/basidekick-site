"use client";

import { motion } from "motion/react";
import {
  EquipmentBlock,
  Schematic,
  centered,
  spanned,
  COLOR,
} from "@/components/learn/shapes";

/**
 * Zone temperature → comparator → PI → damper. Composed on the engine.
 */
export function ControlLoopDiagram() {
  return (
    <Schematic
      width={560}
      columns={12}
      kicker="CONTROL LOOP · ZONE TEMPERATURE"
      lanes={[
        { id: "setpt", height: 50 },
        { id: "body", height: 80 },
        { id: "feedback", height: 30 },
      ]}
      slots={[
        // Setpoint sits in its own lane above the comparator.
        {
          id: "setpt",
          lane: "setpt",
          col: 5,
          span: 2,
          render: (b) => (
            <EquipmentBlock
              {...spanned(b)}
              variant="neutral"
              kicker="SETPT"
              title="72°F"
            />
          ),
        },
        // Sensor, comparator, controller, output in the body lane.
        {
          id: "sensor",
          lane: "body",
          col: 1,
          span: 2,
          render: (b) => (
            <EquipmentBlock
              {...spanned(b)}
              variant="neutral"
              kicker="SENSOR"
              title="ZN_TEMP"
            />
          ),
        },
        {
          id: "cmp",
          lane: "body",
          col: 5,
          span: 1,
          render: (b) => {
            const c = centered(b);
            return (
              <g>
                <circle
                  cx={c.cx}
                  cy={c.cy}
                  r={18}
                  fill={COLOR.sand}
                  stroke={COLOR.ink}
                  strokeWidth={1.4}
                />
                <text
                  x={c.cx - 7}
                  y={c.cy + 3}
                  fontSize="14"
                  textAnchor="middle"
                  style={{ fill: COLOR.ink, fontWeight: 600 }}
                >
                  +
                </text>
                <text
                  x={c.cx + 7}
                  y={c.cy + 3}
                  fontSize="14"
                  textAnchor="middle"
                  style={{ fill: COLOR.ink, fontWeight: 600 }}
                >
                  −
                </text>
              </g>
            );
          },
        },
        {
          id: "ctrl",
          lane: "body",
          col: 7,
          span: 2,
          render: (b) => (
            <EquipmentBlock
              {...spanned(b)}
              variant="active"
              kicker="CTRL"
              title="PI"
            />
          ),
        },
        {
          id: "output",
          lane: "body",
          col: 11,
          span: 2,
          render: (b) => (
            <EquipmentBlock
              {...spanned(b)}
              variant="neutral"
              kicker="OUTPUT"
              title="DMPR"
            />
          ),
        },
        // Animated dot traversing the loop.
        {
          id: "flow",
          lane: "body",
          col: 1,
          span: 12,
          render: (b) => {
            const cellW = b.width / 12;
            const cy = b.y + b.height / 2;
            const xs = [
              b.x + 2 * cellW,
              b.x + 4 * cellW + cellW / 2,
              b.x + 5 * cellW + cellW / 2,
              b.x + 8 * cellW + cellW,
              b.x + 10 * cellW + cellW,
            ];
            return (
              <motion.circle
                r={3}
                fill={COLOR.punch}
                animate={{ cx: xs, cy: [cy, cy, cy, cy, cy] }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            );
          },
        },
      ]}
      connects={[
        { from: "sensor.E", to: "cmp.W", medium: "control", strokeWidth: 1.4 },
        { from: "setpt.S", to: "cmp.N", medium: "control", strokeWidth: 1.4 },
        { from: "cmp.E", to: "ctrl.W", medium: "control", strokeWidth: 1.4 },
        { from: "ctrl.E", to: "output.W", medium: "control", strokeWidth: 1.4 },
        // Feedback path: output back to sensor.
        {
          from: "output.S",
          to: "sensor.S",
          medium: "control",
          dash: "4 3",
          strokeWidth: 1.2,
        },
      ]}
      labels={[
        { slot: "sensor", text: "SENSOR" },
        { slot: "setpt", text: "SETPOINT" },
        { slot: "ctrl", text: "CONTROLLER" },
        { slot: "output", text: "OUTPUT" },
      ]}
      legend={[
        { color: COLOR.ink, label: "SIGNAL" },
        { color: COLOR.punch, label: "ACTIVE LOOP" },
      ]}
    />
  );
}
