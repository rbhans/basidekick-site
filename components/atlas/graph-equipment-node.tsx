"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";

interface EquipmentNodeData {
  label: string;
  category: string;
  pointCount?: number;
}

export function EquipmentNode({ data, selected }: NodeProps) {
  const d = data as unknown as EquipmentNodeData;
  return (
    <div
      className={`rounded-lg border-2 px-3 py-2 shadow-sm transition-all ${
        selected
          ? "border-blue-500 bg-blue-50 shadow-md"
          : "border-blue-200 bg-white hover:border-blue-300"
      }`}
    >
      <Handle type="source" position={Position.Right} className="!bg-blue-400" />
      <Handle type="target" position={Position.Left} className="!bg-blue-400" />
      <div className="text-sm font-semibold text-blue-900">{d.label}</div>
      <div className="text-xs text-blue-500">{d.category}</div>
    </div>
  );
}
