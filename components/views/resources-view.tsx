"use client";

import Link from "next/link";
import { ROUTES } from "@/lib/routes";

const resources = [
  {
    title: "Rust BAS Packages",
    description:
      "Open source Rust crates for BAS protocols, starting with rustbac for BACnet.",
    href: ROUTES.RESOURCES_RUST,
    letter: "A",
  },
  {
    title: "BAS Atlas",
    description:
      "Open source, community-driven reference for point naming standards and equipment catalog.",
    href: ROUTES.ATLAS,
    letter: "B",
  },
  {
    title: "Wiki",
    description: "Guides, tutorials, and reference documentation for BAS professionals.",
    href: ROUTES.WIKI,
    letter: "C",
  },
  {
    title: "Calculators",
    description:
      "Signal scaling, psychrometrics, hydronics, power, schedules, and quick BAS math.",
    href: ROUTES.CALCULATORS,
    letter: "D",
  },
  {
    title: "References",
    description:
      "Protocol tables, signal notes, abbreviations, and source-backed BAS field sheets.",
    href: ROUTES.REFERENCES,
    letter: "E",
  },
  {
    title: "PointStack",
    description:
      "Community platform for BAS professionals to share knowledge and connect.",
    href: ROUTES.POINTSTACK,
    letter: "F",
  },
];

export function ResourcesView() {
  return (
    <div className="min-h-full">
      {/* Title block strip */}
      <div className="title-block">
        <div className="field">
          <span className="field-label">Drawing</span>
          <span className="field-value">Resources</span>
        </div>
        <div className="field">
          <span className="field-label">Title</span>
          <span className="field-value">Free Knowledge Base</span>
        </div>
        <div className="field">
          <span className="field-label">Items</span>
          <span className="field-value tabular-nums">{resources.length}</span>
        </div>
        <div className="spacer" />
        <div className="field">
          <span className="field-label">License</span>
          <span className="field-value">Open</span>
        </div>
      </div>

      <section className="bsk-wrap-narrow py-14">
        <p className="italic text-[17px] text-muted-foreground text-center leading-[1.5] mb-12 max-w-[640px] mx-auto">
          A working set of references and resources — built alongside the industry, free to use.
        </p>

        <div className="flex items-baseline gap-3.5 pb-3.5 border-b border-foreground mb-5">
          <span className="font-mono text-[11px] text-accent tracking-[1px]">01 /</span>
          <h2 className="font-heading font-semibold text-[22px] leading-none text-foreground">
            All resources
          </h2>
          <span className="ml-auto font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground tabular-nums">
            {resources.length} items
          </span>
        </div>

        <div className="space-y-0">
          {resources.map((resource) => (
            <Link
              key={resource.title}
              href={resource.href}
              className="group grid grid-cols-[32px_1fr_60px] gap-5 items-start py-5 px-2 border-b border-muted hover:bg-muted/40 transition-colors"
            >
              <span className="font-mono text-[11px] text-accent tracking-[1.2px] mt-1">
                {resource.letter} /
              </span>
              <div className="min-w-0">
                <h3 className="font-heading font-semibold text-[18px] leading-[1.25] text-foreground group-hover:text-accent transition-colors">
                  {resource.title}
                </h3>
                <p className="italic text-[14px] text-muted-foreground mt-1 leading-[1.5]">
                  {resource.description}
                </p>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground group-hover:text-accent transition-colors text-right self-center">
                Open →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
