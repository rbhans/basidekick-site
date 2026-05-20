"use client";

import Link from "next/link";
import { AppleLogo, GooglePlayLogo, Play, ShieldCheck } from "@phosphor-icons/react";
import { TOOL_DETAILS } from "@/lib/constants";
import { getIcon } from "@/lib/icons";
import { ROUTES } from "@/lib/routes";

interface ToolDetailViewProps {
  toolId: "ssk" | "qsk";
}

export function ToolDetailView({ toolId }: ToolDetailViewProps) {
  const tool = TOOL_DETAILS[toolId];

  if (!tool) {
    return (
      <div className="py-24 text-center italic text-[18px] text-muted-foreground">
        Tool not found.
      </div>
    );
  }

  return (
    <section className="container mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-16 py-10">
      {/* Back link */}
      <Link
        href={ROUTES.TOOLS}
        className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[1.2px] text-muted-foreground hover:text-accent transition-colors mb-6"
      >
        <span className="text-accent">←</span>
        Back to tools
      </Link>

      {/* Header */}
      <div className="pb-5 border-b border-foreground mb-10">
        <div className="font-mono text-[10px] uppercase tracking-[1.3px] text-muted-foreground mb-2">
          {tool.id.toUpperCase()} · Tool
        </div>
        <div className="flex items-start gap-3 flex-wrap">
          <h1 className="font-heading font-semibold text-[32px] md:text-[42px] leading-[1.05] text-foreground">
            {tool.name}
          </h1>
          <span className="mt-2 font-mono text-[9px] uppercase tracking-[1.2px] text-accent border border-accent px-1.5 py-0.5 rounded-sm">
            Coming soon
          </span>
        </div>
        <p className="italic text-[17px] text-muted-foreground mt-3 max-w-[680px] leading-[1.5]">
          {tool.tagline}. {tool.description}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {tool.mobileApp ? (
            <>
              <button
                disabled
                className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-foreground bg-card text-foreground font-mono text-[10px] uppercase tracking-[1.2px] disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                <AppleLogo className="w-3.5 h-3.5" weight="fill" />
                App Store
              </button>
              <button
                disabled
                className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-foreground bg-card text-foreground font-mono text-[10px] uppercase tracking-[1.2px] disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                <GooglePlayLogo className="w-3.5 h-3.5" weight="fill" />
                Google Play
              </button>
            </>
          ) : (
            <button
              disabled
              className="px-5 py-2.5 border border-foreground bg-primary text-primary-foreground font-mono text-[10px] uppercase tracking-[1.2px] disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
            >
              Get notified when ready →
            </button>
          )}
        </div>
      </div>

      {/* 01 / Demo */}
      <NumberedSection num="01" title="Demo">
        <div className="aspect-video border border-border bg-card flex items-center justify-center max-w-[720px]">
          <div className="text-center">
            <div className="w-14 h-14 border border-foreground bg-muted flex items-center justify-center mx-auto mb-3">
              <Play className="w-6 h-6 text-accent" weight="fill" />
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground">
              {tool.name} · Demo video
            </p>
          </div>
        </div>
      </NumberedSection>

      {/* 02 / Features */}
      <NumberedSection num="02" title="Features">
        <ul className="space-y-5 max-w-[720px]">
          {tool.detailedFeatures.map((feature) => (
            <li key={feature.title} className="grid grid-cols-[32px_1fr] gap-4">
              <span className="shrink-0 mt-0.5">
                {getIcon(feature.iconName, "w-6 h-6 text-accent")}
              </span>
              <div>
                <h3 className="font-heading font-semibold text-[17px] text-foreground leading-[1.3]">
                  {feature.title}
                </h3>
                <p className="italic text-[14px] text-muted-foreground mt-1 leading-[1.5]">
                  {feature.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </NumberedSection>

      {/* 03 / How it works */}
      <NumberedSection num="03" title="How it works">
        <ol className="space-y-5 max-w-[640px]">
          {tool.steps.map((step) => (
            <li key={step.number} className="grid grid-cols-[40px_1fr] gap-4">
              <span className="font-mono text-[13px] text-accent tabular-nums mt-1">
                {String(step.number).padStart(2, "0")}
              </span>
              <div>
                <h4 className="font-heading font-semibold text-[16px] text-foreground leading-[1.3]">
                  {step.title}
                </h4>
                <p className="text-[13px] text-muted-foreground mt-1 leading-[1.55]">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </NumberedSection>

      {/* 04 / Requirements */}
      <NumberedSection num="04" title="Requirements">
        <dl className="border-t border-b border-foreground max-w-[520px]">
          {tool.requirements.map((req) => (
            <div
              key={req.label}
              className="grid grid-cols-[160px_1fr] gap-4 py-3 border-b border-border last:border-b-0"
            >
              <dt className="font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground">
                {req.label}
              </dt>
              <dd className="text-[14px] text-foreground">{req.value}</dd>
            </div>
          ))}
        </dl>
      </NumberedSection>

      {/* 05 / Use cases */}
      {tool.useCases && tool.useCases.length > 0 && (
        <NumberedSection num="05" title="Use cases">
          <ul className="space-y-2 max-w-[640px]">
            {tool.useCases.map((useCase, index) => (
              <li
                key={index}
                className="flex gap-3 text-[14px] text-foreground leading-[1.55] py-2 border-b border-muted"
              >
                <span className="text-accent font-mono text-[11px] shrink-0 mt-0.5">→</span>
                <span>{useCase}</span>
              </li>
            ))}
          </ul>
        </NumberedSection>
      )}

      {/* Perfect for */}
      {tool.perfectFor && tool.perfectFor.length > 0 && (
        <NumberedSection num="06" title="Perfect for">
          <div className="flex flex-wrap gap-2">
            {tool.perfectFor.map((persona, index) => (
              <span
                key={index}
                className="inline-block px-3 py-1.5 border border-border bg-card font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground"
              >
                {persona}
              </span>
            ))}
          </div>
        </NumberedSection>
      )}

      {/* Pricing */}
      {tool.pricing && tool.pricing.length > 0 && (
        <NumberedSection num="07" title="Pricing">
          <p className="italic text-[14px] text-muted-foreground mb-5 max-w-[640px]">
            Free to scan and use. Upgrade for more equipment.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-[760px]">
            {tool.pricing.map((tier) => (
              <div
                key={tier.name}
                className={`p-5 border bg-card ${
                  tier.highlighted ? "border-foreground" : "border-border"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-heading font-semibold text-[16px] text-foreground">
                    {tier.name}
                  </h3>
                  {tier.highlighted && (
                    <span className="font-mono text-[9px] uppercase tracking-[1.2px] text-accent border border-accent px-1.5 py-0.5 rounded-sm">
                      Popular
                    </span>
                  )}
                </div>
                <p className="font-heading font-semibold text-[22px] text-foreground tabular-nums">
                  {tier.price}
                </p>
                <p className="italic text-[12px] text-muted-foreground mt-0.5">
                  {tier.limit}
                </p>
              </div>
            ))}
          </div>
        </NumberedSection>
      )}

      {/* QSK privacy policy link */}
      {toolId === "qsk" && (
        <div className="mt-10 pt-8 border-t border-border">
          <Link
            href="/tools/qsk/privacy"
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[1.2px] text-muted-foreground hover:text-accent transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Privacy policy →
          </Link>
        </div>
      )}
    </section>
  );
}

function NumberedSection({
  num,
  title,
  children,
}: {
  num: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-12 last:mb-0">
      <div className="flex items-baseline gap-3.5 pb-3.5 border-b border-foreground mb-6">
        <span className="font-mono text-[11px] text-accent tracking-[1px]">{num} /</span>
        <h2 className="font-heading font-semibold text-[22px] leading-none text-foreground">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}
