"use client";

/* eslint-disable @next/next/no-img-element -- Shared entry images can come from arbitrary community-hosted URLs. */
import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  FileArrowDown,
  Globe,
  GithubLogo,
  LinkSimple,
  MagnifyingGlass,
  Plus,
  Stack,
} from "@phosphor-icons/react";
import { CreateResourceDialog } from "@/components/pointstack/resources/create-resource-dialog";
import { useAuth } from "@/hooks/use-auth";
import type { PointStackResourceCategory, PointStackResourceListing } from "@/lib/types";
import { ROUTES } from "@/lib/routes";
import * as pointStackApi from "@/components/pointstack/pointstack-api";

type ShareKind = "Protocol" | "Project" | "Module" | "File";
type ShareStage = "Active" | "Preview" | "Planned";
type ShareAccess = "Open source" | "Project site" | "File" | "Planned";
type ShareLinkType = "github" | "file" | "site" | "external";

interface CommunityShareLink {
  label: string;
  href: string;
  type?: ShareLinkType;
}

interface CommunityShareImage {
  src: string;
  alt: string;
}

interface CommunityShareEntry {
  id: string;
  title: string;
  protocol: string;
  kind: ShareKind;
  stage: ShareStage;
  access: ShareAccess;
  summary: string;
  description: ReactNode;
  owner: string;
  language: string;
  license: string;
  latest: string;
  lastCommit: string;
  stars: number | string;
  images?: CommunityShareImage[];
  highlights: string[];
  snippets?: {
    label: string;
    body: string;
  }[];
  tags: string[];
  links: CommunityShareLink[];
}

