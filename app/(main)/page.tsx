import { HomeView } from "@/components/views/home-view";
import { createClient } from "@supabase/supabase-js";
import { ROUTES } from "@/lib/routes";

// ISR: Revalidate daily — content updates come via redeployments
export const revalidate = 86400;

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return null;
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Fallback atlas entry
const FALLBACK_ATLAS = {
  name: "Discharge Air Temperature",
  aliases: ["DAT", "DA-T", "SAT", "SaTemp", "DischrgAirTmp", "DA_TEMP"],
  description:
    "Temperature of the air leaving an air-handling unit or terminal box, after any heating, cooling, or mixing. One of the four most-aliased points in the Atlas — every vendor names it differently.",
  type: "Analog input · °F",
  haystackTags: ["discharge", "air", "temp", "sensor", "point"],
  brick: "brick:Discharge_Air_Temperature_Sensor",
  foundOn: ["AHU", "RTU", "VAV", "FCU", "MAU"],
  aliasCount: 17,
  url: ROUTES.ATLAS,
};

async function getHomePageData() {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return {
      pulse: { newWikiThisWeek: 0, newAtlasThisWeek: 0, newPointStackThisWeek: 0 },
      featuredAtlas: FALLBACK_ATLAS,
      pointStackPosts: [],
      pointStackStats: { members: 0, posts: 0, openJobs: 0, onlineNow: 0 },
      alsoHere: { wikiCount: 0, newsLatest: null, crateCount: 3 },
    };
  }

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    wikiCountResult,
    wikiThisWeekResult,
    pointStackPostsResult,
    pointStackTotalCountResult,
    pointStackThisWeekResult,
    pointStackOpenJobsResult,
    pointStackMemberCountResult,
  ] = await Promise.all([
    supabase
      .from("wiki_articles")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true),
    supabase
      .from("wiki_articles")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true)
      .gte("created_at", oneWeekAgo),
    supabase
      .from("pointstack_posts")
      .select(`
        id,
        post_type,
        title,
        slug,
        created_at,
        comment_count,
        author:profiles!author_id(display_name)
      `)
      .eq("is_published", true)
      .in("post_type", ["question", "project", "job"])
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("pointstack_posts")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true),
    supabase
      .from("pointstack_posts")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true)
      .gte("created_at", oneWeekAgo),
    supabase
      .from("pointstack_posts")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true)
      .eq("post_type", "job"),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true }),
  ]);

  // Map PointStack posts to the HomeView shape.
  const pointStackPosts = (pointStackPostsResult.data ?? []).map((raw) => {
    const row = raw as unknown as {
      id: string;
      post_type: string;
      title: string;
      slug: string;
      created_at: string;
      comment_count: number | null;
      author: { display_name: string | null } | { display_name: string | null }[] | null;
    };

    const authorObj = Array.isArray(row.author) ? row.author[0] : row.author;
    const displayName = authorObj?.display_name ?? "anonymous";
    const handle = displayName.toLowerCase().replace(/\s+/g, "");

    const kind: "question" | "project" | "job" =
      row.post_type === "question"
        ? "question"
        : row.post_type === "job"
          ? "job"
          : "project";

    return {
      id: row.id,
      kind,
      title: row.title,
      authorHandle: handle,
      createdAt: row.created_at,
      meta: [{ label: "replies", value: String(row.comment_count ?? 0) }],
      url: `${ROUTES.POINTSTACK}/posts/${row.slug}`,
    };
  });

  return {
    pulse: {
      newWikiThisWeek: wikiThisWeekResult.count ?? 0,
      newAtlasThisWeek: 0, // Atlas data is file-based, no "added this week" query yet
      newPointStackThisWeek: pointStackThisWeekResult.count ?? 0,
    },
    featuredAtlas: FALLBACK_ATLAS,
    pointStackPosts,
    pointStackStats: {
      members: pointStackMemberCountResult.count ?? 0,
      posts: pointStackTotalCountResult.count ?? 0,
      openJobs: pointStackOpenJobsResult.count ?? 0,
      onlineNow: 0, // Real presence tracking deferred to follow-up
    },
    alsoHere: {
      wikiCount: wikiCountResult.count ?? 0,
      newsLatest: null,
      crateCount: 3,
    },
  };
}

export default async function HomePage() {
  const data = await getHomePageData();
  return <HomeView {...data} />;
}
