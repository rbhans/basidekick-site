"use client";

import { motion } from "motion/react";
import {
  EquipmentBlock,
  LabeledSchematic,
  COLOR,
} from "@/components/learn/shapes";

interface ProtocolStackIllustrationProps {
  step: number; // 0..3
}

const PROTOCOLS = [
  {
    name: "BACnet/IP",
    tag: "Dominant on modern commercial",
    detail:
      "Objects + services carried over standard IP. Default at supervisor layer.",
    layers: {
      application: "BACnet objects + services",
      network: "UDP/IP (port 47808)",
      dataLink: "Ethernet frames",
      physical: "Ethernet (Cat5e/6)",
    },
    accent: COLOR.chwsBlue,
  },
  {
    name: "BACnet MS/TP",
    tag: "Terminal-unit networks",
    detail:
      "Same BACnet semantics, cheaper wiring. Workhorse on dense VAV trunks.",
    layers: {
      application: "BACnet objects + services",
      network: "Same BACnet net #",
      dataLink: "Token-passing master/slave",
      physical: "RS-485 twisted pair",
    },
    accent: COLOR.cwsGreen,
  },
  {
    name: "Modbus TCP",
    tag: "Meters, chillers, third-party",
    detail: "Registers at addresses. No object model. Bridges to BAS via gateway.",
    layers: {
      application: "Register read/write",
      network: "TCP/IP (port 502)",
      dataLink: "Ethernet frames",
      physical: "Ethernet (Cat5e/6)",
    },
    accent: COLOR.hwsRed,
  },
  {
    name: "MQTT",
    tag: "Analytics, IoT, cloud",
    detail: "Pub/sub for streaming telemetry. Lives above the BAS, not inside.",
    layers: {
      application: "Publish / subscribe topics",
      network: "TCP/IP (port 1883 / 8883)",
      dataLink: "Ethernet / cellular",
      physical: "Ethernet / cellular / wifi",
    },
    accent: COLOR.refrigerant,
  },
];

const LAYERS = [
  { key: "application", label: "APPLICATION" },
  { key: "network", label: "NETWORK" },
  { key: "dataLink", label: "DATA LINK" },
  { key: "physical", label: "PHYSICAL" },
] as const;

export function ProtocolStackIllustration({
  step,
}: ProtocolStackIllustrationProps) {
  const p = PROTOCOLS[Math.min(step, PROTOCOLS.length - 1)] ?? PROTOCOLS[0];
  return (
    <LabeledSchematic
      width={520}
      height={340}
      kicker={`${p.name.toUpperCase()} · 4-LAYER STACK`}
      tag={p.tag.toUpperCase()}
      legend={[
        { color: p.accent, label: p.name.toUpperCase() },
        { color: COLOR.ink, label: "STACK FRAME" },
      ]}
    >
      {LAYERS.map((layer, idx) => {
        const y = 30 + idx * 70;
        const text = p.layers[layer.key as keyof typeof p.layers];
        return (
          <g key={layer.key}>
            {/* Layer name on the left */}
            <text
              x={20}
              y={y + 30}
              fontSize="10"
              style={{
                fill: COLOR.inkMuted,
                fontFamily: "var(--font-mono)",
                fontWeight: 600,
                letterSpacing: "0.14em",
              }}
            >
              {layer.label}
            </text>
            {/* Bar */}
            <motion.rect
              x={140}
              y={y}
              width={360}
              height={56}
              rx={6}
              fill={p.accent}
              initial={false}
              animate={{ opacity: 0.18 + idx * 0.06 }}
              transition={{ duration: 0.3 }}
            />
            <rect
              x={140}
              y={y}
              width={360}
              height={56}
              rx={6}
              fill="none"
              stroke={COLOR.ink}
              strokeOpacity={0.18}
              strokeWidth={1}
            />
            {/* Layer payload */}
            <motion.text
              key={`${p.name}-${layer.key}`}
              x={320}
              y={y + 33}
              fontSize="13"
              textAnchor="middle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
              style={{
                fill: COLOR.ink,
                fontFamily: "var(--font-sans)",
                fontWeight: 600,
              }}
            >
              {text}
            </motion.text>
          </g>
        );
      })}

      {/* Detail caption */}
      <text
        x={20}
        y={320}
        fontSize="11"
        style={{
          fill: "var(--ink-2)",
          fontFamily: "var(--font-sans)",
          fontStyle: "italic",
        }}
      >
        {p.detail}
      </text>
    </LabeledSchematic>
  );
}
