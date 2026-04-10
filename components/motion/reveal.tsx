"use client";

import { type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { duration, ease, distance as distanceTokens } from "./tokens";

type Direction = "up" | "down" | "left" | "right";

interface RevealProps {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  distance?: number;
  duration?: number;
  once?: boolean;
  className?: string;
}

const offsets: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 1 },
  down: { x: 0, y: -1 },
  left: { x: 1, y: 0 },
  right: { x: -1, y: 0 },
};

export function Reveal({
  children,
  direction = "up",
  delay = 0,
  distance = distanceTokens.reveal,
  duration: dur = duration.normal,
  once = true,
  className,
}: RevealProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  const offset = offsets[direction];

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: offset.x * distance, y: offset.y * distance }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, amount: 0.2 }}
      transition={{ duration: dur, ease: ease.out as unknown as number[], delay }}
    >
      {children}
    </motion.div>
  );
}
