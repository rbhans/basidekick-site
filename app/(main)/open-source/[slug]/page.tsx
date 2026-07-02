import { PointStackResourceDetail } from "@/components/pointstack/resources/resource-detail";
import { escapeJsonLd } from "@/lib/security";
import type { PointStackResourceListing } from "@/lib/types";
import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface CommunityShareEntryPageProps {
  params: Promise<{ slug: string }>;
}

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return null;

  return createClient(supabaseUrl, supabaseAnonKey);
}

function hasSupabaseConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

async function getCommunityShareEntry(slug: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("pointstack_resource_listings")
    .select(`
      *,
      author:profiles!author_id(display_name, avatar_url)
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!data) return null;

  const resource = data as Partial<PointStackResourceListing> & {
    author?: PointStackResourceListing["author"] | PointStackResourceListing["author"][] | null;
  };
  const author = Array.isArray(resource.author)
    ? resource.author[0] || undefined
    : resource.author || undefined;

  return {
    ...(resource as PointStackResourceListing),
    title: typeof resource.title === "string" ? resource.title : "Community entry",
    slug: typeof resource.slug === "string" ? resource.slug : slug,
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
}

export async function generateMetadata({
  params,
}: CommunityShareEntryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getCommunityShareEntry(slug);
  const title = entry?.title
    ? `${entry.title} — Community Share`
    : "Community Share Entry";
  const description =
    entry?.description?.slice(0, 160) || "View a shared BAS community entry.";
  const canonical = `https://basidekick.com/open-source/${encodeURIComponent(slug)}`;
  const firstImage = entry?.preview_images?.[0];

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      images: firstImage ? [firstImage] : undefined,
    },
    twitter: {
      card: firstImage ? "summary_large_image" : "summary",
      title,
      description,
      images: firstImage ? [firstImage] : undefined,
    },
  };
}

function generateCommunityShareJsonLd(resource: PointStackResourceListing) {
  const canonical = `https://basidekick.com/open-source/${encodeURIComponent(resource.slug)}`;
  const citedUrl = resource.external_link || resource.file_url;

  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${canonical}#entry`,
    name: resource.title,
    description:
      resource.description || "Shared BAS community resource on BASidekick.",
    url: canonical,
    mainEntityOfPage: canonical,
    datePublished: resource.created_at,
    dateModified: resource.updated_at || resource.created_at,
    author: {
      "@type": "Person",
      name: resource.author?.display_name || "BASidekick community",
    },
    publisher: {
      "@id": "https://basidekick.com/#organization",
    },
    isAccessibleForFree: resource.is_free,
    keywords: resource.tags,
    image: resource.preview_images,
    citation: citedUrl,
    isBasedOn: citedUrl
      ? {
          "@type": "CreativeWork",
          url: citedUrl,
        }
      : undefined,
  };
}

export default async function CommunityShareEntryPage({
  params,
}: CommunityShareEntryPageProps) {
  const { slug } = await params;
  const entry = await getCommunityShareEntry(slug);

  if (!entry && hasSupabaseConfig()) {
    notFound();
  }

  return (
    <>
      {entry && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: escapeJsonLd(generateCommunityShareJsonLd(entry)),
          }}
        />
      )}
      <PointStackResourceDetail slug={slug} initialResource={entry} />
    </>
  );
}
