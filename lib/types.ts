import { ReactNode } from "react";

// Tool status
export type ToolStatus = "coming";

// Base tool info (used in listings)
export interface Tool {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  status: ToolStatus;
  iconName: string;
  features: string[];
  webVersion?: boolean;
}

// Extended feature info (used in detail pages)
export interface ToolFeature {
  iconName: string;
  title: string;
  description: string;
}

// Step info for "how it works" sections
export interface ToolStep {
  number: number;
  title: string;
  description: string;
}

// Requirement info
export interface ToolRequirement {
  label: string;
  value: string;
}

// Pricing tier for tools with subscription pricing
export interface ToolPricingTier {
  name: string;
  limit: string;
  price: string;
  highlighted?: boolean;
}

// Full tool detail (used in detail pages)
export interface ToolDetail extends Tool {
  detailedFeatures: ToolFeature[];
  steps: ToolStep[];
  requirements: ToolRequirement[];
  pricing?: ToolPricingTier[];
  mobileApp?: boolean;
  useCases?: string[];
  perfectFor?: string[];
}

// Use case for tools page
export interface UseCase {
  title: string;
  description: string;
  tools: string[];
}

// Resource info (for resources section)
export interface Resource {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  iconName: string;
  href: string;
}

// Color variants for navigation sections
export type NavColorVariant = "default" | "tools" | "resources" | "wiki" | "pointstack" | "news";

// Navigation tree node
export interface NavNode {
  id: string;
  label: string;
  iconName?: string;
  colorVariant?: NavColorVariant;
  href?: string;
  exact?: boolean;
  badge?: {
    text: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  };
  children?: NavNode[];
  defaultExpanded?: boolean;
}

// View IDs as const for type safety
export const VIEW_IDS = {
  HOME: "home",
  TOOLS: "tools",
  SSK: "ssk",
  QSK: "qsk",
  RESOURCES: "resources",
  ATLAS: "atlas",
  BABEL: "babel",
  EQUIPMENT: "equipment",
  REFERENCES: "references",
  WIKI: "wiki",
  POINTSTACK: "pointstack",
  NEWS: "news",
  OPEN_SOURCE: "open-source",

  CALCULATORS: "calculators",
  ACCOUNT: "account",
  SIGNIN: "signin",
  SIGNUP: "signup",
  ADMIN: "admin",
} as const;

export type ViewId = (typeof VIEW_IDS)[keyof typeof VIEW_IDS];

// License from Lemon Squeezy purchases
export interface License {
  id: string;
  product_id: string; // 'ssk'
  license_key: string;
  lemon_squeezy_order_id: string | null;
  purchased_at: string;
  expires_at: string | null; // null = lifetime
  is_active: boolean;
}

// User profile from Supabase
export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  company: string | null;
  subscription_tier: string | null;
  entitlements: {
    tools: string[];
    features: string[];
    limits: {
      max_agents: number;
      max_devices: number;
    };
  } | null;
  post_count: number;
  role: "member" | "moderator" | "admin";
  created_at: string;
  updated_at: string;
}

// Wiki types
export interface WikiCategory {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  icon_name: string | null;
  display_order: number;
  color?: string | null;
  created_at: string;
  // Computed/joined
  children?: WikiCategory[];
  article_count?: number;
}

export interface WikiFacetGroup {
  id: string;
  name: string;
  slug: string;
  display_order: number;
  created_at: string;
  // Joined
  facets?: WikiFacet[];
}

export interface WikiFacet {
  id: string;
  group_id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_name: string | null;
  article_count: number;
  display_order: number;
  created_at: string;
  // Joined
  group?: WikiFacetGroup;
}

export interface WikiCollection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  cover_icon: string | null;
  is_featured: boolean;
  display_order: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  articles?: WikiArticle[];
  article_count?: number;
}

/** @deprecated Use WikiFacet instead. Retained for legacy tag page fallback. */
export interface WikiTag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface WikiArticle {
  id: string;
  category_id: string | null;
  author_id: string | null;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  is_published: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  // Joined data
  author?: { display_name: string | null };
  category?: { name: string; slug: string };
  tags?: WikiTag[];
  facets?: WikiFacet[];
}

export interface WikiComment {
  id: string;
  article_id: string;
  user_id: string;
  content: string;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  author?: { display_name: string | null };
}

