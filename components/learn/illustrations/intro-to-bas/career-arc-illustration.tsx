"use client";

import { motion } from "motion/react";
import { LabeledSchematic, COLOR } from "@/components/learn/shapes";

interface CareerArcIllustrationProps {
  step: number; // 0..4 — year buckets
}

interface StageMix {
  field: number;
  desk: number;
  design: number;
  lead: number;
}

const STAGES: Array<{
  bucket: string;
  role: string;
  detail: string;
  mix: StageMix;
}> = [
  {
    bucket: "Year 0–2",
    role: "Field technician",
    detail: "Mounting controllers, terminating panels, walking down points.",
    mix: { field: 80, desk: 15, design: 0, lead: 5 },
  },
  {
    bucket: "Year 2–4",
    role: "Programmer",
    detail: "Writing sequences, building graphics, learning one platform deep.",
    mix: { field: 45, desk: 45, design: 5, lead: 5 },
  },
  {
    bucket: "Year 4–7",
    role: "Lead engineer",
    detail: "Owning BAS scope on whole buildings, mentoring, writing RFIs.",
    mix: { field: 25, desk: 40, design: 15, lead: 20 },
  },
  {
    bucket: "Year 7–10",
    role: "Senior / specialist",
    detail: "Designer, MSI, analytics lead, or owner's-rep. Pick a direction.",
    mix: { field: 15, desk: 35, design: 30, lead: 20 },
  },
  {
    bucket: "Year 10+",
    role: "Principal / consultant",
    detail: "Department head, principal designer, in-house director, or independent.",
    mix: { field: 10, desk: 25, design: 30, lead: 35 },
  },
];

const CATEGORY = [
  { key: "field" as const, label: "FIELD", color: COLOR.cwsGreen },
  { key: "desk" as const, label: "DESK", color: COLOR.chwsBlue },
  { key: "design" as const, label: "DESIGN", color: COLOR.refrigerant },
  { key: "lead" as const, label: "LEAD", color: COLOR.hwsRed },
];

export function CareerArcIllustration({ step }: CareerArcIllustrationProps) {
  const safe = Math.min(step, STAGES.length - 1);
  const stage = STAGES[safe];

  return (
    <LabeledSchematic
      width={520}
      height={300}
      kicker={`CAREER MIX · ${stage.bucket.toUpperCase()}`}
      tag={stage.role.toUpperCase()}
      labels={STAGES.map((s, i) => ({
        x: 60 + i * 90 + 25,
        text: s.bucket,
      }))}
      legend={CATEGORY.map((c) => ({ color: c.color, label: c.label }))}
    >
      {/* Baseline */}
      <line
        x1={40}
        y1={220}
        x2={500}
        y2={220}
        stroke={COLOR.borderStrong}
        strokeWidth={1}
      />

      {/* Stacked bars per stage */}
      {STAGES.map((s, idx) => {
        const x = 60 + idx * 90;
        let cumY = 220;
        return (
          <g key={s.bucket} opacity={idx === safe ? 1 : 0.4}>
            {CATEGORY.map((c) => {
              const h = s.mix[c.key] * 1.4;
              const segY = cumY - h;
              const rect = (
                <motion.rect
                  key={c.key}
                  x={x}
                  width={50}
                  fill={c.color}
                  rx={2}
                  initial={false}
                  animate={{ y: segY, height: h }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                />
              );
              cumY = segY;
              return rect;
            })}
          </g>
        );
      })}

      {/* Detail caption */}
      <text
        x={20}
        y={278}
        fontSize="11"
        style={{
          fill: "var(--ink-2)",
          fontFamily: "var(--font-sans)",
          fontStyle: "italic",
        }}
      >
        {stage.detail}
      </text>
    </LabeledSchematic>
  );
}
