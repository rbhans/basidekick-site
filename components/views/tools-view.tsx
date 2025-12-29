"use client";

import { SectionLabel } from "@/components/section-label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CircuitBackground } from "@/components/circuit-background";
import { ArrowRight, CheckCircle } from "@phosphor-icons/react";
import { TOOLS_LIST, USE_CASES } from "@/lib/constants";
import { getIcon } from "@/lib/icons";

interface ToolsViewProps {
  onNavigate: (viewId: string) => void;
}

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
            {TOOLS_LIST.map((tool) => (
              <div
                key={tool.id}
                className="flex flex-col p-6 border border-border bg-card hover:border-primary/50 transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-primary">{getIcon(tool.iconName, "size-6")}</div>
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
            {USE_CASES.map((useCase) => (
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
