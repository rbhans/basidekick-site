"use client";

import { useState, ReactNode } from "react";
import { NavTreeItem } from "./nav-tree-item";
import {
  Wrench,
  Book,
  User,
  Desktop,
  WaveTriangle,
  Buildings,
  BookOpen,
  Chats,
  Kanban,
  SignIn,
  UserPlus
} from "@phosphor-icons/react";

export interface TreeNode {
  id: string;
  label: string;
  icon?: string;
  badge?: {
    text: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  };
  children?: TreeNode[];
  defaultExpanded?: boolean;
}

interface NavTreeProps {
  activeView: string;
  onViewChange: (viewId: string) => void;
}

// Icon mapping
const iconMap: Record<string, ReactNode> = {
  Wrench: <Wrench className="w-4 h-4" />,
  Book: <Book className="w-4 h-4" />,
  User: <User className="w-4 h-4" />,
  Desktop: <Desktop className="w-4 h-4" />,
  WaveTriangle: <WaveTriangle className="w-4 h-4" />,
  Buildings: <Buildings className="w-4 h-4" />,
  BookOpen: <BookOpen className="w-4 h-4" />,
  Chats: <Chats className="w-4 h-4" />,
  Kanban: <Kanban className="w-4 h-4" />,
  SignIn: <SignIn className="w-4 h-4" />,
  UserPlus: <UserPlus className="w-4 h-4" />,
};

// Navigation tree data
const navItems: TreeNode[] = [
  {
    id: "tools",
    label: "TOOLS",
    icon: "Wrench",
    defaultExpanded: true,
    children: [
      {
        id: "nsk",
        label: "NiagaraSidekick",
        icon: "Desktop",
        badge: { text: "Ready", variant: "outline" }
      },
      {
        id: "ssk",
        label: "SimulatorSidekick",
        icon: "WaveTriangle",
        badge: { text: "Ready", variant: "outline" }
      },
      {
        id: "msk",
        label: "MetasysSidekick",
        icon: "Buildings",
        badge: { text: "Dev", variant: "outline" }
      },
    ]
  },
  {
    id: "resources",
    label: "RESOURCES",
    icon: "Book",
    defaultExpanded: true,
    children: [
      { id: "wiki", label: "Wiki", icon: "BookOpen" },
      { id: "forum", label: "Forum", icon: "Chats" },
      { id: "psk", label: "PSK (Free)", icon: "Kanban" },
    ]
  },
  {
    id: "account",
    label: "ACCOUNT",
    icon: "User",
    defaultExpanded: false,
    children: [
      { id: "signin", label: "Sign In", icon: "SignIn" },
      { id: "signup", label: "Sign Up", icon: "UserPlus" },
    ]
  }
];

export function NavTree({ activeView, onViewChange }: NavTreeProps) {
  // Track expanded state for each folder
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    navItems.forEach(item => {
      initial[item.id] = item.defaultExpanded ?? false;
    });
    return initial;
  });

  const toggleExpanded = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderNode = (node: TreeNode, depth: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expanded[node.id] ?? false;
    const isActive = activeView === node.id;

    return (
      <div key={node.id}>
        <NavTreeItem
          id={node.id}
          label={node.label}
          icon={node.icon ? iconMap[node.icon] : undefined}
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
      {navItems.map(item => renderNode(item))}
    </nav>
  );
}

export { navItems };
