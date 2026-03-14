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

/**
 * Focused radial layout: root in center, direct connections in a ring.
 */
function layoutFocused(graphData: GraphData, rootId: string) {
  const rootNode = graphData.nodes.find((n) => n.id === rootId);
  if (!rootNode) return { nodes: [] as Node[], edges: [] as Edge[] };

  // Build adjacency
  const connections = new Map<string, Set<string>>();
  for (const e of graphData.edges) {
    if (!connections.has(e.source)) connections.set(e.source, new Set());
    if (!connections.has(e.target)) connections.set(e.target, new Set());
    connections.get(e.source)!.add(e.target);
    connections.get(e.target)!.add(e.source);
  }

  const directIds = connections.get(rootId) || new Set<string>();
  const directNodes = graphData.nodes.filter((n) => directIds.has(n.id));

  // Separate direct connections by type
  const directEquip = directNodes.filter((n) => n.type === "equipment");
  const directPoints = directNodes.filter((n) => n.type === "point");

  const nodes: Node[] = [];

  // Root at center
  nodes.push({
    id: rootId,
    type: rootNode.type,
    position: { x: 0, y: 0 },
    data: {
      label: rootNode.label,
      category: rootNode.category,
      pointCount: rootNode.type === "equipment" ? directPoints.length : undefined,
      isRoot: true,
    },
  });

  // Points in inner ring
  const innerRadius = Math.max(250, directPoints.length * 30);
  directPoints.forEach((n, i) => {
    const angle = (2 * Math.PI * i) / directPoints.length - Math.PI / 2;
    nodes.push({
      id: n.id,
      type: "point",
      position: {
        x: Math.cos(angle) * innerRadius,
        y: Math.sin(angle) * innerRadius,
      },
      data: { label: n.label, category: n.category },
    });
  });

  // Equipment in outer ring
  if (directEquip.length > 0) {
    const outerRadius = innerRadius + 200;
    directEquip.forEach((n, i) => {
      const angle = (2 * Math.PI * i) / directEquip.length - Math.PI / 2;
      nodes.push({
        id: n.id,
        type: "equipment",
        position: {
          x: Math.cos(angle) * outerRadius,
          y: Math.sin(angle) * outerRadius,
        },
        data: {
          label: n.label,
          category: n.category,
          pointCount: 0,
          isRoot: false,
        },
      });
    });
  }

  // Only include edges that connect visible nodes
  const visibleIds = new Set(nodes.map((n) => n.id));
  const edges: Edge[] = graphData.edges
    .filter((e) => visibleIds.has(e.source) && visibleIds.has(e.target))
    .map((e, i) => ({
      id: `e-${i}`,
      source: e.source,
      target: e.target,
      style: {
        stroke: "#C4F82A",
        strokeWidth: 1.5,
        opacity: 0.5,
      },
    }));

  return { nodes, edges };
}

/**
 * Equipment-only overview layout: equipment nodes grouped by category
 * in a clean grid. No points shown until you click.
 */
