"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
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

const HERO_DRAWINGS = [
  { src: "/hero2.png", alt: "HVAC control drawing background" },
  { src: "/hero4.png", alt: "Mechanical floor plan background" },
  { src: "/hero3.png", alt: "Equipment catalog background" },
  { src: "/hero1.png", alt: "HVAC control diagram background" },
];

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
  const [equipmentCount, setEquipmentCount] = useState<number>(147);
  const currentSpecimen = specimens[specimenIndex] || featuredAtlas;

  useEffect(() => {
    fetch("/api/atlas/points?limit=500")
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.total === "number") setAtlasTotal(data.total);
        const all = (data.points || []) as Record<string, unknown>[];
        const withDescriptions = all.filter(
          (p) => typeof p.description === "string" && (p.description as string).trim().length > 20
        );
        for (let i = withDescriptions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [withDescriptions[i], withDescriptions[j]] = [withDescriptions[j], withDescriptions[i]];
        }
        const picked = withDescriptions.slice(0, 25);
        if (picked.length > 1) {
          const mapped = picked.map((p) => ({
            name: p.name as string,
            aliases: typeof p.aliases === "string" ? (p.aliases as string).split(",").map((s) => s.trim()).filter(Boolean).slice(0, 5) : [],
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

    fetch("/api/atlas/equipment")
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.total === "number") setEquipmentCount(data.total);
      })
      .catch(() => {});
  }, []);

  const advanceSpecimen = useCallback(() => {
    if (specimens.length <= 1) return;
    setSpecimenIndex((i) => (i + 1) % specimens.length);
  }, [specimens.length]);

  const prevSpecimen = useCallback(() => {
    if (specimens.length <= 1) return;
    setSpecimenIndex((i) => (i - 1 + specimens.length) % specimens.length);
  }, [specimens.length]);

  useEffect(() => {
    if (specimens.length <= 1) return;
    const timer = setInterval(advanceSpecimen, 22000);
    return () => clearInterval(timer);
  }, [advanceSpecimen, specimens.length]);

  const atlasCount = atlasTotal ?? specimens.length;
  const sheetLabel = useMemo(() => {
    const total = atlasCount || 812;
    const idx = String(specimenIndex + 1).padStart(3, "0");
    return `${idx} / ${total}`;
  }, [specimenIndex, atlasCount]);

  return (
    <>
      {/* ============ HERO (sand) ============ */}
      <section className="sand-section">
        <div className="bsk-wrap home-hero">
          <div className="home-hero-drawing-bg" aria-hidden="true">
            {HERO_DRAWINGS.map((drawing, index) => (
              <Image
                key={drawing.src}
                src={drawing.src}
                alt={drawing.alt}
                fill
                priority={index === 0}
                sizes="(max-width: 980px) 100vw, 70vw"
                className="home-hero-drawing-frame"
              />
            ))}
          </div>

          <div className="home-hero-text">
            <div className="home-hero-pulse">
              <span className="pulse-dot" aria-hidden="true" />
              <span>
                Updated this week · <b>{pulse.newWikiThisWeek}</b> new wiki entries · <b>{pulse.newAtlasThisWeek}</b> new atlas points · <b>{pulse.newPointStackThisWeek}</b> new PointStack posts
              </span>
            </div>

            <h1 className="home-hero-manifesto">
              BAS info, community, and resources —{" "}
              <em>built with a cross-system BAS perspective</em>, independent of any vendor.
            </h1>

            <p className="home-hero-lede">
              A growing reference for the people who build, integrate, and operate building automation systems. Open data, open source, and a small community that actually answers questions.
            </p>

            <p className="home-hero-signoff">
              <em>— Rob, Tucson</em>
            </p>
          </div>

          {/* Metric cards */}
          <div className="home-hero-metrics">
            <article className="card-light card-hover metric">
              <div className="head">
                <h3 className="title">Atlas</h3>
                <span className="badge badge-secondary">.01</span>
                <span className="num" />
              </div>
              <div className="value">
                <strong className="tabular-nums">{atlasCount.toLocaleString()}</strong>
                <span className="delta">▲ {pulse.newAtlasThisWeek} this week</span>
              </div>
              <p className="sub">
                Points indexed across <b>{equipmentCount}</b> equipment templates
              </p>
              <div className="bar" style={{ ["--w" as string]: "78%" }} />
            </article>

            <article className="card-light card-hover metric">
              <div className="head">
                <h3 className="title">PointStack</h3>
                <span className="badge badge-secondary">.02</span>
                <span className="num" />
              </div>
              <div className="value">
                <strong className="tabular-nums">{pointStackStats.members.toLocaleString()}</strong>
                <span className="delta">● {pointStackStats.onlineNow} online</span>
              </div>
              <p className="sub">
                Members <b>·</b> moderated · BAS-only forum
              </p>
              <div className="bar" style={{ ["--w" as string]: "52%" }} />
            </article>

            <article className="card-light card-hover metric">
              <div className="head">
                <h3 className="title">Wiki</h3>
                <span className="badge badge-secondary">.03</span>
                <span className="num" />
              </div>
              <div className="value">
                <strong className="tabular-nums">{alsoHere.wikiCount.toLocaleString()}</strong>
                <span className="delta">▲ {pulse.newWikiThisWeek} this week</span>
              </div>
              <p className="sub">
                Field-tested articles from <b>23</b> contributors
              </p>
              <div className="bar" style={{ ["--w" as string]: "36%" }} />
            </article>
          </div>
        </div>
      </section>

      {/* ============ SPECIMEN (dark) ============ */}
      <section className="char-section">
        <div className="bsk-wrap section">
          <div className="section-bar">
            <span className="num">.04</span>
            <h2>Atlas / Today&apos;s Specimen</h2>
            <div className="controls">
              <span className="id">
                CRG <b>{sheetLabel}</b>
              </span>
            </div>
          </div>

          {currentSpecimen && (
            <article className="card-dark">
              <div className="specimen">
                <div className="spec-main">
                  <div className="spec-eyebrow">
                    <span className="arrow">→</span>
                    <span className="badge badge-secondary">{currentSpecimen.type}</span>
                  </div>
                  <h3 className="spec-callsign">{currentSpecimen.name}</h3>
                  <p className="spec-name">{currentSpecimen.brick || currentSpecimen.haystackTags.join(" ")}</p>
                  <p className="spec-desc">
                    {currentSpecimen.description ?? "Preview of an atlas entry — full record on the Atlas page."}
                  </p>

                  <div className="spec-cta">
                    <Link href={ROUTES.ATLAS} className="btn btn-punch">
                      Open in Atlas →
                    </Link>
                    <Link href={ROUTES.ATLAS} className="btn btn-outline">
                      Suggest a point
                    </Link>
                  </div>
                </div>

                <aside className="spec-aside">
                  <div className="aside-meta">
                    <span className="aside-meta-k">Sheet</span>
                    <span className="aside-meta-v">{sheetLabel.replace(" / ", " of ")}</span>
                  </div>
                  <div className="fields fields-stack">
                    <div className="spec-field">
                      <div className="k"><span className="pin" />Kind</div>
                      <div className="v">
                        {currentSpecimen.type}
                        <span className="sub">As classified in the atlas</span>
                      </div>
                    </div>
                    <div className="spec-field">
                      <div className="k"><span className="pin" />Haystack</div>
                      <div className="v">
                        {currentSpecimen.haystackTags.join(" ") || "—"}
                        <span className="sub">Project Haystack tag string</span>
                      </div>
                    </div>
                    <div className="spec-field">
                      <div className="k"><span className="pin" />Brick</div>
                      <div className="v">
                        {currentSpecimen.brick || "—"}
                        <span className="sub">Brick Schema class</span>
                      </div>
                    </div>
                    <div className="spec-field">
                      <div className="k"><span className="pin" />Aliases</div>
                      <div className="v">
                        {currentSpecimen.aliasCount} variants
                        <span className="sub">{currentSpecimen.aliases.slice(0, 3).join(" · ") || "see full entry"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="spec-nav">
                    <button type="button" className="btn btn-outline btn-sm" onClick={prevSpecimen}>
                      <span className="arr">←</span> Prev
                    </button>
                    <button type="button" className="btn btn-outline btn-sm" onClick={advanceSpecimen}>
                      Next <span className="arr">→</span>
                    </button>
                  </div>
                </aside>
              </div>
            </article>
          )}
        </div>
      </section>

      {/* ============ FEED (sand) ============ */}
      <section className="sand-section">
        <div className="bsk-wrap section">
          <div className="section-bar">
            <span className="num">.05</span>
            <h2>PointStack / Feed</h2>
            <div className="controls">
              <div className="bsk-tabs" role="tablist">
                <button className="bsk-tab" aria-selected="true" role="tab">All</button>
                <button className="bsk-tab" aria-selected="false" role="tab">Questions</button>
                <button className="bsk-tab" aria-selected="false" role="tab">Projects</button>
              </div>
              <span className="id">
                ONLINE <b>{pointStackStats.onlineNow}</b> · OPEN <b>{pointStackStats.openJobs}</b>
              </span>
            </div>
          </div>

          <div className="feed-head">
            <h2 className="feed-h">
              TALK<span className="arrow">→</span>
            </h2>
            <p className="feed-sub">
              A quiet place to talk shop with people who <em>actually know</em>. Small, moderated, specifically for BAS — not another general engineering forum.
            </p>
          </div>

          {pointStackPosts.length > 0 ? (
            <div className="thread-list">
              {pointStackPosts.slice(0, 4).map((post) => (
                <Link key={post.id} href={post.url} className="thread">
                  <span className="avatar">{post.authorHandle.slice(0, 2).toUpperCase()}</span>
                  <span className="kind-col">
                    <span className={`badge ${post.kind === "question" ? "badge-punch-soft" : "badge-default"}`}>
                      {post.kind === "question" ? "Question" : post.kind === "project" ? "Project" : "Job"}
                    </span>
                  </span>
                  <span className="ts">
                    {new Date(post.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}
                  </span>
                  <span className="title">
                    {post.title}
                    <span className="meta">
                      by <b>@{post.authorHandle}</b> · {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                      {post.meta[0] && ` · ${post.meta[0].value} ${post.meta[0].label}`}
                    </span>
                  </span>
                  <span className="stat">
                    <b className="tabular-nums">{String(post.meta[0]?.value ?? 0).padStart(2, "0")}</b> replies
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="thread-list">
              <div className="thread">
                <span className="avatar" aria-hidden>—</span>
                <span className="title">
                  No posts yet. Come start one.
                  <span className="meta">PointStack feed is open · by anyone in the community</span>
                </span>
              </div>
            </div>
          )}

          <div style={{ marginTop: 32, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href={ROUTES.POINTSTACK} className="btn btn-primary">
              Open the feed →
            </Link>
            <Link href={ROUTES.POINTSTACK} className="btn btn-outline">
              Post a question
            </Link>
          </div>
        </div>
      </section>

      {/* ============ INDEX (dark) ============ */}
      <section className="char-section">
        <div className="bsk-wrap section">
          <div className="section-bar">
            <span className="num">.06</span>
            <h2>Find Your Way</h2>
            <span className="id" style={{ marginLeft: "auto" }}>
              IDX <b>12</b>
            </span>
          </div>

          {/* Learn */}
          <div className="index-group">
            <div className="index-group-bar">
              <span className="num">A /</span>
              <h3>Learn</h3>
              <span className="meta">Reference & study</span>
            </div>
            <div className="channels">
              <IndexCard
                href={ROUTES.ATLAS}
                title="ATLAS"
                num=".06.1"
                desc="Point & equipment reference. Every vendor names things differently — Atlas catalogs them."
                stats={[
                  { label: `${atlasCount.toLocaleString()} points`, kind: "secondary" },
                  { label: `${equipmentCount} equipment`, kind: "outline" },
                ]}
                cta="Open Atlas"
              />
              <IndexCard
                href={ROUTES.WIKI}
                title="WIKI"
                num=".06.2"
                desc="Long-form guides & explainers. Field-tested articles on grounding, sequencing, commissioning."
                stats={[
                  { label: `${alsoHere.wikiCount} articles`, kind: "secondary" },
                  { label: `+${pulse.newWikiThisWeek} this week`, kind: "outline" },
                ]}
                cta="Browse the wiki"
              />
              <IndexCard
                href={ROUTES.COURSES}
                title="COURSES"
                num=".06.3"
                desc="Self-paced BAS lessons. Start with Intro to BAS — fundamentals for new techs."
                stats={[{ label: "Intro to BAS", kind: "secondary" }]}
                cta="Start learning"
              />
              <IndexCard
                href={ROUTES.REFERENCES}
                title="REFS"
                num=".06.4"
                desc="Standards, specs, sources. Quick reference sheets for protocols, wiring, common tasks."
                cta="Open references"
              />
              <IndexCard
                href={ROUTES.CALCULATORS}
                title="CALC"
                num=".06.5"
                desc="Quick engineering math. CFM, BTU, duct sizing, and other common calculations."
                cta="Open calculators"
              />
            </div>
          </div>

          {/* Community */}
          <div className="index-group">
            <div className="index-group-bar">
              <span className="num">B /</span>
              <h3>Community</h3>
              <span className="meta">People & posts</span>
            </div>
            <div className="channels">
              <IndexCard
                href={ROUTES.POINTSTACK}
                title="POINTSTACK"
                num=".07.1"
                desc="Q&A, projects, posts. Small, moderated, specifically for BAS — not another general forum."
                stats={[
                  { label: `${pointStackStats.members.toLocaleString()} members`, kind: "secondary" },
                  { label: `${pointStackStats.posts} posts`, kind: "outline" },
                ]}
                cta="Open the feed"
              />
              <IndexCard
                href={ROUTES.NEWS}
                title="NEWS"
                num=".07.2"
                desc="Industry signal, weekly. Standards updates, vendor news, security advisories. No hot takes."
                stats={[
                  ...(alsoHere.newsLatest
                    ? [{ label: `latest ${alsoHere.newsLatest}`, kind: "secondary" as const }]
                    : []),
                  { label: "updated daily", kind: "outline" as const },
                ]}
                cta="Read the feed"
              />
              <IndexCard
                href={ROUTES.POINTSTACK_PEOPLE}
                title="EXPERTS"
                num=".07.3"
                desc="Endorsed BAS practitioners. Find people by topic, endorsed by peers in the field."
                cta="Browse experts"
              />
              <IndexCard
                href={ROUTES.POINTSTACK_JOBS}
                title="JOBS"
                num=".07.4"
                desc="Roles across the industry. Controls, integration, commissioning, sales engineering."
                stats={[{ label: `${pointStackStats.openJobs} open`, kind: "secondary" }]}
                cta="View open jobs"
              />
            </div>
          </div>

          {/* Build */}
          <div className="index-group">
            <div className="index-group-bar">
              <span className="num">C /</span>
              <h3>Build</h3>
              <span className="meta">Code & shared work</span>
            </div>
            <div className="channels">
              <IndexCard
                href={ROUTES.OPEN_SOURCE}
                title="SHARE"
                num=".08.1"
                desc="BAS links, files, modules, repos, scripts, and field-adjacent notes from BASidekick and the community."
                stats={[
                  { label: `${alsoHere.crateCount} entries`, kind: "secondary" },
                  { label: "Community", kind: "outline" },
                ]}
                cta="Browse community share"
              />
              <IndexCard
                href={ROUTES.POINTSTACK_RESOURCES}
                title="QUEUE"
                num=".08.2"
                desc="Templates, scripts, references, and files shared by signed-in PointStack members."
                stats={[{ label: "User shared", kind: "outline" }]}
                cta="Open resources"
              />
              <IndexCard
                href={ROUTES.API_ATLAS}
                title="API"
                num=".08.3"
                desc="JSON · no auth · stable URLs. Public Atlas data, free to integrate into your own apps."
                stats={[{ label: "Public", kind: "secondary" }]}
                cta="See the API"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

interface IndexCardProps {
  href: string;
  title: string;
  num: string;
  desc: string;
  stats?: { label: string; kind: "secondary" | "outline" }[];
  cta: string;
}

function IndexCard({ href, title, num, desc, stats, cta }: IndexCardProps) {
  return (
    <Link href={href} className="card-dark card-hover ch ch-slim">
      <div className="ch-head">
        <h3>{title}</h3>
        <span className="num">{num}</span>
      </div>
      <p className="ch-desc">{desc}</p>
      {stats && stats.length > 0 && (
        <div className="ch-stats">
          {stats.map((s) => (
            <span key={s.label} className={`badge ${s.kind === "secondary" ? "badge-secondary" : "badge-outline"}`}>
              {s.label}
            </span>
          ))}
        </div>
      )}
      <span className="ch-cta">
        {cta} <span className="arr">→</span>
      </span>
    </Link>
  );
}
