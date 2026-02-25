"use client";

import { SiteBadge } from "@/components/site-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, AppleLogo, GooglePlayLogo, CheckCircle, ShieldCheck } from "@phosphor-icons/react";
import Link from "next/link";
import { TOOL_DETAILS } from "@/lib/constants";
import { getIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface ToolDetailViewProps {
  toolId: "ssk" | "qsk";
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
      <section className="relative py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-200px] left-[-100px] w-[600px] h-[600px] rounded-full opacity-[0.04]" style={{ background: "radial-gradient(circle, #C4F82A 0%, transparent 70%)" }} />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-20 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <SiteBadge label={tool.id.toUpperCase()} />
            <Badge variant="outline">
              Coming Soon
            </Badge>
          </div>

          <h1 className="text-3xl md:text-4xl font-heading font-bold tracking-tight">
            {tool.name}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-xl">
            {tool.tagline}. {tool.description}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {tool.mobileApp ? (
              <>
                <Button size="lg" disabled className="gap-2">
                  <AppleLogo className="size-5" weight="fill" />
                  App Store
                  <Badge variant="outline" className="ml-1 text-xs">Coming Soon</Badge>
                </Button>
                <Button size="lg" variant="outline" disabled className="gap-2">
                  <GooglePlayLogo className="size-5" weight="fill" />
                  Google Play
                  <Badge variant="outline" className="ml-1 text-xs">Coming Soon</Badge>
                </Button>
              </>
            ) : (
              renderPurchaseButton("lg")
            )}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h3 className="font-mono text-[12px] font-bold text-muted-foreground tracking-[2px] uppercase">demo</h3>

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
          <h3 className="font-mono text-[12px] font-bold text-muted-foreground tracking-[2px] uppercase">features</h3>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {tool.detailedFeatures.map((feature) => (
              <div
                key={feature.title}
                className="p-5 border border-border bg-card shadow-sm"
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
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h3 className="font-mono text-[12px] font-bold text-muted-foreground tracking-[2px] uppercase">how it works</h3>

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
          <h3 className="font-mono text-[12px] font-bold text-muted-foreground tracking-[2px] uppercase">requirements</h3>

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

      {/* Use Cases - Only for tools that have them */}
      {tool.useCases && tool.useCases.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h3 className="font-mono text-[12px] font-bold text-muted-foreground tracking-[2px] uppercase">use cases</h3>

            <div className="mt-6 max-w-lg space-y-3">
              {tool.useCases.map((useCase, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <CheckCircle className="size-5 text-primary mt-0.5 flex-shrink-0" weight="fill" />
                  <p className="text-sm text-muted-foreground">{useCase}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Perfect For - Only for tools that have them */}
      {tool.perfectFor && tool.perfectFor.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h3 className="font-mono text-[12px] font-bold text-muted-foreground tracking-[2px] uppercase">perfect for</h3>

            <div className="mt-6 flex flex-wrap gap-2">
              {tool.perfectFor.map((persona, index) => (
                <Badge key={index} variant="secondary" className="text-sm py-1.5 px-3">
                  {persona}
                </Badge>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pricing - Only for tools that have pricing tiers */}
      {tool.pricing && tool.pricing.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h3 className="font-mono text-[12px] font-bold text-muted-foreground tracking-[2px] uppercase">pricing</h3>
            <p className="mt-2 text-sm text-muted-foreground">Free to scan and use. Upgrade for more equipment.</p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-3xl">
              {tool.pricing.map((tier) => (
                <div
                  key={tier.name}
                  className={cn(
                    "p-5 border bg-card",
                    tier.highlighted ? "border-primary" : "border-border"
                  )}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="font-semibold">{tier.name}</h3>
                    {tier.highlighted && (
                      <Badge variant="default" className="text-xs">Popular</Badge>
                    )}
                  </div>
                  <p className="text-2xl font-bold">{tier.price}</p>
                  <p className="text-sm text-muted-foreground mt-1">{tier.limit}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-12">
        <div className="container mx-auto px-4 text-center">
          <div>
            {tool.mobileApp ? (
              <div className="flex flex-wrap justify-center gap-3">
                <Button size="lg" disabled className="gap-2">
                  <AppleLogo className="size-5" weight="fill" />
                  App Store
                  <Badge variant="outline" className="ml-1 text-xs">Coming Soon</Badge>
                </Button>
                <Button size="lg" variant="outline" disabled className="gap-2">
                  <GooglePlayLogo className="size-5" weight="fill" />
                  Google Play
                  <Badge variant="outline" className="ml-1 text-xs">Coming Soon</Badge>
                </Button>
              </div>
            ) : (
              renderPurchaseButton("lg")
            )}
          </div>

          {/* Privacy Policy Link for QSK */}
          {toolId === "qsk" && (
            <div className="mt-6">
              <Link
                href="/tools/qsk/privacy"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ShieldCheck className="size-4" />
                Privacy Policy
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
