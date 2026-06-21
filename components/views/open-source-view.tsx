"use client";

/* eslint-disable @next/next/no-img-element -- Shared entry images can come from arbitrary community-hosted URLs. */
import { useEffect, useMemo, useState } from "react";
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
import {
  curatedCommunityShareEntries,
  type CommunityShareEntry,
  type CommunityShareKind,
  type CommunityShareLink,
  type CommunityShareLinkType,
} from "@/lib/data/community-share";
import type { PointStackResourceCategory, PointStackResourceListing } from "@/lib/types";
import { ROUTES } from "@/lib/routes";
import * as pointStackApi from "@/components/pointstack/pointstack-api";

type KindFilter = "all" | Lowercase<CommunityShareKind>;

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

function getShareLinkType(link: CommunityShareLink): CommunityShareLinkType {
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
    href: ROUTES.COMMUNITY_SHARE_ENTRY(resource.slug),
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

function getEntryDedupeKeys(entry: CommunityShareEntry): string[] {
  return [
    `title:${entry.title.toLowerCase()}`,
    ...entry.links.map((link) => `link:${link.href.toLowerCase()}`),
  ];
}

function mergeCommunityShareEntries(resourceEntries: CommunityShareEntry[]) {
  const resourceKeys = new Set(resourceEntries.flatMap(getEntryDedupeKeys));
  const curatedEntries = curatedCommunityShareEntries.filter((entry) =>
    getEntryDedupeKeys(entry).every((key) => !resourceKeys.has(key)),
  );

  return [...resourceEntries, ...curatedEntries];
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

interface OpenSourceViewProps {
  initialResources?: PointStackResourceListing[];
}

export function OpenSourceView({ initialResources = [] }: OpenSourceViewProps) {
  const { user } = useAuth();
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");
  const [protocolFilter, setProtocolFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [sharedResources, setSharedResources] = useState<PointStackResourceListing[]>(initialResources);

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

  const allEntries = useMemo(() => {
    const resourceEntries = sharedResources.map(resourceToCommunityShareEntry);
    return mergeCommunityShareEntries(resourceEntries);
  }, [sharedResources]);

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
  const fileCount = allEntries.filter((entry) => entry.kind === "File").length;

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

        <section
          aria-labelledby="community-share-answer"
          className="mb-6 border-y border-foreground py-4"
        >
          <div className="grid gap-4 md:grid-cols-[1.2fr_1fr_1fr]">
            <div>
              <h2
                id="community-share-answer"
                className="font-mono text-[10px] uppercase tracking-[1.4px] text-accent"
              >
                What this index answers
              </h2>
              <p className="mt-2 text-[14px] leading-[1.55] text-foreground">
                Community Share is the BASidekick directory for BAS files, open-source
                Niagara modules, protocol crates, project repos, and field references.
              </p>
            </div>
            <p className="text-[13px] leading-[1.5] text-muted-foreground">
              For Niagara integration work, start with BASk Stream for authenticated
              station data over WebSocket and QRBAS for local QR equipment pages.
            </p>
            <p className="text-[13px] leading-[1.5] text-muted-foreground">
              For protocol code, start with the Rust BACnet and Modbus workspaces,
              then use community-submitted files and references as they are added.
            </p>
          </div>
        </section>

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
                  <b>{fileCount}</b>
                  Files
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
                <h2>{allEntries.length === 0 ? "No entries shared yet." : "No entries match that filter."}</h2>
                <p>
                  {allEntries.length === 0
                    ? "Be the first to share a file, project, reference, or field note."
                    : "Clear a filter or share the thing you expected to find."}
                </p>
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
