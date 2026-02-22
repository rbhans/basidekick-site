"use client";

import Link from "next/link";
import { SectionLabel } from "@/components/section-label";
import { AnimatedCounter } from "@/components/animated-counter";
import { CircuitBackground } from "@/components/circuit-background";
import { BuildingWireframeIsometric } from "@/components/building-wireframe-isometric";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { Changelog } from "@/components/changelog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  BookOpen,
  Article,
  ClockCounterClockwise,
  Wrench,
  UsersThree,
  Lightning,
  Terminal,
  MagnifyingGlass,
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
  const products = TOOLS_LIST.map((tool) => ({
    name: tool.name,
    shortName: tool.shortName,
    description: tool.description,
    href: ROUTES.TOOL(tool.id),
    icon: tool.iconName ? getIcon(tool.iconName, "size-6") : undefined,
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
      {/* ================================================================ */}
      {/* HERO                                                              */}
      {/* ================================================================ */}
      <section className="relative py-16 md:py-24 lg:py-28 overflow-hidden">
        <CircuitBackground opacity={0.12} colorGradient />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left content */}
            <div className="lg:col-span-7 text-center lg:text-left animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-primary/30 bg-primary/5 mb-6">
                <Terminal className="size-3.5 text-primary" />
                <span className="font-mono text-xs text-primary uppercase tracking-wider">
                  Building Automation Platform
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1]">
                The toolkit for{" "}
                <span className="gradient-text">BAS professionals</span>
              </h1>

              <p className="mt-5 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Open-source tools, community knowledge, and reference data for
                building automation professionals.
              </p>

              {/* CTA buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Button size="lg" asChild className="h-11 px-6 text-sm">
                  <Link href={ROUTES.RESOURCES}>
                    <MagnifyingGlass className="size-4 mr-2" />
                    Explore Resources
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="h-11 px-6 text-sm"
                >
                  <Link href={ROUTES.POINTSTACK}>
                    <UsersThree className="size-4 mr-2" />
                    Join the Community
                  </Link>
                </Button>
              </div>

              {/* Inline stats */}
              <div className="mt-10 flex items-center gap-8 justify-center lg:justify-start">
                <div className="text-center lg:text-left">
                  <div className="text-2xl font-bold text-foreground">
                    <AnimatedCounter end={stats.articleCount} suffix="+" />
                  </div>
                  <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide mt-0.5">
                    Wiki Articles
                  </p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="text-center lg:text-left">
                  <div className="text-2xl font-bold text-foreground">
                    <AnimatedCounter end={stats.termCount} suffix="+" />
                  </div>
                  <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide mt-0.5">
                    BAS Terms
                  </p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="text-center lg:text-left">
                  <div className="text-2xl font-bold text-foreground">
                    <AnimatedCounter end={stats.modelCount} suffix="+" />
                  </div>
                  <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide mt-0.5">
                    Equipment Models
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Building wireframe (desktop) */}
            <div className="lg:col-span-5 hidden lg:block animate-fade-in animation-delay-200">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-primary/5 via-transparent to-cyan-500/5 pointer-events-none" />
                <BuildingWireframeIsometric className="w-full" />
              </div>
            </div>
          </div>

          {/* Mobile wireframe */}
          <div className="lg:hidden mt-10 animate-fade-in animation-delay-200">
            <BuildingWireframeIsometric className="w-full max-w-sm mx-auto" />
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* PLATFORM PILLARS                                                  */}
      {/* ================================================================ */}
      <section className="py-16 border-y border-border bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in-up">
            <SectionLabel>platform</SectionLabel>
            <h2 className="mt-4 text-2xl md:text-3xl font-semibold tracking-tight">
              Everything in one place
            </h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
              Tools, references, and community built specifically for BAS
              professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Pillar: Tools */}
            <Link
              href={ROUTES.TOOLS}
              className="group relative p-6 border border-border bg-card hover:border-cyan-500/50 transition-all card-hover-lift animate-fade-in-up"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center size-10 border border-cyan-500/30 bg-cyan-500/10 text-cyan-500 dark:text-cyan-400">
                  <Wrench className="size-5" />
                </div>
                <h3 className="font-semibold text-lg">Tools</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Simulators, scanners, and utilities purpose-built for controls
                work.
              </p>
              <div className="mt-4 flex items-center text-sm text-cyan-500 dark:text-cyan-400 font-medium group-hover:gap-2 transition-all">
                View Tools <ArrowRight className="size-3.5 ml-1" />
              </div>
            </Link>

            {/* Pillar: Resources */}
            <Link
              href={ROUTES.RESOURCES}
              className="group relative p-6 border border-border bg-card hover:border-violet-500/50 transition-all card-hover-lift animate-fade-in-up animation-delay-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center size-10 border border-violet-500/30 bg-violet-500/10 text-violet-500 dark:text-violet-400">
                  <BookOpen className="size-5" />
                </div>
                <h3 className="font-semibold text-lg">Resources</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                BAS terminology, equipment data, calculators, and reference
                materials.
              </p>
              <div className="mt-4 flex items-center text-sm text-violet-500 dark:text-violet-400 font-medium group-hover:gap-2 transition-all">
                Browse Resources <ArrowRight className="size-3.5 ml-1" />
              </div>
            </Link>

            {/* Pillar: Community */}
            <Link
              href={ROUTES.POINTSTACK}
              className="group relative p-6 border border-border bg-card hover:border-emerald-500/50 transition-all card-hover-lift animate-fade-in-up animation-delay-200"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center size-10 border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
                  <UsersThree className="size-5" />
                </div>
                <h3 className="font-semibold text-lg">Community</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Connect with other BAS professionals. Share knowledge, ask
                questions, find jobs.
              </p>
              <div className="mt-4 flex items-center text-sm text-emerald-500 dark:text-emerald-400 font-medium group-hover:gap-2 transition-all">
                Join PointStack <ArrowRight className="size-3.5 ml-1" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* TOOLS                                                             */}
      {/* ================================================================ */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Wrench className="size-5 text-cyan-500 dark:text-cyan-400" />
              <SectionLabel variant="tools">tools</SectionLabel>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={ROUTES.TOOLS}>
                All Tools
                <ArrowRight className="size-3 ml-2" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.map((product, index) => (
              <Link
                key={product.shortName}
                href={product.href}
                className="group relative flex items-start gap-5 p-6 border border-border bg-card hover:border-primary/50 transition-all card-hover-lift animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex-shrink-0 flex items-center justify-center size-12 border border-primary/20 bg-primary/5 text-primary">
                  {product.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-base group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <Badge variant="outline" className="text-[10px]">
                      Coming Soon
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                  <span className="mt-3 inline-flex items-center text-xs text-primary font-medium">
                    Learn More <ArrowRight className="size-3 ml-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* RESOURCES                                                         */}
      {/* ================================================================ */}
      <section className="py-16 bg-card/30 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <BookOpen className="size-5 text-violet-500 dark:text-violet-400" />
              <SectionLabel variant="resources">resources</SectionLabel>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={ROUTES.RESOURCES}>
                View All
                <ArrowRight className="size-3 ml-2" />
              </Link>
            </Button>
          </div>

          <p className="text-muted-foreground mb-8 max-w-lg">
            Free tools and references for BAS professionals. Decode
            abbreviations, look up equipment, run calculations, and more.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {RESOURCES.map((resource, index) => (
              <Link
                key={resource.id}
                href={resource.href}
                className="group flex items-center gap-4 p-4 border border-border bg-card hover:border-violet-500/40 transition-all card-hover-lift animate-fade-in-up"
                style={{ animationDelay: `${index * 75}ms` }}
              >
                <div className="flex-shrink-0 flex items-center justify-center size-10 border border-violet-500/20 bg-violet-500/5 text-violet-500 dark:text-violet-400">
                  {resource.iconName
                    ? getIcon(resource.iconName, "size-5")
                    : null}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors">
                    {resource.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {resource.tagline}
                  </p>
                </div>
                <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* WIKI / RECENT ARTICLES                                            */}
      {/* ================================================================ */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Article className="size-5 text-blue-500 dark:text-blue-400" />
              <SectionLabel variant="wiki">recent articles</SectionLabel>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={ROUTES.WIKI}>
                Browse Wiki
                <ArrowRight className="size-3 ml-2" />
              </Link>
            </Button>
          </div>

          <p className="text-muted-foreground mb-8 max-w-lg">
            Guides, tutorials, and reference documentation written for BAS
            professionals.
          </p>

          {recentArticles.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-5 border border-border bg-card animate-pulse"
                >
                  <div className="h-3 w-16 bg-muted rounded mb-3" />
                  <div className="h-5 w-full bg-muted rounded mb-2" />
                  <div className="h-4 w-3/4 bg-muted rounded mb-4" />
                  <div className="h-3 w-20 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentArticles.map((article, index) => (
                <Link
                  key={article.id}
                  href={ROUTES.WIKI_ARTICLE(article.slug)}
                  className="group p-5 border border-border bg-card hover:border-blue-500/40 transition-all card-hover-lift animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {article.category && (
                      <span className="font-mono text-[10px] uppercase tracking-wider text-blue-500 dark:text-blue-400">
                        {article.category.name}
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground">
                      {formatDate(article.created_at)}
                    </span>
                  </div>
                  <h3 className="font-semibold group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  {article.summary && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {article.summary}
                    </p>
                  )}
                  <span className="mt-3 inline-flex items-center text-xs text-blue-500 dark:text-blue-400 font-medium">
                    Read Article <ArrowRight className="size-3 ml-1" />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ================================================================ */}
      {/* COMMUNITY CTA                                                     */}
      {/* ================================================================ */}
      <section className="py-16 border-y border-border bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
            <div className="inline-flex items-center justify-center size-14 border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 mb-6">
              <UsersThree className="size-7" />
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Join the BAS community
            </h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto leading-relaxed">
              PointStack is where BAS professionals connect. Share projects, ask
              questions, find jobs, and learn from each other.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                asChild
                className="h-11 px-6 text-sm bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
              >
                <Link href={ROUTES.POINTSTACK}>
                  <UsersThree className="size-4 mr-2" />
                  Browse PointStack
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="h-11 px-6 text-sm"
              >
                <Link href={ROUTES.SIGNUP}>
                  Create Account
                  <ArrowRight className="size-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* NEWSLETTER & CHANGELOG                                            */}
      {/* ================================================================ */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {/* Newsletter */}
            <div className="animate-fade-in-up">
              <NewsletterSignup />
            </div>

            {/* Changelog */}
            <div className="animate-fade-in-up animation-delay-100">
              <div className="flex items-center gap-3 mb-6">
                <ClockCounterClockwise className="size-5 text-primary" />
                <SectionLabel>what&apos;s new</SectionLabel>
              </div>
              <Changelog maxItems={2} showExpand={true} />
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* FOOTER CTA                                                        */}
      {/* ================================================================ */}
      <section className="py-16 border-t border-border bg-card/30">
        <div className="container mx-auto px-4 text-center animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-primary/30 bg-primary/5 mb-5">
            <Lightning className="size-3.5 text-primary" weight="fill" />
            <span className="font-mono text-xs text-primary uppercase tracking-wider">
              Open Source
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
            Built by a BAS professional, for BAS professionals
          </h2>
          <p className="mt-3 text-muted-foreground max-w-md mx-auto">
            I work in the industry and wanted to build tools and a community to
            help with the day-to-day.
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
      </section>
    </div>
  );
}
