"use client";

import { type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ease } from "./tokens";

interface PressScaleProps {
  children: ReactNode;
  scale?: number;
  className?: string;
}

export function PressScale({
  children,
  scale = 0.97,
  className,
}: PressScaleProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      whileTap={{ scale }}
      transition={ease.spring}
    >
      {children}
    </motion.div>
  );
}
