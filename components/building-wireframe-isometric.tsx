"use client";

import { useEffect, useRef, useState } from "react";

interface BuildingWireframeIsometricProps {
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

// Equipment positioned in normalized coordinates (0-1 range) - matches original floor plan
const equipment: Equipment[] = [
  // AHU in mechanical room (top left)
  { id: "ahu-01", name: "AHU-01", type: "ahu", x: 0.09, y: 0.18, value: "DAT 55°F" },

  // VAVs top row
  { id: "vav-101", name: "VAV-101", type: "vav", x: 0.30, y: 0.18, value: "72.4°F" },
  { id: "vav-102", name: "VAV-102", type: "vav", x: 0.54, y: 0.18, value: "71.8°F" },
  { id: "vav-103", name: "VAV-103", type: "vav", x: 0.83, y: 0.18, value: "73.1°F" },

  // VAVs middle row
  { id: "vav-201", name: "VAV-201", type: "vav", x: 0.30, y: 0.53, value: "72.0°F" },
  { id: "vav-202", name: "VAV-202", type: "vav", x: 0.54, y: 0.53, value: "71.5°F" },
  { id: "vav-203", name: "VAV-203", type: "vav", x: 0.83, y: 0.53, value: "72.8°F" },

  // VAVs bottom row
  { id: "vav-301", name: "VAV-301", type: "vav", x: 0.22, y: 0.85, value: "73.2°F" },
  { id: "vav-302", name: "VAV-302", type: "vav", x: 0.54, y: 0.85, value: "71.9°F" },

  // OAT sensor - outside building
  { id: "oat", name: "OAT Sensor", type: "sensor", x: -0.05, y: 0.18, value: "45°F" },

  // Return air temp sensor
  { id: "rat", name: "Return Air", type: "sensor", x: 0.09, y: 0.30, value: "72°F" },

  // CO2 sensors
  { id: "co2-1", name: "CO2", type: "sensor", x: 0.38, y: 0.28, value: "680 ppm" },
  { id: "co2-2", name: "CO2", type: "sensor", x: 0.62, y: 0.62, value: "520 ppm" },

  // JACE controller
  { id: "jace", name: "JACE-8000", type: "controller", x: 0.09, y: 0.85, value: "Online" },

  // Chiller
  { id: "ch-01", name: "Chiller-01", type: "chiller", x: 0.92, y: 0.88, value: "78% Load" },
];

// Connections between equipment (by index)
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

// Room definitions: [x1, y1, x2, y2] in normalized coords, plus label
interface Room {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
  labelX: number;
  labelY: number;
}

const rooms: Room[] = [
  // Top row
  { x1: 0, y1: 0, x2: 0.17, y2: 0.36, label: "MECH", labelX: 0.05, labelY: 0.08 },
  { x1: 0.17, y1: 0, x2: 0.41, y2: 0.36, label: "OFFICE 1", labelX: 0.24, labelY: 0.08 },
  { x1: 0.41, y1: 0, x2: 0.66, y2: 0.36, label: "OFFICE 2", labelX: 0.48, labelY: 0.08 },
  { x1: 0.66, y1: 0, x2: 1, y2: 0.36, label: "CONFERENCE", labelX: 0.73, labelY: 0.08 },

  // Middle row
  { x1: 0, y1: 0.36, x2: 0.41, y2: 0.70, label: "OPEN OFFICE", labelX: 0.14, labelY: 0.44 },
  { x1: 0.41, y1: 0.36, x2: 0.66, y2: 0.70, label: "BREAK ROOM", labelX: 0.46, labelY: 0.44 },
  { x1: 0.66, y1: 0.36, x2: 1, y2: 0.70, label: "LOBBY", labelX: 0.78, labelY: 0.44 },

  // Bottom row
  { x1: 0, y1: 0.70, x2: 0.17, y2: 1, label: "IT/ELEC", labelX: 0.03, labelY: 0.78 },
  { x1: 0.17, y1: 0.70, x2: 0.41, y2: 1, label: "STORAGE", labelX: 0.23, labelY: 0.78 },
  { x1: 0.41, y1: 0.70, x2: 0.83, y2: 1, label: "RESTROOMS", labelX: 0.53, labelY: 0.78 },
  { x1: 0.83, y1: 0.70, x2: 1, y2: 1, label: "PLANT", labelX: 0.87, labelY: 0.78 },
];

export function BuildingWireframeIsometric({ className = "" }: BuildingWireframeIsometricProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; equipment: Equipment } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 680;
    const height = 420;
    canvas.width = width;
    canvas.height = height;

    // Isometric projection helpers
    const isoAngle = Math.PI / 6; // 30 degrees
    const cos30 = Math.cos(isoAngle);
    const sin30 = Math.sin(isoAngle);

    // Building dimensions in iso space
    const buildingWidth = 320;
    const buildingDepth = 200;
    const wallHeight = 60;

    // Center offset
    const centerX = width / 2;
    const centerY = height / 2 + 20;

