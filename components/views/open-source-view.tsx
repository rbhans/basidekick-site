"use client";

import { ArrowRight, Cpu, GithubLogo } from "@phosphor-icons/react";
import { SiteBadge } from "@/components/site-badge";
import { PageHero } from "@/components/page-hero";

const rustCrates = [
  {
    id: "rustbac",
    name: "rustbac",
    protocol: "BACnet",
    description:
      "Open source Rust crate for BACnet communication in BAS applications. This is the first protocol crate in the BASidekick Rust suite.",
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
];

export function OpenSourceView() {
  return (
    <div className="min-h-full">
      <PageHero>
        <SiteBadge label="OPEN SOURCE" icon={Cpu} />
        <h1 className="mt-6 text-3xl md:text-4xl font-heading font-bold tracking-tight">
          Open Source Rust Crates for BAS
        </h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">
          Protocol-first Rust crates for open source BAS software. Start with
          BACnet and expand into a full Rust-native protocol stack.
        </p>
      </PageHero>

      <section className="py-8 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-20">
          <h3 className="font-mono text-[12px] font-bold text-muted-foreground tracking-[2px] uppercase mb-6">
            RUST CRATES ({rustCrates.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rustCrates.map((item) => (
              <a
                key={item.id}
                href={item.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="group block p-6 bg-card border border-border rounded-xl hover:border-primary/30 transition-all"
              >
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Cpu className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-xs font-mono px-2.5 py-1 rounded-md border border-border bg-muted/40">
                    {item.protocol}
                  </span>
                </div>

                <h2 className="font-heading text-lg font-bold group-hover:text-primary transition-colors">
                  {item.name}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>

                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:underline underline-offset-4">
                  <GithubLogo className="w-4 h-4" />
                  View on GitHub
                  <ArrowRight className="w-3 h-3" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
