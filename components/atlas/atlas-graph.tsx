"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

interface SimNode extends SimulationNodeDatum {
  id: string;
  nodeData: GraphNodeData;
}

/**
 * Run d3-force simulation to compute organic positions.
 * Equipment nodes repel strongly and cluster by category.
 * Points cluster near their parent equipment.
 */
function runForceLayout(graphData: GraphData, rootId: string | null) {
  const nodeMap = new Map(graphData.nodes.map((n) => [n.id, n]));

  // Build adjacency for point counts
  const pointsForEquip = new Map<string, string[]>();
  for (const e of graphData.edges) {
    if (!pointsForEquip.has(e.source)) pointsForEquip.set(e.source, []);
    pointsForEquip.get(e.source)!.push(e.target);
  }

  // For root view: only show root + direct connections
  let visibleNodes: GraphNodeData[];
  let visibleEdgeData: Array<{ source: string; target: string }>;

  if (rootId) {
    const rootNode = nodeMap.get(rootId);
    if (!rootNode) return { nodes: [] as Node[], edges: [] as Edge[] };

    const connectedIds = new Set<string>();
    for (const e of graphData.edges) {
      if (e.source === rootId) connectedIds.add(e.target);
      if (e.target === rootId) connectedIds.add(e.source);
    }

    visibleNodes = [rootNode, ...graphData.nodes.filter((n) => connectedIds.has(n.id))];
    const visibleSet = new Set(visibleNodes.map((n) => n.id));
    visibleEdgeData = graphData.edges.filter(
      (e) => visibleSet.has(e.source) && visibleSet.has(e.target)
    );
  } else {
    visibleNodes = graphData.nodes;
    visibleEdgeData = graphData.edges;
  }

  // Create simulation nodes
  const simNodes: SimNode[] = visibleNodes.map((n) => ({
    id: n.id,
    nodeData: n,
    x: undefined,
    y: undefined,
  }));

  const nodeById = new Map(simNodes.map((n) => [n.id, n]));

  // Create simulation links
  const simLinks: SimulationLinkDatum<SimNode>[] = visibleEdgeData
    .filter((e) => nodeById.has(e.source) && nodeById.has(e.target))
    .map((e) => ({
      source: nodeById.get(e.source)!,
      target: nodeById.get(e.target)!,
    }));

  // Category clustering — assign category centers for equipment
  const categories = [...new Set(visibleNodes.filter((n) => n.type === "equipment").map((n) => n.category))];
  const catAngle = new Map<string, number>();
  categories.forEach((cat, i) => {
    catAngle.set(cat, (2 * Math.PI * i) / categories.length);
  });

  const equipCount = visibleNodes.filter((n) => n.type === "equipment").length;
  const totalCount = visibleNodes.length;

  // Scale forces based on node count
  const chargeStrength = rootId
    ? -400
    : totalCount > 200
      ? -250
      : -350;

  const linkDistance = rootId
    ? 180
    : totalCount > 200
      ? 120
      : 150;

  const clusterRadius = rootId ? 0 : Math.max(300, equipCount * 15);

  // Initialize positions — equipment spread by category angle, points near their equipment
  for (const sn of simNodes) {
    if (rootId && sn.id === rootId) {
      sn.x = 0;
      sn.y = 0;
      sn.fx = 0;
      sn.fy = 0;
    } else if (sn.nodeData.type === "equipment") {
      const angle = catAngle.get(sn.nodeData.category) ?? 0;
      const jitter = (Math.random() - 0.5) * clusterRadius * 0.6;
      sn.x = Math.cos(angle) * clusterRadius + jitter;
      sn.y = Math.sin(angle) * clusterRadius + jitter;
    } else {
      // Point — initialize near its parent equipment
      let parentEquipId: string | null = null;
      for (const e of visibleEdgeData) {
        if (e.target === sn.id) { parentEquipId = e.source; break; }
        if (e.source === sn.id) { parentEquipId = e.target; break; }
      }
      const parent = parentEquipId ? nodeById.get(parentEquipId) : null;
      if (parent) {
        sn.x = (parent.x ?? 0) + (Math.random() - 0.5) * 100;
        sn.y = (parent.y ?? 0) + (Math.random() - 0.5) * 100;
      } else {
        sn.x = (Math.random() - 0.5) * 600;
        sn.y = (Math.random() - 0.5) * 600;
      }
    }
  }

  // Run simulation
  const simulation = forceSimulation(simNodes)
    .force(
      "link",
      forceLink<SimNode, SimulationLinkDatum<SimNode>>(simLinks)
        .id((d) => d.id)
        .distance(linkDistance)
        .strength(0.7)
    )
    .force("charge", forceManyBody<SimNode>().strength(chargeStrength))
    .force("center", forceCenter(0, 0).strength(0.05))
    .force(
      "collide",
      forceCollide<SimNode>().radius((d) =>
        d.nodeData.type === "equipment" ? 80 : 50
      ).strength(0.8)
    );

  // Category clustering force (only in overview mode)
  if (!rootId && clusterRadius > 0) {
    simulation
      .force(
        "x",
        forceX<SimNode>((d) => {
          if (d.nodeData.type !== "equipment") return 0;
          const angle = catAngle.get(d.nodeData.category) ?? 0;
          return Math.cos(angle) * clusterRadius;
        }).strength((d) => (d.nodeData.type === "equipment" ? 0.15 : 0.02))
      )
      .force(
        "y",
        forceY<SimNode>((d) => {
          if (d.nodeData.type !== "equipment") return 0;
          const angle = catAngle.get(d.nodeData.category) ?? 0;
          return Math.sin(angle) * clusterRadius;
        }).strength((d) => (d.nodeData.type === "equipment" ? 0.15 : 0.02))
      );
  }

  // Tick to completion
  simulation.stop();
  for (let i = 0; i < 300; i++) simulation.tick();

  // Convert to React Flow nodes
  const rfNodes: Node[] = simNodes.map((sn) => ({
    id: sn.id,
    type: sn.nodeData.type,
    position: { x: sn.x ?? 0, y: sn.y ?? 0 },
    data: {
      label: sn.nodeData.label,
      category: sn.nodeData.category,
      ...(sn.nodeData.type === "equipment"
        ? {
            pointCount: pointsForEquip.get(sn.id)?.length ?? 0,
            isRoot: sn.id === rootId,
          }
        : {}),
    },
  }));

  const visibleIds = new Set(rfNodes.map((n) => n.id));
  const rfEdges: Edge[] = visibleEdgeData
    .filter((e) => visibleIds.has(e.source) && visibleIds.has(e.target))
    .map((e, i) => ({
      id: `e-${i}`,
      source: e.source,
      target: e.target,
      style: {
        stroke: "#C4F82A",
        strokeWidth: 1.5,
        opacity: 0.7,
      },
    }));

  return { nodes: rfNodes, edges: rfEdges };
}