// Wiki suggestion
export interface WikiSuggestion {
  id: string;
  thread_id: string;
  suggested_by: string;
  suggested_at: string;
  status: "pending" | "approved" | "rejected";
  reviewed_by: string | null;
  reviewed_at: string | null;
  notes: string | null;
  // Joined data
  thread?: { title: string; slug: string };
  suggester?: { display_name: string | null };
  reviewer?: { display_name: string | null };
}

// BAS Babel types
export type BabelHaystackTagKind = "Marker" | "Str" | "Number" | "Bool" | "Ref";

export interface BabelHaystackTag {
  name: string;
  kind: BabelHaystackTagKind;
}

export interface BabelPointHaystackData {
  tags: BabelHaystackTag[];
  tagString: string;
  markers: string[];
  unit?: string;
  kind?: string;
}

export interface BabelEquipmentHaystackData {
  tags: BabelHaystackTag[];
  tagString: string;
  markers: string[];
}

export interface BabelTypicalRange {
  min: number;
  max: number;
}

export interface BabelAliases {
  common: string[];
  abbreviated?: string[];
  verbose?: string[];
  misspellings?: string[];
}

export interface BabelPointConcept {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  description: string;
  haystack?: BabelPointHaystackData;
  brick?: string;
  kind?: "Number" | "Bool" | string;
  unit?: string | string[];
  typical_range?: BabelTypicalRange;
  object_type?: string;
  engineering_units?: string;
  point_function?: string;
  states?: Record<string, string | string[]>;
}

export interface BabelPointEntry {
  concept: BabelPointConcept;
  aliases: BabelAliases;
  notes?: string[];
  related?: string[];
}

export interface BabelEquipmentSubtype {
  id: string;
  name: string;
  aliases?: string[];
  description?: string;
}

export interface BabelEquipmentEntry {
  id: string;
  name: string;
  full_name?: string;
  abbreviation?: string;
  category: string;
  description: string;
  haystack?: BabelEquipmentHaystackData;
  brick?: string;
  aliases: BabelAliases;
  subtypes?: BabelEquipmentSubtype[];
  typical_points?: string[];
}

export interface BabelCategory {
  id: string;
  name: string;
  type: "points" | "equipment";
  count: number;
  subcategories?: BabelCategory[];
}

export interface BabelSearchIndexEntry {
  id: string;
  type: "point" | "equipment";
  name: string;
  tokens: string[];
}

export interface BabelData {
  version: string;
  lastUpdated: string;
  totalPoints: number;
  totalEquipment: number;
  points: BabelPointEntry[];
  equipment: BabelEquipmentEntry[];
}

export interface BabelCategoriesData {
  version: string;
  categories: BabelCategory[];
}

export interface BabelSearchIndexData {
  version: string;
  entries: BabelSearchIndexEntry[];
}

// BAS Atlas types
export interface AtlasAliases {
  common?: string[];
  misspellings?: string[];
}

export type AtlasModelStatus = "current" | "discontinued";

export interface AtlasBrand {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  website?: string;
  description?: string;
}

