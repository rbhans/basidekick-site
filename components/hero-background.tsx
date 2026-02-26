"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const HERO_IMAGES = [
  "/images/hero/hero-1.png",
  "/images/hero/hero-2.png",
  "/images/hero/hero-3.png",
];

const CYCLE_INTERVAL = 8000; // ms between transitions
const FADE_DURATION = 2000; // ms for crossfade

export function HeroBackground() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState<number | null>(null);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setNextIndex((activeIndex + 1) % HERO_IMAGES.length);
      setFading(true);

      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % HERO_IMAGES.length);
        setNextIndex(null);
        setFading(false);
      }, FADE_DURATION);
    }, CYCLE_INTERVAL);

    return () => clearInterval(interval);
  }, [activeIndex]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {/* Active image */}
      <div
        className="absolute inset-0 transition-opacity"
        style={{
          opacity: fading ? 0 : 1,
          transitionDuration: `${FADE_DURATION}ms`,
        }}
      >
        <Image
          src={HERO_IMAGES[activeIndex]}
          alt=""
          fill
          className="object-cover object-center"
          priority={activeIndex === 0}
          sizes="100vw"
        />
      </div>

      {/* Next image (crossfade in) */}
      {nextIndex !== null && (
        <div
          className="absolute inset-0 transition-opacity"
          style={{
            opacity: fading ? 1 : 0,
            transitionDuration: `${FADE_DURATION}ms`,
          }}
        >
          <Image
            src={HERO_IMAGES[nextIndex]}
            alt=""
            fill
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>
      )}

      {/* Transparency overlay — makes the image subtle */}
      <div className="absolute inset-0 bg-background/75" />

      {/* Edge fade — all sides fade to background */}
      <div
        className="absolute inset-0"
        style={{
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 70%)",
        }}
      >
        {/* This layer shows through the mask — re-reveal the image slightly */}
      </div>

      {/* Bottom hard fade to background */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-background via-background/80 to-transparent" />

      {/* Top soft fade */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-background/60 to-transparent" />

      {/* Side fades */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent" />
    </div>
  );
}
