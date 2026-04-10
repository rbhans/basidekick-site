"use client";

import { type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ease } from "./tokens";

interface HoverLiftProps {
  children: ReactNode;
  distance?: number;
  className?: string;
}

export function HoverLift({
  children,
  distance = 3,
  className,
}: HoverLiftProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      whileHover={{
        y: -distance,
        boxShadow: "0 8px 25px -5px rgba(0, 0, 0, 0.08)",
      }}
      transition={ease.spring}
    >
      {children}
    </motion.div>
  );
}
