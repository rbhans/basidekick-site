import { z } from "zod";

/**
 * Curated topic that members can endorse each other on.
 * Rows live in `endorsement_topics`.
 */
export const endorsementTopicSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1).max(64),
  name: z.string().min(1).max(128),
  description: z.string().nullable(),
  wiki_category_id: z.string().uuid().nullable(),
  icon_name: z.string().nullable(),
  display_order: z.number().int(),
  is_active: z.boolean(),
  created_at: z.string(),
});
export type EndorsementTopic = z.infer<typeof endorsementTopicSchema>;

/**
 * Denormalized per-(user, topic) score row from `endorsement_scores`,
 * joined with its topic for display.
 */
export const topicScoreSchema = z.object({
  topic: endorsementTopicSchema,
  score: z.number().int().nonnegative(),
  viewer_has_endorsed: z.boolean(),
});
export type TopicScore = z.infer<typeof topicScoreSchema>;

/**
 * Leaderboard row: ranked user for a topic.
 */
export const leaderboardEntrySchema = z.object({
  user_id: z.string().uuid(),
  display_name: z.string().nullable(),
  avatar_url: z.string().nullable(),
  headline: z.string().nullable(),
  score: z.number().int().nonnegative(),
});
export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;

/**
 * Input for toggling an endorsement on another user.
 */
export const toggleEndorsementInputSchema = z.object({
  endorsee_id: z.string().uuid(),
  topic_id: z.string().uuid(),
});
export type ToggleEndorsementInput = z.infer<
  typeof toggleEndorsementInputSchema
>;

/**
 * Admin CRUD input for endorsement topics.
 */
export const upsertEndorsementTopicSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, digits, or dashes"),
  name: z.string().min(1).max(128),
  description: z.string().max(500).nullable().optional(),
  wiki_category_id: z.string().uuid().nullable().optional(),
  icon_name: z.string().max(64).nullable().optional(),
  display_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
});
export type UpsertEndorsementTopicInput = z.infer<
  typeof upsertEndorsementTopicSchema
>;

// ------------------------------------------------------------
// Tier derivation (display-only)
// ------------------------------------------------------------

export type EndorsementTier =
  | "contributor"
  | "practitioner"
  | "expert"
  | "authority";

export interface TierDescriptor {
  key: EndorsementTier;
  label: string;
  minScore: number;
}

export const ENDORSEMENT_TIERS: TierDescriptor[] = [
  { key: "authority", label: "Authority", minScore: 50 },
  { key: "expert", label: "Expert", minScore: 15 },
  { key: "practitioner", label: "Practitioner", minScore: 5 },
  { key: "contributor", label: "Contributor", minScore: 1 },
];

export function tierFor(score: number): TierDescriptor | null {
  for (const tier of ENDORSEMENT_TIERS) {
    if (score >= tier.minScore) return tier;
  }
  return null;
}

// ------------------------------------------------------------
// Client-side limits (also enforced server-side)
// ------------------------------------------------------------

export const ENDORSEMENT_DAILY_CAP = 20;
