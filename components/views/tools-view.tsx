"use client";

import { SectionLabel } from "@/components/section-label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CircuitBackground } from "@/components/circuit-background";
import {
  ArrowRight,
  Desktop,
  WaveTriangle,
  Buildings,
  FileMagnifyingGlass,
  TextAa,
  CheckCircle,
  FileText,
  Plugs,
  Cpu,
} from "@phosphor-icons/react";
import { ReactNode } from "react";

interface ToolsViewProps {
  onNavigate: (viewId: string) => void;
}

interface ToolInfo {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  price: string;
  status: "ready" | "dev";
  icon: ReactNode;
  features: string[];
}

const tools: ToolInfo[] = [
  {
    id: "nsk",
    name: "NiagaraSidekick",
    shortName: "NSK",
    tagline: "QA tool for Niagara stations",
    price: "$79",
    status: "ready",
    icon: <Desktop className="size-6" />,
    features: [
      "Template comparison",
      "Typo detection",
      "Point verification",
      "PDF report generation",
    ],
  },
  {
    id: "ssk",
    name: "SimulatorSidekick",
    shortName: "SSK",
    tagline: "BACnet/Modbus simulator",
    price: "$75",
    status: "ready",
    icon: <WaveTriangle className="size-6" />,
    features: [
      "BACnet/IP simulation",
      "Modbus TCP/RTU support",
      "Multiple virtual devices",
      "Save/load templates",
    ],
  },
  {
    id: "msk",
    name: "MetasysSidekick",
    shortName: "MSK",
    tagline: "QA tool for Metasys systems",
    price: "$79",
    status: "dev",
    icon: <Buildings className="size-6" />,
    features: [
      "Metasys integration",
      "Template comparison",
      "Typo detection",
      "PDF report generation",
    ],
  },
];

interface UseCase {
  title: string;
  description: string;
  tools: string[];
}

const useCases: UseCase[] = [
  {
    title: "Commissioning a new building",
    description: "Verify point configurations and simulate devices before go-live",
    tools: ["NSK", "SSK"],
  },
  {
    title: "QA check before handoff",
    description: "Generate clean reports showing all points are correctly configured",
    tools: ["NSK", "MSK"],
  },
  {
    title: "Testing integrations offline",
    description: "Simulate BACnet/Modbus devices without physical hardware",
    tools: ["SSK"],
  },
  {
    title: "Metasys site audit",
    description: "Review and document Metasys system configurations",
    tools: ["MSK"],
  },
];

export function ToolsView({ onNavigate }: ToolsViewProps) {
  return (
    <div className="min-h-full">
      {/* Header */}
      <section className="relative py-12 overflow-hidden">
        <CircuitBackground opacity={0.15} />
        <div className="container mx-auto px-4 relative z-10">
          <SectionLabel>tools</SectionLabel>

          <h1 className="mt-6 text-3xl md:text-4xl font-semibold tracking-tight">
            BAS Tools
          </h1>
          <p className="mt-3 text-muted-foreground max-w-xl">
            Professional software for building automation professionals.
            One-time purchase, no subscriptions.
          </p>
        </div>
      </section>

      {/* Expanded Tool Cards */}
      <section className="py-8 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {tools.map((tool) => (
              <div
                key={tool.id}
                className="flex flex-col p-6 border border-border bg-card hover:border-primary/50 transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-primary">{tool.icon}</div>
                    <span className="font-mono text-sm text-muted-foreground uppercase tracking-wide">
                      {tool.shortName}
                    </span>
                  </div>
                  <Badge variant={tool.status === "ready" ? "default" : "secondary"}>
                    {tool.status === "ready" ? "Ready" : "In Dev"}
                  </Badge>
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold">{tool.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{tool.tagline}</p>

                {/* Features */}
                <ul className="mt-4 space-y-2 flex-grow">
                  {tool.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="size-4 text-primary flex-shrink-0" weight="fill" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Footer */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                  <span className="font-mono text-lg">{tool.price}</span>
                  <Button size="sm" onClick={() => onNavigate(tool.id)}>
                    {tool.status === "ready" ? "View Details" : "Get Notified"}
                    <ArrowRight className="size-3 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <SectionLabel>use cases</SectionLabel>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
            {useCases.map((useCase) => (
              <div
                key={useCase.title}
                className="p-4 border border-border bg-card/50"
              >
                <h4 className="font-medium">{useCase.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {useCase.description}
                </p>
                <div className="flex gap-2 mt-3">
                  {useCase.tools.map((tool) => (
                    <span
                      key={tool}
                      className="text-xs font-mono px-2 py-0.5 bg-primary/10 text-primary border border-primary/20"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
