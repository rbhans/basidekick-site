import { OpenSourceView } from "@/components/views/open-source-view";
import { curatedCommunityShareEntries, type CommunityShareEntry } from "@/lib/data/community-share";
import { escapeJsonLd } from "@/lib/security";
import type { PointStackResourceListing } from "@/lib/types";
import { createClient } from "@supabase/supabase-js";

export const metadata = {
  title: "Community Share: BAS Files, Modules & Repos | BASidekick",
  description:
    "Find BAS community files, open-source Niagara modules like BASk Stream, Rust BACnet and Modbus crates, project repos, and field references.",
  alternates: { canonical: "https://basidekick.com/open-source" },
};

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return null;

  return createClient(supabaseUrl, supabaseAnonKey);
}

async function getCommunityShareEntries() {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("pointstack_resource_listings")
    .select(`
      *,
      author:profiles!author_id(display_name, avatar_url)
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(50);

  return ((data || []) as Array<Partial<PointStackResourceListing> & {
    author?: PointStackResourceListing["author"] | PointStackResourceListing["author"][] | null;
  }>).map((resource) => {
    const author = Array.isArray(resource.author)
      ? resource.author[0] || undefined
      : resource.author || undefined;

    return {
      ...(resource as PointStackResourceListing),
      title: typeof resource.title === "string" ? resource.title : "Community entry",
      slug: typeof resource.slug === "string" ? resource.slug : "",
      description:
        typeof resource.description === "string" ? resource.description : null,
      tags: Array.isArray(resource.tags)
        ? resource.tags.filter((tag): tag is string => typeof tag === "string")
        : [],
      preview_images: Array.isArray(resource.preview_images)
        ? resource.preview_images.filter((image): image is string => typeof image === "string")
        : [],
      file_url: typeof resource.file_url === "string" ? resource.file_url : null,
      external_link:
        typeof resource.external_link === "string" ? resource.external_link : null,
      is_free:
        typeof resource.is_free === "boolean" ? resource.is_free : true,
      download_count:
        typeof resource.download_count === "number" ? resource.download_count : 0,
      upvote_count:
        typeof resource.upvote_count === "number" ? resource.upvote_count : 0,
      comment_count:
        typeof resource.comment_count === "number" ? resource.comment_count : 0,
      author,
      user_vote: null,
    } satisfies PointStackResourceListing;
  });
}

interface CommunityShareListItem {
  name: string;
  description: string | null;
  url: string;
  sourceUrl?: string;
  tags: string[];
  kind: string;
}

function resourceToListItem(entry: PointStackResourceListing): CommunityShareListItem {
  return {
    name: entry.title,
    description: entry.description,
    url: `https://basidekick.com/open-source/${encodeURIComponent(entry.slug)}`,
    sourceUrl: entry.external_link || entry.file_url || undefined,
    tags: entry.tags || [],
    kind: entry.file_url ? "File" : "Project",
  };
}

function curatedToListItem(entry: CommunityShareEntry): CommunityShareListItem {
  return {
    name: entry.title,
    description: entry.summary,
    url: `https://basidekick.com/open-source#${encodeURIComponent(entry.id)}`,
    sourceUrl: entry.links[0]?.href,
    tags: entry.tags,
    kind: entry.kind,
  };
}

function getListItemDedupeKeys(entry: CommunityShareListItem): string[] {
  return [
    `name:${entry.name.toLowerCase()}`,
    ...(entry.sourceUrl ? [`source:${entry.sourceUrl.toLowerCase()}`] : []),
  ];
}

function mergeCommunityShareListItems(resources: PointStackResourceListing[]) {
  const resourceItems = resources.map(resourceToListItem);
  const resourceKeys = new Set(resourceItems.flatMap(getListItemDedupeKeys));
  const curatedItems = curatedCommunityShareEntries
    .map(curatedToListItem)
    .filter((entry) => getListItemDedupeKeys(entry).every((key) => !resourceKeys.has(key)));

  return [...resourceItems, ...curatedItems];
}

function generateCommunityShareJsonLd(entries: CommunityShareListItem[]) {
  const itemListId = "https://basidekick.com/open-source#itemlist";

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": "https://basidekick.com/open-source#webpage",
        url: "https://basidekick.com/open-source",
        name: "BASidekick Community Share",
        description: metadata.description,
        isPartOf: {
          "@id": "https://basidekick.com/#website",
        },
        about: [
          "building automation resources",
          "BAS files",
          "open-source Niagara modules",
          "BASk Stream",
          "BACnet protocol crates",
          "Modbus protocol crates",
        ],
        mainEntity: {
          "@id": itemListId,
        },
      },
      {
        "@type": "ItemList",
        "@id": itemListId,
        name: "BAS files, modules, repositories, and references",
        numberOfItems: entries.length,
        itemListElement: entries.map((entry, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": entry.kind === "Module" || entry.kind === "Protocol"
              ? "SoftwareSourceCode"
              : "CreativeWork",
            name: entry.name,
            description: entry.description || undefined,
            url: entry.url,
            sameAs: entry.sourceUrl,
            keywords: entry.tags,
          },
        })),
      },
    ],
  };
}

export default async function OpenSourcePage() {
  const entries = await getCommunityShareEntries();
  const listItems = mergeCommunityShareListItems(entries);

  return (
    <>
      {listItems.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: escapeJsonLd(generateCommunityShareJsonLd(listItems)),
          }}
        />
      )}
      <OpenSourceView initialResources={entries} />
    </>
  );
}
