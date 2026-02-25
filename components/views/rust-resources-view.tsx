"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Cpu } from "@phosphor-icons/react";
import { SiteBadge } from "@/components/site-badge";
import { ROUTES } from "@/lib/routes";
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

export function RustResourcesView() {
  return (
    <div className="min-h-full">
            <PageHero>
          <SiteBadge label="RUST" />
          <h1 className="mt-6 text-3xl md:text-4xl font-heading font-bold tracking-tight">
            Open Source Rust Crates for BAS
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Protocol-first Rust crates for open source BAS software. Start with BACnet and expand into a full
            Rust-native protocol stack.
          </p>

          <Link
            href={ROUTES.RESOURCES}
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline underline-offset-4"
          >
            <ArrowLeft className="size-3" />
            Back to Resources
          </Link>
      </PageHero>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {rustCrates.map((item) => (
              <article
                key={item.id}
                className="p-6 border border-border bg-card shadow-sm"
              >
                <div className="flex items-center justify-between gap-3 mb-4">
                  <Cpu className="size-8 text-primary" />
                  <span className="text-xs font-mono px-2 py-1 border border-border bg-muted/40">
                    {item.protocol}
                  </span>
                </div>

                <h2 className="text-xl font-semibold">{item.name}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>

                <a
                  href={item.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline underline-offset-4"
                >
                  View on GitHub
                  <ArrowRight className="size-3" />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
