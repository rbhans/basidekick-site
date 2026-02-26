"use client";

import { useMemo } from "react";

/**
 * Decorative scattered marks (crosses, dots, dashes, angles)
 * rendered as absolutely-positioned SVG elements across the hero.
 * Uses deterministic seeded RNG so marks are stable across renders.
 */

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

type Mark = {
  id: number;
  x: number; // percent
  y: number; // percent
  type: "cross" | "dot" | "dash" | "angle" | "ring";
  rotation: number;
  opacity: number;
  size: number;
};

function generateMarks(count: number, seed: number): Mark[] {
  const rand = seededRandom(seed);
  const marks: Mark[] = [];
  const types: Mark["type"][] = ["cross", "dot", "dash", "angle", "ring"];

  for (let i = 0; i < count; i++) {
    marks.push({
      id: i,
      x: rand() * 100,
      y: rand() * 100,
      type: types[Math.floor(rand() * types.length)],
      rotation: rand() * 360,
      opacity: 0.06 + rand() * 0.12,
      size: 6 + rand() * 10,
    });
  }
  return marks;
}

function MarkShape({ type, size }: { type: Mark["type"]; size: number }) {
  const half = size / 2;
  const stroke = "currentColor";
  const sw = 1;

  switch (type) {
    case "cross":
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <line x1={half} y1={0} x2={half} y2={size} stroke={stroke} strokeWidth={sw} />
          <line x1={0} y1={half} x2={size} y2={half} stroke={stroke} strokeWidth={sw} />
        </svg>
      );
    case "dot":
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={half} cy={half} r={size * 0.25} fill={stroke} />
        </svg>
      );
    case "dash":
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <line x1={0} y1={half} x2={size} y2={half} stroke={stroke} strokeWidth={sw} />
        </svg>
      );
    case "angle":
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <polyline
            points={`${size * 0.2},${size * 0.8} ${size * 0.5},${size * 0.2} ${size * 0.8},${size * 0.8}`}
            fill="none"
            stroke={stroke}
            strokeWidth={sw}
          />
        </svg>
      );
    case "ring":
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={half} cy={half} r={size * 0.35} fill="none" stroke={stroke} strokeWidth={sw} />
        </svg>
      );
  }
}

export function HeroMarks({ count = 40, seed = 42 }: { count?: number; seed?: number }) {
  const marks = useMemo(() => generateMarks(count, seed), [count, seed]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
      {marks.map((m) => (
        <div
          key={m.id}
          className="absolute text-primary"
          style={{
            left: `${m.x}%`,
            top: `${m.y}%`,
            opacity: m.opacity,
            transform: `rotate(${m.rotation}deg)`,
          }}
        >
          <MarkShape type={m.type} size={m.size} />
        </div>
      ))}
    </div>
  );
}
