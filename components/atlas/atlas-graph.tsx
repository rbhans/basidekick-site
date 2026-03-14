"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useSearchParams, useRouter } from "next/navigation";
import { EquipmentNode } from "./graph-equipment-node";
import { PointNode } from "./graph-point-node";
import { GraphSidebar } from "./graph-sidebar";

interface GraphNodeData {
  id: string;
  type: "equipment" | "point";
  label: string;
  category: string;
}

interface GraphData {
  nodes: GraphNodeData[];
  edges: Array<{ source: string; target: string }>;
  root?: string;
}

const nodeTypes = {
  equipment: EquipmentNode,
  point: PointNode,
};

// Category color map for visual clustering
const CATEGORY_COLORS: Record<string, string> = {
  temperatures: "#EF4444",
  pressures: "#F59E0B",
  flows: "#3B82F6",
  humidity: "#8B5CF6",
  electrical: "#F97316",
  commands: "#10B981",
  statuses: "#06B6D4",
  setpoints: "#EC4899",
  "air-quality": "#84CC16",
  occupancy: "#A855F7",
  lighting: "#FBBF24",
  energy: "#F472B6",
  hvac: "#10B981",
  "water-systems": "#3B82F6",
  "air-distribution": "#06B6D4",
  meters: "#F59E0B",
  actuators: "#EF4444",
  default: "#6B7280",
};

function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.default;
}

/**
 * Force-directed layout: equipment in a ring, points gravitate toward
 * the equipment they connect to, creating organic clusters.
 */
function forceLayout(graphData: GraphData, root?: string | null) {
  const equipNodes = graphData.nodes.filter((n) => n.type === "equipment");
  const pointNodes = graphData.nodes.filter((n) => n.type === "point");

  // Build adjacency
  const equipForPoint = new Map<string, string[]>(); // point → [equipment]
  const pointsForEquip = new Map<string, string[]>(); // equipment → [points]
  for (const e of graphData.edges) {
    if (!equipForPoint.has(e.target)) equipForPoint.set(e.target, []);
    equipForPoint.get(e.target)!.push(e.source);
    if (!pointsForEquip.has(e.source)) pointsForEquip.set(e.source, []);
    pointsForEquip.get(e.source)!.push(e.target);
  }

  const positions = new Map<string, { x: number; y: number }>();

  if (root) {
    // Radial layout centered on root
    layoutRadial(graphData, root, equipForPoint, pointsForEquip, positions);
  } else {
    // Full graph: equipment in a large ring, points cluster around them
    layoutFullGraph(equipNodes, pointNodes, equipForPoint, pointsForEquip, positions);
  }

  const nodes: Node[] = graphData.nodes.map((n) => {
    const pos = positions.get(n.id) || { x: 0, y: 0 };
    const isEquip = n.type === "equipment";
    return {
      id: n.id,
      type: n.type,
      position: pos,
      data: {
        label: n.label,
        category: n.category,
        pointCount: isEquip ? (pointsForEquip.get(n.id)?.length || 0) : undefined,
        isRoot: n.id === root,
      },
    };
  });

  const edges: Edge[] = graphData.edges.map((e, i) => ({
    id: `e-${i}`,
    source: e.source,
    target: e.target,
    style: {
      stroke: "hsl(var(--border))",
      strokeWidth: 1,
      opacity: 0.4,
    },
  }));

  return { nodes, edges };
}

