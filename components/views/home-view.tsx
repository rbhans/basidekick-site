"use client";

import { SectionLabel } from "@/components/section-label";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { CircuitBackground } from "@/components/circuit-background";
import { BuildingWireframe } from "@/components/building-wireframe";
import { ArrowRight, GithubLogo, Chats, BookOpen } from "@phosphor-icons/react";
import { TOOLS_LIST } from "@/lib/constants";
import { VIEW_IDS } from "@/lib/types";

interface HomeViewProps {
  onNavigate: (viewId: string) => void;
}

export function HomeView({ onNavigate }: HomeViewProps) {
  // Map tools to product card format
  const products = TOOLS_LIST.map(tool => ({
    name: tool.name,
    shortName: tool.shortName,
    description: tool.description,
    price: tool.price,
    status: tool.status,
    href: "#",
    ctaText: tool.status === "ready" ? "View" : "Notify",
    onClick: () => onNavigate(tool.id),
  }));

  return (
    <div className="min-h-full">
      {/* Hero Section */}
      <section className="relative py-12 md:py-16 overflow-hidden">
        <CircuitBackground opacity={0.15} />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left: Text content */}
            <div className="text-center lg:text-left">
              <SectionLabel>building automation</SectionLabel>

              <h1 className="mt-6 text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight">
                Tools, community, and knowledge.
              </h1>
              <p className="mt-3 text-base md:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
                Assistive tools, shared knowledge, and a community for BAS professionals.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                <Button size="lg" onClick={() => onNavigate(VIEW_IDS.TOOLS)}>
                  Browse Tools
                  <ArrowRight className="size-4 ml-2" />
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a href="https://github.com/basidekick" target="_blank" rel="noopener noreferrer">
                    <GithubLogo className="size-4 mr-2" />
                    GitHub
                  </a>
                </Button>
              </div>
            </div>

            {/* Right: Building wireframe */}
            <div className="hidden lg:block">
              <BuildingWireframe className="w-full" />
            </div>
          </div>

          {/* Mobile: Building wireframe below */}
          <div className="lg:hidden mt-8">
            <BuildingWireframe className="w-full max-w-md mx-auto" />
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-12 bg-card/30">
        <div className="container mx-auto px-4">
          <SectionLabel>tools</SectionLabel>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {products.map((product) => (
              <ProductCard key={product.shortName} {...product} />
            ))}
          </div>
        </div>
      </section>

      {/* Community Section - Forum & Wiki CTAs */}
      <section className="relative py-12 overflow-hidden">
        <CircuitBackground opacity={0.12} />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {/* Forum CTA */}
            <button
              onClick={() => onNavigate(VIEW_IDS.FORUM)}
              className="group p-6 border border-border bg-card hover:border-primary/50 transition-all text-left"
            >
              <Chats className="size-8 text-primary mb-4" />
              <SectionLabel>forum</SectionLabel>
              <h3 className="mt-4 text-lg font-semibold">Join the Community</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Connect with other BAS professionals. Ask questions, share knowledge.
              </p>
              <span className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-primary group-hover:underline underline-offset-4">
                Join Discussion
                <ArrowRight className="size-3" />
              </span>
            </button>

            {/* Wiki CTA */}
            <button
              onClick={() => onNavigate(VIEW_IDS.WIKI)}
              className="group p-6 border border-border bg-card hover:border-primary/50 transition-all text-left"
            >
              <BookOpen className="size-8 text-primary mb-4" />
              <SectionLabel>wiki</SectionLabel>
              <h3 className="mt-4 text-lg font-semibold">Knowledge Base</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Guides, tutorials, and reference documentation for BAS professionals.
              </p>
              <span className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-primary group-hover:underline underline-offset-4">
                Browse Wiki
                <ArrowRight className="size-3" />
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-12 bg-card/30">
        <div className="container mx-auto px-4">
          <SectionLabel>built by rob</SectionLabel>

          <div className="mt-8 max-w-xl mx-auto text-center">
            <p className="text-base text-muted-foreground leading-relaxed">
              I work in the industry and wanted to build tools and a community
              to help with the day-to-day.
            </p>
            <p className="mt-4 text-sm">
              <span className="text-muted-foreground">Questions? </span>
              <a
                href="mailto:rob@basidekick.com"
                className="text-primary hover:underline underline-offset-4"
              >
                rob@basidekick.com
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
