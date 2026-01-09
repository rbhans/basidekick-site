"use client";

import Link from "next/link";
import { SectionLabel } from "@/components/section-label";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CircuitBackground } from "@/components/circuit-background";
import { BuildingWireframe } from "@/components/building-wireframe";
import { AnimatedCounter } from "@/components/animated-counter";
import { HeroSearch } from "@/components/hero-search";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { UserAvatar } from "@/components/user-avatar";
import { CommandMenu, useCommandMenu } from "@/components/command-menu";
import { Changelog } from "@/components/changelog";
import {
  ArrowRight,
  GithubLogo,
  Chats,
  BookOpen,
  ChatCircle,
  Book,
  Translate,
  Users,
  Article,
  ClockCounterClockwise,
} from "@phosphor-icons/react";
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

interface RecentThread {
  id: string;
  title: string;
  slug: string;
  created_at: string;
  reply_count?: number | null;
  category: { name: string; slug: string } | null;
  author: { display_name: string | null } | null;
}

interface HomeViewProps {
  recentArticles?: RecentArticle[];
  recentThreads?: RecentThread[];
  stats?: {
    articleCount: number;
    threadCount: number;
    termCount: number;
  };
}

export function HomeView({
  recentArticles = [],
  recentThreads = [],
  stats = { articleCount: 0, threadCount: 0, termCount: 0 },
}: HomeViewProps) {
  const { open: commandOpen, setOpen: setCommandOpen } = useCommandMenu();

  // Map tools to product card format
  const products = TOOLS_LIST.map((tool) => ({
    name: tool.name,
    shortName: tool.shortName,
    description: tool.description,
    href: ROUTES.TOOL(tool.id),
    ctaText: "Learn More",
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
      {/* Command Menu (Cmd+K) */}
      <CommandMenu open={commandOpen} onOpenChange={setCommandOpen} />

      {/* Hero Section */}
      <section className="relative py-12 md:py-16 overflow-hidden">
        <CircuitBackground opacity={0.15} />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left: Text content */}
            <div className="text-center lg:text-left animate-fade-in-up">
              <SectionLabel>building automation</SectionLabel>

              <h1 className="mt-6 text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight">
                Tools, community, and{" "}
                <span className="gradient-text">knowledge</span>.
              </h1>
              <p className="mt-3 text-base md:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
                Assistive tools, shared knowledge, and a community for BAS
                professionals.
              </p>

              {/* Hero Search */}
              <div className="mt-6 flex justify-center lg:justify-start">
                <HeroSearch onCommandMenuOpen={() => setCommandOpen(true)} />
              </div>

              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                <Button size="lg" asChild>
                  <Link href={ROUTES.TOOLS}>
                    Browse Tools
                    <ArrowRight className="size-4 ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a
                    href="https://github.com/basidekick"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <GithubLogo className="size-4 mr-2" />
                    GitHub
                  </a>
                </Button>
              </div>
            </div>

            {/* Right: Building wireframe */}
            <div className="hidden lg:block animate-fade-in animation-delay-200">
              <BuildingWireframe className="w-full" />
            </div>
          </div>

          {/* Mobile: Building wireframe below */}
          <div className="lg:hidden mt-8 animate-fade-in">
            <BuildingWireframe className="w-full max-w-md mx-auto" />
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-6 border-y border-border bg-card/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold text-primary">
                <Article className="size-6 md:size-7" />
                <AnimatedCounter end={stats.articleCount} suffix="+" />
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">
                Wiki Articles
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold text-primary">
                <Users className="size-6 md:size-7" />
                <AnimatedCounter end={stats.threadCount} suffix="+" />
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">
                Forum Discussions
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold text-primary">
                <Translate className="size-6 md:size-7" />
                <AnimatedCounter end={stats.termCount} suffix="+" />
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">
                BAS Terms
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-12 bg-card/30">
        <div className="container mx-auto px-4">
          <SectionLabel>tools</SectionLabel>

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
      <section className="relative py-12 overflow-hidden">
        <CircuitBackground opacity={0.1} />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Book className="size-6 text-primary" />
              <SectionLabel>resources</SectionLabel>
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
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wiki Section - Recent Articles */}
      <section className="relative py-12 overflow-hidden bg-card/30">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <BookOpen className="size-6 text-primary" />
              <SectionLabel>wiki</SectionLabel>
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
                <div key={i} className="p-4 border border-border bg-card">
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
                  className="group p-4 border border-border bg-card hover:border-primary/50 transition-all block card-hover-lift animate-fade-in-up"
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

      {/* Forum Section - Recent Threads */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Chats className="size-6 text-primary" />
              <SectionLabel>forum</SectionLabel>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={ROUTES.FORUM}>
                View All
                <ArrowRight className="size-3 ml-2" />
              </Link>
            </Button>
          </div>

          <p className="text-muted-foreground mb-6">
            Connect with other BAS professionals. Ask questions, share
            knowledge.
          </p>

          {recentThreads.length === 0 ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-4 border border-border bg-card flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-5 w-3/4" />
                  </div>
                  <Skeleton className="h-5 w-8" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {recentThreads.map((thread, index) => (
                <Link
                  key={thread.id}
                  href={ROUTES.FORUM_THREAD(
                    thread.category?.slug || "general",
                    thread.slug
                  )}
                  className="group flex items-center justify-between p-4 border border-border bg-card hover:border-primary/50 transition-all card-hover-lift animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="min-w-0 flex-1 flex items-center gap-3">
                    <UserAvatar
                      name={thread.author?.display_name || null}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        {thread.category && (
                          <span className="bg-primary/10 text-primary px-2 py-0.5">
                            {thread.category.name}
                          </span>
                        )}
                        <span>
                          {thread.author?.display_name || "Anonymous"}
                        </span>
                        <span>&middot;</span>
                        <span>{formatDate(thread.created_at)}</span>
                      </div>
                      <h3 className="font-semibold group-hover:text-primary transition-colors truncate">
                        {thread.title}
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground ml-4 shrink-0">
                    <ChatCircle className="size-4" />
                    <span>{thread.reply_count || 0}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter & Changelog Section */}
      <section className="py-12 bg-card/30 border-y border-border">
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
