"use client";

import { type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { duration, ease, stagger as staggerTokens, distance } from "./tokens";

interface StaggerGroupProps {
  children: ReactNode;
  stagger?: number;
  delay?: number;
  className?: string;
  once?: boolean;
}

export function StaggerGroup({
  children,
  stagger: staggerDelay = staggerTokens.default,
  delay = 0,
  className,
  once = true,
}: StaggerGroupProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.1 }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: distance.reveal },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: duration.normal, ease: ease.out as unknown as number[] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
