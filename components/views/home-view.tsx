"use client";

import Link from "next/link";
import { ArrowRight, GithubLogo } from "@phosphor-icons/react";
import { ROUTES } from "@/lib/routes";
import { formatDistanceToNow } from "date-fns";

// Types ----------------------------------------------------------------

interface FeaturedAtlasEntry {
  name: string;
  aliases: string[];
  description: string | null;
  type: string;
  haystackTags: string[];
  brick: string | null;
  foundOn: string[];
  aliasCount: number;
  url: string;
}

interface RecentPostItem {
  id: string;
  kind: "question" | "project" | "job";
  title: string;
  authorHandle: string;
  createdAt: string;
  meta: { label: string; value: string }[];
  url: string;
}

interface HomeViewProps {
  pulse: {
    newWikiThisWeek: number;
    newAtlasThisWeek: number;
    newPointStackThisWeek: number;
  };
  featuredAtlas: FeaturedAtlasEntry | null;
  pointStackPosts: RecentPostItem[];
  pointStackStats: {
    members: number;
    posts: number;
    openJobs: number;
    onlineNow: number;
  };
  alsoHere: {
    wikiCount: number;
    newsLatest: string | null;
    crateCount: number;
  };
}

// Component ------------------------------------------------------------

export function HomeView({
  pulse,
  featuredAtlas,
  pointStackPosts,
  pointStackStats,
  alsoHere,
}: HomeViewProps) {
  return (
    <div className="min-h-full">
      {/* ============ HERO / MANIFESTO ============ */}
      <div className="hero-wrap">
        <div className="hero-bg" aria-hidden="true" />
        <section className="relative z-[2] container mx-auto px-4 sm:px-6 lg:px-16 py-24 md:py-28 max-w-[1100px]">
          <div className="max-w-[980px]">
            {/* Pulse line */}
            <div className="font-mono text-[11px] uppercase tracking-[1.5px] text-muted-foreground mb-8 flex items-center gap-2">
              <span className="live-dot" aria-hidden="true" />
              <span>
                Updated this week · {pulse.newWikiThisWeek} new wiki entries · {pulse.newAtlasThisWeek} new atlas points · {pulse.newPointStackThisWeek} new PointStack posts
              </span>
            </div>

            <h1 className="font-heading font-semibold text-[34px] md:text-[44px] lg:text-[52px] leading-[1.08] tracking-[-0.015em] text-foreground">
              BAS info, community, and resources —{" "}
              <em className="italic font-medium text-accent">
                collected from next to the industry
              </em>
              , not from inside it.
            </h1>

            <p className="mt-8 text-[17px] md:text-[18px] leading-[1.55] text-foreground max-w-[640px]">
              A growing reference for the people who build, integrate, and operate building automation systems. Open data, open source, and a small community that actually answers questions.
            </p>

            <p className="mt-9 font-heading italic text-[16px] text-muted-foreground">
              — Rob, Tucson
            </p>
          </div>
        </section>
      </div>

      {/* ============ 01 / ATLAS, TODAY ============ */}
      <section className="bg-secondary border-y border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-16 py-20 max-w-[1100px]">
          <div className="font-mono text-[11px] uppercase tracking-[1.4px] text-muted-foreground mb-3">
            <span className="text-accent mr-1.5">01 /</span>
            Atlas, today
          </div>
          <h2 className="font-heading font-semibold text-[28px] md:text-[34px] leading-[1.15] tracking-[-0.01em] text-foreground max-w-[760px]">
            An open reference for points, equipment, and the messy names they show up under.
          </h2>
          <p className="mt-3 text-[16px] text-muted-foreground max-w-[620px] leading-[1.55]">
            Browse 800+ standardized point definitions with Haystack and Brick mappings. Today&apos;s exhibit:
          </p>

          {/* Specimen card */}
          {featuredAtlas && (
            <div className="mt-9 bg-card border border-border rounded-md p-9 grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="md:pr-6 md:border-r md:border-border">
                <h3 className="font-heading font-semibold text-[26px] leading-[1.15] text-foreground mb-2">
                  {featuredAtlas.name}
                </h3>
                <div className="font-mono text-[12px] text-muted-foreground leading-[1.6] mb-6">
                  {featuredAtlas.aliases.join(" · ")}
                </div>
                {featuredAtlas.description && (
                  <p className="text-[14px] leading-[1.55] text-foreground">
                    {featuredAtlas.description}
                  </p>
                )}
              </div>

              <div>
                <SpecimenField label="Type" value={featuredAtlas.type} />
                <SpecimenField
                  label="Haystack"
                  value={
                    <div className="flex flex-wrap gap-1">
                      {featuredAtlas.haystackTags.map((t) => (
                        <span
                          key={t}
                          className="inline-block bg-muted px-2 py-0.5 rounded-sm text-[11px]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  }
                />
                {featuredAtlas.brick && (
                  <SpecimenField label="Brick" value={featuredAtlas.brick} />
                )}
                <SpecimenField label="Found on" value={featuredAtlas.foundOn.join(" · ")} />
                <SpecimenField label="Aliases" value={`${featuredAtlas.aliasCount} known variants`} last />
              </div>
            </div>
          )}

          {/* Action row */}
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href={ROUTES.ATLAS}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md text-[14px] font-semibold hover:bg-primary/90 transition-colors"
            >
              Browse the Atlas
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href={featuredAtlas?.url ?? ROUTES.ATLAS}
              className="text-[14px] font-semibold text-foreground hover:text-accent transition-colors px-1 py-3"
            >
              Suggest a point
            </Link>
            <span className="md:ml-auto font-heading italic text-[13px] text-muted-foreground">
              Featured manually · changes weekly
            </span>
          </div>
        </div>
      </section>

      {/* ============ 02 / POINTSTACK ============ */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-16 py-24 max-w-[1100px]">
        <div className="font-mono text-[11px] uppercase tracking-[1.4px] text-muted-foreground mb-3">
          <span className="text-accent mr-1.5">02 /</span>
          PointStack
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end mb-11">
          <h2 className="font-heading font-semibold text-[28px] md:text-[34px] leading-[1.15] tracking-[-0.01em] text-foreground">
            A quiet place to talk shop with people who actually <em className="italic text-muted-foreground font-normal">know</em>.
          </h2>
          <div>
            <p className="text-[16px] text-muted-foreground leading-[1.6] mb-4">
              Ask questions, post projects, share the things you learned the hard way. PointStack is small, moderated, and specifically for BAS — not another general engineering forum.
            </p>
            <div className="flex flex-wrap gap-7 font-mono text-[11px] text-muted-foreground uppercase tracking-[1.2px]">
              <PointStackStat label="People" value={pointStackStats.members} />
              <PointStackStat label="Posts" value={pointStackStats.posts} />
              <PointStackStat label="Open jobs" value={pointStackStats.openJobs} />
              <PointStackStat label="Online now" value={pointStackStats.onlineNow} accent />
            </div>
          </div>
        </div>

        {/* Recent posts feed */}
        {pointStackPosts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-9">
            {pointStackPosts.slice(0, 3).map((post) => (
              <Link
                key={post.id}
                href={post.url}
                className="bg-card border border-border rounded-md p-5 flex flex-col gap-2 hover:border-foreground transition-colors"
              >
                <div className="font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground">
                  {post.kind === "question" && <span className="text-accent mr-0.5">?</span>}
                  {post.kind === "question" ? "Question" : post.kind === "project" ? "Project" : "Job"}
                </div>
                <h4 className="font-heading font-semibold text-[16px] leading-[1.3] text-foreground">
                  {post.title}
                </h4>
                <div className="mt-auto pt-2 font-mono text-[10px] text-muted-foreground tracking-[0.5px]">
                  <span className="text-foreground font-medium">@{post.authorHandle}</span>
                  {" · "}
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  {post.meta[0] && (
                    <>
                      {" · "}
                      {post.meta[0].value} {post.meta[0].label}
                    </>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* CTA with rule */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-foreground" />
          <Link
            href={ROUTES.POINTSTACK}
            className="font-heading italic text-[16px] font-medium text-foreground hover:text-accent transition-colors"
          >
            Join the community →
          </Link>
        </div>
      </section>

      {/* ============ ALSO HERE ============ */}
      <section className="bg-secondary border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-16 py-20 max-w-[1100px]">
          <h3 className="font-heading font-semibold text-[24px] mb-10 text-foreground">
            Also here. <em className="italic text-muted-foreground font-normal">Smaller, but still loved.</em>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-9">
            <AlsoHereItem
              num="03"
              title="Wiki"
              description={`Field-tested guides on grounding, sequencing, commissioning, and the things nobody writes down. ${alsoHere.wikiCount} articles and counting.`}
              linkLabel="Browse the wiki"
              href={ROUTES.WIKI}
            />
            <AlsoHereItem
              num="04"
              title="News"
              description="A small daily-ish feed of the BAS industry — standards updates, vendor news, security advisories. No hot takes."
              linkLabel="Read the feed"
              href={ROUTES.NEWS}
            />
            <AlsoHereItem
              num="05"
              title="Open Source"
              description={
                <>
                  Rust crates and tools for building BAS software from the ground up. <em>rustbac</em>, <em>rustmod</em>, and an experimental BMS.
                </>
              }
              linkLabel={
                <span className="inline-flex items-center gap-1.5">
                  <GithubLogo className="w-3.5 h-3.5" />
                  View on GitHub
                </span>
              }
              href={ROUTES.OPEN_SOURCE}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

// Sub-components -------------------------------------------------------

function SpecimenField({
  label,
  value,
  last = false,
}: {
  label: string;
  value: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-[90px_1fr] gap-3 py-2.5 ${
        last ? "" : "border-b border-muted"
      }`}
    >
      <div className="font-mono text-[11px] uppercase tracking-[1px] text-muted-foreground pt-0.5">
        {label}
      </div>
      <div className="font-mono text-[12px] leading-[1.5] text-foreground">{value}</div>
    </div>
  );
}

function PointStackStat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div>
      <strong className="block font-heading not-italic font-semibold text-[24px] text-foreground tracking-normal normal-case mb-0.5 tabular-nums">
        {value}
      </strong>
      <span className={accent ? "text-accent flex items-center gap-1.5" : ""}>
        {accent && <span className="live-dot" aria-hidden="true" />}
        {label}
      </span>
    </div>
  );
}

function AlsoHereItem({
  num,
  title,
  description,
  linkLabel,
  href,
}: {
  num: string;
  title: string;
  description: React.ReactNode;
  linkLabel: React.ReactNode;
  href: string;
}) {
  return (
    <div className="border-t border-foreground pt-5">
      <div className="font-mono text-[11px] tracking-[1px] text-accent">{num}</div>
      <h4 className="font-heading font-semibold text-[24px] mt-1.5 mb-2 text-foreground leading-[1.2]">
        {title}
      </h4>
      <div className="text-[13px] text-muted-foreground leading-[1.55] mb-4">
        {description}
      </div>
      <Link
        href={href}
        className="text-[13px] font-semibold text-foreground border-b border-foreground pb-px hover:text-accent hover:border-accent transition-colors"
      >
        {linkLabel}
      </Link>
    </div>
  );
}
