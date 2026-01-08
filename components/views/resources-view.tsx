"use client";

import Link from "next/link";
import { SectionLabel } from "@/components/section-label";
import { CircuitBackground } from "@/components/circuit-background";
import { BookOpen, Chats, Kanban, ArrowRight, Translate } from "@phosphor-icons/react";
import { ROUTES } from "@/lib/routes";

const resources = [
  {
    id: "babel",
    title: "BAS Babel",
    description: "Point naming standards and aliases across BAS platforms. Translate between vendor conventions and industry standards.",
    icon: Translate,
    cta: "Browse Standards",
    href: ROUTES.BABEL,
  },
  {
    id: "wiki",
    title: "Wiki",
    description: "Guides, tutorials, and reference documentation for BAS professionals. Learn best practices and troubleshooting tips.",
    icon: BookOpen,
    cta: "Browse Wiki",
    href: ROUTES.WIKI,
  },
  {
    id: "forum",
    title: "Forum",
    description: "Community discussion board. Ask questions, share knowledge, and connect with other BAS professionals.",
    icon: Chats,
    cta: "Join Discussion",
    href: ROUTES.FORUM,
  },
  {
    id: "psk",
    title: "PSK",
    description: "Free project management tool built for BAS projects. Track points, schedules, and commissioning progress.",
    icon: Kanban,
    cta: "Open PSK",
    href: ROUTES.PSK,
  },
];

export function ResourcesView() {
  return (
    <div className="min-h-full">
      {/* Header */}
      <section className="relative py-12 overflow-hidden">
        <CircuitBackground opacity={0.15} />
        <div className="container mx-auto px-4 relative z-10">
          <SectionLabel>resources</SectionLabel>

          <h1 className="mt-6 text-3xl md:text-4xl font-semibold tracking-tight">
            Free Resources
          </h1>
          <p className="mt-3 text-muted-foreground max-w-xl">
            Knowledge base, community forum, and free tools to help you succeed.
          </p>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {resources.map((resource) => (
              <Link
                key={resource.id}
                href={resource.href}
                className="group p-6 border border-border bg-card hover:border-primary/50 transition-all text-left block"
              >
                <resource.icon className="size-8 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">{resource.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {resource.description}
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:underline underline-offset-4">
                  {resource.cta}
                  <ArrowRight className="size-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Community Stats (placeholder) */}
      <section className="py-12 bg-card/30">
        <div className="container mx-auto px-4">
          <SectionLabel>community</SectionLabel>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl">
            <div className="p-4 text-center">
              <p className="text-2xl font-mono font-semibold">500+</p>
              <p className="text-xs text-muted-foreground mt-1">Wiki Articles</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-2xl font-mono font-semibold">1.2k</p>
              <p className="text-xs text-muted-foreground mt-1">Forum Members</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-2xl font-mono font-semibold">50+</p>
              <p className="text-xs text-muted-foreground mt-1">PSK Users</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-2xl font-mono font-semibold">24hr</p>
              <p className="text-xs text-muted-foreground mt-1">Avg Response</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
