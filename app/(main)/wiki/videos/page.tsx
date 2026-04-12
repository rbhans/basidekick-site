import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { WikiFacetLanding } from "@/components/wiki/wiki-facet-landing";
import { WikiArticle, WikiFacet } from "@/lib/types";

export const revalidate = 86400;

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return null;
  return createClient(supabaseUrl, supabaseAnonKey);
}

export const metadata: Metadata = {
  title: "BAS Video Library | BASidekick Wiki",
  description:
    "Curated video tutorials and walkthroughs for building automation — BACnet, Niagara, DDC controls, HVAC commissioning, and more.",
  openGraph: {
    title: "BAS Video Library - BASidekick Wiki",
    description:
      "Curated video tutorials for building automation professionals.",
    type: "website",
    siteName: "BASidekick",
    url: "https://basidekick.com/wiki/videos",
  },
  alternates: { canonical: "https://basidekick.com/wiki/videos" },
};

export default async function WikiVideosPage() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return (
      <WikiFacetLanding
        facet={{ id: "", name: "Video", slug: "video", description: "Video tutorials and walkthroughs", group_id: "", display_order: 6, article_count: 0 } as WikiFacet}
        groupName="Content Format"
        articles={[]}
      />
    );
  }

  const { data: facetRow } = await supabase
    .from("wiki_facets")
    .select("*")
    .eq("slug", "video")
    .limit(1)
    .single();

  const facet = facetRow as WikiFacet | null;

  let articles: WikiArticle[] = [];

  if (facet) {
    const { data: links } = await supabase
      .from("wiki_article_facets")
      .select("article_id")
      .eq("facet_id", facet.id);

    const ids = links?.map((l: { article_id: string }) => l.article_id) || [];

    if (ids.length > 0) {
      const { data } = await supabase
        .from("wiki_articles")
        .select(`
          *,
          author:profiles!wiki_articles_author_id_fkey(display_name),
          category:wiki_categories!wiki_articles_category_id_fkey(name, slug)
        `)
        .in("id", ids)
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      articles = (data || []) as WikiArticle[];
    }
  }

  return (
    <WikiFacetLanding
      facet={(facet || { id: "", name: "Video", slug: "video", description: "Video tutorials and walkthroughs", group_id: "", display_order: 6, article_count: 0 }) as WikiFacet}
      groupName="Content Format"
      articles={articles}
    />
  );
}
