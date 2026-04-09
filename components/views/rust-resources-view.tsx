"use client";

import Link from "next/link";
import { GithubLogo } from "@phosphor-icons/react";
import { ROUTES } from "@/lib/routes";

const rustCrates = [
  {
    id: "rustbac",
    name: "rustbac",
    protocol: "BACnet",
    description:
      "Open source Rust crate for BACnet communication in BAS applications. This is the first protocol crate in the BASidekick Rust suite.",
    githubUrl: "https://github.com/rbhans/rust-bac",
    letter: "A",
  },
  {
    id: "rustmod",
    name: "rustmod",
    protocol: "Modbus",
    description:
      "Open source Rust crate for Modbus communication in BAS applications.",
    githubUrl: "https://github.com/rbhans/rust-mod",
    letter: "B",
  },
];

export function RustResourcesView() {
  return (
    <div className="min-h-full">
      {/* Title block strip */}
      <div className="title-block">
        <div className="field">
          <span className="field-label">Drawing</span>
          <span className="field-value">Rust</span>
        </div>
        <div className="field">
          <span className="field-label">Title</span>
          <span className="field-value">Protocol Crates</span>
        </div>
        <div className="field">
          <span className="field-label">Crates</span>
          <span className="field-value tabular-nums">{rustCrates.length}</span>
        </div>
        <div className="spacer" />
        <div className="field">
          <span className="field-label">License</span>
          <span className="field-value">MIT</span>
        </div>
      </div>

      <section className="container mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-16 py-14">
        <Link
          href={ROUTES.OPEN_SOURCE}
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[1.2px] text-muted-foreground hover:text-accent transition-colors mb-6"
        >
          <span className="text-accent">←</span>
          Back to open source
        </Link>

        <div className="pb-5 border-b border-foreground mb-8">
          <div className="font-mono text-[10px] uppercase tracking-[1.3px] text-muted-foreground mb-2">
            Rust · Crates
          </div>
          <h1 className="font-heading font-semibold text-[32px] md:text-[40px] leading-[1.05] text-foreground">
            Open source Rust crates for BAS
          </h1>
          <p className="font-heading italic text-[16px] text-muted-foreground mt-3 max-w-[680px] leading-[1.5]">
            Protocol-first Rust crates for open source BAS software. Start with BACnet and expand
            into a full Rust-native protocol stack.
          </p>
        </div>

        <div className="flex items-baseline gap-3.5 pb-3.5 border-b border-foreground mb-5">
          <span className="font-mono text-[11px] text-accent tracking-[1px]">01 /</span>
          <h2 className="font-heading font-semibold text-[22px] leading-none text-foreground">
            Crates
          </h2>
          <span className="ml-auto font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground tabular-nums">
            {rustCrates.length} items
          </span>
        </div>

        <div className="space-y-0">
          {rustCrates.map((crate) => (
            <a
              key={crate.id}
              href={crate.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="group grid grid-cols-[32px_1fr_auto] gap-5 items-start py-5 px-2 border-b border-muted hover:bg-muted/40 transition-colors"
            >
              <span className="font-mono text-[11px] text-accent tracking-[1.2px] mt-1">
                {crate.letter} /
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-heading font-semibold text-[18px] leading-[1.25] text-foreground group-hover:text-accent transition-colors">
                    {crate.name}
                  </h3>
                  <span className="font-mono text-[9px] uppercase tracking-[1.2px] text-accent border border-accent px-1.5 py-0.5 rounded-sm">
                    {crate.protocol}
                  </span>
                </div>
                <p className="font-heading italic text-[14px] text-muted-foreground leading-[1.5]">
                  {crate.description}
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground group-hover:text-accent transition-colors self-center">
                <GithubLogo className="w-3 h-3" />
                GitHub →
              </span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
