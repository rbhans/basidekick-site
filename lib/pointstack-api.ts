import type { SupabaseClient } from "@/lib/supabase/client";
import { sanitizeSearchInput } from "@/lib/security";
import {
  PointStackCompany,
  PointStackCompanyMember,
  PointStackConversation,
  PointStackJob,
  PointStackMessage,
  PointStackNotification,
  PointStackPost,
  PointStackPostComment,
  PointStackProfile,
  WorkExperience,
} from "@/lib/types";

// ============================================================
// NORMALIZATION HELPERS
// (ported from basidekick-site/components/pointstack/pointstack-api.ts)
// ============================================================

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

type RawPointStackPost = Partial<PointStackPost> & {
  author?: PointStackPost["author"] | PointStackPost["author"][] | null;
};

function normalizePost(post: RawPointStackPost): PointStackPost {
  const author = Array.isArray(post.author) ? post.author[0] || undefined : post.author || undefined;

  return {
    ...(post as PointStackPost),
    title: typeof post.title === "string" ? post.title : "Untitled",
    content: typeof post.content === "string" ? post.content : "",
    tags: asStringArray(post.tags),
    view_count: asNumber(post.view_count),
    upvote_count: asNumber(post.upvote_count),
    comment_count: asNumber(post.comment_count),
    author,
  };
}

function normalizePosts(posts: RawPointStackPost[] | null | undefined): PointStackPost[] {
  return (posts || []).map(normalizePost).filter((post) => !post.title.startsWith("[Example]"));
}

type RawPointStackJob = Partial<PointStackJob> & {
  company?: PointStackJob["company"] | PointStackJob["company"][] | null;
  poster?: PointStackJob["poster"] | PointStackJob["poster"][] | null;
};

function normalizeJob(job: RawPointStackJob): PointStackJob {
  const company = Array.isArray(job.company) ? job.company[0] || null : job.company || null;
  const poster = Array.isArray(job.poster) ? job.poster[0] || undefined : job.poster || undefined;

  return {
    ...(job as PointStackJob),
    title: typeof job.title === "string" ? job.title : "Untitled",
    description: typeof job.description === "string" ? job.description : "",
    company,
    poster,
  };
}

function normalizeJobs(jobs: RawPointStackJob[] | null | undefined): PointStackJob[] {
  return (jobs || []).map(normalizeJob);
}

// ============================================================
// POSTS API (read-only)
// ============================================================

