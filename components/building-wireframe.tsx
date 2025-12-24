"use client";

import { useEffect, useRef, useState } from "react";

interface BuildingWireframeProps {
  className?: string;
}

interface Equipment {
  id: string;
  name: string;
  type: "vav" | "ahu" | "sensor" | "controller" | "chiller";
  x: number;
  y: number;
  value?: string;
}


// Floorplan layout - equipment positions
// Building outer walls: x=60-640, y=50-380
const equipment: Equipment[] = [
  // AHU in mechanical room (top left, inside walls)
  { id: "ahu-01", name: "AHU-01", type: "ahu", x: 110, y: 105, value: "DAT 55°F" },

  // VAVs in offices/zones (top row: 160-300, 300-440, 440-640)
  { id: "vav-101", name: "VAV-101", type: "vav", x: 230, y: 110, value: "72.4°F" },
  { id: "vav-102", name: "VAV-102", type: "vav", x: 370, y: 110, value: "71.8°F" },
  { id: "vav-103", name: "VAV-103", type: "vav", x: 540, y: 110, value: "73.1°F" },

  // VAVs middle row (y=170-280)
  { id: "vav-201", name: "VAV-201", type: "vav", x: 230, y: 225, value: "72.0°F" },
  { id: "vav-202", name: "VAV-202", type: "vav", x: 370, y: 225, value: "71.5°F" },
  { id: "vav-203", name: "VAV-203", type: "vav", x: 540, y: 225, value: "72.8°F" },

  // VAVs bottom row (y=280-380)
  { id: "vav-301", name: "VAV-301", type: "vav", x: 180, y: 330, value: "73.2°F" },
  { id: "vav-302", name: "VAV-302", type: "vav", x: 370, y: 330, value: "71.9°F" },

  // OAT sensor - OUTSIDE building (left of x=60 wall)
  { id: "oat", name: "OAT Sensor", type: "sensor", x: 35, y: 105, value: "45°F" },

  // Return air temp sensor in mech room
  { id: "rat", name: "Return Air", type: "sensor", x: 110, y: 145, value: "72°F" },

  // CO2 sensors in occupied spaces
  { id: "co2-1", name: "CO2", type: "sensor", x: 260, y: 140, value: "680 ppm" },
  { id: "co2-2", name: "CO2", type: "sensor", x: 400, y: 255, value: "520 ppm" },

  // JACE controller in IT room (bottom left)
  { id: "jace", name: "JACE-8000", type: "controller", x: 110, y: 330, value: "Online" },

  // Chiller in plant room (bottom right)
  { id: "ch-01", name: "Chiller-01", type: "chiller", x: 590, y: 340, value: "78% Load" },
];

// Network connections (indices into equipment array)
// Equipment indices: 0=AHU, 1-8=VAVs, 9=OAT, 10=RAT, 11=CO2-1, 12=CO2-2, 13=JACE, 14=Chiller
const connections: [number, number][] = [
  [0, 1], [0, 2], [0, 3],   // AHU to top VAVs
  [1, 4], [2, 5], [3, 6],   // Top VAVs to middle VAVs
  [4, 7], [5, 8],           // Middle to bottom VAVs
  [13, 0], [13, 4], [13, 7], // JACE controller connections
  [14, 6], [14, 5],         // Chiller connections
  [9, 0],                   // OAT to AHU
  [10, 0],                  // Return air to AHU
  [11, 2], [12, 5],         // CO2 sensors to nearby VAVs
];

