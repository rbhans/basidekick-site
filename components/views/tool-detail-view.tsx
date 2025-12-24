"use client";

import { SectionLabel } from "@/components/section-label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KbdHint } from "@/components/kbd-hint";
import { CircuitBackground } from "@/components/circuit-background";
import {
  Play,
  Download,
  Browser,
  FileMagnifyingGlass,
  TextAa,
  CheckCircle,
  FileText,
  WaveTriangle,
  Plugs,
  Cpu,
  Buildings,
} from "@phosphor-icons/react";
import { ReactNode } from "react";

interface ToolDetailViewProps {
  toolId: "nsk" | "ssk" | "msk";
}

interface Feature {
  icon: ReactNode;
  title: string;
  description: string;
}

interface Step {
  number: number;
  title: string;
  description: string;
}

interface ToolData {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: string;
  status: "ready" | "dev";
  features: Feature[];
  steps: Step[];
  requirements: { label: string; value: string }[];
  webVersion?: boolean;
}

const toolsData: Record<string, ToolData> = {
  nsk: {
    id: "nsk",
    name: "NiagaraSidekick",
    tagline: "QA tool for Niagara stations",
    description: "Finds typos, compares templates, verifies points, generates clean reports.",
    price: "$79",
    status: "ready",
    webVersion: true,
    features: [
      {
        icon: <FileMagnifyingGlass className="size-8 text-primary" />,
        title: "Template Comparison",
        description: "Compare points against templates to find inconsistencies and deviations instantly.",
      },
      {
        icon: <TextAa className="size-8 text-primary" />,
        title: "Typo Detection",
        description: "Smart analysis finds naming errors, misspellings, and formatting issues.",
      },
      {
        icon: <CheckCircle className="size-8 text-primary" />,
        title: "Point Verification",
        description: "Validate point configurations against standards and best practices.",
      },
      {
        icon: <FileText className="size-8 text-primary" />,
        title: "Report Generation",
        description: "Generate clean, professional PDF reports to share with customers.",
      },
    ],
    steps: [
      { number: 1, title: "Export or Connect", description: "Export station CSV or connect live to your Niagara station" },
      { number: 2, title: "Analyze", description: "NSK analyzes and groups points by template automatically" },
      { number: 3, title: "Review & Report", description: "Review findings, fix issues, and generate clean reports" },
    ],
    requirements: [
      { label: "Platform", value: "Windows 10+" },
      { label: "For live connection", value: "Niagara 4.x" },
      { label: "CSV works with", value: "Any Niagara version" },
    ],
  },
  ssk: {
    id: "ssk",
    name: "SimulatorSidekick",
    tagline: "BACnet/Modbus simulator",
    description: "Create virtual devices in seconds for testing and development.",
    price: "$75",
    status: "ready",
    webVersion: false,
    features: [
      {
        icon: <WaveTriangle className="size-8 text-primary" />,
        title: "BACnet Simulation",
        description: "Create virtual BACnet devices with customizable object types and properties.",
      },
      {
        icon: <Plugs className="size-8 text-primary" />,
        title: "Modbus Simulation",
        description: "Simulate Modbus TCP/RTU devices with configurable registers.",
      },
      {
        icon: <Cpu className="size-8 text-primary" />,
        title: "Multiple Devices",
        description: "Run multiple virtual devices simultaneously for complex testing scenarios.",
      },
      {
        icon: <FileText className="size-8 text-primary" />,
        title: "Templates",
        description: "Save and load device templates for quick setup on future projects.",
      },
    ],
    steps: [
      { number: 1, title: "Create Device", description: "Define your virtual device type and properties" },
      { number: 2, title: "Configure Points", description: "Add and configure simulated points" },
      { number: 3, title: "Start Simulation", description: "Run the simulator and connect your BAS" },
    ],
    requirements: [
      { label: "Platform", value: "Windows 10+" },
      { label: "BACnet", value: "BACnet/IP" },
      { label: "Modbus", value: "TCP & RTU" },
    ],
  },
  msk: {
    id: "msk",
    name: "MetasysSidekick",
    tagline: "QA tool for Metasys systems",
    description: "Same power as NSK, built for JCI environments.",
    price: "$79",
    status: "dev",
    webVersion: false,
    features: [
      {
        icon: <Buildings className="size-8 text-primary" />,
        title: "Metasys Integration",
        description: "Native support for Metasys system exports and configurations.",
      },
      {
        icon: <FileMagnifyingGlass className="size-8 text-primary" />,
        title: "Template Comparison",
        description: "Compare points against templates to find inconsistencies.",
      },
      {
        icon: <TextAa className="size-8 text-primary" />,
        title: "Typo Detection",
        description: "Smart analysis finds naming errors and formatting issues.",
      },
      {
        icon: <FileText className="size-8 text-primary" />,
        title: "Report Generation",
        description: "Generate clean, professional PDF reports.",
      },
    ],
    steps: [
      { number: 1, title: "Export Data", description: "Export your Metasys system configuration" },
      { number: 2, title: "Analyze", description: "MSK analyzes and groups points automatically" },
      { number: 3, title: "Review & Report", description: "Review findings and generate reports" },
    ],
    requirements: [
      { label: "Platform", value: "Windows 10+" },
      { label: "Metasys Version", value: "10.x+" },
      { label: "Export Format", value: "CSV/XML" },
    ],
  },
};

