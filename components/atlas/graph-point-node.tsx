"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";

export function PointNode({ data, selected }: NodeProps) {
  const d = data as unknown as {
    label: string;
    category: string;
  };

  return (
    <div
      className={`rounded-md border px-2.5 py-1.5 transition-all cursor-pointer ${
        selected
          ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)] shadow-sm shadow-[hsl(var(--primary)/0.15)]"
          : "border-[hsl(var(--border))] bg-[hsl(var(--muted))] hover:border-[hsl(var(--primary)/0.3)]"
      }`}
    >
      <Handle type="source" position={Position.Right} className="!bg-[hsl(var(--muted-foreground))] !border-none !w-1.5 !h-1.5" />
      <Handle type="target" position={Position.Left} className="!bg-[hsl(var(--muted-foreground))] !border-none !w-1.5 !h-1.5" />
      <div className="text-xs font-medium text-[hsl(var(--foreground))]">{d.label}</div>
      <div className="text-[10px] text-[hsl(var(--muted-foreground))]">{d.category}</div>
    </div>
  );
}
