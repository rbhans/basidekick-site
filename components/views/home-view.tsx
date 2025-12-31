"use client";

import Link from "next/link";
import { SectionLabel } from "@/components/section-label";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { CircuitBackground } from "@/components/circuit-background";
import { BuildingWireframe } from "@/components/building-wireframe";
import { ArrowRight, GithubLogo, Chats, BookOpen, ChatCircle } from "@phosphor-icons/react";
import { TOOLS_LIST } from "@/lib/constants";
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
  reply_count: number | null;
  category: { name: string; slug: string } | null;
  author: { display_name: string | null } | null;
}

interface HomeViewProps {
  recentArticles?: RecentArticle[];
  recentThreads?: RecentThread[];
}

export function HomeView({ recentArticles = [], recentThreads = [] }: HomeViewProps) {
  // Map tools to product card format
  const products = TOOLS_LIST.map(tool => ({
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
                <Button size="lg" asChild>
                  <Link href={ROUTES.TOOLS}>
                    Browse Tools
                    <ArrowRight className="size-4 ml-2" />
                  </Link>
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

      {/* Wiki Section - Recent Articles */}
      <section className="relative py-12 overflow-hidden">
        <CircuitBackground opacity={0.12} />
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
            Guides, tutorials, and reference documentation for BAS professionals.
          </p>

          {recentArticles.length === 0 ? (
            <div className="border border-dashed border-border p-8 text-center">
              <p className="text-muted-foreground">No articles yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentArticles.map((article) => (
                <Link
                  key={article.id}
                  href={ROUTES.WIKI_ARTICLE(article.slug)}
                  className="group p-4 border border-border bg-card hover:border-primary/50 transition-all block"
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
      <section className="py-12 bg-card/30">
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
            Connect with other BAS professionals. Ask questions, share knowledge.
          </p>

          {recentThreads.length === 0 ? (
            <div className="border border-dashed border-border p-8 text-center">
              <p className="text-muted-foreground">No discussions yet. Be the first to start one!</p>
              <Button className="mt-4" asChild>
                <Link href={ROUTES.FORUM}>
                  Visit Forum
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {recentThreads.map((thread) => (
                <Link
                  key={thread.id}
                  href={ROUTES.FORUM_THREAD(thread.category?.slug || "general", thread.slug)}
                  className="group flex items-center justify-between p-4 border border-border bg-card hover:border-primary/50 transition-all"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      {thread.category && (
                        <span className="bg-primary/10 text-primary px-2 py-0.5">
                          {thread.category.name}
                        </span>
                      )}
                      <span>{thread.author?.display_name || "Anonymous"}</span>
                      <span>&middot;</span>
                      <span>{formatDate(thread.created_at)}</span>
                    </div>
                    <h3 className="font-semibold group-hover:text-primary transition-colors truncate">
                      {thread.title}
                    </h3>
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
