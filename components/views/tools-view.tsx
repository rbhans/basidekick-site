"use client";

import { SiteBadge } from "@/components/site-badge";
import { FeatureCard } from "@/components/feature-card";
import { StepCard } from "@/components/step-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, AppleLogo, GooglePlayLogo } from "@phosphor-icons/react";
import { TOOL_DETAILS } from "@/lib/constants";
import { getIcon } from "@/lib/icons";
import { PageHero } from "@/components/page-hero";

export function ToolsView() {
  const ssk = TOOL_DETAILS["ssk"];
  const qsk = TOOL_DETAILS["qsk"];

  return (
    <div className="min-h-full">
      {/* Hero */}
            <PageHero imageSrc="/images/hero/tools.png">
          <SiteBadge label="TOOLS" />
          <h1 className="mt-6 text-3xl md:text-4xl font-heading font-bold tracking-tight">
            Built for BAS Professionals
          </h1>
          <p className="mt-3 text-muted-foreground max-w-xl">
            Professional software for building automation. One-time purchase, no subscriptions.
          </p>
      </PageHero>

      {/* SimulatorSidekick Section */}
      {ssk && (
        <section className="py-16 border-t border-border" id="ssk">
          <div className="container mx-auto px-4 sm:px-6 lg:px-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left: Description */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-2xl md:text-3xl font-heading font-bold">{ssk.name}</h2>
                  <Badge variant="outline" className="text-destructive border-destructive/30">Coming Soon</Badge>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {ssk.tagline}. {ssk.description}
                </p>
                <div className="mt-6">
                  <Button className="rounded-lg font-semibold">Get Notified</Button>
                </div>
              </div>

              {/* Right: Demo Placeholder */}
              <div className="aspect-video bg-card border border-border rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Play className="w-7 h-7 text-primary" weight="fill" />
                  </div>
                  <p className="text-sm text-muted-foreground">{ssk.name} demo</p>
                </div>
              </div>
            </div>

            {/* Features / Steps / Requirements */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-mono text-[12px] font-bold text-muted-foreground tracking-[2px] uppercase mb-4">Features</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ssk.detailedFeatures.map((f) => (
                    <FeatureCard
                      key={f.title}
                      title={f.title}
                      description={f.description}
                      icon={getIcon(f.iconName, "w-5 h-5 text-primary")}
                    />
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-mono text-[12px] font-bold text-muted-foreground tracking-[2px] uppercase mb-4">How It Works</h3>
                <div className="space-y-4">
                  {ssk.steps.map((s) => (
                    <StepCard key={s.number} number={s.number} title={s.title} description={s.description} />
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-mono text-[12px] font-bold text-muted-foreground tracking-[2px] uppercase mb-4">Requirements</h3>
                <div className="bg-card border border-border rounded-xl p-5">
                  <dl className="space-y-3">
                    {ssk.requirements.map((r) => (
                      <div key={r.label} className="flex justify-between py-2 border-b border-border last:border-0">
                        <dt className="text-sm text-muted-foreground">{r.label}</dt>
                        <dd className="text-sm font-medium">{r.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* QR Sidekick Section */}
      {qsk && (
        <section className="py-16" id="qsk">
          <div className="container mx-auto px-4 sm:px-6 lg:px-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left: Description */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-2xl md:text-3xl font-heading font-bold">{qsk.name}</h2>
                  <Badge variant="outline" className="text-destructive border-destructive/30">Coming Soon</Badge>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {qsk.tagline}. {qsk.description}
                </p>
                <div className="mt-6 flex gap-3">
                  <Button disabled className="gap-2 rounded-lg font-semibold">
                    <AppleLogo className="w-5 h-5" weight="fill" />
                    App Store
                  </Button>
                  <Button variant="outline" disabled className="gap-2 rounded-lg font-semibold">
                    <GooglePlayLogo className="w-5 h-5" weight="fill" />
                    Google Play
                  </Button>
                </div>
              </div>

              {/* Right: Demo Placeholder */}
              <div className="aspect-video bg-card border border-border rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Play className="w-7 h-7 text-primary" weight="fill" />
                  </div>
                  <p className="text-sm text-muted-foreground">{qsk.name} demo</p>
                </div>
              </div>
            </div>

            {/* Features / Steps / Requirements */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-mono text-[12px] font-bold text-muted-foreground tracking-[2px] uppercase mb-4">Features</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {qsk.detailedFeatures.map((f) => (
                    <FeatureCard
                      key={f.title}
                      title={f.title}
                      description={f.description}
                      icon={getIcon(f.iconName, "w-5 h-5 text-primary")}
                    />
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-mono text-[12px] font-bold text-muted-foreground tracking-[2px] uppercase mb-4">How It Works</h3>
                <div className="space-y-4">
                  {qsk.steps.map((s) => (
                    <StepCard key={s.number} number={s.number} title={s.title} description={s.description} />
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-mono text-[12px] font-bold text-muted-foreground tracking-[2px] uppercase mb-4">Requirements</h3>
                <div className="bg-card border border-border rounded-xl p-5">
                  <dl className="space-y-3">
                    {qsk.requirements.map((r) => (
                      <div key={r.label} className="flex justify-between py-2 border-b border-border last:border-0">
                        <dt className="text-sm text-muted-foreground">{r.label}</dt>
                        <dd className="text-sm font-medium">{r.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