export async function fetchPosts(
  client: SupabaseClient | null,
  filter?: { sort?: "recent" | "top" },
  limit = 20,
  offset = 0
): Promise<PointStackPost[]> {
  if (!client) return [];

  let query = client
    .from("pointstack_posts")
    .select(`
      *,
      author:profiles!author_id(display_name, avatar_url)
    `)
    .eq("is_published", true)
    .range(offset, offset + limit - 1);

  if (filter?.sort === "top") {
    query = query.order("upvote_count", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw error;
  return normalizePosts(data as RawPointStackPost[] | null);
}

export async function fetchPostBySlug(
  client: SupabaseClient | null,
  slug: string
): Promise<PointStackPost | null> {
  if (!client) return null;

  const { data, error } = await client
    .from("pointstack_posts")
    .select(`
      *,
      author:profiles!author_id(display_name, avatar_url)
    `)
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data ? normalizePost(data as RawPointStackPost) : null;
}

// ============================================================
// COMMENTS API (read-only)
// ============================================================

export async function fetchComments(
  client: SupabaseClient | null,
  postId: string
): Promise<PointStackPostComment[]> {
  if (!client) return [];

  const { data, error } = await client
    .from("pointstack_post_comments")
    .select(`
      *,
      author:profiles!author_id(display_name, avatar_url)
    `)
    .eq("post_id", postId)
    .order("created_at", { ascending: true })
    .limit(200);

  if (error) throw error;
  return data || [];
}

// ============================================================
// PROFILES API (read-only)
// ============================================================

export async function fetchProfiles(
  client: SupabaseClient | null,
  filter?: { search?: string },
  limit = 30,
  offset = 0
): Promise<PointStackProfile[]> {
  if (!client) return [];

  let query = client
    .from("profiles")
    .select(
      "id, username, display_name, avatar_url, skills, headline, location, availability_status, reputation_score, is_verified, post_count"
    )
    .order("reputation_score", { ascending: false })
    .range(offset, offset + limit - 1);

  if (filter?.search) {
    const sanitized = sanitizeSearchInput(filter.search);
    if (sanitized) {
      query = query.or(`display_name.ilike.%${sanitized}%,headline.ilike.%${sanitized}%`);
    }
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data as PointStackProfile[]) || [];
}

export async function fetchProfileByUsername(
  client: SupabaseClient | null,
  username: string
): Promise<PointStackProfile | null> {
  if (!client) return null;

  const decoded = decodeURIComponent(username).replace(/^@/, "");
  const { data: usernameMatch, error: usernameError } = await client
    .from("profiles")
    .select("*")
    .eq("username", decoded)
    .maybeSingle();

  if (usernameError) throw usernameError;
  if (usernameMatch) return usernameMatch as PointStackProfile;

  // Existing BASidekick profiles predate the username field and currently have
  // null usernames. Keep those profiles reachable without changing production data.
  const displayName = decoded.replaceAll("-", " ");
  const { data, error } = await client
    .from("profiles")
    .select("*")
    .ilike("display_name", displayName)
    .maybeSingle();

  if (error) throw error;
  return (data as PointStackProfile | null) ?? null;
}

export async function fetchUserPosts(
  client: SupabaseClient | null,
  userId: string,
  limit = 12
): Promise<PointStackPost[]> {
  if (!client) return [];
  const { data, error } = await client
    .from("pointstack_posts")
    .select("*, author:profiles!author_id(display_name, avatar_url)")
    .eq("author_id", userId)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return normalizePosts(data as RawPointStackPost[] | null);
}

export async function fetchUserWorkExperience(
  client: SupabaseClient | null,
  userId: string
): Promise<WorkExperience[]> {
  if (!client) return [];
  const { data, error } = await client
    .from("work_experience")
    .select("*")
    .eq("user_id", userId)
    .order("is_current", { ascending: false })
    .order("start_date", { ascending: false });
  if (error) throw error;
  return (data as WorkExperience[]) || [];
}

export async function fetchConnectionCounts(
  client: SupabaseClient | null,
  userId: string
): Promise<{ followers: number; following: number }> {
  if (!client) return { followers: 0, following: 0 };
  const [followers, following] = await Promise.all([
    client.from("pointstack_user_follows").select("*", { count: "exact", head: true }).eq("following_id", userId),
    client.from("pointstack_user_follows").select("*", { count: "exact", head: true }).eq("follower_id", userId),
  ]);
  return { followers: followers.count ?? 0, following: following.count ?? 0 };
}

// ============================================================
// JOBS API (read-only)
// ============================================================

export async function fetchJobs(
  client: SupabaseClient | null,
  filter?: { search?: string },
  limit = 20,
  offset = 0
): Promise<PointStackJob[]> {
  if (!client) return [];

  let query = client
    .from("pointstack_jobs")
    .select(`
      *,
      company:pointstack_companies!company_id(name, slug, logo_url),
      poster:profiles!posted_by(display_name)
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (filter?.search) {
    const sanitized = sanitizeSearchInput(filter.search);
    if (sanitized) {
      query = query.ilike("title", `%${sanitized}%`);
    }
  }

  const { data, error } = await query;
  if (error) throw error;
  return normalizeJobs(data as RawPointStackJob[] | null);
}

export async function fetchJobBySlug(
  client: SupabaseClient | null,
  slug: string
): Promise<PointStackJob | null> {
  if (!client) return null;

  const { data, error } = await client
    .from("pointstack_jobs")
    .select(`
      *,
      company:pointstack_companies!company_id(name, slug, logo_url),
      poster:profiles!posted_by(display_name)
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data ? normalizeJob(data as RawPointStackJob) : null;
}

// ============================================================
// COMPANIES API (read-only)
// ============================================================

export async function fetchCompanies(
  client: SupabaseClient | null,
  limit = 30,
  offset = 0
): Promise<PointStackCompany[]> {
  if (!client) return [];
  const { data, error } = await client
    .from("pointstack_companies")
    .select("*, owner:profiles!owner_id(display_name)")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return (data as PointStackCompany[]) || [];
}

export async function fetchCompanyBySlug(
  client: SupabaseClient | null,
  slug: string
): Promise<PointStackCompany | null> {
  if (!client) return null;
  const { data, error } = await client
    .from("pointstack_companies")
    .select(`
      *,
      owner:profiles!owner_id(display_name),
      members:pointstack_company_members(
        *,
        profile:profiles!user_id(display_name, avatar_url)
      )
    `)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return (data as PointStackCompany | null) ?? null;
}

export async function fetchUserCompanies(
  client: SupabaseClient | null,
  userId: string
): Promise<PointStackCompanyMember[]> {
  if (!client) return [];
  const { data, error } = await client
    .from("pointstack_company_members")
    .select(`
      *,
      company:pointstack_companies!company_id(name, slug, logo_url, is_verified)
    `)
    .eq("user_id", userId)
    .order("joined_at", { ascending: false });
  if (error) throw error;
  return (data as PointStackCompanyMember[]) || [];
}

// ============================================================
// SIGNED-IN ACTIVITY (existing RLS remains authoritative)
// ============================================================

export async function fetchNotifications(
  client: SupabaseClient | null,
  userId: string,
  limit = 50
): Promise<PointStackNotification[]> {
  if (!client) return [];
  const { data, error } = await client
    .from("pointstack_notifications")
    .select("*, actor:profiles!actor_id(display_name, avatar_url)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as PointStackNotification[]) || [];
}

export async function fetchConversations(
  client: SupabaseClient | null,
  userId: string
): Promise<PointStackConversation[]> {
  if (!client) return [];
  const { data, error } = await client
    .from("pointstack_conversation_participants")
    .select(`
      conversation:pointstack_conversations!conversation_id(
        *,
        participants:pointstack_conversation_participants(
          *,
          profile:profiles!user_id(display_name, avatar_url)
        )
      )
    `)
    .eq("user_id", userId);
  if (error) throw error;
  return ((data || []) as unknown as { conversation: PointStackConversation | null }[])
    .map((item) => item.conversation)
    .filter((item): item is PointStackConversation => Boolean(item))
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
}

export async function fetchMessages(
  client: SupabaseClient | null,
  conversationId: string
): Promise<PointStackMessage[]> {
  if (!client) return [];
  const { data, error } = await client
    .from("pointstack_messages")
    .select("*, sender:profiles!sender_id(display_name, avatar_url)")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data as PointStackMessage[]) || [];
}
