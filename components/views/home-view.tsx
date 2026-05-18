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

// Schematic frame metadata — labels matched to each hero image
const SCHEMATIC_FRAMES = [
  { src: "/hero1.png", drawing: "M-23-700", rev: "B", sheet: "01 / 04", stamp: "M-23-700-HVAC", title: "HVAC CONTROL DIAGRAM · RTU-23" },
  { src: "/hero4.png", drawing: "M-23-600", rev: "0", sheet: "02 / 04", stamp: "M-23-600-MECH", title: "MECHANICAL FLOOR PLAN · LEVEL 06" },
  { src: "/hero2.png", drawing: "FT-240512", rev: "0", sheet: "03 / 04", stamp: "FT-240512-M0.0", title: "HVAC CONTROL DRAWING · FUTURE TOWER" },
  { src: "/hero3.png", drawing: "M-23-700", rev: "C", sheet: "04 / 04", stamp: "M-23-700-CAT", title: "EQUIPMENT CATALOG · 8 SYSTEMS" },
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
  const [schematicIndex, setSchematicIndex] = useState(0);
  const currentSpecimen = specimens[specimenIndex] || featuredAtlas;
  const currentSchematic = SCHEMATIC_FRAMES[schematicIndex];

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

  useEffect(() => {
    const timer = setInterval(() => {
      setSchematicIndex((i) => (i + 1) % SCHEMATIC_FRAMES.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

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
        <div className="bsk-wrap hero">
          <div className="hero-grid">
            <div className="hero-text">
              <div className="hero-pulse">
                <span className="pulse-dot" aria-hidden="true" />
                <span>
                  Updated this week · <b>{pulse.newWikiThisWeek}</b> new wiki entries · <b>{pulse.newAtlasThisWeek}</b> new atlas points · <b>{pulse.newPointStackThisWeek}</b> new PointStack posts
                </span>
              </div>

              <h1 className="hero-manifesto">
                BAS info, community, and resources —{" "}
                <em>built by a working engineer</em>, independent of any vendor.
              </h1>

              <p className="hero-lede">
                A growing reference for the people who build, integrate, and operate building automation systems. Open data, open source, and a small community that actually answers questions.
              </p>

              <p className="hero-signoff">
                <em>— Rob, Tucson</em>
              </p>
            </div>

            {/* Schematic viewer */}
            <figure className="hero-schematic" aria-label="Featured technical drawing">
              <div className="strip">
                <span className="group">
                  <span className="k">DRAWING</span> <span className="v">{currentSchematic.drawing}</span>
                </span>
                <span className="sep" aria-hidden />
                <span className="group">
                  <span className="k">REV</span> <span className="v">{currentSchematic.rev}</span>
                </span>
                <span className="sep" aria-hidden />
                <span className="group">
                  <span className="k">SHEET</span> <span className="v">{currentSchematic.sheet}</span>
                </span>
                <span className="live">
                  <span className="dot" aria-hidden /> LIVE
                </span>
              </div>
              <div className="viewport">
                <span className="stamp">
                  <span className="k">BSK</span>
                  <span>{currentSchematic.stamp}</span>
                </span>
                <Image
                  key={currentSchematic.src}
                  src={currentSchematic.src}
                  alt={currentSchematic.title}
                  fill
                  priority
                  sizes="(max-width: 980px) 100vw, 50vw"
                  className="active"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <figcaption className="foot">
                <span className="meta">
                  <span className="k" style={{ color: "var(--punch)" }}>TITLE</span>
                  <b>{currentSchematic.title}</b>
                </span>
                <span className="dots" role="tablist" aria-label="Schematic">
                  {SCHEMATIC_FRAMES.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSchematicIndex(i)}
                      className={i === schematicIndex ? "active" : ""}
                      aria-label={`View schematic ${i + 1}`}
                    />
                  ))}
                </span>
              </figcaption>
            </figure>
          </div>

          {/* Metric cards */}
          <div className="hero-metrics">
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

      {/* ============ CHANNELS (dark) ============ */}
      <section className="char-section">
        <div className="bsk-wrap section">
          <div className="section-bar">
            <span className="num">.06</span>
            <h2>Also On This Console</h2>
            <span className="id" style={{ marginLeft: "auto" }}>
              CHN <b>03</b>
            </span>
          </div>

          <div className="channels">
            <Link href={ROUTES.WIKI} className="card-dark card-hover ch">
              <div className="ch-head">
                <h3>WIKI</h3>
                <span className="num">.06</span>
              </div>
              <p className="ch-desc">
                Field-tested guides on grounding, sequencing, commissioning — and the things nobody writes down. Every article authored by humans who showed up on site.
              </p>
              <div className="ch-stats">
                <span className="badge badge-secondary">{alsoHere.wikiCount} articles</span>
                <span className="badge badge-outline">+{pulse.newWikiThisWeek} this week</span>
              </div>
              <span className="ch-cta">
                Browse the wiki <span className="arr">→</span>
              </span>
            </Link>

            <Link href={ROUTES.NEWS} className="card-dark card-hover ch">
              <div className="ch-head">
                <h3>NEWS</h3>
                <span className="num">.07</span>
              </div>
              <p className="ch-desc">
                A small daily-ish feed of the BAS industry — standards updates, vendor news, security advisories. <em>LLM-sorted, human-reviewed.</em> No hot takes.
              </p>
              <div className="ch-stats">
                {alsoHere.newsLatest && <span className="badge badge-secondary">latest {alsoHere.newsLatest}</span>}
                <span className="badge badge-outline">updated daily</span>
              </div>
              <span className="ch-cta">
                Read the feed <span className="arr">→</span>
              </span>
            </Link>

            <Link href={ROUTES.OPEN_SOURCE} className="card-dark card-hover ch">
              <div className="ch-head">
                <h3>SRC</h3>
                <span className="num">.08</span>
              </div>
              <p className="ch-desc">
                Rust crates and tools for building BAS software from the ground up. <em>rustbac</em>, <em>rustmod</em>, and an experimental BMS. Pull requests welcome.
              </p>
              <div className="ch-stats">
                <span className="badge badge-secondary">{alsoHere.crateCount} repos</span>
                <span className="badge badge-outline">MIT · Rust</span>
              </div>
              <span className="ch-cta">
                View on GitHub <span className="arr">→</span>
              </span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