    // Convert 3D point to 2D isometric
    const toIso = (x: number, y: number, z: number): [number, number] => {
      const isoX = centerX + (x - y) * cos30;
      const isoY = centerY + (x + y) * sin30 - z;
      return [isoX, isoY];
    };

    let animationId: number;
    let time = 0;
    let currentMousePos = { x: -100, y: -100 };

    // Store equipment screen positions for hover detection
    const equipmentScreenPos: { eq: Equipment; sx: number; sy: number }[] = [];

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = width / rect.width;
      const scaleY = height / rect.height;
      currentMousePos = {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };

      // Check hover
      let hoveredEquip: Equipment | null = null;
      for (const { eq, sx, sy } of equipmentScreenPos) {
        const dist = Math.sqrt((currentMousePos.x - sx) ** 2 + (currentMousePos.y - sy) ** 2);
        if (dist < 15) {
          hoveredEquip = eq;
          break;
        }
      }

      if (hoveredEquip) {
        const pos = equipmentScreenPos.find(p => p.eq === hoveredEquip);
        if (pos) {
          setTooltip({
            x: (pos.sx / width) * rect.width + rect.left,
            y: (pos.sy / height) * rect.height + rect.top - 40,
            equipment: hoveredEquip,
          });
        }
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
      time += 0.016;
      ctx.clearRect(0, 0, width, height);
      equipmentScreenPos.length = 0;

      const isDark = document.documentElement.classList.contains("dark");
      const primaryColor = isDark ? "251, 191, 36" : "217, 119, 6";
      const wallColor = isDark ? "250, 250, 250" : "24, 24, 27";
      const mutedColor = isDark ? "161, 161, 170" : "113, 113, 122";

      const halfW = buildingWidth / 2;
      const halfD = buildingDepth / 2;

      // Draw floor plate
      const floorCorners = [
        toIso(-halfW, -halfD, 0),
        toIso(halfW, -halfD, 0),
        toIso(halfW, halfD, 0),
        toIso(-halfW, halfD, 0),
      ];

      ctx.fillStyle = `rgba(${mutedColor}, 0.05)`;
      ctx.beginPath();
      ctx.moveTo(floorCorners[0][0], floorCorners[0][1]);
      for (let i = 1; i < 4; i++) {
        ctx.lineTo(floorCorners[i][0], floorCorners[i][1]);
      }
      ctx.closePath();
      ctx.fill();

      // Draw exterior walls outline
      ctx.strokeStyle = `rgba(${wallColor}, 0.6)`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Helper to draw a wall line on floor
      const drawFloorLine = (x1: number, y1: number, x2: number, y2: number, opacity = 0.35) => {
        const [sx1, sy1] = toIso(-halfW + buildingWidth * x1, -halfD + buildingDepth * y1, 0);
        const [sx2, sy2] = toIso(-halfW + buildingWidth * x2, -halfD + buildingDepth * y2, 0);
        ctx.strokeStyle = `rgba(${wallColor}, ${opacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sx1, sy1);
        ctx.lineTo(sx2, sy2);
        ctx.stroke();
      };

      // Helper to draw vertical wall segment
      const drawWall = (x1: number, y1: number, x2: number, y2: number, opacity = 0.25) => {
        const [bx1, by1] = toIso(-halfW + buildingWidth * x1, -halfD + buildingDepth * y1, 0);
        const [bx2, by2] = toIso(-halfW + buildingWidth * x2, -halfD + buildingDepth * y2, 0);
        const [tx1, ty1] = toIso(-halfW + buildingWidth * x1, -halfD + buildingDepth * y1, wallHeight);
        const [tx2, ty2] = toIso(-halfW + buildingWidth * x2, -halfD + buildingDepth * y2, wallHeight);

        // Wall fill
        ctx.fillStyle = `rgba(${mutedColor}, ${opacity * 0.3})`;
        ctx.beginPath();
        ctx.moveTo(bx1, by1);
        ctx.lineTo(bx2, by2);
        ctx.lineTo(tx2, ty2);
        ctx.lineTo(tx1, ty1);
        ctx.closePath();
        ctx.fill();

        // Wall outline
        ctx.strokeStyle = `rgba(${wallColor}, ${opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      };

      // Draw interior walls (back walls first for proper layering)
      // Horizontal dividers at y=0.36 and y=0.70
      drawWall(0, 0.36, 1, 0.36, 0.3);
      drawWall(0, 0.70, 1, 0.70, 0.3);

      // Vertical dividers
      drawWall(0.17, 0, 0.17, 0.36, 0.25);
      drawWall(0.41, 0, 0.41, 1, 0.25);
      drawWall(0.66, 0, 0.66, 0.70, 0.25);
      drawWall(0.17, 0.70, 0.17, 1, 0.25);
      drawWall(0.83, 0.70, 0.83, 1, 0.25);

      // Draw floor lines for rooms
      drawFloorLine(0.17, 0, 0.17, 0.36);
      drawFloorLine(0.41, 0, 0.41, 1);
      drawFloorLine(0.66, 0, 0.66, 0.70);
      drawFloorLine(0, 0.36, 1, 0.36);
      drawFloorLine(0, 0.70, 1, 0.70);
      drawFloorLine(0.17, 0.70, 0.17, 1);
      drawFloorLine(0.83, 0.70, 0.83, 1);

      // Draw exterior walls (vertical edges)
      ctx.strokeStyle = `rgba(${wallColor}, 0.5)`;
      ctx.lineWidth = 1.5;

      // Back corners
      [[0, 0], [1, 0]].forEach(([x, y]) => {
        const [bx, by] = toIso(-halfW + buildingWidth * x, -halfD + buildingDepth * y, 0);
        const [tx, ty] = toIso(-halfW + buildingWidth * x, -halfD + buildingDepth * y, wallHeight);
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(tx, ty);
        ctx.stroke();
      });

      // Front corners
      [[0, 1], [1, 1]].forEach(([x, y]) => {
        const [bx, by] = toIso(-halfW + buildingWidth * x, -halfD + buildingDepth * y, 0);
        const [tx, ty] = toIso(-halfW + buildingWidth * x, -halfD + buildingDepth * y, wallHeight);
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(tx, ty);
        ctx.stroke();
      });

      // Draw roof outline
      const roofCorners = [
        toIso(-halfW, -halfD, wallHeight),
        toIso(halfW, -halfD, wallHeight),
        toIso(halfW, halfD, wallHeight),
        toIso(-halfW, halfD, wallHeight),
      ];

      ctx.strokeStyle = `rgba(${wallColor}, 0.4)`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(roofCorners[0][0], roofCorners[0][1]);
      for (let i = 1; i < 4; i++) {
        ctx.lineTo(roofCorners[i][0], roofCorners[i][1]);
      }
      ctx.closePath();
      ctx.stroke();

      // Draw room labels on floor
      ctx.font = "8px monospace";
      ctx.fillStyle = `rgba(${mutedColor}, 0.4)`;
      rooms.forEach((room) => {
        const [lx, ly] = toIso(
          -halfW + buildingWidth * room.labelX,
          -halfD + buildingDepth * room.labelY,
          0
        );
        ctx.fillText(room.label, lx, ly);
      });

      // Draw "EXT" label outside building
      const [extX, extY] = toIso(-halfW - 30, -halfD + buildingDepth * 0.15, 0);
      ctx.fillStyle = `rgba(${mutedColor}, 0.3)`;
      ctx.fillText("EXT", extX, extY);

      // Draw connections between equipment
      ctx.strokeStyle = `rgba(${primaryColor}, 0.2)`;
      ctx.lineWidth = 1;
      connections.forEach(([fromIdx, toIdx]) => {
        const from = equipment[fromIdx];
        const to = equipment[toIdx];

        const fromX = -halfW + buildingWidth * from.x;
        const fromY = -halfD + buildingDepth * from.y;

        const toX = -halfW + buildingWidth * to.x;
        const toY = -halfD + buildingDepth * to.y;

        const [x1, y1] = toIso(fromX, fromY, wallHeight * 0.3);
        const [x2, y2] = toIso(toX, toY, wallHeight * 0.3);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });

      // Draw equipment points
      equipment.forEach((eq) => {
        const eqX = -halfW + buildingWidth * eq.x;
        const eqY = -halfD + buildingDepth * eq.y;

        const [sx, sy] = toIso(eqX, eqY, wallHeight * 0.3);
        equipmentScreenPos.push({ eq, sx, sy });

        // Proximity effect
        const dist = Math.sqrt((currentMousePos.x - sx) ** 2 + (currentMousePos.y - sy) ** 2);
        const proximityScale = Math.max(0, 1 - dist / 80);

        const baseSize = eq.type === "ahu" || eq.type === "chiller" ? 6 : eq.type === "controller" ? 5 : 4;
        const size = baseSize + proximityScale * 3;

        // Subtle pulse animation
        const pulse = 1 + Math.sin(time * 2 + eq.x * 10 + eq.y * 10) * 0.1;

        // Draw point
        ctx.fillStyle = `rgba(${primaryColor}, ${0.7 + proximityScale * 0.3})`;
        ctx.beginPath();
        ctx.arc(sx, sy, size * pulse, 0, Math.PI * 2);
        ctx.fill();

        // Draw ring for larger equipment
        if (eq.type === "ahu" || eq.type === "chiller" || eq.type === "controller") {
          ctx.strokeStyle = `rgba(${primaryColor}, ${0.3 + proximityScale * 0.3})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(sx, sy, (size + 3) * pulse, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Show label on proximity
        if (proximityScale > 0.4) {
          ctx.font = "9px monospace";
          ctx.fillStyle = `rgba(${primaryColor}, ${proximityScale})`;
          ctx.fillText(eq.id.toUpperCase(), sx + size + 5, sy + 3);
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