// Directory entries are hand-curated from project READMEs, public project sites,
// or local module metadata. Unknown values stay explicit instead of guessed.
const communityShareEntries: CommunityShareEntry[] = [
  {
    id: "rustbac",
    title: "rustbac",
    protocol: "BACnet",
    kind: "Protocol",
    stage: "Active",
    access: "Open source",
    summary: "Rust BACnet workspace for BACnet/IP, BACnet/SC, MS/TP, clients, servers, and CLI work.",
    description: (
      <>
        Open source Rust crate for BACnet communication in BAS applications. The workspace ships a <em>no_std</em> core encoder/decoder, async BACnet/IP transport, BACnet/SC WebSocket transport, MS/TP transport, a high-level client API, server scaffolding, and CLI commands.
      </>
    ),
    owner: "BASidekick",
    language: "Rust",
    license: "MIT OR Apache-2.0",
    latest: "0.4.1",
    lastCommit: "May 12, 2026",
    stars: 2,
    tags: ["bacnet", "rust", "protocol"],
    highlights: [
      "no_std core encoder/decoder for BACnet NPDU/APDU, types, and service payloads.",
      "BACnet/IP with BBMD/FDR support, BACnet/SC WebSocket, and MS/TP transports.",
      "CLI commands for whois, readprop, writeprop, subcov, readrange, file services, DCC, and time sync.",
    ],
    snippets: [
      {
        label: "Cargo.toml",
        body: `[dependencies]\nrustbac-client = "0.4"\nrustbac-core = "0.4"\nrustbac-datalink = "0.4"`,
      },
    ],
    links: [
      { label: "GitHub", href: "https://github.com/rbhans/rust-bac", type: "github" },
    ],
  },
  {
    id: "rustmod",
    title: "rustmod",
    protocol: "Modbus",
    kind: "Protocol",
    stage: "Active",
    access: "Open source",
    summary: "Rust Modbus workspace with TCP and RTU transports, async and sync clients, and server support.",
    description: (
      <>
        Open source Rust crate for Modbus communication in BAS applications. A modern, safe Rust Modbus library for building automation and industrial integrations with <em>zero-copy codec</em>, no_std core, async and sync clients, TCP and RTU transports, and server support.
      </>
    ),
    owner: "BASidekick",
    language: "Rust",
    license: "MIT OR Apache-2.0",
    latest: "0.2.0",
    lastCommit: "Mar 5, 2026",
    stars: 0,
    tags: ["modbus", "rust", "protocol"],
    highlights: [
      "Function codes 01-43, including coils, registers, diagnostics, file records, FIFO, and MEI.",
      "Zero-copy no_std core that decodes PDUs by borrowing from the input buffer.",
      "TCP server, RTU-over-TCP server, optional native RTU serial server, and in-memory simulator.",
    ],
    snippets: [
      {
        label: "Cargo.toml",
        body: `[dependencies]\nrustmod-client = "0.2"\nrustmod-datalink = "0.2"\ntokio = { version = "1", features = ["full"] }`,
      },
    ],
    links: [
      { label: "GitHub", href: "https://github.com/rbhans/rust-mod", type: "github" },
    ],
  },
  {
    id: "qrbas",
    title: "QRBAS",
    protocol: "Niagara",
    kind: "Project",
    stage: "Active",
    access: "Open source",
    summary: "Self-hosted QR equipment pages for BAS teams, with a local Niagara connector and no cloud backend.",
    description: (
      <>
        Open source QR code project for BAS workflows. Run one small server on the local network, add Niagara stations, print QR codes for equipment, and let technicians scan with a phone camera to see live point data in the browser. <em>No app store. No cloud backend. No technician logins.</em>
      </>
    ),
    owner: "BASidekick",
    language: "Go",
    license: "-",
    latest: "-",
    lastCommit: "Apr 28, 2026",
    stars: 0,
    tags: ["niagara", "qr", "field"],
    highlights: [
      "Single Go binary with embedded PWA and SQLite storage.",
      "Niagara station setup from the admin UI, equipment mapping, and printable QR codes.",
      "Runs on the BAS network with no cloud backend, accounts, or telemetry.",
    ],
    snippets: [
      {
        label: "Quick start",
        body: `cd server\ngo run .\n# open http://localhost:8080`,
      },
    ],
    links: [
      { label: "GitHub", href: "https://github.com/rbhans/qrbas", type: "github" },
      { label: "Project site", href: "https://rbhans.github.io/qrbas/" },
    ],
  },
  {
    id: "bask-stream",
    title: "BASk Stream",
    protocol: "Niagara 4",
    kind: "Module",
    stage: "Active",
    access: "Open source",
    summary: "Niagara 4 runtime module that exposes station data through an authenticated WebSocket API.",
    description: (
      <>
        BASk Stream gives external graphics, dashboards, commissioning apps, and integrations a practical live-data path without forcing every app to live inside Niagara UI.
      </>
    ),
    owner: "BASidekick",
    language: "Java",
    license: "-",
    latest: "-",
    lastCommit: "May 26, 2026",
    stars: 0,
    tags: ["niagara", "websocket", "integration"],
    highlights: [
      "Station browsing, object descriptions, bounded search, and metadata for points, devices, schedules, histories, and alarms.",
      "Point snapshots and replaceable live subscriptions with lease renewal and connection cleanup.",
      "Writable point capability checks before set, override, auto, or emergency override controls render.",
    ],
    snippets: [
      {
        label: "Station endpoint",
        body: `GET https://<station>/stream/health\nwss://<station>/stream`,
      },
    ],
    links: [
      { label: "GitHub", href: "https://github.com/rbhans/bask-stream", type: "github" },
    ],
  },
  {
    id: "opencrate-bms",
    title: "OpenCrate BMS",
    protocol: "BMS",
    kind: "Project",
    stage: "Planned",
    access: "Project site",
    summary: "Hobby BMS project being built from scratch in Rust. Public release is still pending.",
    description: (
      <>
        A hobby project to learn various parts of BMS by building the software from the ground up in pure Rust. Public release is <em>still pending</em>; the project site lists the planned feature set.
      </>
    ),
    owner: "BASidekick",
    language: "Rust",
    license: "MIT",
    latest: "-",
    lastCommit: "-",
    stars: "-",
    tags: ["rust", "bms", "project"],
    highlights: [
      "Planned multi-protocol support for BACnet/IP, BACnet/SC, MS/TP, Modbus TCP, and Modbus RTU.",
      "Planned alarms, routing, trend logging, visual logic, and commissioning workflows.",
      "Useful as a public build log while the software is still forming.",
    ],
    links: [
      { label: "Project site", href: "https://rbhans.github.io/opencrate-site/" },
    ],
  },
];

