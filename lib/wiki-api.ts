import type { SupabaseClient } from "@/lib/supabase/client";
import { WikiArticle, WikiArticleListItem, WikiCategory, WikiCollection, WikiFacet, WikiFacetGroup } from "@/lib/types";
import { sanitizeSearchInput } from "@/lib/security";
import { WikiFilterState } from "@/lib/wiki-filters";

// ============================================================
// Ported from basidekick-site/components/views/wiki-view.tsx (list + facet
// composition), basidekick-site/app/(main)/wiki/[slug]/page.tsx (article
// detail), basidekick-site/app/(main)/wiki/platform|topic|protocol/[slug]/page.tsx
// (facet landing), and basidekick-site/app/(main)/wiki/collections/[slug]/page.tsx
// (collection view).
// ============================================================

const ARTICLES_PER_PAGE = 20;

const ARTICLE_SELECT = `
  *,
  author:profiles!wiki_articles_author_id_fkey(display_name),
  category:wiki_categories!wiki_articles_category_id_fkey(name, slug)
`;

const ARTICLE_LIST_SELECT = `
  id,
  category_id,
  title,
  slug,
  summary,
  view_count,
  created_at,
  updated_at,
  category:wiki_categories!wiki_articles_category_id_fkey(name, slug)
`;

function getSortConfig(sort: WikiFilterState["sort"]): { column: string; ascending: boolean } {
  switch (sort) {
    case "oldest":
      return { column: "created_at", ascending: true };
    case "popular":
      return { column: "view_count", ascending: false };
    case "alphabetical":
      return { column: "title", ascending: true };
    case "newest":
    default:
      return { column: "created_at", ascending: false };
  }
}

// ============================================================
// CATEGORIES / FACET GROUPS / COLLECTIONS (read-only)
// ============================================================

export async function fetchCategories(client: SupabaseClient | null): Promise<WikiCategory[]> {
  if (!client) return [];

  const { data, error } = await client
    .from("wiki_categories")
    .select("*")
    .order("display_order");

  if (error) throw error;
  return (data as WikiCategory[]) || [];
}

export async function fetchFacetGroups(client: SupabaseClient | null): Promise<WikiFacetGroup[]> {
  if (!client) return [];

  const { data, error } = await client
    .from("wiki_facet_groups")
    .select("*, facets:wiki_facets(*)")
    .order("display_order");

  if (error) throw error;

  return ((data as WikiFacetGroup[]) || []).map((g) => ({
    ...g,
    facets: (g.facets || []).sort((a, b) => a.display_order - b.display_order),
  }));
}

export async function fetchFeaturedCollections(client: SupabaseClient | null): Promise<WikiCollection[]> {
  if (!client) return [];

  const { data, error } = await client
    .from("wiki_collections")
    .select("*, article_count:wiki_collection_articles(count)")
    .eq("is_featured", true)
    .order("display_order");

  if (error) throw error;

  return ((data as (WikiCollection & { article_count: { count: number }[] })[]) || []).map((c) => ({
    ...c,
    article_count: c.article_count?.[0]?.count ?? 0,
  }));
}

// ============================================================
// ARTICLES LIST (read-only)
// ============================================================

export async function fetchWikiArticles(
  client: SupabaseClient | null,
  filters: WikiFilterState,
  page: number,
  pageSize = ARTICLES_PER_PAGE
): Promise<{ articles: WikiArticleListItem[]; count: number }> {
  if (!client) return { articles: [], count: 0 };

  const { column, ascending } = getSortConfig(filters.sort);
  const offset = (page - 1) * pageSize;

  let query = client
    .from("wiki_articles")
    .select(ARTICLE_LIST_SELECT, { count: "exact" })
    .eq("is_published", true);

  // Filter by category slug -> id lookup
  if (filters.category) {
    const { data: categoryData } = await client
      .from("wiki_categories")
      .select("id")
      .eq("slug", filters.category)
      .single();

    if (categoryData) {
      query = query.eq("category_id", (categoryData as { id: string }).id);
    }
  }

  // Collect facet slugs for filtering (AND semantics: article must match every selected facet)
  const allFacetSlugs: string[] = [
    ...filters.platform,
    ...filters.protocol,
    ...filters.domain,
    ...filters.topic,
    ...filters.format,
  ];

  if (allFacetSlugs.length > 0) {
    // Resolve slugs -> IDs
    const { data: facetData } = await client
      .from("wiki_facets")
      .select("id, slug")
      .in("slug", allFacetSlugs);

    if (facetData && facetData.length > 0) {
      const facetIds = (facetData as { id: string; slug: string }[]).map((f) => f.id);

      // For AND semantics: fetch all article_id/facet_id pairs, then keep
      // only articles that appear for every selected facet.
      const { data: articleFacetsData } = await client
        .from("wiki_article_facets")
        .select("article_id, facet_id")
        .in("facet_id", facetIds);

      if (articleFacetsData && articleFacetsData.length > 0) {
        // Count how many of the selected facets each article matches
        const countByArticle: Record<string, number> = {};
        for (const { article_id } of articleFacetsData as { article_id: string; facet_id: string }[]) {
          countByArticle[article_id] = (countByArticle[article_id] || 0) + 1;
        }
        // Only keep articles matching ALL selected facets
        const articleIds = Object.entries(countByArticle)
          .filter(([, count]) => count >= facetIds.length)
          .map(([id]) => id);

        if (articleIds.length > 0) {
          query = query.in("id", articleIds);
        } else {
          return { articles: [], count: 0 };
        }
      } else {
        return { articles: [], count: 0 };
      }
    }
  }

  // Apply full-text search
  if (filters.q) {
    const sanitized = sanitizeSearchInput(filters.q);
    if (sanitized) {
      query = query.textSearch("search_vector", sanitized, {
        type: "websearch",
        config: "english",
      });
    }
  }

  // Apply sorting and pagination
  query = query.order(column, { ascending }).range(offset, offset + pageSize - 1);

  const { data, count, error } = await query;
  if (error) throw error;

  return { articles: (data as unknown as WikiArticleListItem[]) || [], count: count || 0 };
}

