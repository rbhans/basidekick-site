"use client";

import { useEffect, useRef, useState } from "react";

interface CircuitBackgroundProps {
  className?: string;
  opacity?: number;
  colorGradient?: boolean; // Enable multi-color gradient (default: amber only)
}

// Color palette matching site theme (RGB values)
const COLORS = {
  dark: {
    amber: [251, 191, 36],   // Primary - #fbbf24
    cyan: [34, 211, 238],    // Tools - cyan-400
    violet: [167, 139, 250], // Resources - violet-400
    blue: [96, 165, 250],    // Wiki - blue-400
    emerald: [52, 211, 153], // Forum - emerald-400
  },
  light: {
    amber: [217, 119, 6],    // Primary - #d97706
    cyan: [6, 182, 212],     // Tools - cyan-500
    violet: [139, 92, 246],  // Resources - violet-500
    blue: [59, 130, 246],    // Wiki - blue-500
    emerald: [16, 185, 129], // Forum - emerald-500
  },
};

// Interpolate between two RGB colors
function lerpColor(c1: number[], c2: number[], t: number): number[] {
  return [
    Math.round(c1[0] + (c2[0] - c1[0]) * t),
    Math.round(c1[1] + (c2[1] - c1[1]) * t),
    Math.round(c1[2] + (c2[2] - c1[2]) * t),
  ];
}

export function CircuitBackground({ className = "", opacity = 0.15, colorGradient = false }: CircuitBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Configuration
    const dotSpacing = 20;
    const baseDotSize = 1.5;
    const waveAmplitude = 0.25;

    // Get color palette based on theme
    const palette = isDark ? COLORS.dark : COLORS.light;
    const baseOpacity = isDark ? opacity * 1.5 : opacity * 3;

    let startTime: number | null = null;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      const cols = Math.ceil(rect.width / dotSpacing) + 2;
      const rows = Math.ceil(rect.height / dotSpacing) + 2;

      // Time factors for different wave layers (varied speeds)
      const t1 = elapsed * 0.0015; // Slow diagonal
      const t2 = elapsed * 0.002;  // Medium horizontal
      const t3 = elapsed * 0.0025; // Faster vertical
      const t4 = elapsed * 0.0008; // Very slow breathing
      const t5 = elapsed * 0.003;  // Fast ripple

      // Guard against division by zero
      if (rect.width === 0 || rect.height === 0) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const baseX = col * dotSpacing;
          const baseY = row * dotSpacing;

          // Normalized position (0-1 range across canvas)
          const nx = baseX / rect.width;
          const ny = baseY / rect.height;

          // === POSITION WAVES (subtle movement) ===
          // Wave 1: Diagonal sweep
          const wave1 = Math.sin((nx + ny) * 8 - t1) * waveAmplitude * dotSpacing;
          // Wave 2: Horizontal ripple
          const wave2 = Math.sin(ny * 12 - t2) * waveAmplitude * dotSpacing * 0.4;
          // Wave 3: Circular ripple from center
          const distFromCenter = Math.sqrt(Math.pow(nx - 0.5, 2) + Math.pow(ny - 0.5, 2));
          const wave3 = Math.sin(distFromCenter * 15 - t5) * waveAmplitude * dotSpacing * 0.3;

          const x = baseX + wave1 * 0.5 + wave2 * 0.3 + wave3 * 0.2;
          const y = baseY + wave1 * 0.3 + wave3 * 0.2;

          // === OPACITY WAVES (varied brightness patterns) ===
          // Layer 1: Primary diagonal band (slower, wider)
          const opacity1 = Math.sin((nx + ny) * 6 - t1 * 1.5);

          // Layer 2: Horizontal waves (different frequency)
          const opacity2 = Math.sin(ny * 10 - t2 * 0.8) * 0.5;

          // Layer 3: Vertical accent (creates cross-hatch feel)
          const opacity3 = Math.sin(nx * 14 - t3) * 0.3;

          // Layer 4: Slow breathing across whole canvas (adds variation over time)
          const breathe = Math.sin(t4) * 0.15;

          // Layer 5: Radial pulse from bottom-right corner
          const distFromCorner = Math.sqrt(Math.pow(nx - 1, 2) + Math.pow(ny - 1, 2));
          const radialPulse = Math.sin(distFromCorner * 10 - t5 * 1.2) * 0.25;

          // Layer 6: Secondary radial from top-left (interference pattern)
          const distFromTopLeft = Math.sqrt(nx * nx + ny * ny);
          const radialPulse2 = Math.sin(distFromTopLeft * 8 - t2) * 0.2;

          // Combine all opacity layers
          const combinedOpacity = (opacity1 * 0.4 + opacity2 + opacity3 + breathe + radialPulse + radialPulse2) / 1.8;

          // Map to visible range (0.1 to 1.0)
          const dotOpacity = baseOpacity * (0.1 + (combinedOpacity + 1) * 0.45);

          // Size variation based on combined waves
          const sizeVariation = 1 + combinedOpacity * 0.25;
          const dotSize = baseDotSize * Math.max(0.5, sizeVariation);

          // === COLOR ===
          let colorRgb: string;

          if (colorGradient) {
            // Multi-color gradient based on position and wave
            const colorTime = elapsed * 0.0003; // Very slow color shift

            // Calculate color blend factors based on position and wave
            const colorWave1 = (Math.sin((nx * 2 + ny * 1.5) * 3 + colorTime) + 1) / 2;
            const colorWave2 = (Math.sin((nx * 1.5 - ny * 2) * 2.5 - colorTime * 0.7) + 1) / 2;
            const colorWave3 = (Math.sin(distFromCenter * 4 + colorTime * 1.3) + 1) / 2;

            // Amber is the base (40%), other colors blend in more prominently (60%)
            const secondaryWeight = 0.6;

            // Determine which secondary color based on position quadrants + wave
            const colorSelector = (colorWave1 * 0.5 + colorWave2 * 0.3 + ny * 0.2) % 1;

            let secondaryColor: number[];
            if (colorSelector < 0.25) {
              secondaryColor = palette.cyan;
            } else if (colorSelector < 0.5) {
              secondaryColor = palette.violet;
            } else if (colorSelector < 0.75) {
              secondaryColor = palette.blue;
            } else {
              secondaryColor = palette.emerald;
            }

            // Blend intensity varies with wave - more prominent colors
            const blendIntensity = secondaryWeight * (0.5 + colorWave3 * 0.5);

            // Final color: lerp between amber and the selected secondary color
            const finalColor = lerpColor(palette.amber, secondaryColor, blendIntensity);
            colorRgb = `${finalColor[0]}, ${finalColor[1]}, ${finalColor[2]}`;
          } else {
            // Simple amber-only color
            colorRgb = `${palette.amber[0]}, ${palette.amber[1]}, ${palette.amber[2]}`;
          }

          ctx.beginPath();
          ctx.arc(x, y, dotSize, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${colorRgb}, ${Math.max(0, dotOpacity)})`;
          ctx.fill();
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    animationRef.current = requestAnimationFrame(animate);

    const handleResize = () => resizeCanvas();
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [isDark, opacity, colorGradient]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ zIndex: 0, width: "100%", height: "100%" }}
    />
  );
}
