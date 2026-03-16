"use client";

import { useEffect, useRef, useState } from "react";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  forceX,
  forceY,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from "d3-force";

interface GraphNodeData {
  id: string;
  type: "equipment" | "point";
  label: string;
  category: string;
}

interface GraphData {
  nodes: GraphNodeData[];
  edges: Array<{ source: string; target: string }>;
}

interface SimNode extends SimulationNodeDatum {
  id: string;
  nodeData: GraphNodeData;
  radius: number;
}

const PRIMARY = "#C4F82A";
const PRIMARY_DIM = "rgba(196, 248, 42, 0.12)";
const POINT_COLOR = "rgba(161, 161, 170, 0.5)";
const EDGE_COLOR = "rgba(196, 248, 42, 0.15)";
const EDGE_COLOR_BRIGHT = "rgba(196, 248, 42, 0.35)";
const LABEL_COLOR = "rgba(255, 255, 255, 0.6)";
const LABEL_COLOR_EQUIP = "rgba(255, 255, 255, 0.85)";

export function HeroGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const simRef = useRef<ReturnType<typeof forceSimulation<SimNode>> | null>(null);
  const nodesRef = useRef<SimNode[]>([]);
  const linksRef = useRef<SimulationLinkDatum<SimNode>[]>([]);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const mouseRef = useRef<{ x: number; y: number } | null>(null);
  const timeRef = useRef(0);

  // Fetch graph data
  useEffect(() => {
    fetch("/api/atlas/graph")
      .then((r) => r.json())
      .then((data: GraphData) => setGraphData(data))
      .catch(() => {});
  }, []);

  // Set up simulation + animation loop
  useEffect(() => {
    if (!graphData || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Size canvas
    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // Build simulation nodes
    const categories = [...new Set(graphData.nodes.filter((n) => n.type === "equipment").map((n) => n.category))];
    const catAngle = new Map<string, number>();
    categories.forEach((cat, i) => {
      catAngle.set(cat, (2 * Math.PI * i) / categories.length);
    });

    const w = container.getBoundingClientRect().width;
    const h = container.getBoundingClientRect().height;
    const cx = w / 2;
    const cy = h / 2;
    const spread = Math.min(w, h) * 0.35;

    const simNodes: SimNode[] = graphData.nodes.map((n) => {
      const isEquip = n.type === "equipment";
      const angle = catAngle.get(n.category) ?? Math.random() * Math.PI * 2;
      const r = isEquip
        ? spread * (0.4 + Math.random() * 0.6)
        : spread * (0.2 + Math.random() * 0.8);
      const jitter = (Math.random() - 0.5) * spread * 0.3;

      return {
        id: n.id,
        nodeData: n,
        radius: isEquip ? 5 : 2.5,
        x: cx + Math.cos(angle) * r + jitter,
        y: cy + Math.sin(angle) * r + jitter,
      };
    });

    const nodeById = new Map(simNodes.map((n) => [n.id, n]));

    const simLinks: SimulationLinkDatum<SimNode>[] = graphData.edges
      .filter((e) => nodeById.has(e.source) && nodeById.has(e.target))
      .map((e) => ({
        source: nodeById.get(e.source)!,
        target: nodeById.get(e.target)!,
      }));

    nodesRef.current = simNodes;
    linksRef.current = simLinks;

    // Create simulation with gentle, continuous forces
    const simulation = forceSimulation(simNodes)
      .force(
        "link",
        forceLink<SimNode, SimulationLinkDatum<SimNode>>(simLinks)
          .id((d) => d.id)
          .distance(60)
          .strength(0.15)
      )
      .force("charge", forceManyBody<SimNode>().strength(-30).distanceMax(200))
      .force("center", forceCenter(cx, cy).strength(0.02))
      .force(
        "collide",
        forceCollide<SimNode>().radius((d) => d.radius + 8).strength(0.5)
      )
      .force(
        "x",
        forceX<SimNode>((d) => {
          if (d.nodeData.type !== "equipment") return cx;
          const angle = catAngle.get(d.nodeData.category) ?? 0;
          return cx + Math.cos(angle) * spread * 0.5;
        }).strength(0.03)
      )
      .force(
        "y",
        forceY<SimNode>((d) => {
          if (d.nodeData.type !== "equipment") return cy;
          const angle = catAngle.get(d.nodeData.category) ?? 0;
          return cy + Math.sin(angle) * spread * 0.5;
        }).strength(0.03)
      )
      .alphaDecay(0.005)
      .velocityDecay(0.4);

    // Let it settle a bit first
    for (let i = 0; i < 150; i++) simulation.tick();

    simRef.current = simulation;

    // Mouse tracking for subtle interaction
    const handleMouse = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const handleMouseLeave = () => {
      mouseRef.current = null;
    };
    container.addEventListener("mousemove", handleMouse);
    container.addEventListener("mouseleave", handleMouseLeave);

    // Animation loop
    const draw = () => {
      const rect = container.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      timeRef.current += 0.008;

      // Keep simulation alive with gentle energy injection
      if (simulation.alpha() < 0.05) {
        simulation.alpha(0.05);
      }
      simulation.tick();

      // Subtle drift based on time
      for (const node of simNodes) {
        const drift = 0.15;
        node.vx = (node.vx ?? 0) + Math.sin(timeRef.current + (node.x ?? 0) * 0.01) * drift;
        node.vy = (node.vy ?? 0) + Math.cos(timeRef.current * 0.7 + (node.y ?? 0) * 0.01) * drift;
      }

      // Mouse repulsion
      if (mouseRef.current) {
        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;
        for (const node of simNodes) {
          const dx = (node.x ?? 0) - mx;
          const dy = (node.y ?? 0) - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120 && dist > 0) {
            const force = (120 - dist) / 120 * 2;
            node.vx = (node.vx ?? 0) + (dx / dist) * force;
            node.vy = (node.vy ?? 0) + (dy / dist) * force;
          }
        }
      }

      // Clear
      ctx.clearRect(0, 0, w, h);

      // Draw edges
      for (const link of simLinks) {
        const source = link.source as SimNode;
        const target = link.target as SimNode;
        const sx = source.x ?? 0;
        const sy = source.y ?? 0;
        const tx = target.x ?? 0;
        const ty = target.y ?? 0;

        // Check if either end is near mouse for highlighting
        let bright = false;
        if (mouseRef.current) {
          const dSource = Math.hypot(sx - mouseRef.current.x, sy - mouseRef.current.y);
          const dTarget = Math.hypot(tx - mouseRef.current.x, ty - mouseRef.current.y);
          bright = dSource < 100 || dTarget < 100;
        }

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(tx, ty);
        ctx.strokeStyle = bright ? EDGE_COLOR_BRIGHT : EDGE_COLOR;
        ctx.lineWidth = bright ? 1.2 : 0.5;
        ctx.stroke();
      }

      // Draw nodes
      for (const node of simNodes) {
        const nx = node.x ?? 0;
        const ny = node.y ?? 0;
        const isEquip = node.nodeData.type === "equipment";

        // Proximity to mouse for glow effect
        let proximity = 0;
        if (mouseRef.current) {
          const d = Math.hypot(nx - mouseRef.current.x, ny - mouseRef.current.y);
          proximity = Math.max(0, 1 - d / 150);
        }

        if (isEquip) {
          // Equipment: glowing lime dot with pulse
          const pulse = 1 + Math.sin(timeRef.current * 2 + nx * 0.01) * 0.15;
          const r = node.radius * pulse;

          // Glow
          const glowR = r + 8 + proximity * 12;
          const glow = ctx.createRadialGradient(nx, ny, r, nx, ny, glowR);
          glow.addColorStop(0, `rgba(196, 248, 42, ${0.2 + proximity * 0.3})`);
          glow.addColorStop(1, "rgba(196, 248, 42, 0)");
          ctx.beginPath();
          ctx.arc(nx, ny, glowR, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();

          // Core
          ctx.beginPath();
          ctx.arc(nx, ny, r, 0, Math.PI * 2);
          ctx.fillStyle = PRIMARY;
          ctx.fill();

          // Label (only when nearby mouse or always for equipment)
          if (proximity > 0.3) {
            ctx.font = "11px 'Space Grotesk', sans-serif";
            ctx.fillStyle = LABEL_COLOR_EQUIP;
            ctx.textAlign = "center";
            ctx.fillText(node.nodeData.label, nx, ny - r - 8);
          }
        } else {
          // Point: small subtle dot
          const r = node.radius + proximity * 1.5;

          if (proximity > 0) {
            // Subtle glow on hover
            const glow = ctx.createRadialGradient(nx, ny, r, nx, ny, r + 6);
            glow.addColorStop(0, `rgba(161, 161, 170, ${0.15 + proximity * 0.2})`);
            glow.addColorStop(1, "rgba(161, 161, 170, 0)");
            ctx.beginPath();
            ctx.arc(nx, ny, r + 6, 0, Math.PI * 2);
            ctx.fillStyle = glow;
            ctx.fill();
          }

          ctx.beginPath();
          ctx.arc(nx, ny, r, 0, Math.PI * 2);
          ctx.fillStyle = POINT_COLOR;
          ctx.fill();

          // Label only on very close hover
          if (proximity > 0.6) {
            ctx.font = "9px 'Space Grotesk', sans-serif";
            ctx.fillStyle = LABEL_COLOR;
            ctx.textAlign = "center";
            ctx.fillText(node.nodeData.label, nx, ny - r - 5);
          }
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      simulation.stop();
      window.removeEventListener("resize", resize);
      container.removeEventListener("mousemove", handleMouse);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [graphData]);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-auto" style={{ zIndex: 0 }}>
      <canvas ref={canvasRef} className="absolute inset-0" />
      {/* Dark scrim over the whole canvas so text is readable */}
      <div className="absolute inset-0 bg-background/75 pointer-events-none" />
      {/* Vignette overlay so graph fades into edges */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 60% at 50% 40%, transparent 20%, hsl(var(--background)) 75%)",
        }}
      />
      {/* Bottom fade so content below blends cleanly */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      {/* Top fade for navbar */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-background/60 to-transparent pointer-events-none" />
    </div>
  );
}
