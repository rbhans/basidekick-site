"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const HERO_IMAGES = [
  "/images/hero/hero-1.png",
  "/images/hero/hero-2.png",
  "/images/hero/hero-3.png",
  "/images/hero/hero-main.png",
];

const CYCLE_INTERVAL = 8000;
const FADE_DURATION = 2000;

export function HeroBackground() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, CYCLE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {/* All images stacked — only the active one is visible */}
      {HERO_IMAGES.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0"
          style={{
            opacity: i === activeIndex ? 1 : 0,
            transition: `opacity ${FADE_DURATION}ms ease-in-out`,
          }}
        >
          <Image
            src={src}
            alt=""
            fill
            className="object-cover object-center"
            priority={i === 0}
            sizes="100vw"
          />
        </div>
      ))}

      {/* Heavy overlay — images are very faint, fading into background */}
      <div className="absolute inset-0 bg-background/80 dark:bg-background/80" />

      {/* Radial vignette — image only visible in a soft center ellipse */}
      <div
        className="absolute inset-0 bg-background"
        style={{
          maskImage:
            "radial-gradient(ellipse 65% 55% at 50% 35%, transparent 15%, black 65%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 65% 55% at 50% 35%, transparent 15%, black 65%)",
        }}
      />

      {/* Bottom hard fade */}
      <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-background via-background/90 to-transparent" />

      {/* Top fade */}
      <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-background/70 to-transparent" />

      {/* Side fades */}
      <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-background to-transparent" />
      <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-background to-transparent" />

      {/* Light mode: subtle warm tint over the hero area */}
      <div className="absolute inset-0 bg-primary/[0.03] dark:bg-transparent" />
    </div>
  );
}
