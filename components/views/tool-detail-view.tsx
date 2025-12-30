"use client";

import { SectionLabel } from "@/components/section-label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CircuitBackground } from "@/components/circuit-background";
import { Play } from "@phosphor-icons/react";
import { TOOL_DETAILS } from "@/lib/constants";
import { getIcon } from "@/lib/icons";

interface ToolDetailViewProps {
  toolId: "nsk" | "ssk" | "msk";
}

export function ToolDetailView({ toolId }: ToolDetailViewProps) {
  const tool = TOOL_DETAILS[toolId];

  if (!tool) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Tool not found
      </div>
    );
  }

  const renderPurchaseButton = (size: "default" | "lg" = "lg") => {
    // All tools are "Coming Soon" for now
    return (
      <Button size={size}>
        Get Notified When Ready
      </Button>
    );
  };

  return (
    <div className="min-h-full">
      {/* Hero Section */}
      <section className="relative py-12 md:py-16 overflow-hidden">
        <CircuitBackground opacity={0.15} />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <SectionLabel>{tool.id}</SectionLabel>
            <Badge variant="outline">
              Coming Soon
            </Badge>
          </div>

          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            {tool.name}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-xl">
            {tool.tagline}. {tool.description}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {renderPurchaseButton("lg")}
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
            {tool.detailedFeatures.map((feature) => (
              <div
                key={feature.title}
                className="p-5 border border-border bg-card"
              >
                {getIcon(feature.iconName, "size-8 text-primary")}
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
          <div>
            {renderPurchaseButton("lg")}
          </div>
        </div>
      </section>
    </div>
  );
}
