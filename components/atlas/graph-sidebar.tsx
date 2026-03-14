"use client";

import Link from "next/link";

interface GraphNode {
  id: string;
  type: "equipment" | "point";
  label: string;
  category: string;
}

interface GraphSidebarProps {
  node: GraphNode | null;
  connectedNodes: GraphNode[];
  onNavigate: (id: string) => void;
  onClose: () => void;
}

export function GraphSidebar({ node, connectedNodes, onNavigate, onClose }: GraphSidebarProps) {
  if (!node) return null;

  const isEquip = node.type === "equipment";

  return (
    <div className="absolute right-0 top-0 z-10 h-full w-80 overflow-y-auto border-l bg-white p-4 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">{node.label}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          &times;
        </button>
      </div>

      <div className="mb-2">
        <span
          className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
            isEquip ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {node.type}
        </span>
        <span className="ml-2 text-xs text-gray-500">{node.category}</span>
      </div>

      <Link
        href={`/atlas/${node.id}`}
        className="mb-4 inline-block text-sm text-blue-600 underline hover:text-blue-800"
      >
        View full detail &rarr;
      </Link>

      <h4 className="mb-2 mt-4 text-sm font-medium text-gray-700">
        {isEquip ? "Typical Points" : "Used by Equipment"} ({connectedNodes.length})
      </h4>
      <div className="space-y-1">
        {connectedNodes.map((cn) => (
          <button
            key={cn.id}
            onClick={() => onNavigate(cn.id)}
            className="block w-full rounded px-2 py-1 text-left text-sm hover:bg-gray-100"
          >
            <span className="font-medium">{cn.label}</span>
            <span className="ml-1 text-xs text-gray-400">{cn.category}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
