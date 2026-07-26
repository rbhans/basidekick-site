import type { SupabaseClient } from "@/lib/supabase/client";
import { createServerReadClient } from "@/lib/supabase/server";
import {
  curatedCommunityShareEntries,
  type CommunityShareEntry,
  type CommunityShareLink,
} from "@/lib/data/community-share";

// Read-only merge of curated Community Share entries with live
// `pointstack_resource_listings` rows (is_active = true), converted into the
// same CommunityShareEntry shape so the list/detail UI has one type to render.
// Ported from basidekick-site/components/views/open-source-view.tsx
// (resourceToCommunityShareEntry / mergeCommunityShareEntries).
//
// Live rows use their real `slug` as CommunityShareEntry.id; curated entries'
// `id` is already slug-shaped (e.g. "bask-stream"). Either way `id` doubles as
// the /share/[slug] route param.

type PointStackResourceCategory = "template" | "script" | "document" | "guide" | "tool" | "other";

const RESOURCE_CATEGORY_LABELS: Record<PointStackResourceCategory, string> = {
  template: "Template",
  script: "Script",
  document: "Document",
  guide: "Guide",
  tool: "Project",
  other: "Other",
};

interface RawResourceListing {
  id?: string;
  slug?: string;
  title?: string;
  description?: string | null;
  tags?: unknown;
  file_url?: string | null;
  external_link?: string | null;
  is_free?: boolean;
  download_count?: number;
  upvote_count?: number;
  comment_count?: number;
  category?: PointStackResourceCategory;
  created_at?: string;
  author?: { display_name: string | null } | { display_name: string | null }[] | null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function formatShareDate(value: string | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function resourceToEntry(resource: RawResourceListing): CommunityShareEntry | null {
  const slug = typeof resource.slug === "string" ? resource.slug : "";
  if (!slug) return null;

  const title = typeof resource.title === "string" ? resource.title : "Community entry";
  const description = typeof resource.description === "string" ? resource.description : null;
  const author = Array.isArray(resource.author) ? resource.author[0] || null : resource.author || null;
  const category = resource.category && RESOURCE_CATEGORY_LABELS[resource.category]
    ? resource.category
    : "other";
  const topic = RESOURCE_CATEGORY_LABELS[category];
  const fileUrl = typeof resource.file_url === "string" ? resource.file_url : null;
  const externalLink = typeof resource.external_link === "string" ? resource.external_link : null;
  const isFree = typeof resource.is_free === "boolean" ? resource.is_free : true;
  const downloadCount = asNumber(resource.download_count);
  const upvoteCount = asNumber(resource.upvote_count);
  const commentCount = asNumber(resource.comment_count);
  const ownerName = author?.display_name || "Community";

  const links: CommunityShareLink[] = [];
  if (fileUrl) {
    links.push({ label: "File", href: fileUrl, type: "file" });
  }
  if (externalLink) {
    const isGithub = externalLink.toLowerCase().includes("github.com");
    links.push({
      label: isGithub ? "GitHub" : "Reference",
      href: externalLink,
      type: isGithub ? "github" : "site",
    });
  }

  return {
    id: slug,
    resourceId: typeof resource.id === "string" ? resource.id : undefined,
    title,
    protocol: topic,
    kind: fileUrl ? "File" : "Project",
    stage: "Active",
    access: isFree ? (fileUrl ? "File" : "Project site") : "Paid externally",
    summary: description || "Community-submitted BAS entry.",
    description:
      description || "Community-submitted entry. Add a description when more detail is available.",
    owner: ownerName,
    language: "-",
    license: isFree ? "Free" : "Paid externally",
    latest: "Shared",
    lastCommit: formatShareDate(resource.created_at),
    stars: upvoteCount,
    tags: asStringArray(resource.tags),
    highlights: [
      `${topic} shared by ${ownerName === "Community" ? "a community member" : ownerName}.`,
      fileUrl ? "Includes a file link." : "Includes a project or reference link.",
      `${commentCount} comments and ${downloadCount} opens.`,
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

function mergeWithCurated(liveEntries: CommunityShareEntry[]): CommunityShareEntry[] {
  const liveKeys = new Set(liveEntries.flatMap(getEntryDedupeKeys));
  const curated = curatedCommunityShareEntries.filter((entry) =>
    getEntryDedupeKeys(entry).every((key) => !liveKeys.has(key)),
  );
  return [...liveEntries, ...curated];
}

async function fetchLiveEntries(client: SupabaseClient): Promise<CommunityShareEntry[]> {
  const { data, error } = await client
    .from("pointstack_resource_listings")
    .select(`*, author:profiles!author_id(display_name)`)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;

  return ((data || []) as RawResourceListing[])
    .map(resourceToEntry)
    .filter((entry): entry is CommunityShareEntry => entry !== null)
    // Hide the "[Example] …" demo rows seeded with the Supabase schema — they
    // aren't real community content. (Same guard applied to PointStack posts.)
    .filter((entry) => !entry.title.startsWith("[Example]"));
}

/**
 * Curated entries always render. Live Supabase entries are appended (and take
 * dedupe priority) when a client is configured and the query succeeds;
 * otherwise this falls back to curated-only.
 */
export async function getCommunityShareEntries(): Promise<CommunityShareEntry[]> {
  const client = await createServerReadClient();
  if (!client) return curatedCommunityShareEntries;

  try {
    const liveEntries = await fetchLiveEntries(client);
    return mergeWithCurated(liveEntries);
  } catch {
    return curatedCommunityShareEntries;
  }
}

export async function getCommunityShareEntry(slug: string): Promise<CommunityShareEntry | null> {
  const entries = await getCommunityShareEntries();
  return entries.find((entry) => entry.id === slug) ?? null;
}
