import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { WikiArticle, WikiCollection } from "@/lib/types";
import { WikiCollectionView } from "@/components/wiki/wiki-collection-view";

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return null;
  return createClient(supabaseUrl, supabaseAnonKey);
}

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = getSupabaseClient();
  if (!supabase) return { title: "Collection Not Found — BASidekick Wiki" };

  const { data: collection } = await supabase
    .from("wiki_collections")
    .select("name, description")
    .eq("slug", slug)
    .single();

  if (!collection) return { title: "Collection Not Found — BASidekick Wiki" };

  const description = collection.description || `Browse the ${collection.name} article collection`;

  return {
    title: `${collection.name} — BASidekick Wiki`,
    description,
    openGraph: {
      title: `${collection.name} — BASidekick Wiki`,
      description,
      type: "website",
      siteName: "BASidekick",
      url: `https://basidekick.com/wiki/collections/${slug}`,
    },
    alternates: {
      canonical: `https://basidekick.com/wiki/collections/${slug}`,
    },
  };
}

export default async function WikiCollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const supabase = getSupabaseClient();
  if (!supabase) notFound();

  const { data: collection } = await supabase
    .from("wiki_collections")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!collection) notFound();

  // Fetch articles in this collection, ordered by display_order
  const { data: collectionArticles } = await supabase
    .from("wiki_collection_articles")
    .select("article_id, display_order")
    .eq("collection_id", collection.id)
    .order("display_order");

  const articleIds = collectionArticles?.map((ca: { article_id: string }) => ca.article_id) || [];

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
      .eq("is_published", true);

    if (data) {
      const orderMap = new Map(collectionArticles!.map((ca: { article_id: string; display_order: number }) => [ca.article_id, ca.display_order]));
      articles = (data as WikiArticle[]).sort(
        (a, b) => (orderMap.get(a.id) || 0) - (orderMap.get(b.id) || 0)
      );
    }
  }

  return <WikiCollectionView collection={collection as WikiCollection} articles={articles} />;
}
