"use client";

import { useState } from "react";
import { NavTreeItem } from "./nav-tree-item";
import { NAV_ITEMS } from "@/lib/constants";
import { NavNode } from "@/lib/types";
import { getIcon } from "@/lib/icons";

interface NavTreeProps {
  activeView: string;
  onViewChange: (viewId: string) => void;
}

export function NavTree({ activeView, onViewChange }: NavTreeProps) {
  // Track expanded state for each folder
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    NAV_ITEMS.forEach(item => {
      initial[item.id] = item.defaultExpanded ?? false;
    });
    return initial;
  });

  const toggleExpanded = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderNode = (node: NavNode, depth: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expanded[node.id] ?? false;
    const isActive = activeView === node.id;

    return (
      <div key={node.id}>
        <NavTreeItem
          id={node.id}
          label={node.label}
          icon={node.iconName ? getIcon(node.iconName) : undefined}
          badge={node.badge}
          active={isActive}
          expanded={isExpanded}
          hasChildren={hasChildren}
          depth={depth}
          onClick={() => onViewChange(node.id)}
          onToggle={hasChildren ? () => toggleExpanded(node.id) : undefined}
        />

        {/* Render children if expanded */}
        {hasChildren && isExpanded && (
          <div>
            {node.children!.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className="py-2">
      {NAV_ITEMS.map(item => renderNode(item))}
    </nav>
  );
}