function layoutRadial(
  graphData: GraphData,
  rootId: string,
  equipForPoint: Map<string, string[]>,
  pointsForEquip: Map<string, string[]>,
  positions: Map<string, { x: number; y: number }>,
) {
  const rootNode = graphData.nodes.find((n) => n.id === rootId);
  if (!rootNode) return;

  // Root at center
  positions.set(rootId, { x: 0, y: 0 });

  const isRootEquip = rootNode.type === "equipment";
  const directConnections: GraphNodeData[] = [];
  const secondaryConnections: GraphNodeData[] = [];

  if (isRootEquip) {
    // Direct: points connected to this equipment
    const pointIds = new Set(pointsForEquip.get(rootId) || []);
    for (const n of graphData.nodes) {
      if (n.id === rootId) continue;
      if (pointIds.has(n.id)) directConnections.push(n);
      else secondaryConnections.push(n);
    }
  } else {
    // Direct: equipment connected to this point
    const equipIds = new Set(equipForPoint.get(rootId) || []);
    for (const n of graphData.nodes) {
      if (n.id === rootId) continue;
      if (equipIds.has(n.id)) directConnections.push(n);
      else secondaryConnections.push(n);
    }
  }

  // Inner ring: direct connections
  const innerRadius = Math.max(200, directConnections.length * 25);
  directConnections.forEach((n, i) => {
    const angle = (2 * Math.PI * i) / directConnections.length - Math.PI / 2;
    positions.set(n.id, {
      x: Math.cos(angle) * innerRadius,
      y: Math.sin(angle) * innerRadius,
    });
  });

  // Outer ring: secondary connections (equipment that shares points, or points of connected equipment)
  if (secondaryConnections.length > 0) {
    const outerRadius = innerRadius + 180;
    secondaryConnections.forEach((n, i) => {
      const angle = (2 * Math.PI * i) / secondaryConnections.length - Math.PI / 2;
      positions.set(n.id, {
        x: Math.cos(angle) * outerRadius,
        y: Math.sin(angle) * outerRadius,
      });
    });
  }
}

function layoutFullGraph(
  equipNodes: GraphNodeData[],
  pointNodes: GraphNodeData[],
  equipForPoint: Map<string, string[]>,
  pointsForEquip: Map<string, string[]>,
  positions: Map<string, { x: number; y: number }>,
) {
  // Sort equipment by number of points (most connected in center)
  const sortedEquip = [...equipNodes].sort((a, b) => {
    return (pointsForEquip.get(b.id)?.length || 0) - (pointsForEquip.get(a.id)?.length || 0);
  });

  // Place equipment in a spiral for organic feel
  const equipCount = sortedEquip.length;
  const spiralSpacing = 280;

  sortedEquip.forEach((n, i) => {
    // Golden angle spiral
    const angle = i * 2.399963; // golden angle in radians
    const radius = spiralSpacing * Math.sqrt(i + 1);
    positions.set(n.id, {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    });
  });

  // Place points: average position of connected equipment + jitter
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  };

  pointNodes.forEach((n, idx) => {
    const connectedEquip = equipForPoint.get(n.id) || [];
    if (connectedEquip.length === 0) {
      positions.set(n.id, { x: 0, y: 0 });
      return;
    }

    // Average position of connected equipment
    let avgX = 0;
    let avgY = 0;
    let count = 0;
    for (const eqId of connectedEquip) {
      const pos = positions.get(eqId);
      if (pos) {
        avgX += pos.x;
        avgY += pos.y;
        count++;
      }
    }
    if (count > 0) {
      avgX /= count;
      avgY /= count;
    }

    // Add jitter based on index for spread, biased away from center
    const jitterAngle = seededRandom(idx) * 2 * Math.PI;
    const jitterRadius = 40 + seededRandom(idx + 1000) * 80;

    // If connected to multiple equipment, position between them
    // If connected to one, position near that equipment
    const pullFactor = connectedEquip.length > 1 ? 0.5 : 0.85;

    positions.set(n.id, {
      x: avgX * pullFactor + Math.cos(jitterAngle) * jitterRadius,
      y: avgY * pullFactor + Math.sin(jitterAngle) * jitterRadius,
    });
  });

  // Simple repulsion pass to reduce overlap
  const allIds = [...equipNodes, ...pointNodes].map((n) => n.id);
  for (let iter = 0; iter < 30; iter++) {
    for (let i = 0; i < allIds.length; i++) {
      for (let j = i + 1; j < allIds.length; j++) {
        const a = positions.get(allIds[i])!;
        const b = positions.get(allIds[j])!;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = 60;
        if (dist < minDist && dist > 0) {
          const force = (minDist - dist) / dist * 0.3;
          a.x -= dx * force;
          a.y -= dy * force;
          b.x += dx * force;
          b.y += dy * force;
        }
      }
    }
  }
}

