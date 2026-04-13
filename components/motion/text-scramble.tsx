"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useReducedMotion } from "motion/react";

interface TextScrambleProps {
  text: string;
  className?: string;
  duration?: number;
  as?: "span" | "h3" | "div";
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-·";

export function TextScramble({
  text,
  className,
  duration = 800,
  as: Tag = "span",
}: TextScrambleProps) {
  const [display, setDisplay] = useState(text);
  const animRef = useRef<number | null>(null);
  const prefersReduced = useReducedMotion();

  const scramble = useCallback(
    (newText: string) => {
      if (prefersReduced) {
        setDisplay(newText);
        return;
      }

      const oldText = display;
      const length = Math.max(oldText.length, newText.length);
      const startTime = performance.now();

      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);

        let result = "";
        for (let i = 0; i < length; i++) {
          const charProgress = Math.max(0, (progress * length - i) / (length * 0.3));

          if (charProgress >= 1) {
            result += newText[i] ?? "";
          } else if (i < newText.length) {
            result += CHARS[Math.floor(Math.random() * CHARS.length)];
          }
        }

        setDisplay(result);

        if (progress < 1) {
          animRef.current = requestAnimationFrame(step);
        } else {
          setDisplay(newText);
        }
      };

      if (animRef.current) cancelAnimationFrame(animRef.current);
      animRef.current = requestAnimationFrame(step);
    },
    [display, duration, prefersReduced]
  );

  useEffect(() => {
    scramble(text);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
    // Only trigger on text change, not on scramble ref change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return <Tag className={className}>{display}</Tag>;
}
