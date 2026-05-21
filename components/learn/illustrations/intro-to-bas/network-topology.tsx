"use client";

import { motion } from "motion/react";
import {
  EquipmentBlock,
  Schematic,
  spanned,
  COLOR,
} from "@/components/learn/shapes";

interface NetworkTopologyProps {
  frame: number; // 0..4
}

const NODES = ["browser", "supervisor", "bc", "vav"] as const;
type NodeId = (typeof NODES)[number];

const FRAMES: Array<{
  title: string;
  detail: string;
  active: NodeId | null;
  packet: { from: NodeId; to: NodeId; label?: string } | null;
}> = [
  {
    title: "1 · Operator opens graphic",
    detail: "Browser requests ZN_TEMP from supervisor over HTTP.",
    active: "browser",
    packet: { from: "browser", to: "supervisor", label: "HTTP" },
  },
  {
    title: "2 · Supervisor reads cache miss",
    detail: "Supervisor issues BACnet/IP ReadProperty to building controller.",
    active: "supervisor",
    packet: { from: "supervisor", to: "bc", label: "BACnet/IP" },
  },
  {
    title: "3 · Building controller polls MS/TP",
    detail: "BC becomes master on MS/TP and forwards the request.",
    active: "bc",
    packet: { from: "bc", to: "vav", label: "MS/TP" },
  },
  {
    title: "4 · VAV controller responds",
    detail: "VAV reads AI-1, formats BACnet reply, sends back on the trunk.",
    active: "vav",
    packet: { from: "vav", to: "bc", label: "72.4°F" },
  },
  {
    title: "5 · Reply travels back",
    detail: "BC wraps in BACnet/IP, supervisor caches, browser renders.",
    active: "browser",
    packet: { from: "supervisor", to: "browser", label: "72.4°F" },
  },
];

// Each node lives in its own column slot. Slot columns chosen for even spacing
// across 12 columns: 2, 5, 8, 11.
const NODE_COL: Record<NodeId, number> = {
  browser: 2,
  supervisor: 5,
  bc: 8,
  vav: 11,
};

export function NetworkTopology({ frame }: NetworkTopologyProps) {
  const f = FRAMES[Math.min(frame, FRAMES.length - 1)] ?? FRAMES[0];

  return (
    <Schematic
      width={680}
      columns={12}
      kicker={f.title.toUpperCase()}
      tag={`FRAME ${frame + 1} / ${FRAMES.length}`}
      caption={f.detail}
      lanes={[{ id: "row", height: 90 }]}
      slots={[
        {
          id: "browser",
          lane: "row",
          col: NODE_COL.browser,
          span: 2,
          render: (b) => (
            <EquipmentBlock
              {...spanned(b)}
              variant={f.active === "browser" ? "active" : "neutral"}
              kicker="BROWSER"
              title="OPERATOR"
            />
          ),
        },
        {
          id: "supervisor",
          lane: "row",
          col: NODE_COL.supervisor,
          span: 2,
          render: (b) => (
            <EquipmentBlock
              {...spanned(b)}
              variant={f.active === "supervisor" ? "active" : "control"}
              kicker="SERVER"
              title="SUPERVISOR"
            />
          ),
        },
        {
          id: "bc",
          lane: "row",
          col: NODE_COL.bc,
          span: 2,
          render: (b) => (
            <EquipmentBlock
              {...spanned(b)}
              variant={f.active === "bc" ? "active" : "control"}
              kicker="JACE / BC"
              title="BLDG CTRL"
            />
          ),
        },
        {
          id: "vav",
          lane: "row",
          col: NODE_COL.vav,
          span: 2,
          render: (b) => (
            <EquipmentBlock
              {...spanned(b)}
              variant={f.active === "vav" ? "active" : "neutral"}
              kicker="MS/TP"
              title="VAV CTRL"
            />
          ),
        },
        // Animated packet — rendered in a dummy slot so the engine handles
        // viewBox sizing. Drawn at absolute coords because the packet path
        // doesn't fit the slot-anchor model.
        {
          id: "packet",
          lane: "row",
          col: 1,
          span: 12,
          render: (b) => {
            if (!f.packet) return null;
            const cellW = b.width / 12;
            const fromX =
              b.x + (NODE_COL[f.packet.from] - 1) * cellW + cellW;
            const toX =
              b.x + (NODE_COL[f.packet.to] - 1) * cellW + cellW;
            const y = b.y + b.height / 2 - 20;
            return (
              <motion.g
                key={`${frame}-${f.packet.from}-${f.packet.to}`}
                initial={{ translateX: fromX, opacity: 0 }}
                animate={{
                  translateX: [fromX, toX],
                  opacity: [0, 1, 1, 0],
                }}
                transition={{
                  duration: 1.4,
                  times: [0, 0.15, 0.85, 1],
                  ease: "easeInOut",
                }}
                style={{ translateY: y }}
              >
                <rect
                  x={-22}
                  y={-9}
                  width={44}
                  height={18}
                  rx={3}
                  fill={COLOR.punch}
                />
                <text
                  x={0}
                  y={4}
                  fontSize="9"
                  textAnchor="middle"
                  style={{
                    fill: COLOR.cream,
                    fontFamily: "var(--font-mono)",
                    fontWeight: 600,
                  }}
                >
                  {f.packet.label ?? "pkt"}
                </text>
              </motion.g>
            );
          },
        },
      ]}
      connects={[
        { from: "browser.E", to: "supervisor.W", medium: "control", strokeWidth: 1.6 },
        { from: "supervisor.E", to: "bc.W", medium: "chws", strokeWidth: 2 },
        { from: "bc.E", to: "vav.W", medium: "cws", strokeWidth: 2, dash: "6 3" },
      ]}
      labels={[
        { slot: "browser", text: "OPERATOR" },
        { slot: "supervisor", text: "SUPERVISOR" },
        { slot: "bc", text: "BUILDING CTRL" },
        { slot: "vav", text: "VAV CTRL" },
      ]}
      legend={[
        { color: COLOR.ink, label: "HTTP" },
        { color: COLOR.chwsBlue, label: "BACnet/IP" },
        { color: COLOR.cwsGreen, label: "MS/TP" },
        { color: COLOR.punch, label: "ACTIVE" },
      ]}
    />
  );
}