type KindFilter = "all" | Lowercase<ShareKind>;

const KIND_FILTERS: { value: KindFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "protocol", label: "Protocol" },
  { value: "project", label: "Projects" },
  { value: "module", label: "Modules" },
  { value: "file", label: "Files" },
];

const RESOURCE_CATEGORY_LABELS: Record<PointStackResourceCategory, string> = {
  template: "Template",
  script: "Script",
  document: "Document",
  guide: "Guide",
  tool: "Project",
  other: "Other",
};

const FILE_LINK_PATTERN = /\.(?:7z|bac|bog|csv|docx?|gz|jar|json|mod|n4|pdf|pptx?|px|tar|tgz|txt|xlsx?|xml|ya?ml|zip)(?:[?#].*)?$/i;
const HAS_SUPABASE_CONFIG = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

function getShareLinkType(link: CommunityShareLink): ShareLinkType {
  if (link.type) return link.type;
  const href = link.href.toLowerCase();
  if (href.includes("github.com")) return "github";
  if (FILE_LINK_PATTERN.test(href)) return "file";
  if (/^https?:\/\//i.test(href)) return "site";
  return "external";
}

function resourceToCommunityShareEntry(resource: PointStackResourceListing): CommunityShareEntry {
  const topic = RESOURCE_CATEGORY_LABELS[resource.category];
  const links: CommunityShareLink[] = [];

  if (resource.file_url) {
    links.push({ label: "File", href: resource.file_url, type: "file" });
  }

  if (resource.external_link) {
    const isGithub = resource.external_link.toLowerCase().includes("github.com");
    links.push({
      label: isGithub ? "GitHub" : "Reference",
      href: resource.external_link,
      type: isGithub ? "github" : "site",
    });
  }

  links.push({
    label: "Entry",
    href: ROUTES.POINTSTACK_RESOURCE(resource.slug),
    type: "external",
  });

  return {
    id: `resource-${resource.id}`,
    title: resource.title,
    protocol: topic,
    kind: resource.file_url ? "File" : "Project",
    stage: "Active",
    access: resource.file_url ? "File" : "Project site",
    summary: resource.description || "Community-submitted BAS entry.",
    description: resource.description || "Community-submitted entry. Add a description when more detail is available.",
    owner: resource.author?.display_name || "Community",
    language: "-",
    license: resource.is_free ? "Free" : "Premium",
    latest: "Shared",
    lastCommit: formatShareDate(resource.created_at),
    stars: resource.upvote_count,
    images: (resource.preview_images || []).map((src, index) => ({
      src,
      alt: `${resource.title} image ${index + 1}`,
    })),
    tags: resource.tags || [],
    highlights: [
      `${topic} shared by ${resource.author?.display_name || "a community member"}.`,
      resource.file_url ? "Includes a file link." : "Includes a project or reference link.",
      `${resource.comment_count} comments and ${resource.download_count} opens.`,
    ],
    links,
  };
}

function formatShareDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function OpenSourceView() {
  const { user } = useAuth();
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");
  const [protocolFilter, setProtocolFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [sharedResources, setSharedResources] = useState<PointStackResourceListing[]>([]);

  useEffect(() => {
    if (!HAS_SUPABASE_CONFIG) return;

    let cancelled = false;

    pointStackApi
      .fetchResources(undefined, 50)
      .then((resources) => {
        if (!cancelled) setSharedResources(resources);
      })
      .catch((error) => {
        console.error("Error loading shared resources:", error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const allEntries = useMemo(
    () => [
      ...sharedResources.map(resourceToCommunityShareEntry),
      ...communityShareEntries,
    ],
    [sharedResources],
  );

  const protocols = useMemo(
    () => Array.from(new Set(allEntries.map((entry) => entry.protocol))).sort(),
    [allEntries],
  );

  const tags = useMemo(
    () => Array.from(new Set(allEntries.flatMap((entry) => entry.tags))).sort(),
    [allEntries],
  );

  const entries = useMemo(() => {
    const q = query.trim().toLowerCase();

    return allEntries.filter((entry) => {
      const matchesKind = kindFilter === "all" || entry.kind.toLowerCase() === kindFilter;
      const matchesProtocol = protocolFilter === "all" || entry.protocol === protocolFilter;
      const matchesTag = tagFilter === "all" || entry.tags.includes(tagFilter);
      const searchText = [
        entry.title,
        entry.protocol,
        entry.kind,
        entry.stage,
        entry.access,
        entry.summary,
        entry.owner,
        entry.language,
        ...entry.tags,
        ...entry.highlights,
        ...entry.links.flatMap((link) => [link.label, link.href]),
      ].join(" ").toLowerCase();
      const matchesQuery = !q || searchText.includes(q);
      return matchesKind && matchesProtocol && matchesTag && matchesQuery;
    });
  }, [allEntries, kindFilter, protocolFilter, query, tagFilter]);

  const activeCount = allEntries.filter((entry) => entry.stage === "Active").length;
  const sourceCount = allEntries.filter((entry) => entry.access === "Open source").length;

  return (
    <section className="sand-section">
      <div className="nw-page ts-page">
        <header className="nw-head ts-head">
          <span className="num">.05</span>
          <h1>Community Share</h1>
          <span className="id">
            <span className="live-dot" /> <b>{allEntries.length}</b> entries
          </span>
        </header>

        <p className="nw-tagline ts-tagline">
          BAS projects, references, files, repos, and field notes. <em>Open source when possible</em>, useful first.
        </p>

        <div className="ts-shell">
          <aside className="ts-rail" aria-label="Community share controls">
            <div className="ts-rail-panel">
              <div className="ts-rail-hd">
                <span>Index</span>
                <b>{entries.length}</b>
              </div>

              <label className="ts-search">
                <MagnifyingGlass aria-hidden="true" />
                <span className="sr-only">Search entries</span>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search entries..."
                />
              </label>

              <div className="ts-filter-group">
                <span className="ts-filter-label">Kind</span>
                <div className="ts-filter-buttons">
                  {KIND_FILTERS.map((filter) => (
                    <button
                      key={filter.value}
                      type="button"
                      className="nw-pill"
                      aria-pressed={kindFilter === filter.value}
                      onClick={() => setKindFilter(filter.value)}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="ts-filter-group">
                <span className="ts-filter-label">Topic</span>
                <div className="ts-filter-buttons">
                  <button
                    type="button"
                    className="nw-pill"
                    aria-pressed={protocolFilter === "all"}
                    onClick={() => setProtocolFilter("all")}
                  >
                    All
                  </button>
                  {protocols.map((protocol) => (
                    <button
                      key={protocol}
                      type="button"
                      className="nw-pill"
                      aria-pressed={protocolFilter === protocol}
                      onClick={() => setProtocolFilter(protocol)}
                    >
                      {protocol}
                    </button>
                  ))}
                </div>
              </div>

              <div className="ts-filter-group">
                <span className="ts-filter-label">Tags</span>
                <div className="ts-filter-buttons is-scrollable">
                  <button
                    type="button"
                    className="nw-pill"
                    aria-pressed={tagFilter === "all"}
                    onClick={() => setTagFilter("all")}
                  >
                    All
                  </button>
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className="nw-pill"
                      aria-pressed={tagFilter === tag}
                      onClick={() => setTagFilter(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="ts-stats" aria-label="Directory stats">
                <span>
                  <b>{activeCount}</b>
                  Active
                </span>
                <span>
                  <b>{sourceCount}</b>
                  Open
                </span>
              </div>

              <div className="ts-submit">
                <span className="ts-filter-label">Community queue</span>
                <p>Post a title, description, images, and a file or project link. Images can be added now or later.</p>
                {user ? (
                  <CreateResourceDialog
                    suggestedTags={tags}
                    onCreated={(resource) => {
                      setSharedResources((current) => [resource, ...current]);
                    }}
                    trigger={
                      <button type="button" className="ts-submit-action">
                        <Plus aria-hidden="true" />
                        Share an entry
                      </button>
                    }
                  />
                ) : (
                  <Link href={ROUTES.SIGNIN} className="ts-submit-action">
                    <Plus aria-hidden="true" />
                    Sign in to share
                  </Link>
                )}
              </div>
            </div>
          </aside>

          <div className="ts-results">
            {entries.length > 0 ? (
              entries.map((entry, index) => (
                <CommunityShareCard key={entry.id} entry={entry} index={index} />
              ))
            ) : (
              <div className="ts-empty">
                <Stack aria-hidden="true" />
                <h2>No entries match that filter.</h2>
                <p>Clear a filter or share the thing you expected to find.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function CommunityShareCard({ entry, index }: { entry: CommunityShareEntry; index: number }) {
  const primaryLink = entry.links[0];
  const primaryImage = entry.images?.[0];

  return (
    <article className={primaryImage ? "ts-card has-shot" : "ts-card"} id={entry.id}>
      {primaryImage && (
        <div className="ts-shot" aria-label={`${entry.title} image`}>
          <img
            src={primaryImage.src}
            alt={primaryImage.alt}
            loading="lazy"
          />
        </div>
      )}

      <div className="ts-card-main">
        <div className="ts-card-kicker">
          <span className="ts-num">.{String(index + 1).padStart(2, "0")}</span>
          <span>{entry.kind}</span>
          <span>{entry.protocol}</span>
          <span>{entry.access}</span>
          <span className={entry.stage === "Active" ? "is-live" : ""}>{entry.stage}</span>
        </div>

        <div className="ts-card-title">
          <h2>{entry.title}</h2>
          {primaryLink && (
            <a href={primaryLink.href} target="_blank" rel="noreferrer" aria-label={`Open ${entry.title}`}>
              <ShareLinkIcon link={primaryLink} />
            </a>
          )}
        </div>

        <p className="ts-summary">{entry.summary}</p>

        {entry.tags.length > 0 && (
          <div className="ts-tags" aria-label={`${entry.title} tags`}>
            {entry.tags.map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        )}

        <div className="ts-meta tabular-nums">
          <MetaCell k="Owner" v={entry.owner} />
          <MetaCell k="Lang" v={entry.language} />
          <MetaCell k="License" v={entry.license} />
          <MetaCell k="Latest" v={entry.latest} />
          <MetaCell k="Stars" v={String(entry.stars)} />
          <MetaCell k="Commit" v={entry.lastCommit} />
        </div>

        <div className="ts-actions">
          {entry.links.map((link) => (
            <a key={`${entry.id}-${link.href}`} href={link.href} target="_blank" rel="noreferrer">
              <ShareLinkIcon link={link} />
              {link.label}
            </a>
          ))}
        </div>

        <details className="ts-detail">
          <summary>Description and notes</summary>
          <p className="ts-desc">{entry.description}</p>
          <ul>
            {entry.highlights.map((highlight, highlightIndex) => (
              <li key={highlightIndex}>{highlight}</li>
            ))}
          </ul>
          {entry.snippets?.map((snippet) => (
            <div key={snippet.label} className="ts-code">
              <span>{snippet.label}</span>
              <pre>{snippet.body}</pre>
            </div>
          ))}
        </details>
      </div>
    </article>
  );
}

function ShareLinkIcon({ link }: { link: CommunityShareLink }) {
  const linkType = getShareLinkType(link);

  if (linkType === "github") return <GithubLogo weight="fill" />;
  if (linkType === "file") return <FileArrowDown />;
  if (linkType === "site") return <Globe />;
  return <LinkSimple />;
}

function MetaCell({ k, v }: { k: string; v: string }) {
  return (
    <span className="ts-meta-cell">
      <span className="k">{k}</span>
      <span className="v">{v}</span>
    </span>
  );
}