export function BuildingWireframe({ className = "" }: BuildingWireframeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; equipment: Equipment } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const width = 680;
    const height = 420;
    canvas.width = width;
    canvas.height = height;

    let animationId: number;
    let currentMousePos = { x: 0, y: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = width / rect.width;
      const scaleY = height / rect.height;
      currentMousePos = {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
      setMousePos(currentMousePos);

      // Check for hover on equipment
      let hoveredEquip: Equipment | null = null;
      for (const eq of equipment) {
        const dist = Math.sqrt((currentMousePos.x - eq.x) ** 2 + (currentMousePos.y - eq.y) ** 2);
        if (dist < 20) {
          hoveredEquip = eq;
          break;
        }
      }

      if (hoveredEquip) {
        setTooltip({
          x: (hoveredEquip.x / width) * rect.width + rect.left,
          y: (hoveredEquip.y / height) * rect.height + rect.top - 40,
          equipment: hoveredEquip,
        });
      } else {
        setTooltip(null);
      }
    };

    const handleMouseLeave = () => {
      setTooltip(null);
      currentMousePos = { x: -100, y: -100 };
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      const isDark = document.documentElement.classList.contains("dark");
      const primaryColor = isDark ? "251, 191, 36" : "217, 119, 6";
      const wallColor = isDark ? "250, 250, 250" : "24, 24, 27";
      const mutedColor = isDark ? "161, 161, 170" : "113, 113, 122";

      // Draw exterior walls (thick, prominent)
      ctx.strokeStyle = `rgba(${wallColor}, 0.6)`;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(60, 50, 580, 330);

      // Draw interior walls
      ctx.strokeStyle = `rgba(${wallColor}, 0.35)`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();

      // Mechanical room (top-left corner) - vertical wall only, horizontal handled by zone divider
      ctx.moveTo(160, 50);
      ctx.lineTo(160, 170);

      // Horizontal zone dividers
      ctx.moveTo(60, 170);
      ctx.lineTo(640, 170);
      ctx.moveTo(60, 280);
      ctx.lineTo(640, 280);

      // Vertical zone dividers
      ctx.moveTo(300, 50);
      ctx.lineTo(300, 380);
      ctx.moveTo(440, 50);
      ctx.lineTo(440, 380);

      // Plant room divider
      ctx.moveTo(540, 280);
      ctx.lineTo(540, 380);

      // IT room divider
      ctx.moveTo(160, 280);
      ctx.lineTo(160, 380);

      ctx.stroke();

      // Room labels - positioned in center of each room
      ctx.font = "10px monospace";
      ctx.fillStyle = `rgba(${mutedColor}, 0.45)`;

      // Top row rooms
      ctx.fillText("MECH", 90, 70);
      ctx.fillText("OFFICE 1", 200, 70);
      ctx.fillText("OFFICE 2", 345, 70);
      ctx.fillText("CONFERENCE", 470, 70);

      // Middle row rooms
      ctx.fillText("OPEN OFFICE", 185, 195);
      ctx.fillText("BREAK ROOM", 335, 195);
      ctx.fillText("LOBBY", 515, 195);

      // Bottom row rooms
      ctx.fillText("IT/ELEC", 85, 300);
      ctx.fillText("STORAGE", 205, 300);
      ctx.fillText("RESTROOMS", 340, 300);
      ctx.fillText("PLANT", 570, 300);

      // Outdoor indicator
      ctx.fillStyle = `rgba(${mutedColor}, 0.3)`;
      ctx.font = "9px monospace";
      ctx.fillText("EXT", 25, 85);

      // Draw network connections
      ctx.strokeStyle = `rgba(${primaryColor}, 0.2)`;
      ctx.lineWidth = 1;
      connections.forEach(([fromIdx, toIdx]) => {
        const from = equipment[fromIdx];
        const to = equipment[toIdx];
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
      });


      // Draw equipment points
      equipment.forEach((eq) => {
        // Calculate distance from mouse for proximity effect
        const dist = Math.sqrt((currentMousePos.x - eq.x) ** 2 + (currentMousePos.y - eq.y) ** 2);
        const proximityScale = Math.max(0, 1 - dist / 100);
        const baseSize = eq.type === "ahu" || eq.type === "chiller" ? 8 : eq.type === "controller" ? 7 : 5;
        const size = baseSize + proximityScale * 4;

        // Draw point
        ctx.fillStyle = `rgba(${primaryColor}, ${0.7 + proximityScale * 0.3})`;
        ctx.beginPath();
        ctx.arc(eq.x, eq.y, size, 0, Math.PI * 2);
        ctx.fill();

        // Draw ring for larger equipment
        if (eq.type === "ahu" || eq.type === "chiller" || eq.type === "controller") {
          ctx.strokeStyle = `rgba(${primaryColor}, ${0.4 + proximityScale * 0.3})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(eq.x, eq.y, size + 4, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Show label on proximity
        if (proximityScale > 0.3) {
          ctx.font = "9px monospace";
          ctx.fillStyle = `rgba(${primaryColor}, ${proximityScale})`;
          ctx.fillText(eq.id.toUpperCase(), eq.x + size + 6, eq.y + 3);
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-auto max-w-[680px] mx-auto cursor-crosshair"
        style={{ aspectRatio: "680/420" }}
      />
      {tooltip && (
        <div
          className="fixed z-50 px-2 py-1 bg-card border border-border text-xs font-mono pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: "translateX(-50%)",
          }}
        >
          <div className="text-primary font-medium">{tooltip.equipment.name}</div>
          {tooltip.equipment.value && (
            <div className="text-muted-foreground">{tooltip.equipment.value}</div>
          )}
        </div>
      )}
    </div>
  );
}
