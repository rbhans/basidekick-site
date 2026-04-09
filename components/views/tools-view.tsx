"use client";

import { AppleLogo, GooglePlayLogo, Play } from "@phosphor-icons/react";
import { TOOL_DETAILS } from "@/lib/constants";
import { getIcon } from "@/lib/icons";

type ToolData = (typeof TOOL_DETAILS)[keyof typeof TOOL_DETAILS];

export function ToolsView() {
  const ssk = TOOL_DETAILS["ssk"];
  const qsk = TOOL_DETAILS["qsk"];

  return (
    <div className="min-h-full">
      {/* Title block strip */}
      <div className="title-block">
        <div className="field">
          <span className="field-label">Drawing</span>
          <span className="field-value">Tools</span>
        </div>
        <div className="field">
          <span className="field-label">Title</span>
          <span className="field-value">Built for BAS Professionals</span>
        </div>
        <div className="spacer" />
        <div className="field">
          <span className="field-label">Status</span>
          <span className="field-value">Coming soon</span>
        </div>
      </div>

      <section className="container mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-16 py-14">
        <p className="font-heading italic text-[17px] text-muted-foreground text-center leading-[1.5] mb-14 max-w-[640px] mx-auto">
          Professional software for building automation — one-time purchase, no subscriptions.
        </p>

        {ssk && <ToolSection index={1} tool={ssk} platform="desktop" id="ssk" />}
        {qsk && <ToolSection index={2} tool={qsk} platform="mobile" id="qsk" />}
      </section>
    </div>
  );
}

interface ToolSectionProps {
  index: number;
  tool: ToolData;
  platform: "desktop" | "mobile";
  id: string;
}

function ToolSection({ index, tool, platform, id }: ToolSectionProps) {
  const num = String(index).padStart(2, "0");

  return (
    <section id={id} className="mb-16 last:mb-0 scroll-mt-24">
      <div className="flex items-baseline gap-3.5 pb-3.5 border-b border-foreground mb-7">
        <span className="font-mono text-[11px] text-accent tracking-[1px]">{num} /</span>
        <h2 className="font-heading font-semibold text-[26px] leading-none text-foreground">
          {tool.name}
        </h2>
        <span className="ml-auto font-mono text-[9px] uppercase tracking-[1.2px] text-accent border border-accent px-1.5 py-0.5 rounded-sm">
          Coming soon
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-10 mb-10">
        <div>
          <p className="font-heading italic text-[17px] text-muted-foreground leading-[1.5] mb-6">
            {tool.tagline}.
          </p>
          <p className="text-[14px] text-foreground leading-[1.6] mb-6">
            {tool.description}
          </p>
          {platform === "desktop" ? (
            <button
              disabled
              className="px-5 py-2.5 border border-foreground bg-primary text-primary-foreground font-mono text-[10px] uppercase tracking-[1.2px] hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
            >
              Get notified →
            </button>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                disabled
                className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-foreground bg-card text-foreground font-mono text-[10px] uppercase tracking-[1.2px] hover:bg-muted disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                <AppleLogo className="w-3.5 h-3.5" weight="fill" />
                App Store
              </button>
              <button
                disabled
                className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-foreground bg-card text-foreground font-mono text-[10px] uppercase tracking-[1.2px] hover:bg-muted disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                <GooglePlayLogo className="w-3.5 h-3.5" weight="fill" />
                Google Play
              </button>
            </div>
          )}
        </div>

        {/* Demo placeholder */}
        <div className="aspect-video border border-border bg-card flex items-center justify-center">
          <div className="text-center">
            <div className="w-14 h-14 border border-foreground bg-muted flex items-center justify-center mx-auto mb-3">
              <Play className="w-6 h-6 text-accent" weight="fill" />
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground">
              {tool.name} · Demo
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Features */}
        <div>
          <h3 className="font-mono text-[10px] uppercase tracking-[1.3px] text-muted-foreground pb-2 mb-4 border-b border-foreground">
            <span className="text-accent mr-1.5">A /</span>Features
          </h3>
          <ul className="space-y-3">
            {tool.detailedFeatures.map((f) => (
              <li key={f.title} className="flex gap-3">
                <span className="shrink-0 mt-0.5">
                  {getIcon(f.iconName, "w-4 h-4 text-accent")}
                </span>
                <div>
                  <div className="font-heading font-semibold text-[14px] text-foreground leading-[1.3]">
                    {f.title}
                  </div>
                  <div className="font-heading italic text-[12px] text-muted-foreground mt-0.5 leading-[1.4]">
                    {f.description}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Steps */}
        <div>
          <h3 className="font-mono text-[10px] uppercase tracking-[1.3px] text-muted-foreground pb-2 mb-4 border-b border-foreground">
            <span className="text-accent mr-1.5">B /</span>How it works
          </h3>
          <ol className="space-y-4">
            {tool.steps.map((s) => (
              <li key={s.number} className="flex gap-3">
                <span className="font-mono text-[11px] text-accent tabular-nums shrink-0 mt-1">
                  {String(s.number).padStart(2, "0")}
                </span>
                <div>
                  <div className="font-heading font-semibold text-[14px] text-foreground leading-[1.3]">
                    {s.title}
                  </div>
                  <div className="text-[12px] text-muted-foreground mt-0.5 leading-[1.5]">
                    {s.description}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Requirements */}
        <div>
          <h3 className="font-mono text-[10px] uppercase tracking-[1.3px] text-muted-foreground pb-2 mb-4 border-b border-foreground">
            <span className="text-accent mr-1.5">C /</span>Requirements
          </h3>
          <dl className="border-t border-b border-foreground">
            {tool.requirements.map((r) => (
              <div
                key={r.label}
                className="grid grid-cols-[100px_1fr] gap-3 py-2.5 border-b border-border last:border-b-0"
              >
                <dt className="font-mono text-[9px] uppercase tracking-[1.2px] text-muted-foreground">
                  {r.label}
                </dt>
                <dd className="text-[13px] text-foreground">{r.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
