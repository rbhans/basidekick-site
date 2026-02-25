"use client";

import Link from "next/link";
import { SectionLabel } from "@/components/section-label";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CircuitBackground } from "@/components/circuit-background";
import { BuildingWireframeIsometric } from "@/components/building-wireframe-isometric";
import { AnimatedCounter } from "@/components/animated-counter";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { Changelog } from "@/components/changelog";
import {
  ArrowRight,
  BookOpen,
  Book,
  Translate,
  Article,
  ClockCounterClockwise,
  Wrench,
  Gauge,
  GlobeHemisphereWest,
  Database,
  Broom,
  Tag,
} from "@phosphor-icons/react";
import { getIcon } from "@/lib/icons";
import { TOOLS_LIST, RESOURCES } from "@/lib/constants";
import { ROUTES } from "@/lib/routes";

interface RecentArticle {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  created_at: string;
  category: { name: string; slug: string } | null;
}

interface HomeViewProps {
  recentArticles?: RecentArticle[];
  stats?: {
    articleCount: number;
    termCount: number;
    modelCount: number;
  };
}

export function HomeView({
  recentArticles = [],
  stats = { articleCount: 0, termCount: 0, modelCount: 0 },
}: HomeViewProps) {

  // Map tools to product card format with icons
  const products = TOOLS_LIST.map((tool) => ({
    name: tool.name,
    shortName: tool.shortName,
    description: tool.description,
    href: ROUTES.TOOL(tool.id),
    ctaText: "Learn More",
    icon: tool.iconName ? getIcon(tool.iconName, "size-5") : undefined,
  }));

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-full">
      {/* Hero Section */}
      <section className="relative py-12 md:py-16 overflow-hidden">
        <CircuitBackground opacity={0.15} colorGradient />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left: Text content */}
            <div className="text-center lg:text-left animate-fade-in-up">
              <SectionLabel variant="default">building automation</SectionLabel>

              <h1 className="mt-6 text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight">
                Tools, community, and{" "}
                <span className="gradient-text">knowledge</span>.
              </h1>
              <p className="mt-3 text-base md:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
                Assistive tools, shared knowledge, and a community for BAS
                professionals.
              </p>
            </div>

            {/* Right: Building wireframe */}
            <div className="hidden lg:block animate-fade-in animation-delay-200">
              <BuildingWireframeIsometric className="w-full" />
            </div>
          </div>

          {/* Mobile: Building wireframe below */}
          <div className="lg:hidden mt-8 animate-fade-in">
            <BuildingWireframeIsometric className="w-full max-w-md mx-auto" />
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-6 border-y border-border bg-card/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1.5">
              <div className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold text-primary">
                <Article className="size-6 md:size-7" />
                <AnimatedCounter end={stats.articleCount} suffix="+" />
              </div>
              <p className="text-xs md:text-sm text-muted-foreground font-mono uppercase tracking-wide">
                Wiki Articles
              </p>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold text-primary">
                <Translate className="size-6 md:size-7" />
                <AnimatedCounter end={stats.termCount} suffix="+" />
              </div>
              <p className="text-xs md:text-sm text-muted-foreground font-mono uppercase tracking-wide">
                BAS Terms
              </p>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold text-primary">
                <Gauge className="size-6 md:size-7" />
                <AnimatedCounter end={stats.modelCount} suffix="+" />
              </div>
              <p className="text-xs md:text-sm text-muted-foreground font-mono uppercase tracking-wide">
                Equipment Models
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Atlas Showcase Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <GlobeHemisphereWest className="size-6 text-amber-500 dark:text-amber-400" />
            <SectionLabel variant="atlas">bas atlas</SectionLabel>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left: Atlas pitch */}
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                The unified reference for{" "}
                <span className="gradient-text">BAS professionals</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Browse standardized point definitions with Haystack and Brick mappings,
                explore equipment from major manufacturers, and clean up messy point
                names — all in one place.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button size="sm" asChild>
                  <Link href={ROUTES.ATLAS}>
                    Explore Atlas
                    <ArrowRight className="size-3 ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={ROUTES.ATLAS_EQUIPMENT}>
                    Equipment Catalog
                    <ArrowRight className="size-3 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right: Feature cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 border border-border bg-card/80 space-y-2">
                <div className="flex items-center gap-2 text-amber-500 dark:text-amber-400">
                  <Translate className="size-4" />
                  <span className="font-mono text-xs uppercase tracking-wide">Points</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {stats.termCount}+ standardized BAS point definitions with aliases,
                  units, and typical ranges.
                </p>
              </div>
              <div className="p-4 border border-border bg-card/80 space-y-2">
                <div className="flex items-center gap-2 text-amber-500 dark:text-amber-400">
                  <Database className="size-4" />
                  <span className="font-mono text-xs uppercase tracking-wide">Equipment</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {stats.modelCount}+ equipment models across major manufacturers
                  with protocol details.
                </p>
              </div>
              <div className="p-4 border border-border bg-card/80 space-y-2">
                <div className="flex items-center gap-2 text-amber-500 dark:text-amber-400">
                  <Tag className="size-4" />
                  <span className="font-mono text-xs uppercase tracking-wide">Standards</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Haystack and Brick mappings for every point — bridge naming
                  conventions across standards.
                </p>
              </div>
              <Link
                href={ROUTES.ATLAS_CLEANER}
                className="group p-4 border border-dashed border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-500/60 transition-all space-y-2"
              >
                <div className="flex items-center gap-2 text-amber-500 dark:text-amber-400">
                  <Broom className="size-4" />
                  <span className="font-mono text-xs uppercase tracking-wide">Cleaner</span>
                </div>
                <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  Got messy point names? Upload a file and match them to standardized
                  definitions.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-12 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3">
            <Wrench className="size-6 text-cyan-500 dark:text-cyan-400" />
            <SectionLabel variant="tools">tools</SectionLabel>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((product, index) => (
              <div
                key={product.shortName}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ProductCard {...product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Book className="size-6 text-violet-500 dark:text-violet-400" />
              <SectionLabel variant="resources">resources</SectionLabel>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={ROUTES.RESOURCES}>
                View All
                <ArrowRight className="size-3 ml-2" />
              </Link>
            </Button>
          </div>

          <p className="text-muted-foreground mb-6">
            Free tools and references for BAS professionals.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {RESOURCES.map((resource, index) => (
              <div
                key={resource.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ProductCard
                  name={resource.name}
                  shortName={resource.shortName}
                  description={resource.description}
                  href={resource.href}
                  ctaText="Open"
                  showBadge={false}
                  icon={resource.iconName ? getIcon(resource.iconName, "size-5") : undefined}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wiki Section - Recent Articles */}
      <section className="py-12 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <BookOpen className="size-6 text-blue-500 dark:text-blue-400" />
              <SectionLabel variant="wiki">wiki</SectionLabel>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={ROUTES.WIKI}>
                Browse All
                <ArrowRight className="size-3 ml-2" />
              </Link>
            </Button>
          </div>

          <p className="text-muted-foreground mb-6">
            Guides, tutorials, and reference documentation for BAS
            professionals.
          </p>

          {recentArticles.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 border border-border bg-card shadow-sm">
                  <Skeleton className="h-3 w-16 mb-2" />
                  <Skeleton className="h-5 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-3" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentArticles.map((article, index) => (
                <Link
                  key={article.id}
                  href={ROUTES.WIKI_ARTICLE(article.slug)}
                  className="group p-4 border border-border bg-card shadow-sm hover:border-primary/50 transition-all block card-hover-lift animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {article.category && (
                    <span className="text-xs text-muted-foreground">
                      {article.category.name}
                    </span>
                  )}
                  <h3 className="mt-1 font-semibold group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  {article.summary && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {article.summary}
                    </p>
                  )}
                  <span className="mt-3 text-xs text-muted-foreground block">
                    {formatDate(article.created_at)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter & Changelog Section */}
      <section className="py-12 border-y border-border bg-card/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Newsletter */}
            <div>
              <NewsletterSignup />
            </div>

            {/* Changelog */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <ClockCounterClockwise className="size-6 text-primary" />
                <SectionLabel>what&apos;s new</SectionLabel>
              </div>
              <Changelog maxItems={2} showExpand={true} />
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-12">
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
