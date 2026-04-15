import { getClient } from "@/lib/supabase/client";
import {
  ENDORSEMENT_DAILY_CAP,
  EndorsementTopic,
  LeaderboardEntry,
  TopicScore,
  UpsertEndorsementTopicInput,
} from "@/lib/schemas/endorsements";

// ------------------------------------------------------------
// Topics
// ------------------------------------------------------------

export async function listEndorsementTopics(
  options: { includeInactive?: boolean } = {}
): Promise<EndorsementTopic[]> {
  const supabase = getClient();
  let query = supabase
    .from("endorsement_topics")
    .select("*")
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  if (!options.includeInactive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as EndorsementTopic[];
}

export async function getEndorsementTopicBySlug(
  slug: string
): Promise<EndorsementTopic | null> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("endorsement_topics")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return (data as EndorsementTopic | null) ?? null;
}

// ------------------------------------------------------------
// Per-profile expertise
// ------------------------------------------------------------

/**
 * Scores for a single user across all active topics, plus whether the
 * current viewer has endorsed them in each topic.
 */
export async function getProfileEndorsements(
  profileId: string
): Promise<TopicScore[]> {
  const supabase = getClient();

  const [topicsRes, scoresRes, userRes] = await Promise.all([
    supabase
      .from("endorsement_topics")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase
      .from("endorsement_scores")
      .select("topic_id, score")
      .eq("user_id", profileId),
    supabase.auth.getUser(),
  ]);

  if (topicsRes.error) throw topicsRes.error;
  if (scoresRes.error) throw scoresRes.error;

  const topics = (topicsRes.data ?? []) as EndorsementTopic[];
  const scoreRows = (scoresRes.data ?? []) as Array<{
    topic_id: string;
    score: number;
  }>;
  const scoreByTopic = new Map<string, number>(
    scoreRows.map((row) => [row.topic_id, row.score])
  );

  const viewerId = userRes.data.user?.id ?? null;
  let viewerEndorsedTopicIds = new Set<string>();
  if (viewerId && viewerId !== profileId) {
    const { data: mine } = await supabase
      .from("endorsements")
      .select("topic_id")
      .eq("endorser_id", viewerId)
      .eq("endorsee_id", profileId);
    viewerEndorsedTopicIds = new Set(
      (mine ?? []).map((r: { topic_id: string }) => r.topic_id)
    );
  }

  return topics
    .map<TopicScore>((topic) => ({
      topic,
      score: scoreByTopic.get(topic.id) ?? 0,
      viewer_has_endorsed: viewerEndorsedTopicIds.has(topic.id),
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.topic.display_order - b.topic.display_order;
    });
}

// ------------------------------------------------------------
// Toggle endorsement
// ------------------------------------------------------------

export interface ToggleEndorsementResult {
  endorsed: boolean;
  score: number;
}

export async function toggleEndorsement(input: {
  endorseeId: string;
  topicId: string;
}): Promise<ToggleEndorsementResult> {
  const supabase = getClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in to endorse.");
  if (user.id === input.endorseeId) {
    throw new Error("You can't endorse yourself.");
  }

  // Existing row?
  const { data: existing } = await supabase
    .from("endorsements")
    .select("endorser_id")
    .eq("endorser_id", user.id)
    .eq("endorsee_id", input.endorseeId)
    .eq("topic_id", input.topicId)
    .maybeSingle();

  if (existing) {
    // Un-endorse
    const { error: delError } = await supabase
      .from("endorsements")
      .delete()
      .eq("endorser_id", user.id)
      .eq("endorsee_id", input.endorseeId)
      .eq("topic_id", input.topicId);
    if (delError) throw delError;
  } else {
    // Enforce daily cap client-side (RLS has no date logic).
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count, error: countError } = await supabase
      .from("endorsements")
      .select("endorser_id", { count: "exact", head: true })
      .eq("endorser_id", user.id)
      .gte("created_at", since);
    if (countError) throw countError;
    if ((count ?? 0) >= ENDORSEMENT_DAILY_CAP) {
      throw new Error(
        `Daily endorsement cap reached (${ENDORSEMENT_DAILY_CAP}). Try again tomorrow.`
      );
    }

    const { error: insError } = await supabase.from("endorsements").insert({
      endorser_id: user.id,
      endorsee_id: input.endorseeId,
      topic_id: input.topicId,
    });
    if (insError) throw insError;
  }

  // Read back authoritative score.
  const { data: scoreRow } = await supabase
    .from("endorsement_scores")
    .select("score")
    .eq("user_id", input.endorseeId)
    .eq("topic_id", input.topicId)
    .maybeSingle();

  return {
    endorsed: !existing,
    score: (scoreRow?.score as number | undefined) ?? 0,
  };
}

// ------------------------------------------------------------
// Leaderboard
// ------------------------------------------------------------

export async function getTopicLeaderboard(
  topicId: string,
  options: { limit?: number; offset?: number } = {}
): Promise<LeaderboardEntry[]> {
  const supabase = getClient();
  const limit = options.limit ?? 50;
  const offset = options.offset ?? 0;

  const { data, error } = await supabase
    .from("endorsement_scores")
    .select(
      `
      score,
      user_id,
      profiles:profiles!endorsement_scores_user_id_fkey (
        display_name,
        avatar_url,
        headline
      )
    `
    )
    .eq("topic_id", topicId)
    .gt("score", 0)
    .order("score", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return (data ?? []).map((row: {
    score: number;
    user_id: string;
    profiles: {
      display_name: string | null;
      avatar_url: string | null;
      headline: string | null;
    } | null;
  }) => ({
    user_id: row.user_id,
    display_name: row.profiles?.display_name ?? null,
    avatar_url: row.profiles?.avatar_url ?? null,
    headline: row.profiles?.headline ?? null,
    score: row.score,
  }));
}

// ------------------------------------------------------------
// Admin topic CRUD
// ------------------------------------------------------------

export async function upsertEndorsementTopic(
  input: UpsertEndorsementTopicInput
): Promise<EndorsementTopic> {
  const supabase = getClient();
  const payload = {
    slug: input.slug,
    name: input.name,
    description: input.description ?? null,
    wiki_category_id: input.wiki_category_id ?? null,
    icon_name: input.icon_name ?? null,
    display_order: input.display_order,
    is_active: input.is_active,
  };

  const query = input.id
    ? supabase
        .from("endorsement_topics")
        .update(payload)
        .eq("id", input.id)
        .select("*")
        .single()
    : supabase
        .from("endorsement_topics")
        .insert(payload)
        .select("*")
        .single();

  const { data, error } = await query;
  if (error) throw error;
  return data as EndorsementTopic;
}

export async function deleteEndorsementTopic(id: string): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase
    .from("endorsement_topics")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
