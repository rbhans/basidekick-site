"use client";

import { ArrowRight, GithubLogo } from "@phosphor-icons/react";

const rustCrates = [
  {
    id: "rustbac",
    name: "rustbac",
    protocol: "BACnet",
    description:
      "Open source Rust crate for BACnet communication in BAS applications. The first protocol crate in the BASidekick Rust suite.",
    githubUrl: "https://github.com/rbhans/rust-bac",
  },
  {
    id: "rustmod",
    name: "rustmod",
    protocol: "Modbus",
    description:
      "Open source Rust crate for Modbus communication in BAS applications.",
    githubUrl: "https://github.com/rbhans/rust-mod",
  },
  {
    id: "opencrate-bms",
    name: "OpenCrate BMS",
    protocol: "BMS",
    description:
      "A hobby project to learn various parts of BMS by building the software from the ground up in pure Rust.",
    githubUrl: "https://rbhans.github.io/opencrate-site/",
  },
];

export function OpenSourceView() {
  return (
    <div className="min-h-full">
      {/* Title block strip */}
      <div className="title-block">
        <div className="field">
          <span className="field-label">Drawing</span>
          <span className="field-value">Open Source</span>
        </div>
        <div className="field">
          <span className="field-label">Title</span>
          <span className="field-value">Rust Crates for BAS</span>
        </div>
        <div className="field">
          <span className="field-label">Crates</span>
          <span className="field-value tabular-nums">{rustCrates.length}</span>
        </div>
        <div className="spacer" />
        <div className="field">
          <span className="field-label">Drawn by</span>
          <span className="field-value">R.H.</span>
        </div>
      </div>

      <section className="container mx-auto px-4 sm:px-6 lg:px-16 pt-16 pb-16 max-w-[1100px]">
        <p className="font-heading italic text-[17px] text-muted-foreground text-center mb-12 leading-[1.5] max-w-[640px] mx-auto">
          Rust crates and tools for building BAS software from the ground up. Protocol-first, open source.
        </p>

        <div className="font-mono text-[11px] uppercase tracking-[1.4px] text-muted-foreground mb-4 pb-3 border-b border-foreground">
          <span className="text-accent mr-1.5">01 /</span>
          Crates
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
          {rustCrates.map((crate) => (
            <a
              key={crate.id}
              href={crate.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="group block p-6 bg-card border border-border rounded-md hover:border-foreground transition-colors"
            >
              <div className="flex items-baseline justify-between gap-3 mb-3">
                <h2 className="font-heading font-semibold text-[22px] leading-[1.15] text-foreground group-hover:text-accent transition-colors">
                  {crate.name}
                </h2>
                <span className="font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground border border-border px-2 py-1 rounded-sm shrink-0">
                  {crate.protocol}
                </span>
              </div>
              <p className="text-[13px] text-muted-foreground leading-[1.55] mb-4">
                {crate.description}
              </p>
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[1.2px] text-foreground border-b border-accent pb-0.5 group-hover:text-accent transition-colors">
                <GithubLogo className="w-3.5 h-3.5" />
                View on GitHub
                <ArrowRight className="w-3 h-3" />
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* Colophon */}
      <div className="border-t border-border bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-16 py-14 max-w-[1100px]">
          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr_220px] gap-10 font-mono text-[12px] text-muted-foreground leading-relaxed">
            <div>
              <strong className="text-foreground font-bold">Open Source</strong>
              <br />
              Built and maintained by
              <br />
              Rob Hansen, Tucson
            </div>
            <div>
              Protocol-first, MIT-licensed, Rust-native. Pull requests welcome on every public repo.
            </div>
            <div className="md:text-right">
              <a
                href="https://rbhans.github.io"
                target="_blank"
                rel="noreferrer"
                className="text-foreground underline decoration-accent underline-offset-[3px] hover:text-accent transition-colors"
              >
                rbhans.github.io
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
