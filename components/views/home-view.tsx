"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, GithubLogo } from "@phosphor-icons/react";
import { ROUTES } from "@/lib/routes";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import { Reveal, CountUp, StaggerGroup, StaggerItem, HoverLift, TextScramble } from "@/components/motion";

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
  const [specimens, setSpecimens] = useState<FeaturedAtlasEntry[]>(featuredAtlas ? [featuredAtlas] : []);
  const [specimenIndex, setSpecimenIndex] = useState(0);
  const [atlasTotal, setAtlasTotal] = useState<number | null>(null);
  const currentSpecimen = specimens[specimenIndex] || featuredAtlas;
  const revLabel = useMemo(() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(d.getMonth() + 1)}·${pad(d.getDate())}·${String(d.getFullYear()).slice(-2)}`;
  }, []);

  // Fetch atlas points client-side, shuffle, and filter for cycling variety
  useEffect(() => {
    fetch("/api/atlas/points?limit=500")
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.total === "number") setAtlasTotal(data.total);
        const all = (data.points || []) as Record<string, unknown>[];
        // Keep only points with descriptions — better specimens
        const withDescriptions = all.filter(
          (p) => typeof p.description === "string" && (p.description as string).trim().length > 20
        );
        // Shuffle (Fisher-Yates)
        for (let i = withDescriptions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [withDescriptions[i], withDescriptions[j]] = [withDescriptions[j], withDescriptions[i]];
        }
        // Take up to 25 random specimens
        const picked = withDescriptions.slice(0, 25);
        if (picked.length > 1) {
          const mapped = picked.map((p) => ({
            name: p.name as string,
            aliases: [],
            description: (p.description as string) || null,
            type: [p.kind, p.point_function].filter(Boolean).join(" · ") || "Point",
            haystackTags: typeof p.haystack_tag_string === "string"
              ? p.haystack_tag_string.split(",").map((t: string) => t.trim()).filter(Boolean).slice(0, 5)
              : [],
            brick: (p.brick as string) || null,
            foundOn: [] as string[],
            aliasCount: typeof p.alias_count === "number" ? p.alias_count : 0,
            url: "/atlas",
          }));
          setSpecimens(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const advanceSpecimen = useCallback(() => {
    if (specimens.length <= 1) return;
    setSpecimenIndex((i) => (i + 1) % specimens.length);
  }, [specimens.length]);

  useEffect(() => {
    if (specimens.length <= 1) return;
    const timer = setInterval(advanceSpecimen, 30000);
    return () => clearInterval(timer);
  }, [advanceSpecimen, specimens.length]);

  return (
    <div className="min-h-full">
      <GlyphSprite />
      {/* ============ HERO / MANIFESTO ============ */}
      <div className="hero-wrap">
        <div className="hero-bg" aria-hidden="true" />
        <section className="relative z-[2] container mx-auto px-4 sm:px-6 lg:px-16 py-24 md:py-28 max-w-[1100px]">
          <div className="max-w-[980px]">
            {/* Pulse line */}
            <Reveal delay={0}>
              <div className="font-mono text-[11px] uppercase tracking-[1.5px] text-muted-foreground mb-8 flex items-center gap-2">
                <span className="live-dot" aria-hidden="true" />
                <span>
                  Updated this week · {pulse.newWikiThisWeek} new wiki entries · {pulse.newAtlasThisWeek} new atlas points · {pulse.newPointStackThisWeek} new PointStack posts
                </span>
              </div>
            </Reveal>

            <Reveal delay={0.1} duration={0.6}>
              <h1 className="font-heading font-semibold text-[34px] md:text-[44px] lg:text-[52px] leading-[1.08] tracking-[-0.015em] text-foreground">
                BAS info, community, and resources —{" "}
                <em className="italic font-medium text-accent">
                  built by a working engineer
                </em>
                , independent of any vendor.
              </h1>
            </Reveal>

            <Reveal delay={0.2} duration={0.6}>
              <p className="mt-8 text-[17px] md:text-[18px] leading-[1.55] text-foreground max-w-[640px]">
                A growing reference for the people who build, integrate, and operate building automation systems. Open data, open source, and a small community that actually answers questions.
              </p>

              <p className="mt-9 font-heading italic text-[16px] text-muted-foreground">
                — Rob, Tucson
              </p>
            </Reveal>
          </div>
        </section>
      </div>

      {/* ============ 01 / ATLAS, TODAY ============ */}
      <section className="bg-secondary border-y border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-16 py-20 max-w-[1100px]">
          <Reveal>
            <SectionEyebrow num="01 /" label="Atlas, today" glyph="compass" />
            <h2 className="font-heading font-semibold text-[28px] md:text-[34px] leading-[1.15] tracking-[-0.01em] text-foreground max-w-[760px]">
              An open reference for points, equipment, and the messy names they show up under.
            </h2>
            <p className="mt-3 text-[16px] text-muted-foreground max-w-[620px] leading-[1.55]">
              Browse 800+ standardized point definitions with Haystack and Brick mappings. Today&apos;s exhibit:
            </p>
          </Reveal>

          {/* Specimen card — cycles through atlas points */}
          {currentSpecimen && (
            <Reveal delay={0.1}>
              <div className="mt-9 bg-card border border-border rounded-md grid grid-cols-1 md:grid-cols-2 gap-y-0 md:gap-x-10 relative overflow-hidden">
                {/* RIBBON — full-width row across both columns */}
                <div className="col-span-full px-9 pt-7 pb-4 mb-2 flex items-center gap-7 flex-wrap font-mono text-[10px] uppercase tracking-[1.4px] text-muted-foreground border-b border-dashed border-border">
                  <span className="flex items-center gap-2">
                    <span className="text-brass">ATL</span>
                    <span className="text-border">·</span>
                    <span className="text-foreground tabular-nums tracking-[.4px]">
                      {String(specimenIndex + 1).padStart(4, "0")}
                    </span>
                  </span>
                  <span className="flex items-center gap-2.5">
                    <span className="text-brass">Specimen</span>
                    <span className="text-foreground tabular-nums tracking-[.4px]">
                      {specimenIndex + 1} <span className="text-border mx-0.5">/</span> {atlasTotal ?? specimens.length}
                    </span>
                  </span>
                  <span className="ml-auto flex items-center gap-2">
                    <span className="inline-block w-[7px] h-[7px] rounded-full bg-brass" aria-hidden />
                    <span className="text-brass">Rev</span>
                    <span className="text-foreground tabular-nums tracking-[.4px]">
                      {revLabel}
                    </span>
                  </span>
                </div>

                <div className="p-9 md:pr-6 md:border-r md:border-border">
                  <TextScramble
                    text={currentSpecimen.name}
                    as="h3"
                    className="font-heading font-semibold text-[26px] leading-[1.15] text-foreground mb-2"
                    duration={1000}
                  />
                  <div className="font-mono text-[12px] text-muted-foreground leading-[1.6] mb-6">
                    <TextScramble
                      text={currentSpecimen.aliases.join(" · ")}
                      duration={1200}
                    />
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={currentSpecimen.name + "-desc"}
                      className="text-[14px] leading-[1.55] text-foreground"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {currentSpecimen.description}
                    </motion.p>
                  </AnimatePresence>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSpecimen.name + "-meta"}
                    className="p-9 md:pl-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <SpecimenField label="Type" value={currentSpecimen.type} />
                    <SpecimenField
                      label="Haystack"
                      value={
                        <div className="flex flex-wrap gap-1">
                          {currentSpecimen.haystackTags.map((t) => (
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
                    {currentSpecimen.brick && (
                      <SpecimenField label="Brick" value={currentSpecimen.brick} />
                    )}
                    {currentSpecimen.foundOn.length > 0 && (
                      <SpecimenField label="Found on" value={currentSpecimen.foundOn.join(" · ")} />
                    )}
                    <SpecimenField label="Aliases" value={`${currentSpecimen.aliasCount} known variants`} last />
                  </motion.div>
                </AnimatePresence>

                {/* Manual advance — click the card footer to skip to next */}
                {specimens.length > 1 && (
                  <button
                    onClick={advanceSpecimen}
                    className="absolute bottom-3 right-4 font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground hover:text-accent transition-colors"
                    aria-label="Next specimen"
                  >
                    Next →
                  </button>
                )}
              </div>
            </Reveal>
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
          </div>
        </div>
      </section>

      {/* ============ 02 / POINTSTACK ============ */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-16 py-24 max-w-[1100px]">
        <Reveal>
          <SectionEyebrow num="02 /" label="PointStack" glyph="talk" />
        </Reveal>

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
          <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-9">
            {pointStackPosts.slice(0, 3).map((post) => (
              <StaggerItem key={post.id}>
                <HoverLift>
                  <Link
                    href={post.url}
                    className="bg-card border border-border rounded-md p-5 flex flex-col gap-2 hover:border-foreground transition-colors h-full"
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
                </HoverLift>
              </StaggerItem>
            ))}
          </StaggerGroup>
        )}

        {/* CTA with rule */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-foreground" />
          <Link
            href={ROUTES.POINTSTACK}
            className="font-heading italic text-[16px] font-medium text-foreground hover:text-accent transition-colors"
          >
            See what&apos;s on PointStack →
          </Link>
        </div>
      </section>

      {/* ============ ALSO HERE ============ */}
      <section className="bg-secondary border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-16 py-20 max-w-[1100px]">
          <h3 className="font-heading font-semibold text-[24px] mb-10 text-foreground">
            Also here. <em className="italic text-muted-foreground font-normal">Smaller, but still loved.</em>
          </h3>

          <StaggerGroup className="grid grid-cols-1 md:grid-cols-3 gap-9">
            <StaggerItem>
              <AlsoHereItem
                num="03"
                title="Wiki"
                glyph="book"
                description={`Field-tested guides on grounding, sequencing, commissioning, and the things nobody writes down. ${alsoHere.wikiCount} articles and counting.`}
                linkLabel="Browse the wiki"
                href={ROUTES.WIKI}
              />
            </StaggerItem>
            <StaggerItem>
              <AlsoHereItem
                num="04"
                title="News"
                glyph="news"
                description="A small daily-ish feed of the BAS industry — standards updates, vendor news, security advisories. No hot takes."
                linkLabel="Read the feed"
                href={ROUTES.NEWS}
              />
            </StaggerItem>
            <StaggerItem>
              <AlsoHereItem
                num="05"
                title="Open Source"
                glyph="code"
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
            </StaggerItem>
          </StaggerGroup>
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
      <div className="font-mono text-[11px] uppercase tracking-[1px] text-brass pt-0.5">
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
        <CountUp value={value} />
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
  glyph,
  description,
  linkLabel,
  href,
}: {
  num: string;
  title: string;
  glyph: GlyphName;
  description: React.ReactNode;
  linkLabel: React.ReactNode;
  href: string;
}) {
  return (
    <div className="border-t border-foreground pt-5">
      <div className="font-mono text-[11px] tracking-[1px] flex items-center gap-2 text-brass">
        <span className="inline-grid place-items-center w-[18px] h-[18px] border border-current rounded-full">
          <svg
            viewBox="0 0 24 24"
            className="w-[10px] h-[10px]"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <use href={`#bsk-glyph-${glyph}`} />
          </svg>
        </span>
        <span className="text-accent">{num}</span>
      </div>
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