export function ToolDetailView({ toolId }: ToolDetailViewProps) {
  const tool = toolsData[toolId];

  if (!tool) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Tool not found
      </div>
    );
  }

  return (
    <div className="min-h-full">
      {/* Hero Section */}
      <section className="relative py-12 md:py-16 overflow-hidden">
        <CircuitBackground opacity={0.15} />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <SectionLabel>{tool.id}</SectionLabel>
            <Badge variant={tool.status === "ready" ? "default" : "secondary"}>
              {tool.status === "ready" ? "Ready" : "In Development"}
            </Badge>
          </div>

          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            {tool.name}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-xl">
            {tool.tagline}. {tool.description}
          </p>

          <p className="mt-4 font-mono text-2xl">
            {tool.price}{" "}
            <span className="text-base text-muted-foreground">
              one-time &middot; 1 year updates
            </span>
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {tool.status === "ready" ? (
              <>
                <Button size="lg">
                  <Download className="size-4 mr-2" />
                  Download for Windows
                  <KbdHint keys="D" />
                </Button>
                {tool.webVersion && (
                  <Button variant="outline" size="lg">
                    <Browser className="size-4 mr-2" />
                    Try Free (Web)
                  </Button>
                )}
              </>
            ) : (
              <Button size="lg">
                Get Notified When Ready
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-12 bg-card/30">
        <div className="container mx-auto px-4">
          <SectionLabel>demo</SectionLabel>

          <div className="mt-6 max-w-3xl">
            <div className="aspect-video bg-muted border border-border flex items-center justify-center">
              <div className="text-center">
                <div className="size-14 bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Play className="size-7 text-primary" weight="fill" />
                </div>
                <p className="text-muted-foreground text-sm">{tool.name} demo video</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <SectionLabel>features</SectionLabel>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {tool.features.map((feature) => (
              <div
                key={feature.title}
                className="p-5 border border-border bg-card"
              >
                {feature.icon}
                <h3 className="text-base font-semibold mt-3 mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 bg-card/30">
        <div className="container mx-auto px-4">
          <SectionLabel>how it works</SectionLabel>

          <div className="mt-6 max-w-lg">
            <div className="relative">
              <div className="absolute left-4 top-6 bottom-6 w-px bg-border" />

              <div className="space-y-6">
                {tool.steps.map((step) => (
                  <div key={step.number} className="relative flex gap-4">
                    <div className="relative z-10 flex items-center justify-center size-8 bg-primary text-primary-foreground font-mono text-sm font-medium">
                      {step.number}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{step.title}</h4>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <SectionLabel>requirements</SectionLabel>

          <div className="mt-6 max-w-sm">
            <dl className="space-y-3">
              {tool.requirements.map((req) => (
                <div key={req.label} className="flex justify-between py-2 border-b border-border">
                  <dt className="text-sm text-muted-foreground">{req.label}</dt>
                  <dd className="text-sm font-medium">{req.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-card/30">
        <div className="container mx-auto px-4 text-center">
          <p className="font-mono text-2xl">
            {tool.price}{" "}
            <span className="text-base text-muted-foreground">
              one-time &middot; 1 year updates
            </span>
          </p>
          {tool.status === "ready" ? (
            <Button size="lg" className="mt-4">
              <Download className="size-4 mr-2" />
              Download for Windows
            </Button>
          ) : (
            <Button size="lg" className="mt-4">
              Get Notified When Ready
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