function layoutEquipmentOverview(
  graphData: GraphData,
  expandedEquipId: string | null,
) {
  const equipNodes = graphData.nodes.filter((n) => n.type === "equipment");

  // Build point counts
  const pointsForEquip = new Map<string, string[]>();
  for (const e of graphData.edges) {
    if (!pointsForEquip.has(e.source)) pointsForEquip.set(e.source, []);
    pointsForEquip.get(e.source)!.push(e.target);
  }

  // Group equipment by category
  const categories = new Map<string, GraphNodeData[]>();
  for (const n of equipNodes) {
    const cat = n.category || "other";
    if (!categories.has(cat)) categories.set(cat, []);
    categories.get(cat)!.push(n);
  }

  const nodes: Node[] = [];
  const nodeWidth = 170;
  const nodeHeight = 55;
  const colGap = 30;
  const rowGap = 20;
  const categoryGap = 60;
  const maxCols = 4;

  let currentY = 0;

  for (const [, catNodes] of categories) {
    // Sort by point count descending
    catNodes.sort((a, b) =>
      (pointsForEquip.get(b.id)?.length || 0) - (pointsForEquip.get(a.id)?.length || 0)
    );

    const rows = Math.ceil(catNodes.length / maxCols);
    const cols = Math.min(catNodes.length, maxCols);
    const blockWidth = cols * (nodeWidth + colGap);
    const startX = -blockWidth / 2;

    catNodes.forEach((n, i) => {
      const col = i % maxCols;
      const row = Math.floor(i / maxCols);
      nodes.push({
        id: n.id,
        type: "equipment",
        position: {
          x: startX + col * (nodeWidth + colGap),
          y: currentY + row * (nodeHeight + rowGap),
        },
        data: {
          label: n.label,
          category: n.category,
          pointCount: pointsForEquip.get(n.id)?.length || 0,
          isRoot: n.id === expandedEquipId,
        },
      });
    });

    currentY += rows * (nodeHeight + rowGap) + categoryGap;
  }

  // If an equipment is expanded, show its points radiating from it
  const visibleEdges: Edge[] = [];

  if (expandedEquipId) {
    const equipNode = nodes.find((n) => n.id === expandedEquipId);
    const pointIds = pointsForEquip.get(expandedEquipId) || [];
    const pointDataNodes = graphData.nodes.filter((n) => pointIds.includes(n.id));

    if (equipNode && pointDataNodes.length > 0) {
      const cx = equipNode.position.x + nodeWidth / 2;
      const cy = equipNode.position.y + nodeHeight / 2;
      const radius = Math.max(200, pointDataNodes.length * 22);

      pointDataNodes.forEach((p, i) => {
        const angle = (2 * Math.PI * i) / pointDataNodes.length - Math.PI / 2;
        nodes.push({
          id: p.id,
          type: "point",
          position: {
            x: cx + Math.cos(angle) * radius - 75,
            y: cy + Math.sin(angle) * radius - 16,
          },
          data: { label: p.label, category: p.category },
        });

        visibleEdges.push({
          id: `e-${expandedEquipId}-${p.id}`,
          source: expandedEquipId,
          target: p.id,
          style: {
            stroke: "#C4F82A",
            strokeWidth: 1.5,
            opacity: 0.6,
          },
        });
      });
    }
  }

  return { nodes, edges: visibleEdges };
}

export function AtlasGraph() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const root = searchParams.get("root");

  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [expandedEquip, setExpandedEquip] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Always fetch full graph for overview; focused fetch for root view
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

  // Reset expanded when root changes
  useEffect(() => {
    setExpandedEquip(null);
    setSelectedNode(null);
  }, [root]);

  const { layoutNodes, layoutEdges } = useMemo(() => {
    if (!graphData) return { layoutNodes: [], layoutEdges: [] };

    if (root) {
      const { nodes, edges } = layoutFocused(graphData, root);
      return { layoutNodes: nodes, layoutEdges: edges };
    }

    const { nodes, edges } = layoutEquipmentOverview(graphData, expandedEquip);
    return { layoutNodes: nodes, layoutEdges: edges };
  }, [graphData, root, expandedEquip]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutEdges);

  useEffect(() => {
    setNodes(layoutNodes);
    setEdges(layoutEdges);
  }, [layoutNodes, layoutEdges, setNodes, setEdges]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode(node.id);

      // In overview mode, clicking equipment expands/collapses its points
      if (!root && node.type === "equipment") {
        setExpandedEquip((prev) => (prev === node.id ? null : node.id));
      }
    },
    [root]
  );

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
    if (!root) setExpandedEquip(null);
  }, [root]);

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

  // Highlight edges for selected node
  const styledEdges = useMemo(() => {
    if (!selectedNode) return edges;
    return edges.map((e) => {
      const isConnected = e.source === selectedNode || e.target === selectedNode;
      return {
        ...e,
        animated: isConnected,
        style: {
          stroke: isConnected ? "#C4F82A" : (e.style?.stroke ?? "#C4F82A"),
          strokeWidth: isConnected ? 2.5 : (e.style?.strokeWidth ?? 1.5),
          opacity: isConnected ? 0.9 : 0.2,
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

  const equipCount = graphData?.nodes.filter((n) => n.type === "equipment").length ?? 0;
  const totalPoints = graphData?.nodes.filter((n) => n.type === "point").length ?? 0;
  const totalEdges = graphData?.edges.length ?? 0;

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
          <span className="text-foreground font-medium">{totalPoints}</span> points
          {" · "}
          <span className="text-muted-foreground">{totalEdges} links</span>
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
            n.type === "equipment" ? "#C4F82A" : "#3f3f46"
          }
          maskColor="hsla(0, 0%, 4%, 0.8)"
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
        {root
          ? "Click to inspect · Double-click to refocus · Drag to rearrange"
          : "Click equipment to show points · Double-click to focus · Drag to rearrange"
        }
      </div>
    </div>
  );
}
