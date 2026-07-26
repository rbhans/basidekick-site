// Domain types for News and Wiki features.
// Field names/types mirror Supabase columns verbatim — do not "improve" them.
// Ported from basidekick-site/lib/types.ts (News ~L991-1044, Wiki ~L80-173).

// ============================================================
// Wiki
// ============================================================

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
  // `author`/`category` inlined rather than referencing full Profile/WikiCategory types:
  // matches the `profiles!wiki_articles_author_id_fkey(display_name)` and
  // `wiki_categories!wiki_articles_category_id_fkey(name, slug)` select strings in
  // basidekick-site/components/views/wiki-view.tsx.
  author?: { display_name: string | null };
  category?: { name: string; slug: string };
  facets?: WikiFacet[];
}

export type WikiArticleListItem = Pick<
  WikiArticle,
  "id" | "category_id" | "title" | "slug" | "summary" | "view_count" | "created_at" | "updated_at"
> & {
  category?: { name: string; slug: string };
};

export interface WikiComment {
  id: string;
  article_id: string;
  user_id: string;
  content: string;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  // `author` inlined (minimal Profile fields) — mirrors the shape used for WikiArticle.author.
  author?: { display_name: string | null };
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
  // `submitter` inlined rather than referencing full Profile type: matches the
  // `profiles!submitted_by(display_name, avatar_url)` select string in
  // basidekick-site/components/news/news-api.ts.
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
  // `author` inlined (minimal Profile fields) — mirrors the shape used for NewsArticle.submitter.
  author?: { display_name: string | null; avatar_url: string | null };
  replies?: NewsArticleComment[];
  user_vote?: number | null;
}

export type NewsSortBy = "recent" | "top" | "commented";

export interface NewsFeedFilter {
  tags?: string[];
  sortBy?: NewsSortBy;
  timeRange?: "day" | "week" | "month" | "all";
}

// ============================================================
// PointStack (community: posts, experts, jobs)
// Ported from basidekick-site/lib/types.ts (PointStackProfile ~L459,
// PointStackPost ~L577, PointStackPostComment ~L624, PointStackJob ~L670).
// Read-only subset: vote/notification/message/conversation/company-membership/
// join-request types are intentionally omitted.
// ============================================================

export type PointStackAvailabilityStatus = "available" | "busy" | "not-looking";

export interface PointStackProfile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  role?: string | null;
  post_count: number;
  skills: string[];
  headline: string | null;
  location: string | null;
  availability_status: PointStackAvailabilityStatus;
  reputation_score: number;
  is_verified: boolean;
  // Only present on full-profile fetches (`select("*")`, e.g. fetchProfileByUsername) —
  // the directory list select is narrower, matching basidekick-site's fetchProfiles.
  bio?: string | null;
  company?: string | null;
  website_url?: string | null;
  linkedin_url?: string | null;
  github_url?: string | null;
  cover_image_url?: string | null;
  cover_color?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type WorkExperienceKind = "work" | "education";

export interface WorkExperience {
  id: string;
  user_id: string;
  kind: WorkExperienceKind;
  title: string;
  organization: string;
  organization_url: string | null;
  location: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export type PointStackPostType = "discussion" | "question" | "project" | "job" | "tip";

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
  created_at: string;
  updated_at: string;
  // Joined data
  // `author` inlined (minimal Profile fields) — matches the
  // `profiles!author_id(display_name, avatar_url)` select string in
  // basidekick-site/components/pointstack/pointstack-api.ts.
  author?: { display_name: string | null; avatar_url: string | null };
}

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
}

export type PointStackJobType = "full-time" | "part-time" | "contract" | "freelance" | "internship";
export type PointStackExperienceLevel = "entry" | "mid" | "senior" | "lead" | "executive";

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
  created_at: string;
  updated_at: string;
  // Joined data
  // `company`/`poster` inlined, matching the
  // `pointstack_companies!company_id(name, slug, logo_url)` /
  // `profiles!posted_by(display_name)` select strings.
  company?: { name: string; slug: string; logo_url: string | null } | null;
  poster?: { display_name: string | null };
}

export interface PointStackCompanyMember {
  id: string;
  company_id: string;
  user_id: string;
  role: "owner" | "admin" | "member";
  title: string | null;
  joined_at: string;
  profile?: { display_name: string | null; avatar_url: string | null };
  company?: {
    name: string;
    slug: string;
    logo_url: string | null;
    is_verified: boolean;
  };
}

export interface PointStackCompany {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  website_url: string | null;
  location: string | null;
  size_range: "1-10" | "11-50" | "51-200" | "201-500" | "500+" | null;
  industry: string | null;
  owner_id: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  owner?: { display_name: string | null };
  members?: PointStackCompanyMember[];
}

export interface PointStackNotification {
  id: string;
  user_id: string;
  type: "mention" | "reply" | "follow" | "like" | "answer_accepted" | "job_application" | "system";
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  actor_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  actor?: { display_name: string | null; avatar_url: string | null };
}

export interface PointStackConversationParticipant {
  conversation_id: string;
  user_id: string;
  last_read_at: string | null;
  is_muted: boolean;
  profile?: { display_name: string | null; avatar_url: string | null };
}

export interface PointStackConversation {
  id: string;
  created_at: string;
  updated_at: string;
  participants?: PointStackConversationParticipant[];
}

export interface PointStackMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  sender?: { display_name: string | null; avatar_url: string | null };
}
