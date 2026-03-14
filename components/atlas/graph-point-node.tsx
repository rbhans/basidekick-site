"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";

interface PointNodeData {
  label: string;
  category: string;
}

export function PointNode({ data, selected }: NodeProps) {
  const d = data as unknown as PointNodeData;
  return (
    <div
      className={`rounded-md border px-2 py-1 shadow-sm transition-all ${
        selected
          ? "border-emerald-500 bg-emerald-50 shadow-md"
          : "border-emerald-200 bg-white hover:border-emerald-300"
      }`}
    >
      <Handle type="source" position={Position.Right} className="!bg-emerald-400" />
      <Handle type="target" position={Position.Left} className="!bg-emerald-400" />
      <div className="text-xs font-medium text-emerald-900">{d.label}</div>
      <div className="text-[10px] text-emerald-500">{d.category}</div>
    </div>
  );
}