// ============================================================
// SINGLE ARTICLE (read-only)
// ============================================================

export async function fetchWikiArticleBySlug(
  client: SupabaseClient | null,
  slug: string
): Promise<WikiArticle | null> {
  if (!client) return null;

  const { data: article, error } = await client
    .from("wiki_articles")
    .select(ARTICLE_SELECT)
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  if (!article) return null;

  const { data: facetData } = await client
    .from("wiki_article_facets")
    .select("facet_id, wiki_facets(*, group:wiki_facet_groups!wiki_facets_group_id_fkey(slug, name))")
    .eq("article_id", (article as WikiArticle).id);

  const facets = (facetData || [])
    .map((f: { wiki_facets: unknown }) => {
      const wikiFacet = Array.isArray(f.wiki_facets) ? f.wiki_facets[0] : f.wiki_facets;
      if (wikiFacet && typeof wikiFacet === "object" && "group" in wikiFacet) {
        const group = Array.isArray(wikiFacet.group) ? wikiFacet.group[0] : wikiFacet.group;
        return { ...wikiFacet, group } as WikiFacet;
      }
      return wikiFacet as WikiFacet;
    })
    .filter(Boolean);

  return { ...(article as WikiArticle), facets };
}

// ============================================================
// RELATED ARTICLES (read-only)
// ============================================================

export async function fetchRelatedArticles(
  client: SupabaseClient | null,
  categoryId: string | null,
  excludeId: string,
  limit = 4
): Promise<WikiArticle[]> {
  if (!client || !categoryId) return [];

  const { data, error } = await client
    .from("wiki_articles")
    .select(ARTICLE_SELECT)
    .eq("category_id", categoryId)
    .eq("is_published", true)
    .neq("id", excludeId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data as WikiArticle[]) || [];
}

// ============================================================
// FACET LANDING (read-only)
// ============================================================

export async function fetchFacetBySlug(
  client: SupabaseClient | null,
  groupSlugs: string[],
  slug: string
): Promise<WikiFacet | null> {
  if (!client) return null;

  const { data: groups } = await client
    .from("wiki_facet_groups")
    .select("id, slug, name")
    .in("slug", groupSlugs);

  if (!groups || groups.length === 0) return null;

  const typedGroups = groups as { id: string; slug: string; name: string }[];
  const groupIds = typedGroups.map((g) => g.id);

  const { data: facets } = await client
    .from("wiki_facets")
    .select("*")
    .eq("slug", slug)
    .in("group_id", groupIds);

  if (!facets || facets.length === 0) return null;

  const facet = facets[0] as WikiFacet;
  const group = typedGroups.find((g) => g.id === facet.group_id);

  return { ...facet, group: group as WikiFacetGroup | undefined };
}

export async function fetchArticlesByFacet(
  client: SupabaseClient | null,
  facetId: string
): Promise<WikiArticle[]> {
  if (!client) return [];

  const { data: articleFacets } = await client
    .from("wiki_article_facets")
    .select("article_id")
    .eq("facet_id", facetId);

  const articleIds = (articleFacets || []).map((af: { article_id: string }) => af.article_id);
  if (articleIds.length === 0) return [];

  const { data, error } = await client
    .from("wiki_articles")
    .select(ARTICLE_SELECT)
    .in("id", articleIds)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as WikiArticle[]) || [];
}

// ============================================================
// COLLECTIONS (read-only)
// ============================================================

export async function fetchCollectionBySlug(
  client: SupabaseClient | null,
  slug: string
): Promise<(WikiCollection & { articles: WikiArticle[] }) | null> {
  if (!client) return null;

  const { data: collection, error } = await client
    .from("wiki_collections")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  if (!collection) return null;

  const { data: collectionArticles } = await client
    .from("wiki_collection_articles")
    .select("article_id, display_order")
    .eq("collection_id", (collection as WikiCollection).id)
    .order("display_order");

  const articleIds = (collectionArticles || []).map((ca: { article_id: string }) => ca.article_id);

  let articles: WikiArticle[] = [];
  if (articleIds.length > 0) {
    const { data } = await client
      .from("wiki_articles")
      .select(ARTICLE_SELECT)
      .in("id", articleIds)
      .eq("is_published", true);

    if (data) {
      const orderMap = new Map<string, number>(
        (collectionArticles || []).map(
          (ca: { article_id: string; display_order: number }) =>
            [ca.article_id, ca.display_order] as [string, number]
        )
      );
      articles = (data as WikiArticle[]).sort(
        (a, b) => (orderMap.get(a.id) || 0) - (orderMap.get(b.id) || 0)
      );
    }
  }

  return { ...(collection as WikiCollection), articles };
}
