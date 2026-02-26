"use client";

import Link from "next/link";
import { SiteBadge } from "@/components/site-badge";
import { ResourceCard } from "@/components/resource-card";
import { WikiCarousel } from "@/components/wiki-carousel";
import { RotatingAtlasCard } from "@/components/rotating-atlas-card";
import { CircuitBackground } from "@/components/circuit-background";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  BookOpen,
  Wrench,
  GlobeHemisphereWest,
  Broom,
  WaveTriangle,
  QrCode,
  Cpu,
  Gauge,
  Calculator,
  BookmarksSimple,
} from "@phosphor-icons/react";
import { ROUTES } from "@/lib/routes";
import type { BabelPointEntry, BabelEquipmentEntry } from "@/lib/types";

interface CarouselArticle {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  created_at: string;
  category: { name: string; slug: string } | null;
}

interface HomeViewProps {
  carouselArticles?: CarouselArticle[];
  stats?: {
    articleCount: number;
    termCount: number;
    modelCount: number;
  };
  samplePoints?: BabelPointEntry[];
  sampleEquipment?: BabelEquipmentEntry[];
}

export function HomeView({
  carouselArticles = [],
  stats = { articleCount: 0, termCount: 0, modelCount: 0 },
  samplePoints = [],
  sampleEquipment = [],
}: HomeViewProps) {
  return (
    <div className="min-h-full">
      {/* Hero Section — dark bg with circuit animation */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <CircuitBackground opacity={0.08} />

        <div className="container mx-auto px-4 sm:px-6 lg:px-20 relative z-10">
          <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl lg:text-[56px] font-heading font-bold tracking-tight leading-tight">
              Tools, community, and{" "}
              <span className="gradient-text">knowledge</span>.
            </h1>
            <p className="mt-5 text-lg md:text-[20px] text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Assistive tools, shared knowledge, and a community for BAS
              professionals.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" asChild className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8 rounded-lg">
                <Link href={ROUTES.TOOLS}>
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-lg font-semibold px-8">
                <Link href={ROUTES.WIKI}>
                  Browse Wiki
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-16 max-w-2xl mx-auto">
            <div className="grid grid-cols-3 gap-4 p-6 bg-card/60 border border-border/50 rounded-xl backdrop-blur-sm">
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-heading font-bold text-foreground">
                  {stats.articleCount > 0 ? `${stats.articleCount}+` : "---"}
                </p>
                <p className="text-[12px] text-muted-foreground font-mono uppercase tracking-wider mt-1">
                  Wiki Articles
                </p>
              </div>
              <div className="text-center border-x border-border">
                <p className="text-2xl md:text-3xl font-heading font-bold text-foreground">
                  {stats.termCount > 0 ? `${stats.termCount}+` : "---"}
                </p>
                <p className="text-[12px] text-muted-foreground font-mono uppercase tracking-wider mt-1">
                  Point Definitions
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-heading font-bold text-foreground">
                  {stats.modelCount > 0 ? `${stats.modelCount}+` : "---"}
                </p>
                <p className="text-[12px] text-muted-foreground font-mono uppercase tracking-wider mt-1">
                  Equipment Models
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section — lighter bg for Atlas + Wiki */}
      <section className="py-16 bg-muted/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left: Description */}
            <div>
              <SiteBadge label="BAS ATLAS" icon={GlobeHemisphereWest} />
              <h2 className="mt-6 text-2xl md:text-3xl font-heading font-bold tracking-tight">
                The unified reference for{" "}
                <span className="gradient-text">BAS professionals</span>
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Browse standardized point definitions with Haystack and Brick mappings,
                explore equipment from major manufacturers, and clean up messy point
                names — all in one place.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button size="lg" asChild className="rounded-lg font-semibold px-8">
                  <Link href={ROUTES.ATLAS}>
                    Explore Atlas
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="rounded-lg font-semibold px-8">
                  <Link href={ROUTES.ATLAS_EQUIPMENT}>
                    Equipment Catalog
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right: Rotating example cards + Cleaner CTA */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {samplePoints.length > 0 && (
                  <RotatingAtlasCard entries={samplePoints} type="point" intervalMs={6000} />
                )}
                {sampleEquipment.length > 0 && (
                  <RotatingAtlasCard entries={sampleEquipment} type="equipment" intervalMs={7000} />
                )}
              </div>

              {/* Prominent Cleaner Button */}
              <Link
                href={ROUTES.ATLAS_CLEANER}
                className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-primary text-primary-foreground rounded-xl font-semibold text-[15px] hover:bg-[#d4ff5a] transition-colors shadow-lg shadow-primary/20"
              >
                <Broom className="w-5 h-5" />
                Clean Your Point Names
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Wiki Carousel — also in the lighter area */}
          <div className="mt-20">
            <div className="flex items-center justify-between mb-8">
              <SiteBadge label="WIKI" icon={BookOpen} />
              <Button variant="outline" size="sm" asChild className="rounded-lg font-semibold">
                <Link href={ROUTES.WIKI}>
                  Browse All
                  <ArrowRight className="w-3 h-3 ml-2" />
                </Link>
              </Button>
            </div>
            <h2 className="text-2xl md:text-3xl font-heading font-bold tracking-tight mb-2">
              Latest from the Wiki
            </h2>
            <p className="text-muted-foreground mb-8">
              Guides, tutorials, and reference documentation for BAS professionals.
            </p>

            <WikiCarousel articles={carouselArticles} />
          </div>
        </div>
      </section>

      {/* Tools Section — back to dark bg */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-20">
          <SiteBadge label="TOOLS" icon={Wrench} />
          <h2 className="mt-6 text-2xl md:text-3xl font-heading font-bold tracking-tight">
            Built for BAS Professionals
          </h2>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SSK Card */}
            <Link
              href={ROUTES.TOOLS}
              className="group p-6 bg-card border border-border rounded-xl hover:border-primary/30 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <WaveTriangle className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-mono text-[12px] text-muted-foreground uppercase tracking-wider">SIM</span>
                </div>
                <Badge variant="outline" className="text-[11px] text-destructive border-destructive/30">
                  Coming Soon
                </Badge>
              </div>
              <h3 className="font-heading text-lg font-bold group-hover:text-primary transition-colors">
                SimulatorSidekick
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Create virtual BACnet/Modbus devices in seconds for testing and development.
              </p>
            </Link>

            {/* QSK Card */}
            <Link
              href={ROUTES.TOOLS}
              className="group p-6 bg-card border border-border rounded-xl hover:border-primary/30 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <QrCode className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-mono text-[12px] text-muted-foreground uppercase tracking-wider">QSK</span>
                </div>
                <Badge variant="outline" className="text-[11px] text-destructive border-destructive/30">
                  Coming Soon
                </Badge>
              </div>
              <h3 className="font-heading text-lg font-bold group-hover:text-primary transition-colors">
                QR Sidekick
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                The simplest way for field technicians to manage building equipment using QR codes.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-20">
          <div className="flex items-center justify-between mb-8">
            <SiteBadge label="RESOURCES" />
            <Button variant="outline" size="sm" asChild className="rounded-lg font-semibold">
              <Link href={ROUTES.RESOURCES}>
                View All
                <ArrowRight className="w-3 h-3 ml-2" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ResourceCard
              title="Rust BAS Tools"
              description="Open source Rust crates for BAS protocols, starting with rustbac for BACnet."
              href={ROUTES.RESOURCES_RUST}
              icon={<Cpu className="w-5 h-5 text-primary" />}
            />
            <ResourceCard
              title="BAS Atlas"
              description="Unified BAS reference for point naming standards and equipment catalog."
              href={ROUTES.ATLAS}
              icon={<Gauge className="w-5 h-5 text-primary" />}
            />
            <ResourceCard
              title="Calculators"
              description="CFM, BTU, duct sizing, and other common calculations for BAS professionals."
              href="/calculators"
              icon={<Calculator className="w-5 h-5 text-primary" />}
            />
            <ResourceCard
              title="References"
              description="Protocol specs, wiring diagrams, and cheat sheets for common BAS tasks."
              href="/references"
              icon={<BookmarksSimple className="w-5 h-5 text-primary" />}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
