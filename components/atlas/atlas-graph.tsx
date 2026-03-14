"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useSearchParams, useRouter } from "next/navigation";
import { EquipmentNode } from "./graph-equipment-node";
import { PointNode } from "./graph-point-node";
import { GraphSidebar } from "./graph-sidebar";

interface GraphData {
  nodes: Array<{
    id: string;
    type: "equipment" | "point";
    label: string;
    category: string;
  }>;
  edges: Array<{ source: string; target: string }>;
  root?: string;
}

const nodeTypes = {
  equipment: EquipmentNode,
  point: PointNode,
};

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

  // Layout nodes in a force-like arrangement
  const { flowNodes, flowEdges } = useMemo(() => {
    if (!graphData) return { flowNodes: [], flowEdges: [] };

    const equipNodes = graphData.nodes.filter((n) => n.type === "equipment");
    const pointNodes = graphData.nodes.filter((n) => n.type === "point");

    // Simple grid layout: equipment on left, points on right
    const nodes: Node[] = [];
    const centerY = Math.max(equipNodes.length, pointNodes.length) * 40;

    equipNodes.forEach((n, i) => {
      nodes.push({
        id: n.id,
        type: "equipment",
        position: {
          x: 50 + Math.random() * 100,
          y: (i / equipNodes.length) * centerY * 2,
        },
        data: { label: n.label, category: n.category },
      });
    });

    pointNodes.forEach((n, i) => {
      nodes.push({
        id: n.id,
        type: "point",
        position: {
          x: 500 + Math.random() * 100,
          y: (i / pointNodes.length) * centerY * 2,
        },
        data: { label: n.label, category: n.category },
      });
    });

    const edges: Edge[] = graphData.edges.map((e, i) => ({
      id: `e-${i}`,
      source: e.source,
      target: e.target,
      animated: false,
      style: { stroke: "#94a3b8", strokeWidth: 1 },
    }));

    return { flowNodes: nodes, flowEdges: edges };
  }, [graphData]);

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges);

  useEffect(() => {
    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [flowNodes, flowEdges, setNodes, setEdges]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node.id);
  }, []);

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

  if (loading) {
    return <div className="flex h-full items-center justify-center">Loading graph...</div>;
  }

  return (
    <div className="relative h-full w-full">
      {/* Search bar */}
      <div className="absolute left-4 top-4 z-10">
        <input
          type="text"
          placeholder="Search equipment or points..."
          className="rounded-lg border bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-400 focus:outline-none"
          onChange={(e) => {
            if (e.target.value.length > 2) {
              const match = graphData?.nodes.find((n) =>
                n.label.toLowerCase().includes(e.target.value.toLowerCase())
              );
              if (match) onNavigate(match.id);
            }
          }}
        />
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
      >
        <Controls />
        <Background />
        <MiniMap
          nodeStrokeColor={(n) => (n.type === "equipment" ? "#3b82f6" : "#10b981")}
          nodeColor={(n) => (n.type === "equipment" ? "#dbeafe" : "#d1fae5")}
        />
      </ReactFlow>

      <GraphSidebar
        node={selectedGraphNode}
        connectedNodes={connectedNodes}
        onNavigate={onNavigate}
        onClose={() => setSelectedNode(null)}
      />
    </div>
  );
}
