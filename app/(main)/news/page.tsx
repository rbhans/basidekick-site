import { NewsList } from "@/components/news/news-list";
import { escapeJsonLd } from "@/lib/security";
import type { NewsArticle } from "@/lib/types";
import { createClient } from "@supabase/supabase-js";

const canonicalUrl = "https://basidekick.com/news";

export const metadata = {
  title: "News",
  description: "The latest building automation news, curated by AI and the community.",
  alternates: { canonical: canonicalUrl },
};

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return null;

  return createClient(supabaseUrl, supabaseAnonKey);
}

async function getNewsArticles() {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("news_articles")
    .select(`
      *,
      submitter:profiles!submitted_by(display_name, avatar_url)
    `)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(30);

  return ((data || []) as Array<Partial<NewsArticle> & {
    submitter?: NewsArticle["submitter"] | NewsArticle["submitter"][] | null;
  }>).map((article) => {
    const submitter = Array.isArray(article.submitter)
      ? article.submitter[0] || null
      : article.submitter || null;

    return {
      ...(article as NewsArticle),
      title: typeof article.title === "string" ? article.title : "Untitled",
      url: typeof article.url === "string" ? article.url : "",
      slug: typeof article.slug === "string" ? article.slug : "",
      source_domain:
        typeof article.source_domain === "string" ? article.source_domain : "",
      summary: typeof article.summary === "string" ? article.summary : null,
      tags: Array.isArray(article.tags)
        ? article.tags.filter((tag): tag is string => typeof tag === "string")
        : [],
      upvote_count:
        typeof article.upvote_count === "number" ? article.upvote_count : 0,
      comment_count:
        typeof article.comment_count === "number" ? article.comment_count : 0,
      view_count: typeof article.view_count === "number" ? article.view_count : 0,
      submitter,
      user_vote: null,
    } satisfies NewsArticle;
  });
}

function generateNewsJsonLd(articles: NewsArticle[]) {
  const itemListId = `${canonicalUrl}#itemlist`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: "BASidekick News",
        description: metadata.description,
        isPartOf: {
          "@id": "https://basidekick.com/#website",
        },
        about: [
          "building automation news",
          "BAS industry news",
          "Niagara news",
          "HVAC controls news",
          "cybersecurity advisories",
          "facility operations",
        ],
        mainEntity: {
          "@id": itemListId,
        },
      },
      {
        "@type": "ItemList",
        "@id": itemListId,
        name: "Latest BASidekick news articles",
        numberOfItems: articles.length,
        itemListElement: articles.map((article, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Article",
            headline: article.title,
            description: article.summary || undefined,
            url: `${canonicalUrl}/${encodeURIComponent(article.slug)}`,
            citation: article.url,
            isBasedOn: article.url
              ? {
                  "@type": "CreativeWork",
                  url: article.url,
                  publisher: article.source_domain
                    ? {
                        "@type": "Organization",
                        name: article.source_domain,
                      }
                    : undefined,
                }
              : undefined,
            keywords: article.tags,
          },
        })),
      },
    ],
  };
}

export default async function NewsPage() {
  const articles = await getNewsArticles();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: escapeJsonLd(generateNewsJsonLd(articles)),
        }}
      />
      <NewsList initialArticles={articles} />
    </>
  );
}