export function AtlasGraph() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const root = searchParams.get("root");
  const layoutRef = useRef(false);

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
        layoutRef.current = false;
      })
      .catch(() => setLoading(false));
  }, [root]);

  useEffect(() => {
    setSelectedNode(null);
    layoutRef.current = false;
  }, [root]);

  const { layoutNodes, layoutEdges } = useMemo(() => {
    if (!graphData) return { layoutNodes: [], layoutEdges: [] };
    const { nodes, edges } = runForceLayout(graphData, root);
    return { layoutNodes: nodes, layoutEdges: edges };
  }, [graphData, root]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutEdges);

  useEffect(() => {
    setNodes(layoutNodes);
    setEdges(layoutEdges);
  }, [layoutNodes, layoutEdges, setNodes, setEdges]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode(node.id);
    },
    []
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

  // Highlight edges for selected node
  const styledEdges = useMemo(() => {
    if (!selectedNode) return edges;
    return edges.map((e) => {
      const isConnected = e.source === selectedNode || e.target === selectedNode;
      return {
        ...e,
        animated: isConnected,
        style: {
          stroke: isConnected ? "#C4F82A" : "#C4F82A",
          strokeWidth: isConnected ? 2.5 : 1,
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
          : "Click to inspect · Double-click to focus · Drag to rearrange"
        }
      </div>
    </div>
  );
}
