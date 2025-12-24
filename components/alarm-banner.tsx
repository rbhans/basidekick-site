"use client";

import { useState, useEffect } from "react";

const messages = [
  { tag: "SYS", text: "ALL SYSTEMS NOMINAL", status: "ok" },
  { tag: "NSK", text: "847 POINTS VERIFIED", status: "ok" },
  { tag: "NET", text: "UPLINK STABLE", status: "ok" },
  { tag: "DB", text: "LAST SYNC: 2m AGO", status: "ok" },
  { tag: "SSK", text: "3 DEVICES SIMULATED", status: "ok" },
];

export function AlarmBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % messages.length);
        setIsVisible(true);
      }, 200);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const current = messages[currentIndex];

  return (
    <div className="h-6 px-4 bg-card/50 border-b border-border flex items-center justify-center overflow-hidden">
      <div
        className={`font-mono text-xs tracking-wider transition-opacity duration-200 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="text-primary">[{current.tag}]</span>
        <span className="text-muted-foreground ml-2">{current.text}</span>
        <span className="ml-3 inline-block w-2 h-2 bg-primary animate-pulse" />
      </div>
    </div>
  );
}
