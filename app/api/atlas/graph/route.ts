import { NextRequest, NextResponse } from "next/server";
import { dbAll, dbGet } from "@/lib/data/atlas-db";

interface GraphNode {
  id: string;
  type: "equipment" | "point";
  label: string;
  category: string;
}

interface GraphEdge {
  source: string;
  target: string;
}

export async function GET(request: NextRequest) {
  const root = request.nextUrl.searchParams.get("root");
  const depth = Math.min(parseInt(request.nextUrl.searchParams.get("depth") || "1"), 3);

  if (root) {
    return NextResponse.json(getNeighborhood(root, depth));
  }

  // Full graph
  const equipNodes = dbAll<{ id: string; name: string; category: string }>(
    "SELECT id, name, category FROM equipment ORDER BY name"
  );
  const pointNodes = dbAll<{ id: string; name: string; category: string }>(
    `SELECT DISTINCT p.id, p.name, p.category FROM points p
     JOIN equipment_typical_points etp ON etp.point_id = p.id`
  );
  const edges = dbAll<{ equipment_id: string; point_id: string }>(
    "SELECT equipment_id, point_id FROM equipment_typical_points"
  );

  const nodes: GraphNode[] = [
    ...equipNodes.map((e) => ({ id: e.id, type: "equipment" as const, label: e.name, category: e.category })),
    ...pointNodes.map((p) => ({ id: p.id, type: "point" as const, label: p.name, category: p.category })),
  ];

  return NextResponse.json({
    nodes,
    edges: edges.map((e) => ({ source: e.equipment_id, target: e.point_id })),
  });
}

function getNeighborhood(rootId: string, depth: number) {
  const nodes = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];
  const visited = new Set<string>();

  function expand(id: string, currentDepth: number) {
    if (visited.has(id) || currentDepth > depth) return;
    visited.add(id);

    // Check if equipment
    const equip = dbGet<{ id: string; name: string; category: string }>(
      "SELECT id, name, category FROM equipment WHERE id = ?", id
    );
    if (equip) {
      nodes.set(equip.id, { id: equip.id, type: "equipment", label: equip.name, category: equip.category });
      const points = dbAll<{ point_id: string; name: string; category: string }>(
        `SELECT p.id as point_id, p.name, p.category
         FROM equipment_typical_points etp
         JOIN points p ON p.id = etp.point_id
         WHERE etp.equipment_id = ?`, id
      );
      for (const p of points) {
        nodes.set(p.point_id, { id: p.point_id, type: "point", label: p.name, category: p.category });
        edges.push({ source: equip.id, target: p.point_id });
        if (currentDepth < depth) expand(p.point_id, currentDepth + 1);
      }
    }

    // Check if point
    const point = dbGet<{ id: string; name: string; category: string }>(
      "SELECT id, name, category FROM points WHERE id = ?", id
    );
    if (point) {
      nodes.set(point.id, { id: point.id, type: "point", label: point.name, category: point.category });
      const equips = dbAll<{ equipment_id: string; name: string; category: string }>(
        `SELECT e.id as equipment_id, e.name, e.category
         FROM equipment_typical_points etp
         JOIN equipment e ON e.id = etp.equipment_id
         WHERE etp.point_id = ?`, id
      );
      for (const e of equips) {
        nodes.set(e.equipment_id, { id: e.equipment_id, type: "equipment", label: e.name, category: e.category });
        edges.push({ source: e.equipment_id, target: point.id });
        if (currentDepth < depth) expand(e.equipment_id, currentDepth + 1);
      }
    }
  }

  expand(rootId, 0);

  return {
    nodes: Array.from(nodes.values()),
    edges: dedupeEdges(edges),
    root: rootId,
  };
}

function dedupeEdges(edges: GraphEdge[]): GraphEdge[] {
  const seen = new Set<string>();
  return edges.filter((e) => {
    const key = `${e.source}|${e.target}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
