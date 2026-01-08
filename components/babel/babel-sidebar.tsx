"use client";

import { cn } from "@/lib/utils";
import type { BabelCategory } from "@/lib/types";
import {
  Cpu,
  Gauge,
  Thermometer,
  Wind,
  Drop,
  Warning,
  ToggleRight,
  Sliders,
  ArrowsHorizontal,
  Fan,
  Funnel,
  Factory,
  Lightning,
  Engine,
  AirplaneTilt,
} from "@phosphor-icons/react";

interface BabelSidebarProps {
  categories: BabelCategory[];
  selectedCategory: string | null;
  onCategorySelect: (id: string | null) => void;
}

const categoryIcons: Record<string, React.ElementType> = {
  // Equipment
  "air-handling": Wind,
  "terminal-units": ArrowsHorizontal,
  "central-plant": Factory,
  metering: Lightning,
  motors: Engine,
  vrf: AirplaneTilt,
  // Points
  fans: Fan,
  dampers: Funnel,
  valves: Sliders,
  temperatures: Thermometer,
  pressures: Gauge,
  setpoints: Cpu,
  flows: Drop,
  humidity: Drop,
  alarms: Warning,
  status: ToggleRight,
  commands: ToggleRight,
};

export function BabelSidebar({
  categories,
  selectedCategory,
  onCategorySelect,
}: BabelSidebarProps) {
  const equipmentCategories = categories.filter((c) => c.type === "equipment");
  const pointCategories = categories.filter((c) => c.type === "points");

  return (
    <aside className="w-full lg:w-56 shrink-0">
      <div className="sticky top-4 space-y-6">
        {/* All entries */}
        <button
          onClick={() => onCategorySelect(null)}
          className={cn(
            "w-full text-left px-3 py-2 text-sm font-medium rounded transition-colors",
            selectedCategory === null
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          All Entries
        </button>

        {/* Equipment categories */}
        {equipmentCategories.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-3">
              Equipment
            </h3>
            <ul className="space-y-1">
              {equipmentCategories.map((category) => {
                const Icon = categoryIcons[category.id] || Cpu;
                return (
                  <li key={category.id}>
                    <button
                      onClick={() => onCategorySelect(category.id)}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 text-sm rounded transition-colors",
                        selectedCategory === category.id
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      <Icon className="size-4" />
                      <span className="flex-1 text-left">{category.name}</span>
                      <span className="text-xs opacity-60">{category.count}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Point categories */}
        {pointCategories.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-3">
              Points
            </h3>
            <ul className="space-y-1">
              {pointCategories.map((category) => {
                const Icon = categoryIcons[category.id] || Cpu;
                return (
                  <li key={category.id}>
                    <button
                      onClick={() => onCategorySelect(category.id)}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 text-sm rounded transition-colors",
                        selectedCategory === category.id
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      <Icon className="size-4" />
                      <span className="flex-1 text-left">{category.name}</span>
                      <span className="text-xs opacity-60">{category.count}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
}