export function AtlasGraph() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const root = searchParams.get("root");

  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = root
      ? `/api/atlas/graph?root=${encodeURIComponent(root)}&depth=1`
      : "/api/atlas/graph";

    fetch(url)
      .then((r) => r.json())
      .then((data: GraphData) => {
        setGraphData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [root]);

  const { layoutNodes, layoutEdges } = useMemo(() => {
    if (!graphData) return { layoutNodes: [], layoutEdges: [] };
    const { nodes, edges } = forceLayout(graphData, root);
    return { layoutNodes: nodes, layoutEdges: edges };
  }, [graphData, root]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutEdges);

  useEffect(() => {
    setNodes(layoutNodes);
    setEdges(layoutEdges);
  }, [layoutNodes, layoutEdges, setNodes, setEdges]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node.id);
  }, []);

  const onNodeDoubleClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      router.push(`/atlas/graph?root=${encodeURIComponent(node.id)}`);
    },
    [router]
  );

  const onNavigate = useCallback(
    (id: string) => {
      router.push(`/atlas/graph?root=${encodeURIComponent(id)}`);
    },
    [router]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const selectedGraphNode = graphData?.nodes.find((n) => n.id === selectedNode) ?? null;
  const connectedNodes = useMemo(() => {
    if (!graphData || !selectedNode) return [];
    const connected = new Set<string>();
    for (const e of graphData.edges) {
      if (e.source === selectedNode) connected.add(e.target);
      if (e.target === selectedNode) connected.add(e.source);
    }
    return graphData.nodes.filter((n) => connected.has(n.id));
  }, [graphData, selectedNode]);

  // Highlight edges connected to selected node
  const styledEdges = useMemo(() => {
    if (!selectedNode) return edges;
    return edges.map((e) => {
      const isConnected = e.source === selectedNode || e.target === selectedNode;
      return {
        ...e,
        animated: isConnected,
        style: {
          stroke: isConnected ? "hsl(var(--primary))" : "hsl(var(--border))",
          strokeWidth: isConnected ? 2 : 1,
          opacity: isConnected ? 1 : 0.15,
        },
      };
    });
  }, [edges, selectedNode]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
          <span className="text-sm">Loading graph...</span>
        </div>
      </div>
    );
  }

  const nodeCount = graphData?.nodes.length ?? 0;
  const edgeCount = graphData?.edges.length ?? 0;
  const equipCount = graphData?.nodes.filter((n) => n.type === "equipment").length ?? 0;
  const pointCount = nodeCount - equipCount;

  return (
    <div className="relative h-full w-full">
      {/* Header bar */}
      <div className="absolute left-4 top-4 z-10 flex items-center gap-3">
        <input
          type="text"
          placeholder="Search equipment or points..."
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none w-64"
          onChange={(e) => {
            if (e.target.value.length > 2) {
              const match = graphData?.nodes.find((n) =>
                n.label.toLowerCase().includes(e.target.value.toLowerCase())
              );
              if (match) onNavigate(match.id);
            }
          }}
        />
        {root && (
          <button
            onClick={() => router.push("/atlas/graph")}
            className="rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
          >
            Show all
          </button>
        )}
      </div>

      {/* Stats badge */}
      <div className="absolute right-4 top-4 z-10">
        <div className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
          <span className="text-primary font-medium">{equipCount}</span> equipment
          {" · "}
          <span className="text-foreground font-medium">{pointCount}</span> points
          {" · "}
          <span className="text-muted-foreground">{edgeCount} links</span>
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={styledEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.02}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        style={{ background: "hsl(var(--background))" }}
      >
        <Controls
          className="!bg-card !border-border !rounded-lg !shadow-sm [&>button]:!bg-card [&>button]:!border-border [&>button]:!text-muted-foreground [&>button:hover]:!text-foreground [&>button:hover]:!bg-muted"
        />
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="hsl(var(--border))"
        />
        <MiniMap
          className="!bg-card !border-border !rounded-lg"
          nodeStrokeColor={() => "transparent"}
          nodeColor={(n) =>
            n.type === "equipment"
              ? "hsl(var(--primary))"
              : getCategoryColor((n.data as { category?: string })?.category || "default")
          }
          maskColor="hsl(var(--background) / 0.8)"
        />
      </ReactFlow>

      <GraphSidebar
        node={selectedGraphNode}
        connectedNodes={connectedNodes}
        onNavigate={onNavigate}
        onClose={() => setSelectedNode(null)}
      />

      {/* Help text */}
      <div className="absolute bottom-4 left-4 z-10 text-[10px] text-muted-foreground">
        Click to inspect · Double-click to focus · Drag to rearrange
      </div>
    </div>
  );
}
