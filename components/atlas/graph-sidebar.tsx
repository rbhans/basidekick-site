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
    <div className="absolute right-0 top-0 z-10 h-full w-80 overflow-y-auto border-l border-border bg-card p-4 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">{node.label}</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors text-xl leading-none">
          &times;
        </button>
      </div>

      <div className="mb-3 flex items-center gap-2">
        <span
          className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
            isEquip
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {node.type}
        </span>
        <span className="text-xs text-muted-foreground">{node.category}</span>
      </div>

      <Link
        href={`/atlas/${node.id}`}
        className="mb-4 inline-block text-sm text-primary hover:underline"
      >
        View full detail &rarr;
      </Link>

      <h4 className="mb-2 mt-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">
        {isEquip ? "Typical Points" : "Used by Equipment"} ({connectedNodes.length})
      </h4>
      <div className="space-y-0.5">
        {connectedNodes.map((cn) => (
          <button
            key={cn.id}
            onClick={() => onNavigate(cn.id)}
            className="block w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted transition-colors"
          >
            <span className="font-medium text-foreground">{cn.label}</span>
            <span className="ml-1.5 text-xs text-muted-foreground">{cn.category}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