export interface AtlasType {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface AtlasModel {
  id: string;
  brand: string;
  type: string;
  name: string;
  slug: string;
  model_numbers?: string[];
  protocols?: string[];
  status?: AtlasModelStatus;
  description?: string;
  manufacturer_url?: string;
  image_url?: string;
  added_at?: string;
  aliases?: AtlasAliases;
}

export interface AtlasData {
  version: string;
  lastUpdated: string;
  totalBrands: number;
  totalTypes: number;
  totalModels: number;
  brands: AtlasBrand[];
  types: AtlasType[];
  models: AtlasModel[];
}

export interface AtlasBrandCategory {
  id: string;
  name: string;
  slug: string;
  count: number;
  types: Array<{
    id: string;
    name: string;
    slug: string;
    count: number;
  }>;
}

export interface AtlasTypeCategory {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export interface AtlasCategoriesData {
  version: string;
  brands: AtlasBrandCategory[];
  types: AtlasTypeCategory[];
}

export interface AtlasSearchIndexEntry {
  id: string;
  type: "brand" | "type" | "model";
  name: string;
  brand?: string;
  model_numbers?: string[];
  tokens: string[];
}

export interface AtlasSearchIndexData {
  version: string;
  entries: AtlasSearchIndexEntry[];
}

// BAS Babel Contribution types
export type BabelContributionType = "error" | "edit" | "new_entry";
export type BabelContributionStatus = "pending" | "approved" | "rejected";

export interface BabelContribution {
  id: string;
  user_id: string;
  type: BabelContributionType;
  entry_id: string | null;
  entry_type: "point" | "equipment" | null;
  entry_category: string | null;
  title: string;
  description: string;
  suggested_changes: Record<string, unknown> | null;
  status: BabelContributionStatus;
  reviewer_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  github_issue_url: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  submitter?: { display_name: string | null; email?: string };
  reviewer?: { display_name: string | null };
}

// ============================================================
// PointStack Community Platform Types
// ============================================================

// Extended Profile fields for PointStack
export interface PointStackProfile extends Profile {
  skills: string[];
  headline: string | null;
  location: string | null;
  website_url: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  availability_status: PointStackAvailabilityStatus;
  reputation_score: number;
  is_verified: boolean;
  onboarding_completed: boolean;
  // Computed/joined
  follower_count?: number;
  following_count?: number;
}

export type PointStackAvailabilityStatus = "available" | "busy" | "not-looking";

// Company
export interface PointStackCompany {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  website_url: string | null;
  location: string | null;
  size_range: PointStackCompanySizeRange | null;
  industry: string | null;
  owner_id: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  owner?: { display_name: string | null };
  members?: PointStackCompanyMember[];
  member_count?: number;
}

export type PointStackCompanySizeRange = "1-10" | "11-50" | "51-200" | "201-500" | "500+";

export interface PointStackCompanyMember {
  id: string;
  company_id: string;
  user_id: string;
  role: PointStackCompanyMemberRole;
  title: string | null;
  joined_at: string;
  // Joined data
  profile?: { display_name: string | null; avatar_url: string | null };
}

export type PointStackCompanyMemberRole = "owner" | "admin" | "member";

export type PointStackJoinRequestStatus = "pending" | "approved" | "rejected";

export interface PointStackCompanyJoinRequest {
  id: string;
  company_id: string;
  user_id: string;
  message: string | null;
  status: PointStackJoinRequestStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  user?: { display_name: string | null; avatar_url: string | null };
  reviewer?: { display_name: string | null; avatar_url: string | null };
  company?: { name: string | null; slug: string | null } | null;
}

// User Follow relationship
export interface PointStackUserFollow {
  follower_id: string;
  following_id: string;
  created_at: string;
  // Joined data
  follower?: { display_name: string | null; avatar_url: string | null };
  following?: { display_name: string | null; avatar_url: string | null };
}

// Unified Post
export interface PointStackPost {
  id: string;
  author_id: string;
  post_type: PointStackPostType;
  title: string;
  content: string;
  slug: string;
  is_published: boolean;
  is_pinned: boolean;
  view_count: number;
  upvote_count: number;
  comment_count: number;
  tags: string[];
  equipment_ids?: string[];
  is_showcase?: boolean;
  cover_image_url?: string | null;
  images?: string[];
  documents?: string[];
  building_types?: string[];
  systems?: string[];
  technologies?: string[];
  location?: string | null;
  completion_date?: string | null;
  square_footage?: number | null;
  company_id?: string | null;
  is_featured?: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Joined data
  author?: { display_name: string | null; avatar_url: string | null };
  company?: { name: string; slug: string } | null;
  credits?: PointStackProjectCredit[];
  user_vote?: number | null; // Current user's vote: 1, -1, or null
}

export type PointStackPostType = "discussion" | "question" | "project" | "job" | "tip";

// Post Vote
export interface PointStackPostVote {
  user_id: string;
  post_id: string;
  vote_type: 1 | -1;
  created_at: string;
}

// Post Comment
export interface PointStackPostComment {
  id: string;
  post_id: string;
  author_id: string;
  parent_id: string | null;
  content: string;
  is_accepted: boolean;
  upvote_count: number;
  created_at: string;
  updated_at: string;
  // Joined data
  author?: { display_name: string | null; avatar_url: string | null };
  replies?: PointStackPostComment[];
  user_vote?: number | null;
}

// Comment Vote
export interface PointStackCommentVote {
  user_id: string;
  comment_id: string;
  vote_type: 1 | -1;
  created_at: string;
}

// Showcase Project
export type PointStackShowcaseProject = PointStackPost;

// Project Credit
export interface PointStackProjectCredit {
  id: string;
  project_id: string;
  user_id: string | null;
  role: string;
  display_name: string | null;
  // Joined data
  user?: { display_name: string | null; avatar_url: string | null };
}

// Project Like
export interface PointStackProjectLike {
  user_id: string;
  project_id: string;
  created_at: string;
}

// Job Listing
export interface PointStackJob {
  id: string;
  company_id: string | null;
  posted_by: string;
  title: string;
  slug: string;
  description: string;
  requirements: string | null;
  job_type: PointStackJobType;
  experience_level: PointStackExperienceLevel | null;
  location: string | null;
  is_remote: boolean;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  application_url: string | null;
  application_email: string | null;
  is_active: boolean;
  expires_at: string | null;
  view_count: number;
  application_count: number;
  created_at: string;
  updated_at: string;
  // Joined data
  company?: { name: string; slug: string; logo_url: string | null };
  poster?: { display_name: string | null };
  user_applied?: boolean;
}

export type PointStackJobType = "full-time" | "part-time" | "contract" | "freelance" | "internship";
export type PointStackExperienceLevel = "entry" | "mid" | "senior" | "lead" | "executive";

// Job Application
export interface PointStackJobApplication {
  id: string;
  job_id: string;
  user_id: string;
  cover_letter: string | null;
  resume_url: string | null;
  status: PointStackApplicationStatus;
  created_at: string;
  updated_at: string;
  // Joined data
  job?: PointStackJob;
  applicant?: { display_name: string | null; avatar_url: string | null; headline: string | null };
}

export type PointStackApplicationStatus = "pending" | "reviewed" | "interviewing" | "rejected" | "accepted";

// Resource Listing
export interface PointStackResourceListing {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  description: string | null;
  category: PointStackResourceCategory;
  preview_images: string[];
  file_url: string | null;
  is_free: boolean;
  external_link: string | null;
  download_count: number;
  upvote_count: number;
  comment_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined/enriched data
  author?: { display_name: string | null; avatar_url: string | null };
  user_vote?: number | null;
}

export type PointStackResourceCategory = "template" | "script" | "document" | "guide" | "tool" | "other";

// Resource Comment
export interface PointStackResourceComment {
  id: string;
  resource_id: string;
  author_id: string;
  parent_id: string | null;
  content: string;
  upvote_count: number;
  created_at: string;
  updated_at: string;
  // Joined data
  author?: { display_name: string | null; avatar_url: string | null };
}

// Notification
export interface PointStackNotification {
  id: string;
  user_id: string;
  type: PointStackNotificationType;
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  actor_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  // Joined data
  actor?: { display_name: string | null; avatar_url: string | null };
}

export type PointStackNotificationType =
  | "mention"
  | "reply"
  | "follow"
  | "like"
  | "answer_accepted"
  | "job_application"
  | "system";

// Notification Preferences
export interface PointStackNotificationPreferences {
  user_id: string;
  email_mentions: boolean;
  email_replies: boolean;
  email_follows: boolean;
  email_digest_frequency: PointStackDigestFrequency;
  push_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export type PointStackDigestFrequency = "never" | "daily" | "weekly";

// Conversation (DM)
export interface PointStackConversation {
  id: string;
  created_at: string;
  updated_at: string;
  // Joined data
  participants?: PointStackConversationParticipant[];
  last_message?: PointStackMessage;
  unread_count?: number;
}

// Conversation Participant
export interface PointStackConversationParticipant {
  conversation_id: string;
  user_id: string;
  last_read_at: string | null;
  is_muted: boolean;
  // Joined data
  profile?: { display_name: string | null; avatar_url: string | null };
}

// Message
export interface PointStackMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  sender?: { display_name: string | null; avatar_url: string | null };
}

// Message Request
export interface PointStackMessageRequest {
  id: string;
  from_user_id: string;
  to_user_id: string;
  message: string | null;
  status: PointStackMessageRequestStatus;
  created_at: string;
  // Joined data
  from_user?: { display_name: string | null; avatar_url: string | null; headline: string | null };
}

export type PointStackMessageRequestStatus = "pending" | "accepted" | "declined";

// Feed filter options
export interface PointStackFeedFilter {
  type?: PointStackPostType;
  tags?: string[];
  following?: boolean;
  sortBy?: "recent" | "popular" | "unanswered";
}

// Create/Update input types
export interface CreatePointStackPostInput {
  post_type: PointStackPostType;
  title: string;
  content: string;
  tags?: string[];
  equipment_ids?: string[];
  is_showcase?: boolean;
  cover_image_url?: string | null;
  images?: string[];
  documents?: string[];
  building_types?: string[];
  systems?: string[];
  technologies?: string[];
  location?: string;
  completion_date?: string;
  square_footage?: number;
  company_id?: string | null;
  is_featured?: boolean;
  metadata?: Record<string, unknown>;
}

export interface CreatePointStackCommentInput {
  post_id: string;
  content: string;
  parent_id?: string;
}

export interface CreatePointStackJobInput {
  title: string;
  description: string;
  requirements?: string;
  job_type: PointStackJobType;
  experience_level?: PointStackExperienceLevel;
  location?: string;
  is_remote?: boolean;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  application_url?: string;
  application_email?: string;
  company_id?: string | null;
}

export interface CreatePointStackResourceInput {
  title: string;
  description?: string;
  category: PointStackResourceCategory;
  preview_images?: string[];
  file_url?: string;
  is_free?: boolean;
  external_link?: string;
}

export interface UpdatePointStackProfileInput {
  display_name?: string;
  avatar_url?: string;
  headline?: string;
  location?: string;
  skills?: string[];
  website_url?: string;
  linkedin_url?: string;
  github_url?: string;
  availability_status?: PointStackAvailabilityStatus;
}

// ============================================================
// Activity & Contribution Types
// ============================================================

export type ActivityItemType =
  | "post"
  | "comment"
  | "babel_contribution"
  | "equipment_submission"
  | "equipment_note"
  | "wiki_article";

export interface ActivityItem {
  id: string;
  type: ActivityItemType;
  title: string;
  description?: string;
  link?: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

export type EquipmentSubmissionType = "error" | "edit" | "new_entry";
export type EquipmentSubmissionStatus = "pending" | "approved" | "rejected";

export interface EquipmentSubmission {
  id: string;
  user_id: string;
  type: EquipmentSubmissionType;
  entry_id: string | null;
  brand_id: string | null;
  brand_name: string | null;
  type_id: string | null;
  type_name: string | null;
  model_name: string | null;
  model_numbers: string[] | null;
  protocols: string[] | null;
  description: string | null;
  review_status: EquipmentSubmissionStatus;
  reviewer_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  github_issue_url: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  submitter?: { display_name: string | null };
  reviewer?: { display_name: string | null };
}

export interface EquipmentNote {
  id: string;
  equipment_id: string;
  author_id: string;
  content: string;
  upvote_count: number;
  created_at: string;
  updated_at: string;
  // Joined data
  author?: { display_name: string | null; avatar_url: string | null };
}

// ============================================================
// News (HN-style Article Aggregator)
// ============================================================

export interface NewsArticle {
  id: string;
  title: string;
  url: string;
  slug: string;
  source_domain: string;
  summary: string | null;
  submitted_by: string | null;
  is_ai_submitted: boolean;
  tags: string[];
  upvote_count: number;
  comment_count: number;
  view_count: number;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  submitter?: { display_name: string | null; avatar_url: string | null } | null;
  user_vote?: number | null;
}

export interface NewsArticleComment {
  id: string;
  article_id: string;
  author_id: string;
  parent_id: string | null;
  content: string;
  upvote_count: number;
  created_at: string;
  updated_at: string;
  // Joined data
  author?: { display_name: string | null; avatar_url: string | null };
  replies?: NewsArticleComment[];
  user_vote?: number | null;
}

export interface NewsArticleVote {
  user_id: string;
  article_id: string;
  vote_type: 1 | -1;
  created_at: string;
}

export interface NewsArticleCommentVote {
  user_id: string;
  comment_id: string;
  vote_type: 1 | -1;
  created_at: string;
}

export type NewsSortBy = "recent" | "top" | "commented";

export interface NewsFeedFilter {
  tags?: string[];
  sortBy?: NewsSortBy;
  timeRange?: "day" | "week" | "month" | "all";
}

export interface CreateNewsCommentInput {
  article_id: string;
  content: string;
  parent_id?: string;
}
