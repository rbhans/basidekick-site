"use client";

import { useEffect, useState } from "react";

interface CircuitBackgroundProps {
  className?: string;
  opacity?: number;
}

export function CircuitBackground({ className = "", opacity = 0.15 }: CircuitBackgroundProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial theme
    setIsDark(document.documentElement.classList.contains("dark"));

    // Watch for theme changes
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Amber colors: dark=#fbbf24, light=#d97706
  // Light mode needs higher opacity to be visible
  const color = isDark ? "251, 191, 36" : "217, 119, 6";
  const adjustedOpacity = isDark ? opacity : opacity * 2.5;

  return (
    <div
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        zIndex: 0,
        backgroundImage: `radial-gradient(circle at center, rgba(${color}, ${adjustedOpacity}) 1.5px, transparent 1.5px)`,
        backgroundSize: "20px 20px",
      }}
    />
  );
}
