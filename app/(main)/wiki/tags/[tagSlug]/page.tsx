import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { WikiTagView } from "@/components/wiki/wiki-tag-view";
import { WikiArticle } from "@/lib/types";

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

interface WikiTagPageProps {
  params: Promise<{ tagSlug: string }>;
}

export async function generateMetadata({ params }: WikiTagPageProps): Promise<Metadata> {
  const { tagSlug } = await params;
  const supabase = getSupabaseClient();

  if (!supabase) {
    return {
      title: "Tag Not Found | basidekick Wiki",
    };
  }

  const { data: tag } = await supabase
    .from("wiki_tags")
    .select("name")
    .eq("slug", tagSlug)
    .single();

  if (!tag) {
    return {
      title: "Tag Not Found | basidekick Wiki",
    };
  }

  const description = `Browse all BAS knowledge articles tagged with ${tag.name}`;

  return {
    title: `${tag.name} Articles | basidekick Wiki`,
    description,
    openGraph: {
      title: `${tag.name} - basidekick Wiki`,
      description,
      type: "website",
      siteName: "basidekick",
      url: `https://basidekick.com/wiki/tags/${tagSlug}`,
    },
    alternates: {
      canonical: `https://basidekick.com/wiki/tags/${tagSlug}`,
    },
  };
}

export default async function WikiTagPage({ params }: WikiTagPageProps) {
  const { tagSlug } = await params;
  const supabase = getSupabaseClient();

  if (!supabase) {
    notFound();
  }

  const { data: tag } = await supabase
    .from("wiki_tags")
    .select("*")
    .eq("slug", tagSlug)
    .single();

  if (!tag) {
    notFound();
  }

  // Fetch articles with this tag
  const { data: articleTagsData } = await supabase
    .from("wiki_article_tags")
    .select("article_id")
    .eq("tag_id", tag.id);

  const articleIds = articleTagsData?.map((at: { article_id: string }) => at.article_id) || [];

  let articles: WikiArticle[] = [];
  if (articleIds.length > 0) {
    const { data } = await supabase
      .from("wiki_articles")
      .select(`
        *,
        author:profiles!wiki_articles_author_id_fkey(display_name),
        category:wiki_categories!wiki_articles_category_id_fkey(name, slug)
      `)
      .in("id", articleIds)
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    articles = (data || []) as WikiArticle[];
  }

  return <WikiTagView tag={tag} articles={articles} />;
}
