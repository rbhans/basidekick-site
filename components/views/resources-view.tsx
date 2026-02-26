"use client";

import { SiteBadge } from "@/components/site-badge";
import { ResourceCard } from "@/components/resource-card";
import {
  BookOpen,
  Gauge,
  Cpu,
  Calculator,
  BookmarksSimple,
  UsersThree,
  Broom,
} from "@phosphor-icons/react";
import { ROUTES } from "@/lib/routes";
import { PageHero } from "@/components/page-hero";

const resources = [
  {
    title: "Rust BAS Tools",
    description: "Open source Rust crates for BAS protocols, starting with rustbac for BACnet.",
    href: ROUTES.RESOURCES_RUST,
    icon: <Cpu className="w-5 h-5 text-primary" />,
  },
  {
    title: "BAS Atlas",
    description: "Unified BAS reference for point naming standards and equipment catalog.",
    href: ROUTES.ATLAS,
    icon: <Gauge className="w-5 h-5 text-primary" />,
  },
  {
    title: "Wiki",
    description: "Guides, tutorials, and reference documentation for BAS professionals.",
    href: ROUTES.WIKI,
    icon: <BookOpen className="w-5 h-5 text-primary" />,
  },
  {
    title: "Calculators",
    description: "CFM, BTU, duct sizing, and other common calculations for BAS professionals.",
    href: ROUTES.CALCULATORS,
    icon: <Calculator className="w-5 h-5 text-primary" />,
  },
  {
    title: "References",
    description: "Protocol specs, wiring diagrams, and cheat sheets for common BAS tasks.",
    href: ROUTES.REFERENCES,
    icon: <BookmarksSimple className="w-5 h-5 text-primary" />,
  },
  {
    title: "PointStack",
    description: "Community platform for BAS professionals to share knowledge and connect.",
    href: ROUTES.POINTSTACK,
    icon: <UsersThree className="w-5 h-5 text-primary" />,
  },
  {
    title: "Point Name Cleaner",
    description: "Clean up messy point names using standardized naming conventions.",
    href: ROUTES.ATLAS_CLEANER,
    icon: <Broom className="w-5 h-5 text-primary" />,
  },
];

export function ResourcesView() {
  return (
    <div className="min-h-full">
      {/* Hero */}
      <PageHero imageSrc="/images/hero/resources.png">
        <SiteBadge label="RESOURCES" />
          <h1 className="mt-6 text-3xl md:text-4xl font-heading font-bold tracking-tight">
            Free Resources
          </h1>
          <p className="mt-3 text-muted-foreground max-w-xl">
            Knowledge base and references to help BAS professionals succeed.
          </p>
      </PageHero>

      {/* Resources Grid */}
      <section className="py-8 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-20">
          <h3 className="font-mono text-[12px] font-bold text-muted-foreground tracking-[2px] uppercase mb-6">
            ALL RESOURCES ({resources.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((resource) => (
              <ResourceCard
                key={resource.title}
                title={resource.title}
                description={resource.description}
                href={resource.href}
                icon={resource.icon}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