type GlyphName = "compass" | "talk" | "book" | "news" | "code";

function SectionEyebrow({
  num,
  label,
  glyph,
}: {
  num: string;
  label: string;
  glyph: GlyphName;
}) {
  return (
    <div className="font-mono text-[11px] uppercase tracking-[1.4px] text-brass mb-3 flex items-center gap-2.5">
      <span className="inline-grid place-items-center w-[18px] h-[18px] border border-current rounded-full">
        <svg
          viewBox="0 0 24 24"
          className="w-[10px] h-[10px]"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <use href={`#bsk-glyph-${glyph}`} />
        </svg>
      </span>
      <span className="text-accent">{num}</span>
      <span>{label}</span>
    </div>
  );
}

function GlyphSprite() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden>
      <defs>
        <symbol id="bsk-glyph-compass" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 5 L13.5 12 L12 12 Z" fill="currentColor" stroke="none" />
          <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
        </symbol>
        <symbol id="bsk-glyph-talk" viewBox="0 0 24 24">
          <path d="M3 5 H21 V17 H10 L5 21 V17 H3 Z" />
        </symbol>
        <symbol id="bsk-glyph-book" viewBox="0 0 24 24">
          <path d="M3 5 Q9 3 12 5 Q15 3 21 5 V20 Q15 18 12 20 Q9 18 3 20 Z" />
          <path d="M12 5 V20" />
        </symbol>
        <symbol id="bsk-glyph-news" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="16" />
          <path d="M7 8 H17 M7 12 H13 M7 16 H17" />
        </symbol>
        <symbol id="bsk-glyph-code" viewBox="0 0 24 24">
          <path d="M9 5 Q5 5 5 9 Q5 12 3 12 Q5 12 5 15 Q5 19 9 19" />
          <path d="M15 5 Q19 5 19 9 Q19 12 21 12 Q19 12 19 15 Q19 19 15 19" />
        </symbol>
      </defs>
    </svg>
  );
}
