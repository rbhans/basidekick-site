"use client";

import { motion } from "motion/react";

interface OccupancyIllustrationProps {
  step: number; // 0..4 — 6am, 9am, noon, 5pm, 10pm
}

const SKY_GRADIENTS = [
  ["#0c1a2b", "#1f2d44"], // 6am — pre-dawn
  ["#fef3c7", "#fde68a"], // 9am — warming
  ["#dbeafe", "#bfdbfe"], // noon — bright
  ["#fed7aa", "#fdba74"], // 5pm — golden
  ["#1e1b4b", "#0f172a"], // 10pm — night
];

const LABELS = ["6:00", "9:00", "12:00", "17:00", "22:00"];
const NARRATIVE = [
  "Unoccupied. Setback temps, fans off, schedule about to wake the building.",
  "Morning warm-up complete. AHUs ramping to occupied setpoints.",
  "Peak occupancy. All systems running, demand response window active.",
  "Tenants leaving. CO₂ dropping, schedule begins unoccupied transition.",
  "Night setback. Lighting off, perimeter heat trim active, alarms armed.",
];

// 25 windows in a 5x5 grid — lit windows vary by time of day to suggest
// occupancy intensity. Indices are stable across steps so they animate
// in/out smoothly.
const LIT_WINDOWS: Record<number, number[]> = {
  0: [], // 6am — building dark
  1: [0, 2, 5, 7, 8, 11, 14, 16, 17, 19, 22],
  2: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
  3: [2, 5, 6, 7, 11, 13, 18, 21, 23],
  4: [1, 19], // 10pm — security + cleaning crew
};

export function OccupancyIllustration({ step }: OccupancyIllustrationProps) {
  const [skyFrom, skyTo] = SKY_GRADIENTS[step] ?? SKY_GRADIENTS[0];
  const lit = new Set(LIT_WINDOWS[step] ?? []);

  return (
    <div className="grid items-center gap-6 sm:grid-cols-[1fr_minmax(0,18rem)]">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] border border-[color:var(--color-border)]">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: `linear-gradient(180deg, ${skyFrom} 0%, ${skyTo} 100%)`,
          }}
          transition={{ duration: 0.4 }}
        />
        <svg
          viewBox="0 0 400 300"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          {/* Ground */}
          <rect x="0" y="240" width="400" height="60" fill="#3f3f46" />
          {/* Building */}
          <rect
            x="120"
            y="80"
            width="160"
            height="160"
            fill="#52525b"
            stroke="#27272a"
            strokeWidth="1"
          />
          {/* Windows — 5x5 grid */}
          {Array.from({ length: 25 }).map((_, i) => {
            const col = i % 5;
            const row = Math.floor(i / 5);
            const x = 132 + col * 28;
            const y = 92 + row * 28;
            const isLit = lit.has(i);
            return (
              <motion.rect
                key={i}
                x={x}
                y={y}
                width="18"
                height="18"
                animate={{
                  fill: isLit ? "#fde68a" : "#1f2937",
                  opacity: isLit ? 1 : 0.85,
                }}
                transition={{ duration: 0.3 }}
              />
            );
          })}
          {/* Roof box (HVAC) */}
          <rect x="170" y="60" width="60" height="20" fill="#27272a" />
          <rect x="186" y="44" width="6" height="16" fill="#27272a" />
          <rect x="208" y="44" width="6" height="16" fill="#27272a" />
        </svg>
      </div>
      <div>
        <p className="font-serif text-3xl font-semibold tabular-nums tracking-tight text-[color:var(--color-fg)]">
          {LABELS[step]}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
          {NARRATIVE[step]}
        </p>
      </div>
    </div>
  );
}
