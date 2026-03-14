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
import Dagre from "@dagrejs/dagre";
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

function layoutWithDagre(
  graphData: GraphData,
  root?: string | null,
): { nodes: Node[]; edges: Edge[] } {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: "LR",
    nodesep: 20,
    ranksep: 80,
    edgesep: 10,
    marginx: 40,
    marginy: 40,
  });

  // Count connections per point for sizing
  const pointConnectionCount = new Map<string, number>();
  for (const e of graphData.edges) {
    pointConnectionCount.set(e.target, (pointConnectionCount.get(e.target) || 0) + 1);
  }

  // Count points per equipment
  const equipPointCount = new Map<string, number>();
  for (const e of graphData.edges) {
    equipPointCount.set(e.source, (equipPointCount.get(e.source) || 0) + 1);
  }

  for (const n of graphData.nodes) {
    const isEquip = n.type === "equipment";
    g.setNode(n.id, {
      width: isEquip ? 160 : 150,
      height: isEquip ? 44 : 32,
    });
  }

  for (const e of graphData.edges) {
    g.setEdge(e.source, e.target);
  }

  Dagre.layout(g);

  const nodes: Node[] = graphData.nodes.map((n) => {
    const pos = g.node(n.id);
    const isEquip = n.type === "equipment";
    return {
      id: n.id,
      type: n.type,
      position: {
        x: pos.x - (isEquip ? 80 : 75),
        y: pos.y - (isEquip ? 22 : 16),
      },
      data: {
        label: n.label,
        category: n.category,
        pointCount: isEquip ? equipPointCount.get(n.id) || 0 : undefined,
        isRoot: n.id === root,
      },
    };
  });

  const edges: Edge[] = graphData.edges.map((e, i) => ({
    id: `e-${i}`,
    source: e.source,
    target: e.target,
    animated: false,
    style: {
      stroke: "hsl(var(--border))",
      strokeWidth: 1,
      opacity: 0.6,
    },
  }));

  return { nodes, edges };
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
    const { nodes, edges } = layoutWithDagre(graphData, root);
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
          opacity: isConnected ? 1 : 0.3,
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
      <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
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
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.05}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        style={{ background: "hsl(var(--background))" }}
      >
        <Controls
          className="!bg-card !border-border !rounded-lg !shadow-sm [&>button]:!bg-card [&>button]:!border-border [&>button]:!text-muted-foreground [&>button:hover]:!text-foreground [&>button:hover]:!bg-muted"
        />
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="hsl(var(--border))"
        />
        <MiniMap
          className="!bg-card !border-border !rounded-lg"
          nodeStrokeColor={() => "hsl(var(--border))"}
          nodeColor={(n) => (n.type === "equipment" ? "hsl(var(--primary))" : "hsl(var(--muted))")}
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
