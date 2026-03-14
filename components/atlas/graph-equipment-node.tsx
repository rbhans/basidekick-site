"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";

export function EquipmentNode({ data, selected }: NodeProps) {
  const d = data as unknown as {
    label: string;
    category: string;
    pointCount?: number;
    isRoot?: boolean;
  };

  return (
    <div
      className={`rounded-lg border px-3 py-2 transition-all cursor-pointer min-w-[120px] ${
        selected
          ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)] shadow-md shadow-[hsl(var(--primary)/0.2)]"
          : d.isRoot
            ? "border-[hsl(var(--primary)/0.5)] bg-[hsl(var(--card))] hover:border-[hsl(var(--primary))]"
            : "border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--primary)/0.3)]"
      }`}
    >
      <Handle type="source" position={Position.Right} className="!bg-[hsl(var(--primary))] !border-none !w-1.5 !h-1.5" />
      <Handle type="target" position={Position.Left} className="!bg-[hsl(var(--primary))] !border-none !w-1.5 !h-1.5" />
      <div className="text-sm font-semibold text-[hsl(var(--foreground))]">{d.label}</div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{d.category}</span>
        {d.pointCount !== undefined && d.pointCount > 0 && (
          <span className="text-[10px] text-[hsl(var(--primary)/0.7)]">{d.pointCount} pts</span>
        )}
      </div>
    </div>
  );
}
