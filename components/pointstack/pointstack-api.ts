import { getClient } from "@/lib/supabase/client";
import {
  PointStackPost,
  PointStackPostComment,
  PointStackJob,
  PointStackResourceListing,
  PointStackResourceComment,
  PointStackCompany,
  PointStackCompanyJoinRequest,
  PointStackNotification,
  PointStackNotificationType,
  PointStackConversation,
  PointStackMessage,
  PointStackProfile,
  PointStackFeedFilter,
  PointStackJoinRequestStatus,
  CreatePointStackPostInput,
  CreatePointStackCommentInput,
  CreatePointStackJobInput,
  CreatePointStackResourceInput,
  UpdatePointStackProfileInput,
  ActivityItem,
  BabelContribution,
  EquipmentSubmission,
  EquipmentNote,
  WikiArticle,
} from "@/lib/types";
import { ROUTES, getPointStackPostRoute } from "@/lib/routes";
import { User } from "@supabase/supabase-js";

interface UpdatePointStackCompanyInput {
  name?: string;
  description?: string | null;
  website_url?: string | null;
  location?: string | null;
  size_range?: "1-10" | "11-50" | "51-200" | "201-500" | "500+" | null;
  industry?: string | null;
  logo_url?: string | null;
}

// ============================================================
// AUTH HELPERS
// ============================================================

/** Require authentication, throws if not authenticated */
async function requireAuth(): Promise<User> {
  const supabase = getClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Your session has expired. Please sign in again.");
  return user;
}

/** Verify user owns a post */
async function verifyPostOwnership(postId: string, userId: string): Promise<void> {
  const supabase = getClient();
  const { data } = await supabase
    .from("pointstack_posts")
    .select("author_id")
    .eq("id", postId)
    .single();
  if (!data || data.author_id !== userId) {
    throw new Error("Not authorized to modify this post");
  }
}

/** Verify user owns a comment */
async function verifyCommentOwnership(commentId: string, userId: string): Promise<void> {
  const supabase = getClient();
  const { data } = await supabase
    .from("pointstack_post_comments")
    .select("author_id")
    .eq("id", commentId)
    .single();
  if (!data || data.author_id !== userId) {
    throw new Error("Not authorized to modify this comment");
  }
}

/** Verify user owns a notification */
async function verifyNotificationOwnership(notificationId: string, userId: string): Promise<void> {
  const supabase = getClient();
  const { data } = await supabase
    .from("pointstack_notifications")
    .select("user_id")
    .eq("id", notificationId)
    .single();
  if (!data || data.user_id !== userId) {
    throw new Error("Not authorized to modify this notification");
  }
}

/** Verify user is participant in conversation */
async function verifyConversationParticipant(conversationId: string, userId: string): Promise<void> {
  const supabase = getClient();
  const { data } = await supabase
    .from("pointstack_conversation_participants")
    .select("user_id")
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
    .single();
  if (!data) {
    throw new Error("Not authorized to access this conversation");
  }
}

/** Verify user can manage company details (owner/admin) */
async function verifyCompanyManager(companyId: string, userId: string): Promise<void> {
  const supabase = getClient();

  const { data: company, error: companyError } = await supabase
    .from("pointstack_companies")
    .select("owner_id")
    .eq("id", companyId)
    .single();

  if (companyError) throw companyError;
  if (company?.owner_id === userId) return;

  const { data: membership, error: membershipError } = await supabase
    .from("pointstack_company_members")
    .select("role")
    .eq("company_id", companyId)
    .eq("user_id", userId)
    .maybeSingle();

  if (membershipError && !isNotFoundError(membershipError)) throw membershipError;
  if (membership?.role === "admin") return;

  throw new Error("Not authorized to modify this company");
}

/** Sanitize search input to escape SQL LIKE wildcards */
function sanitizeSearchInput(input: string): string {
  return input
    .replace(/[%_]/g, "\\$&") // Escape LIKE wildcards
    .slice(0, 100); // Limit length
}

function isNotFoundError(error: { code?: string } | null): boolean {
  return error?.code === "PGRST116";
}

/** Enrich posts with the current user's vote from pointstack_post_votes */
async function enrichPostsWithUserVotes(posts: PointStackPost[]): Promise<PointStackPost[]> {
  if (posts.length === 0) return posts;
  const supabase = getClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return posts;

  const ids = posts.map((p) => p.id);
  const { data: votes } = await supabase
    .from("pointstack_post_votes")
    .select("post_id, vote_type")
    .eq("user_id", user.id)
    .in("post_id", ids);

  if (!votes || votes.length === 0) return posts;

  const voteMap = new Map<string, number>(votes.map((v: { post_id: string; vote_type: number }) => [v.post_id, v.vote_type]));
  return posts.map((p) => ({ ...p, user_vote: voteMap.get(p.id) ?? null }));
}

/** Enrich comments with the current user's vote from pointstack_comment_votes */
async function enrichCommentsWithUserVotes(comments: PointStackPostComment[]): Promise<PointStackPostComment[]> {
  if (comments.length === 0) return comments;
  const supabase = getClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return comments;

  const ids = comments.map((c) => c.id);
  const { data: votes } = await supabase
    .from("pointstack_comment_votes")
    .select("comment_id, vote_type")
    .eq("user_id", user.id)
    .in("comment_id", ids);

  if (!votes || votes.length === 0) return comments;

  const voteMap = new Map<string, number>(votes.map((v: { comment_id: string; vote_type: number }) => [v.comment_id, v.vote_type]));
  return comments.map((c) => ({ ...c, user_vote: voteMap.get(c.id) ?? null }));
}

interface CreateNotificationInput {
  userId: string;
  actorId: string;
  type: PointStackNotificationType;
  title: string;
  body?: string | null;
  link?: string | null;
  metadata?: Record<string, unknown>;
}

async function createNotification({
  userId,
  actorId,
  type,
  title,
  body = null,
  link = null,
  metadata = {},
}: CreateNotificationInput): Promise<void> {
  if (!userId || userId === actorId) return;

  const supabase = getClient();
  const { error } = await supabase
    .from("pointstack_notifications")
    .insert({
      user_id: userId,
      actor_id: actorId,
      type,
      title,
      body,
      link,
      metadata,
    });

  if (error) throw error;
}

async function fetchProfileDisplayName(userId: string): Promise<string | null> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", userId)
    .single();
  if (error) return null;
  return data?.display_name ?? null;
}

type RawPointStackPost = Partial<PointStackPost> & {
  author?: PointStackPost["author"] | PointStackPost["author"][] | null;
  company?: PointStackPost["company"] | PointStackPost["company"][] | null;
};

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function normalizeResourceListing(resource: PointStackResourceListing): PointStackResourceListing {
  return {
    ...resource,
    preview_images: asStringArray((resource as { preview_images?: unknown }).preview_images),
    tags: asStringArray((resource as { tags?: unknown }).tags),
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizePost(post: RawPointStackPost): PointStackPost {
  const author = Array.isArray(post.author) ? post.author[0] || undefined : post.author || undefined;
  const company = Array.isArray(post.company) ? post.company[0] || null : post.company || null;

  return {
    ...(post as PointStackPost),
    title: typeof post.title === "string" ? post.title : "Untitled",
    content: typeof post.content === "string" ? post.content : "",
    tags: asStringArray(post.tags),
    equipment_ids: asStringArray(post.equipment_ids),
    images: asStringArray(post.images),
    documents: asStringArray(post.documents),
    building_types: asStringArray(post.building_types),
    systems: asStringArray(post.systems),
    technologies: asStringArray(post.technologies),
    view_count: asNumber(post.view_count),
    upvote_count: asNumber(post.upvote_count),
    comment_count: asNumber(post.comment_count),
    metadata: asRecord(post.metadata),
    author,
    company,
  };
}

function normalizePosts(posts: RawPointStackPost[] | null | undefined): PointStackPost[] {
  return (posts || []).map(normalizePost);
}

// Helper to generate URL-friendly slugs with cryptographic randomness
function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 50);
  // Use crypto for better randomness
  const array = new Uint8Array(6);
  crypto.getRandomValues(array);
  const suffix = Array.from(array, b => b.toString(36)).join("").slice(0, 8);
  return `${base}-${suffix}`;
}

// ============================================================
// POSTS API
// ============================================================

export async function fetchPosts(
  filter?: PointStackFeedFilter,
  limit = 20,
  offset = 0
): Promise<PointStackPost[]> {
  const supabase = getClient();

  let query = supabase
    .from("pointstack_posts")
    .select(`
      *,
      author:profiles!author_id(display_name, avatar_url)
    `)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (filter?.type) {
    query = query.eq("post_type", filter.type);
  }

  if (filter?.tags && filter.tags.length > 0) {
    query = query.contains("tags", filter.tags);
  }

  if (filter?.sortBy === "popular") {
    query = query.order("upvote_count", { ascending: false });
  } else if (filter?.sortBy === "unanswered") {
    query = query.eq("post_type", "question").eq("comment_count", 0);
  }

  const { data, error } = await query;
  if (error) throw error;
  return enrichPostsWithUserVotes(normalizePosts(data as RawPointStackPost[] | null));
}

export async function fetchPostBySlug(slug: string): Promise<PointStackPost | null> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("pointstack_posts")
    .select(`
      *,
      author:profiles!author_id(display_name, avatar_url)
    `)
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  if (!data) return null;
  const post = normalizePost(data as RawPointStackPost);
  const [enriched] = await enrichPostsWithUserVotes([post]);
  return enriched;
}

export async function createPost(input: CreatePointStackPostInput): Promise<PointStackPost> {
  const supabase = getClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Your session has expired. Please sign in again.");

  const slug = generateSlug(input.title);

  const { data, error } = await supabase
    .from("pointstack_posts")
    .insert({
      author_id: user.id,
      post_type: input.post_type,
      title: input.title,
      content: input.content,
      slug,
      tags: input.tags || [],
      equipment_ids: input.equipment_ids || [],
      is_showcase: input.is_showcase || false,
      cover_image_url: input.cover_image_url || null,
      images: input.images || [],
      documents: input.documents || [],
      building_types: input.building_types || [],
      systems: input.systems || [],
      technologies: input.technologies || [],
      location: input.location || null,
      completion_date: input.completion_date || null,
      square_footage: input.square_footage || null,
      company_id: input.company_id || null,
      is_featured: input.is_featured || false,
      metadata: input.metadata || {},
    })
    .select(`
      *,
      author:profiles!author_id(display_name, avatar_url)
    `)
    .single();

  if (error) throw error;
  return normalizePost(data as RawPointStackPost);
}

export async function updatePost(
  postId: string,
  updates: Partial<CreatePointStackPostInput>
): Promise<PointStackPost> {
  const user = await requireAuth();
  await verifyPostOwnership(postId, user.id);

  const supabase = getClient();
  const { data, error } = await supabase
    .from("pointstack_posts")
    .update(updates)
    .eq("id", postId)
    .select(`
      *,
      author:profiles!author_id(display_name, avatar_url)
    `)
    .single();

  if (error) throw error;
  return normalizePost(data as RawPointStackPost);
}

export async function deletePost(postId: string): Promise<void> {
  const user = await requireAuth();
  await verifyPostOwnership(postId, user.id);

  const supabase = getClient();
  const { error } = await supabase.from("pointstack_posts").delete().eq("id", postId);
  if (error) throw error;
}

export async function votePost(postId: string, voteType: 1 | -1): Promise<void> {
  const supabase = getClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Your session has expired. Please sign in again.");

  // Check existing vote
  const { data: existingVote } = await supabase
    .from("pointstack_post_votes")
    .select("vote_type")
    .eq("user_id", user.id)
    .eq("post_id", postId)
    .single();

  const shouldNotifyLike = voteType === 1 && (!existingVote || existingVote.vote_type !== 1);

  if (existingVote) {
    if (existingVote.vote_type === voteType) {
      // Remove vote
      await supabase
        .from("pointstack_post_votes")
        .delete()
        .eq("user_id", user.id)
        .eq("post_id", postId);
    } else {
      // Update vote
      await supabase
        .from("pointstack_post_votes")
        .update({ vote_type: voteType })
        .eq("user_id", user.id)
        .eq("post_id", postId);
    }
  } else {
    // Insert new vote
    await supabase.from("pointstack_post_votes").insert({
      user_id: user.id,
      post_id: postId,
      vote_type: voteType,
    });
  }

  if (shouldNotifyLike) {
    try {
      const { data: post } = await supabase
        .from("pointstack_posts")
        .select("author_id, title, slug, post_type")
        .eq("id", postId)
        .single();

      if (post?.author_id && post.author_id !== user.id) {
        await createNotification({
          userId: post.author_id,
          actorId: user.id,
          type: "like",
          title: "New like on your post",
          body: post.title || null,
          link: post.slug ? getPointStackPostRoute(post.post_type || "discussion", post.slug) : null,
          metadata: { post_id: postId },
        });
      }
    } catch (notifyError) {
      console.error("Error creating like notification:", notifyError);
    }
  }
}

export async function incrementPostViewCount(postId: string): Promise<void> {
  const supabase = getClient();
  await supabase.rpc("increment_post_view_count", { post_id: postId }).catch(() => {
    // Fallback if RPC doesn't exist
  });
}

/** Fetch posts authored by a specific user */
export async function fetchUserPosts(userId: string, limit = 20, offset = 0): Promise<PointStackPost[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("pointstack_posts")
    .select(`
      *,
      author:profiles!author_id(display_name, avatar_url)
    `)
    .eq("author_id", userId)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return enrichPostsWithUserVotes(normalizePosts(data as RawPointStackPost[] | null));
}

// ============================================================
// COMMENTS API
// ============================================================

export async function fetchComments(postId: string, limit = 200): Promise<PointStackPostComment[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("pointstack_post_comments")
    .select(`
      *,
      author:profiles!author_id(display_name, avatar_url)
    `)
    .eq("post_id", postId)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return enrichCommentsWithUserVotes(data || []);
}

export async function createComment(input: CreatePointStackCommentInput): Promise<PointStackPostComment> {
  const supabase = getClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Your session has expired. Please sign in again.");

  const { data, error } = await supabase
    .from("pointstack_post_comments")
    .insert({
      post_id: input.post_id,
      author_id: user.id,
      content: input.content,
      parent_id: input.parent_id || null,
    })
    .select(`
      *,
      author:profiles!author_id(display_name, avatar_url)
    `)
    .single();

  if (error) throw error;

  try {
    const { data: post } = await supabase
      .from("pointstack_posts")
      .select("author_id, title, slug, post_type")
      .eq("id", input.post_id)
      .single();

    let parentAuthorId: string | null = null;
    if (input.parent_id) {
      const { data: parent } = await supabase
        .from("pointstack_post_comments")
        .select("author_id")
        .eq("id", input.parent_id)
        .single();
      parentAuthorId = parent?.author_id ?? null;
    }

    const recipients = new Map<string, string>();
    if (post?.author_id && post.author_id !== user.id) {
      recipients.set(post.author_id, "New comment on your post");
    }
    if (parentAuthorId && parentAuthorId !== user.id) {
      recipients.set(parentAuthorId, "New reply to your comment");
    }

    const link = post?.slug
      ? getPointStackPostRoute(post.post_type || "discussion", post.slug)
      : null;
    const body = data.content ? data.content.slice(0, 200) : null;

    for (const [recipientId, title] of recipients) {
      await createNotification({
        userId: recipientId,
        actorId: user.id,
        type: "reply",
        title,
        body,
        link,
        metadata: {
          post_id: input.post_id,
          comment_id: data.id,
          parent_id: input.parent_id || null,
        },
      });
    }
  } catch (notifyError) {
    console.error("Error creating comment notification:", notifyError);
  }

  return data;
}

export async function updateComment(commentId: string, content: string): Promise<PointStackPostComment> {
  const user = await requireAuth();
  await verifyCommentOwnership(commentId, user.id);

  const supabase = getClient();
  const { data, error } = await supabase
    .from("pointstack_post_comments")
    .update({ content })
    .eq("id", commentId)
    .select(`
      *,
      author:profiles!author_id(display_name, avatar_url)
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteComment(commentId: string): Promise<void> {
  const user = await requireAuth();
  await verifyCommentOwnership(commentId, user.id);

  const supabase = getClient();
  const { error } = await supabase.from("pointstack_post_comments").delete().eq("id", commentId);
  if (error) throw error;
}

export async function acceptAnswer(commentId: string, postId: string): Promise<void> {
  const user = await requireAuth();
  // Only the post author can accept answers
  await verifyPostOwnership(postId, user.id);

  const supabase = getClient();
  // First, unaccept any existing accepted answer
  await supabase
    .from("pointstack_post_comments")
    .update({ is_accepted: false })
    .eq("post_id", postId);
  // Then accept this answer
  const { error } = await supabase
    .from("pointstack_post_comments")
    .update({ is_accepted: true })
    .eq("id", commentId);
  if (error) throw error;

  try {
    const { data } = await supabase
      .from("pointstack_post_comments")
      .select("author_id, post:pointstack_posts!post_id(title, slug, post_type)")
      .eq("id", commentId)
      .single();

    const recipientId = data?.author_id;
    const post = (
      data?.post as { title?: string | null; slug?: string | null; post_type?: string | null } | null
    ) ?? null;

    if (recipientId && recipientId !== user.id) {
      await createNotification({
        userId: recipientId,
        actorId: user.id,
        type: "answer_accepted",
        title: "Your answer was accepted",
        body: post?.title || null,
        link: post?.slug
          ? getPointStackPostRoute(post.post_type || "discussion", post.slug)
          : null,
        metadata: { post_id: postId, comment_id: commentId },
      });
    }
  } catch (notifyError) {
    console.error("Error creating accepted answer notification:", notifyError);
  }
}

export async function voteComment(commentId: string, voteType: 1 | -1): Promise<void> {
  const supabase = getClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Your session has expired. Please sign in again.");

  const { data: existingVote } = await supabase
    .from("pointstack_comment_votes")
    .select("vote_type")
    .eq("user_id", user.id)
    .eq("comment_id", commentId)
    .single();

  if (existingVote) {
    if (existingVote.vote_type === voteType) {
      await supabase
        .from("pointstack_comment_votes")
        .delete()
        .eq("user_id", user.id)
        .eq("comment_id", commentId);
    } else {
      await supabase
        .from("pointstack_comment_votes")
        .update({ vote_type: voteType })
        .eq("user_id", user.id)
        .eq("comment_id", commentId);
    }
  } else {
    await supabase.from("pointstack_comment_votes").insert({
      user_id: user.id,
      comment_id: commentId,
      vote_type: voteType,
    });
  }
}

// ============================================================
// PROFILES API
// ============================================================

export async function fetchProfiles(
  search?: string,
  skills?: string[],
  limit = 20,
  offset = 0
): Promise<PointStackProfile[]> {
  const supabase = getClient();
  let query = supabase
    .from("profiles")
    .select("id, display_name, avatar_url, skills, headline, location, availability_status, reputation_score, is_verified, post_count")
    .order("reputation_score", { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    const sanitizedSearch = sanitizeSearchInput(search);
    query = query.or(`display_name.ilike.%${sanitizedSearch}%,headline.ilike.%${sanitizedSearch}%`);
  }

  if (skills && skills.length > 0) {
    query = query.contains("skills", skills);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as PointStackProfile[];
}

export async function fetchProfileByUsername(username: string): Promise<PointStackProfile | null> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("display_name", username)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as PointStackProfile;
}

export async function fetchProfileById(userId: string): Promise<PointStackProfile | null> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as PointStackProfile;
}

export async function updateProfile(updates: UpdatePointStackProfileInput): Promise<PointStackProfile> {
  const supabase = getClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Your session has expired. Please sign in again.");

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .select("*")
    .single();

  if (error) throw error;
  return data as PointStackProfile;
}

export async function completeOnboarding(): Promise<void> {
  const supabase = getClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Your session has expired. Please sign in again.");

  const { error } = await supabase
    .from("profiles")
    .update({ onboarding_completed: true })
    .eq("id", user.id);

  if (error) throw error;
}

// ============================================================
// FOLLOWS API
// ============================================================

export async function followUser(userId: string): Promise<void> {
  const supabase = getClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Your session has expired. Please sign in again.");

  const { error } = await supabase.from("pointstack_user_follows").insert({
    follower_id: user.id,
    following_id: userId,
  });

  if (error && error.code !== "23505") throw error; // Ignore duplicate key error

  if (!error) {
    try {
      const displayName = await fetchProfileDisplayName(user.id);
      await createNotification({
        userId,
        actorId: user.id,
        type: "follow",
        title: "New follower",
        body: "Someone started following you.",
        link: displayName ? ROUTES.POINTSTACK_PROFILE(displayName) : null,
        metadata: { follower_id: user.id },
      });
    } catch (notifyError) {
      console.error("Error creating follow notification:", notifyError);
    }
  }
}

export async function unfollowUser(userId: string): Promise<void> {
  const supabase = getClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Your session has expired. Please sign in again.");

  const { error } = await supabase
    .from("pointstack_user_follows")
    .delete()
    .eq("follower_id", user.id)
    .eq("following_id", userId);

  if (error) throw error;
}

export async function isFollowing(userId: string): Promise<boolean> {
  const supabase = getClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from("pointstack_user_follows")
    .select("follower_id")
    .eq("follower_id", user.id)
    .eq("following_id", userId)
    .single();

  if (error) return false;
  return !!data;
}

/** Batch check if current user follows multiple users in one query */
export async function isFollowingBatch(userIds: string[]): Promise<Record<string, boolean>> {
  const supabase = getClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || userIds.length === 0) return {};

  const idsToCheck = userIds.filter((id) => id !== user.id);
  if (idsToCheck.length === 0) return {};

  const { data, error } = await supabase
    .from("pointstack_user_follows")
    .select("following_id")
    .eq("follower_id", user.id)
    .in("following_id", idsToCheck);

  if (error) return {};

  const followingSet = new Set((data || []).map((r: { following_id: string }) => r.following_id));
  const result: Record<string, boolean> = {};
  for (const id of idsToCheck) {
    result[id] = followingSet.has(id);
  }
  return result;
}

export async function getFollowerCount(userId: string): Promise<number> {
  const supabase = getClient();
  const { count, error } = await supabase
    .from("pointstack_user_follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", userId);

  if (error) return 0;
  return count || 0;
}

export async function getFollowingCount(userId: string): Promise<number> {
  const supabase = getClient();
  const { count, error } = await supabase
    .from("pointstack_user_follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", userId);

  if (error) return 0;
  return count || 0;
}

// ============================================================
// COMPANIES API
// ============================================================

export async function fetchCompanies(search?: string, limit = 20, offset = 0): Promise<PointStackCompany[]> {
  const supabase = getClient();
  let query = supabase
    .from("pointstack_companies")
    .select(`
      *,
      owner:profiles!owner_id(display_name)
    `)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    const sanitizedSearch = sanitizeSearchInput(search);
    query = query.ilike("name", `%${sanitizedSearch}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function fetchCompanyBySlug(slug: string): Promise<PointStackCompany | null> {
  const supabase = getClient();
  const { data, error } = await supabase
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
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as PointStackCompany;
}

export async function createCompany(name: string, description?: string): Promise<PointStackCompany> {
  const supabase = getClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Your session has expired. Please sign in again.");

  const slug = generateSlug(name);

  const { data, error } = await supabase
    .from("pointstack_companies")
    .insert({
      name,
      slug,
      description,
      owner_id: user.id,
    })
    .select("*")
    .single();

  if (error) throw error;

  // Add owner as member
  const { error: memberError } = await supabase.from("pointstack_company_members").insert({
    company_id: data.id,
    user_id: user.id,
    role: "owner",
  });

  if (memberError) {
    const { error: rollbackError } = await supabase
      .from("pointstack_companies")
      .delete()
      .eq("id", data.id);

    if (rollbackError) {
      throw new Error(
        `Failed to add company owner member (${memberError.message}). Failed to rollback company (${rollbackError.message}).`
      );
    }

    throw memberError;
  }

  return data;
}

export async function fetchUserCompanies(userId: string): Promise<PointStackCompany[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("pointstack_company_members")
    .select(`
      role,
      company:pointstack_companies(
        id, name, slug, logo_url, description, website_url, industry, location, size_range, owner_id, is_verified, invite_code, created_at, updated_at
      )
    `)
    .eq("user_id", userId);

  if (error) throw error;
  if (!data) return [];

  return data
    .filter((row: { role: string; company: PointStackCompany | null }) => row.company)
    .map((row: { role: string; company: PointStackCompany }) => ({
      ...row.company,
      _memberRole: row.role,
    }) as PointStackCompany & { _memberRole: string });
}

export async function updateCompany(
  companyId: string,
  updates: UpdatePointStackCompanyInput
): Promise<PointStackCompany> {
  const user = await requireAuth();
  await verifyCompanyManager(companyId, user.id);

  const payload: Record<string, unknown> = {};
  if ("name" in updates && updates.name !== undefined) payload.name = updates.name.trim();
  if ("description" in updates) payload.description = updates.description?.trim() || null;
  if ("website_url" in updates) payload.website_url = updates.website_url?.trim() || null;
  if ("location" in updates) payload.location = updates.location?.trim() || null;
  if ("size_range" in updates) payload.size_range = updates.size_range ?? null;
  if ("industry" in updates) payload.industry = updates.industry?.trim() || null;
  if ("logo_url" in updates) payload.logo_url = updates.logo_url?.trim() || null;

  if (Object.keys(payload).length === 0) {
    const supabase = getClient();
    const { data, error } = await supabase
      .from("pointstack_companies")
      .select(`
        *,
        owner:profiles!owner_id(display_name),
        members:pointstack_company_members(
          *,
          profile:profiles!user_id(display_name, avatar_url)
        )
      `)
      .eq("id", companyId)
      .single();

    if (error) throw error;
    return data as PointStackCompany;
  }

  const supabase = getClient();
  const { data, error } = await supabase
    .from("pointstack_companies")
    .update(payload)
    .eq("id", companyId)
    .select(`
      *,
      owner:profiles!owner_id(display_name),
      members:pointstack_company_members(
        *,
        profile:profiles!user_id(display_name, avatar_url)
      )
    `)
    .single();

  if (error) throw error;
  return data as PointStackCompany;
}

export async function fetchCompanyProjects(
  companyId: string,
  limit = 20,
  offset = 0
): Promise<PointStackPost[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("pointstack_posts")
    .select(`
      *,
      author:profiles!author_id(display_name, avatar_url),
      company:pointstack_companies!company_id(name, slug)
    `)
    .eq("company_id", companyId)
    .eq("post_type", "project")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return normalizePosts(data as RawPointStackPost[] | null);
}

export async function fetchCompanyJobs(
  companyId: string,
  limit = 20,
  offset = 0
): Promise<PointStackJob[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("pointstack_jobs")
    .select(`
      *,
      company:pointstack_companies!company_id(name, slug, logo_url),
      poster:profiles!posted_by(display_name)
    `)
    .eq("company_id", companyId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data || [];
}

export async function requestToJoinCompany(
  companyId: string,
  message?: string
): Promise<PointStackCompanyJoinRequest> {
  const user = await requireAuth();
  const supabase = getClient();

  const { data: existingMember, error: existingMemberError } = await supabase
    .from("pointstack_company_members")
    .select("id")
    .eq("company_id", companyId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingMemberError && !isNotFoundError(existingMemberError)) throw existingMemberError;
  if (existingMember) throw new Error("You are already a member of this company");

  const { data: existingRequest, error: existingRequestError } = await supabase
    .from("pointstack_company_join_requests")
    .select("id, status")
    .eq("company_id", companyId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingRequestError && !isNotFoundError(existingRequestError)) throw existingRequestError;
  if (existingRequest?.status === "pending") {
    throw new Error("You already have a pending request to join this company");
  }
  if (existingRequest) {
    throw new Error("You have already submitted a join request for this company");
  }

  const cleanMessage = message?.trim();
  const { data, error } = await supabase
    .from("pointstack_company_join_requests")
    .insert({
      company_id: companyId,
      user_id: user.id,
      message: cleanMessage || null,
      status: "pending",
    })
    .select(`
      *,
      user:profiles!user_id(display_name, avatar_url),
      reviewer:profiles!reviewed_by(display_name, avatar_url)
    `)
    .single();

  if (error) throw error;
  return data as PointStackCompanyJoinRequest;
}

export async function fetchJoinRequests(
  companyId: string,
  statusFilter?: PointStackJoinRequestStatus
): Promise<PointStackCompanyJoinRequest[]> {
  await requireAuth();
  const supabase = getClient();

  let query = supabase
    .from("pointstack_company_join_requests")
    .select(`
      *,
      user:profiles!user_id(display_name, avatar_url),
      reviewer:profiles!reviewed_by(display_name, avatar_url)
    `)
    .eq("company_id", companyId)
    .order("created_at", { ascending: true });

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as PointStackCompanyJoinRequest[];
}

export async function approveJoinRequest(requestId: string): Promise<PointStackCompanyJoinRequest> {
  const user = await requireAuth();
  const supabase = getClient();

  const { data: request, error: requestError } = await supabase
    .from("pointstack_company_join_requests")
    .select(`
      id,
      company_id,
      user_id,
      status,
      company:pointstack_companies!company_id(name, slug)
    `)
    .eq("id", requestId)
    .single();

  if (requestError) throw requestError;
  if (request.status !== "pending") {
    throw new Error("Join request has already been reviewed");
  }

  const { data: updatedRequest, error: updateError } = await supabase
    .from("pointstack_company_join_requests")
    .update({
      status: "approved",
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", requestId)
    .select(`
      *,
      user:profiles!user_id(display_name, avatar_url),
      reviewer:profiles!reviewed_by(display_name, avatar_url)
    `)
    .single();

  if (updateError) throw updateError;

  const { data: existingMembership, error: existingMembershipError } = await supabase
    .from("pointstack_company_members")
    .select("id")
    .eq("company_id", request.company_id)
    .eq("user_id", request.user_id)
    .maybeSingle();

  if (existingMembershipError && !isNotFoundError(existingMembershipError)) {
    throw existingMembershipError;
  }

  if (!existingMembership) {
    const { error: memberError } = await supabase
      .from("pointstack_company_members")
      .insert({
        company_id: request.company_id,
        user_id: request.user_id,
        role: "member",
      });

    if (memberError) {
      const { error: rollbackError } = await supabase
        .from("pointstack_company_join_requests")
        .update({
          status: "pending",
          reviewed_by: null,
          reviewed_at: null,
        })
        .eq("id", requestId);

      if (rollbackError) {
        throw new Error(
          `Failed to add company member (${memberError.message}). Failed to rollback join request (${rollbackError.message}).`
        );
      }

      throw memberError;
    }
  }

  const company = (request.company as { name?: string | null; slug?: string | null } | null) ?? null;
  try {
    await createNotification({
      userId: request.user_id,
      actorId: user.id,
      type: "system",
      title: "Your join request was approved",
      body: company?.name ? `You are now a member of ${company.name}.` : null,
      link: company?.slug ? ROUTES.POINTSTACK_COMPANY(company.slug) : null,
      metadata: {
        company_id: request.company_id,
        join_request_id: requestId,
        status: "approved",
      },
    });
  } catch (notifyError) {
    console.error("Error creating join request approval notification:", notifyError);
  }

  return updatedRequest as PointStackCompanyJoinRequest;
}

export async function rejectJoinRequest(requestId: string): Promise<PointStackCompanyJoinRequest> {
  const user = await requireAuth();
  const supabase = getClient();

  const { data: request, error: requestError } = await supabase
    .from("pointstack_company_join_requests")
    .select("id, status")
    .eq("id", requestId)
    .single();

  if (requestError) throw requestError;
  if (request.status !== "pending") {
    throw new Error("Join request has already been reviewed");
  }

  const { data, error } = await supabase
    .from("pointstack_company_join_requests")
    .update({
      status: "rejected",
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", requestId)
    .select(`
      *,
      user:profiles!user_id(display_name, avatar_url),
      reviewer:profiles!reviewed_by(display_name, avatar_url)
    `)
    .single();

  if (error) throw error;
  return data as PointStackCompanyJoinRequest;
}

export async function getUserJoinRequestStatus(
  companyId: string
): Promise<PointStackCompanyJoinRequest | null> {
  const supabase = getClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("pointstack_company_join_requests")
    .select(`
      *,
      reviewer:profiles!reviewed_by(display_name, avatar_url),
      company:pointstack_companies!company_id(name, slug)
    `)
    .eq("company_id", companyId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    if (isNotFoundError(error)) return null;
    throw error;
  }

  return (data as PointStackCompanyJoinRequest | null) ?? null;
}

export async function cancelJoinRequest(requestId: string): Promise<void> {
  const user = await requireAuth();
  const supabase = getClient();

  const { error } = await supabase
    .from("pointstack_company_join_requests")
    .delete()
    .eq("id", requestId)
    .eq("user_id", user.id)
    .eq("status", "pending");

  if (error) throw error;
}

// ============================================================
// SHOWCASE PROJECTS API
// ============================================================

export async function fetchShowcaseProjects(
  filter?: { buildingTypes?: string[]; systems?: string[]; technologies?: string[] },
  limit = 20,
  offset = 0
): Promise<PointStackPost[]> {
  const supabase = getClient();
  let query = supabase
    .from("pointstack_posts")
    .select(`
      *,
      author:profiles!author_id(display_name, avatar_url),
      company:pointstack_companies!company_id(name, slug)
    `)
    .eq("post_type", "project")
    .eq("is_showcase", true)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (filter?.buildingTypes?.length) {
    query = query.contains("building_types", filter.buildingTypes);
  }
  if (filter?.systems?.length) {
    query = query.contains("systems", filter.systems);
  }
  if (filter?.technologies?.length) {
    query = query.contains("technologies", filter.technologies);
  }

  const { data, error } = await query;
  if (error) throw error;
  return normalizePosts(data as RawPointStackPost[] | null);
}

export async function fetchShowcaseProjectBySlug(slug: string): Promise<PointStackPost | null> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("pointstack_posts")
    .select(`
      *,
      author:profiles!author_id(display_name, avatar_url),
      company:pointstack_companies!company_id(name, slug)
    `)
    .eq("slug", slug)
    .eq("post_type", "project")
    .eq("is_showcase", true)
    .eq("is_published", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data ? normalizePost(data as RawPointStackPost) : null;
}


// ============================================================
// JOBS API
// ============================================================

export async function fetchJobs(
  filter?: { jobType?: string; isRemote?: boolean; experienceLevel?: string },
  limit = 20,
  offset = 0
): Promise<PointStackJob[]> {
  const supabase = getClient();
  let query = supabase
    .from("pointstack_jobs")
    .select(`
      *,
      company:pointstack_companies!company_id(name, slug, logo_url),
      poster:profiles!posted_by(display_name)
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (filter?.jobType) {
    query = query.eq("job_type", filter.jobType);
  }
  if (filter?.isRemote !== undefined) {
    query = query.eq("is_remote", filter.isRemote);
  }
  if (filter?.experienceLevel) {
    query = query.eq("experience_level", filter.experienceLevel);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function fetchJobBySlug(slug: string): Promise<PointStackJob | null> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("pointstack_jobs")
    .select(`
      *,
      company:pointstack_companies!company_id(name, slug, logo_url),
      poster:profiles!posted_by(display_name)
    `)
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data;
}

export async function createJob(input: CreatePointStackJobInput): Promise<PointStackJob> {
  const supabase = getClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Your session has expired. Please sign in again.");

  const slug = generateSlug(input.title);

  const { data, error } = await supabase
    .from("pointstack_jobs")
    .insert({
      posted_by: user.id,
      title: input.title,
      slug,
      description: input.description,
      requirements: input.requirements,
      job_type: input.job_type,
      experience_level: input.experience_level,
      location: input.location,
      is_remote: input.is_remote || false,
      salary_min: input.salary_min,
      salary_max: input.salary_max,
      salary_currency: input.salary_currency || "USD",
      application_url: input.application_url,
      application_email: input.application_email,
      company_id: input.company_id,
    })
    .select(`
      *,
      company:pointstack_companies!company_id(name, slug, logo_url)
    `)
    .single();

  if (error) throw error;
  return data;
}

// ============================================================
// RESOURCES API
// ============================================================

export async function fetchResources(
  category?: string,
  limit = 20,
  offset = 0
): Promise<PointStackResourceListing[]> {
  const supabase = getClient();
  let query = supabase
    .from("pointstack_resource_listings")
    .select(`
      *,
      author:profiles!author_id(display_name, avatar_url)
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return ((data || []) as PointStackResourceListing[]).map(normalizeResourceListing);
}

export async function fetchResourceBySlug(slug: string): Promise<PointStackResourceListing | null> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("pointstack_resource_listings")
    .select(`
      *,
      author:profiles!author_id(display_name, avatar_url)
    `)
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return normalizeResourceListing(data as PointStackResourceListing);
}

export async function createResource(input: CreatePointStackResourceInput): Promise<PointStackResourceListing> {
  const supabase = getClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Your session has expired. Please sign in again.");

  const slug = generateSlug(input.title);

  const { data, error } = await supabase
    .from("pointstack_resource_listings")
    .insert({
      author_id: user.id,
      title: input.title,
      slug,
      description: input.description,
      category: input.category,
      tags: input.tags || [],
      preview_images: input.preview_images || [],
      file_url: input.file_url,
      is_free: input.is_free ?? true,
      external_link: input.external_link,
    })
    .select(`
      *,
      author:profiles!author_id(display_name, avatar_url)
    `)
    .single();

  if (error) throw error;
  return normalizeResourceListing(data as PointStackResourceListing);
}

export async function incrementResourceDownloadCount(resourceId: string): Promise<void> {
  const supabase = getClient();
  // Try atomic RPC increment first, fallback to read-then-write
  const { error: rpcError } = await supabase.rpc("increment_resource_download_count", {
    resource_id: resourceId,
  });

  if (!rpcError) return;

  // Fallback: read-then-write (not atomic under concurrency)
  const { data } = await supabase
    .from("pointstack_resource_listings")
    .select("download_count")
    .eq("id", resourceId)
    .single();

  if (data) {
    await supabase
      .from("pointstack_resource_listings")
      .update({ download_count: (data.download_count || 0) + 1 })
      .eq("id", resourceId);
  }
}

// ============================================================
// RESOURCE VOTING & COMMENTS API
// ============================================================

export async function voteResource(resourceId: string, voteType: 1 | -1): Promise<void> {
  const supabase = getClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Your session has expired. Please sign in again.");

  const { data: existingVote } = await supabase
    .from("pointstack_resource_votes")
    .select("vote_type")
    .eq("user_id", user.id)
    .eq("resource_id", resourceId)
    .single();

  if (existingVote) {
    if (existingVote.vote_type === voteType) {
      await supabase
        .from("pointstack_resource_votes")
        .delete()
        .eq("user_id", user.id)
        .eq("resource_id", resourceId);
    } else {
      await supabase
        .from("pointstack_resource_votes")
        .update({ vote_type: voteType })
        .eq("user_id", user.id)
        .eq("resource_id", resourceId);
    }
  } else {
    await supabase.from("pointstack_resource_votes").insert({
      user_id: user.id,
      resource_id: resourceId,
      vote_type: voteType,
    });
  }
}

export async function fetchResourceComments(resourceId: string): Promise<PointStackResourceComment[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("pointstack_resource_comments")
    .select(`
      *,
      author:profiles!author_id(display_name, avatar_url)
    `)
    .eq("resource_id", resourceId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createResourceComment(input: {
  resource_id: string;
  content: string;
  parent_id?: string;
}): Promise<PointStackResourceComment> {
  const supabase = getClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Your session has expired. Please sign in again.");

  const { data, error } = await supabase
    .from("pointstack_resource_comments")
    .insert({
      resource_id: input.resource_id,
      author_id: user.id,
      content: input.content,
      parent_id: input.parent_id || null,
    })
    .select(`
      *,
      author:profiles!author_id(display_name, avatar_url)
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteResourceComment(commentId: string): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase
    .from("pointstack_resource_comments")
    .delete()
    .eq("id", commentId);

  if (error) throw error;
}

/** Enrich resources with user's vote status */
export async function enrichResourcesWithVotes(
  resources: PointStackResourceListing[],
  user: User | null
): Promise<PointStackResourceListing[]> {
  if (!user || resources.length === 0) return resources;
  const supabase = getClient();
  const { data: votes } = await supabase
    .from("pointstack_resource_votes")
    .select("resource_id, vote_type")
    .eq("user_id", user.id)
    .in("resource_id", resources.map((r) => r.id));

  if (!votes) return resources;
  const voteMap = new Map<string, number>(votes.map((v: { resource_id: string; vote_type: number }) => [v.resource_id, v.vote_type]));
  return resources.map((r) => ({ ...r, user_vote: voteMap.get(r.id) ?? null }));
}

// ============================================================
// NOTIFICATIONS API
// ============================================================

export async function fetchNotifications(
  limit = 50,
  unreadOnly = false
): Promise<PointStackNotification[]> {
  const supabase = getClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from("pointstack_notifications")
    .select(`
      *,
      actor:profiles!actor_id(display_name, avatar_url)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (unreadOnly) {
    query = query.eq("is_read", false);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getUnreadNotificationCount(): Promise<number> {
  const supabase = getClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count, error } = await supabase
    .from("pointstack_notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) return 0;
  return count || 0;
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  const user = await requireAuth();
  await verifyNotificationOwnership(notificationId, user.id);

  const supabase = getClient();
  const { error } = await supabase
    .from("pointstack_notifications")
    .update({ is_read: true })
    .eq("id", notificationId);

  if (error) throw error;
}

export async function markAllNotificationsRead(): Promise<void> {
  const supabase = getClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from("pointstack_notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) throw error;
}

// ============================================================
// MESSAGES API
// ============================================================

export async function fetchConversations(): Promise<PointStackConversation[]> {
  const supabase = getClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
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
    .eq("user_id", user.id);

  if (error) throw error;

  // Extract, flatten, and sort conversations by most recent first
  const conversations = data
    ?.map((item: { conversation: PointStackConversation | null }) => item.conversation)
    .filter((c: PointStackConversation | null): c is PointStackConversation => c !== null)
    .sort((a: PointStackConversation, b: PointStackConversation) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  return conversations || [];
}

export async function fetchMessages(conversationId: string): Promise<PointStackMessage[]> {
  const user = await requireAuth();
  await verifyConversationParticipant(conversationId, user.id);

  const supabase = getClient();
  const { data, error } = await supabase
    .from("pointstack_messages")
    .select(`
      *,
      sender:profiles!sender_id(display_name, avatar_url)
    `)
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function sendMessage(conversationId: string, content: string): Promise<PointStackMessage> {
  const trimmed = content.trim();
  if (!trimmed) throw new Error("Message cannot be empty");
  if (trimmed.length > 5000) throw new Error("Message is too long (max 5,000 characters)");

  const supabase = getClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Your session has expired. Please sign in again.");

  const { data, error } = await supabase
    .from("pointstack_messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: trimmed,
    })
    .select(`
      *,
      sender:profiles!sender_id(display_name, avatar_url)
    `)
    .single();

  if (error) throw error;
  return data;
}

/** Find an existing conversation with a user, or create an empty one */
export async function findOrCreateConversation(otherUserId: string): Promise<PointStackConversation> {
  const user = await requireAuth();
  if (otherUserId === user.id) throw new Error("Cannot message yourself");

  const supabase = getClient();

  // Check for existing conversation
  const { data: myConvs } = await supabase
    .from("pointstack_conversation_participants")
    .select("conversation_id")
    .eq("user_id", user.id);

  if (myConvs && myConvs.length > 0) {
    const convIds = myConvs.map((c: { conversation_id: string }) => c.conversation_id);
    const { data: match } = await supabase
      .from("pointstack_conversation_participants")
      .select("conversation_id")
      .eq("user_id", otherUserId)
      .in("conversation_id", convIds)
      .limit(1)
      .maybeSingle();

    if (match) {
      const { data: existing } = await supabase
        .from("pointstack_conversations")
        .select(`
          *,
          participants:pointstack_conversation_participants(
            *,
            profile:profiles!user_id(display_name, avatar_url)
          )
        `)
        .eq("id", match.conversation_id)
        .single();
      if (existing) return existing;
    }
  }

  // Create new empty conversation
  const { data: conversation, error: convError } = await supabase
    .from("pointstack_conversations")
    .insert({})
    .select("*")
    .single();
  if (convError) throw convError;

  const { error: participantError } = await supabase
    .from("pointstack_conversation_participants")
    .insert([
      { conversation_id: conversation.id, user_id: user.id },
      { conversation_id: conversation.id, user_id: otherUserId },
    ]);
  if (participantError) {
    await supabase.from("pointstack_conversations").delete().eq("id", conversation.id);
    throw participantError;
  }

  // Re-fetch with participants joined
  const { data: full } = await supabase
    .from("pointstack_conversations")
    .select(`
      *,
      participants:pointstack_conversation_participants(
        *,
        profile:profiles!user_id(display_name, avatar_url)
      )
    `)
    .eq("id", conversation.id)
    .single();

  return full || conversation;
}

export async function startConversation(otherUserId: string, initialMessage: string): Promise<PointStackConversation> {
  const trimmedMessage = initialMessage.trim();
  if (!trimmedMessage) throw new Error("Message cannot be empty");
  if (trimmedMessage.length > 5000) throw new Error("Message is too long (max 5,000 characters)");

  const user = await requireAuth();

  // Validate target user exists
  const supabase = getClient();
  const { data: targetUser } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", otherUserId)
    .single();

  if (!targetUser) {
    throw new Error("Target user does not exist");
  }

  // Prevent messaging yourself
  if (otherUserId === user.id) {
    throw new Error("Cannot start a conversation with yourself");
  }

  // Check for existing conversation between these two users
  const { data: myConvs } = await supabase
    .from("pointstack_conversation_participants")
    .select("conversation_id")
    .eq("user_id", user.id);

  if (myConvs && myConvs.length > 0) {
    const convIds = myConvs.map((c: { conversation_id: string }) => c.conversation_id);
    const { data: match } = await supabase
      .from("pointstack_conversation_participants")
      .select("conversation_id")
      .eq("user_id", otherUserId)
      .in("conversation_id", convIds)
      .limit(1)
      .maybeSingle();

    if (match) {
      // Return existing conversation with participants
      const { data: existing } = await supabase
        .from("pointstack_conversations")
        .select(`
          *,
          participants:pointstack_conversation_participants(
            *,
            profile:profiles!user_id(display_name, avatar_url)
          )
        `)
        .eq("id", match.conversation_id)
        .single();

      if (existing) {
        // Send the message into the existing conversation
        await supabase.from("pointstack_messages").insert({
          conversation_id: existing.id,
          sender_id: user.id,
          content: trimmedMessage,
        });
        return existing;
      }
    }
  }

  // Create conversation
  const { data: conversation, error: convError } = await supabase
    .from("pointstack_conversations")
    .insert({})
    .select("*")
    .single();

  if (convError) throw convError;

  // Add participants
  const { error: participantError } = await supabase
    .from("pointstack_conversation_participants")
    .insert([
      { conversation_id: conversation.id, user_id: user.id },
      { conversation_id: conversation.id, user_id: otherUserId },
    ]);

  if (participantError) {
    // Clean up conversation if participant insert fails
    await supabase.from("pointstack_conversations").delete().eq("id", conversation.id);
    throw participantError;
  }

  // Send initial message
  await supabase.from("pointstack_messages").insert({
    conversation_id: conversation.id,
    sender_id: user.id,
    content: trimmedMessage,
  });

  return conversation;
}

export async function markConversationRead(conversationId: string): Promise<void> {
  const supabase = getClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from("pointstack_conversation_participants")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id);

  if (error) throw error;
}

// ============================================================
// USER SHOWCASE PROJECTS API
// ============================================================

export async function fetchUserShowcaseProjects(userId: string): Promise<PointStackPost[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("pointstack_posts")
    .select(`
      *,
      author:profiles!author_id(display_name, avatar_url),
      company:pointstack_companies!company_id(name, slug)
    `)
    .eq("author_id", userId)
    .eq("is_showcase", true)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return normalizePosts(data as RawPointStackPost[] | null);
}

// ============================================================
// USER ACTIVITY API
// ============================================================

export async function fetchUserActivity(userId: string, limit = 20): Promise<ActivityItem[]> {
  const supabase = getClient();
  const activities: ActivityItem[] = [];

  // Fetch posts
  const { data: posts } = await supabase
    .from("pointstack_posts")
    .select("id, title, slug, post_type, created_at")
    .eq("author_id", userId)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (posts) {
    for (const post of posts) {
      activities.push({
        id: `post-${post.id}`,
        type: "post",
        title: post.title,
        description: `Created a ${post.post_type}`,
        link: getPointStackPostRoute(post.post_type, post.slug),
        created_at: post.created_at,
      });
    }
  }

  // Fetch comments
  const { data: comments } = await supabase
    .from("pointstack_post_comments")
    .select(`
      id, content, created_at,
      post:pointstack_posts!post_id(title, slug)
    `)
    .eq("author_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (comments) {
    for (const comment of comments) {
      const post = comment.post as { title: string; slug: string } | null;
      activities.push({
        id: `comment-${comment.id}`,
        type: "comment",
        title: `Commented on "${post?.title || "a post"}"`,
        description: comment.content.slice(0, 100) + (comment.content.length > 100 ? "..." : ""),
        link: post ? `/pointstack/posts/${post.slug}` : undefined,
        created_at: comment.created_at,
      });
    }
  }

  // Fetch equipment notes
  const { data: notes } = await supabase
    .from("equipment_notes")
    .select("id, equipment_id, content, created_at")
    .eq("author_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (notes) {
    for (const note of notes) {
      activities.push({
        id: `note-${note.id}`,
        type: "equipment_note",
        title: "Added equipment note",
        description: note.content.slice(0, 100) + (note.content.length > 100 ? "..." : ""),
        created_at: note.created_at,
        metadata: { equipment_id: note.equipment_id },
      });
    }
  }

  // Sort by created_at descending and take limit
  return activities
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);
}

// ============================================================
// USER CONTRIBUTIONS API
// ============================================================

export async function fetchUserBabelContributions(userId: string, limit = 20): Promise<BabelContribution[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("babel_contributions")
    .select(`
      *,
      submitter:profiles!user_id(display_name)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []) as BabelContribution[];
}

export async function fetchUserEquipmentSubmissions(userId: string, limit = 20): Promise<EquipmentSubmission[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("equipment_submissions")
    .select(`
      *,
      submitter:profiles!user_id(display_name)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []) as EquipmentSubmission[];
}

export async function fetchUserEquipmentNotes(userId: string, limit = 20): Promise<EquipmentNote[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("equipment_notes")
    .select(`
      *,
      author:profiles!author_id(display_name, avatar_url)
    `)
    .eq("author_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []) as EquipmentNote[];
}

export async function fetchUserWikiArticles(userId: string, limit = 20): Promise<WikiArticle[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("wiki_articles")
    .select(`
      *,
      author:profiles!author_id(display_name),
      category:wiki_categories!category_id(name, slug)
    `)
    .eq("author_id", userId)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []) as WikiArticle[];
}

// Approved wiki contributions (edits + new entries that an admin approved).
// Public-safe: only status='approved'.
export interface UserWikiContributionRow {
  id: string;
  type: "edit" | "new_entry";
  title: string;
  created_at: string;
  approved_article_id: string | null;
  target_article: { title: string; slug: string } | null;
  approved_article: { title: string; slug: string } | null;
}

export async function fetchUserApprovedWikiContributions(
  userId: string,
  limit = 20
): Promise<UserWikiContributionRow[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("wiki_contributions")
    .select(
      `id, type, title, created_at, approved_article_id,
       target_article:wiki_articles!wiki_contributions_target_article_id_fkey(title, slug),
       approved_article:wiki_articles!wiki_contributions_approved_article_id_fkey(title, slug)`
    )
    .eq("user_id", userId)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  // Supabase types embedded relations as arrays in some configs — normalize.
  return (data || []).map((row: {
    id: string;
    type: "edit" | "new_entry";
    title: string;
    created_at: string;
    approved_article_id: string | null;
    target_article: unknown;
    approved_article: unknown;
  }) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    created_at: row.created_at,
    approved_article_id: row.approved_article_id,
    target_article: Array.isArray(row.target_article) ? row.target_article[0] ?? null : (row.target_article as { title: string; slug: string } | null),
    approved_article: Array.isArray(row.approved_article) ? row.approved_article[0] ?? null : (row.approved_article as { title: string; slug: string } | null),
  }));
}

// User's pending contributions across all moderation queues (owner-only view).
export interface UserPendingItem {
  id: string;
  source: "wiki" | "babel" | "equipment" | "wiki_draft";
  type: string;
  title: string;
  created_at: string;
  link?: string;
}

export async function fetchUserPendingContributions(userId: string): Promise<UserPendingItem[]> {
  const supabase = getClient();

  const [wikiRes, babelRes, equipmentRes, draftRes] = await Promise.all([
    supabase
      .from("wiki_contributions")
      .select("id, type, title, created_at, target_article:wiki_articles!wiki_contributions_target_article_id_fkey(slug)")
      .eq("user_id", userId)
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
    supabase
      .from("babel_contributions")
      .select("id, type, title, created_at")
      .eq("user_id", userId)
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
    supabase
      .from("equipment_submissions")
      .select("id, type, model_name, brand_name, created_at")
      .eq("user_id", userId)
      .eq("review_status", "pending")
      .order("created_at", { ascending: false }),
    supabase
      .from("wiki_articles")
      .select("id, title, slug, created_at")
      .eq("author_id", userId)
      .eq("is_published", false)
      .order("created_at", { ascending: false }),
  ]);

  const items: UserPendingItem[] = [];

  for (const row of (wikiRes.data || []) as Array<{
    id: string; type: string; title: string; created_at: string;
    target_article: unknown;
  }>) {
    const target = Array.isArray(row.target_article) ? row.target_article[0] : row.target_article;
    items.push({
      id: row.id,
      source: "wiki",
      type: row.type,
      title: row.title,
      created_at: row.created_at,
      link: target && typeof target === "object" && "slug" in target ? `/wiki/${(target as { slug: string }).slug}` : undefined,
    });
  }
  for (const row of (babelRes.data || []) as Array<{ id: string; type: string; title: string; created_at: string }>) {
    items.push({ id: row.id, source: "babel", type: row.type, title: row.title, created_at: row.created_at });
  }
  for (const row of (equipmentRes.data || []) as Array<{ id: string; type: string; model_name: string | null; brand_name: string | null; created_at: string }>) {
    items.push({
      id: row.id,
      source: "equipment",
      type: row.type,
      title: row.model_name || row.brand_name || "Equipment submission",
      created_at: row.created_at,
    });
  }
  for (const row of (draftRes.data || []) as Array<{ id: string; title: string; slug: string; created_at: string }>) {
    items.push({
      id: row.id,
      source: "wiki_draft",
      type: "draft",
      title: row.title,
      created_at: row.created_at,
      link: `/wiki/${row.slug}`,
    });
  }

  return items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

// User's news submissions (public).
export interface UserNewsSubmission {
  id: string;
  title: string;
  slug: string;
  source_domain: string;
  upvote_count: number;
  created_at: string;
}

export async function fetchUserNewsSubmissions(userId: string, limit = 20): Promise<UserNewsSubmission[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("news_articles")
    .select("id, title, slug, source_domain, upvote_count, created_at")
    .eq("submitted_by", userId)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []) as UserNewsSubmission[];
}

// User's course progress (public if owner allows or viewer is owner — caller must check).
export interface UserCourseProgressRow {
  course_slug: string;
  lessons_completed: string[];
  last_lesson_slug: string | null;
  started_at: string;
  last_active_at: string;
}

export async function fetchUserCourseProgress(userId: string): Promise<UserCourseProgressRow[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("course_progress")
    .select("course_slug, lessons_completed, last_lesson_slug, started_at, last_active_at")
    .eq("user_id", userId)
    .order("last_active_at", { ascending: false });

  if (error) throw error;
  return (data || []) as UserCourseProgressRow[];
}

// ============================================================
// FOLLOWERS/FOLLOWING LISTS API
// ============================================================

export async function fetchFollowers(userId: string, limit = 50): Promise<PointStackProfile[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("pointstack_user_follows")
    .select(`
      follower:profiles!follower_id(
        id, display_name, avatar_url, headline, skills, reputation_score, is_verified
      )
    `)
    .eq("following_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  // Extract profiles from join
  return (data || [])
    .map((row: { follower: unknown }) => row.follower as PointStackProfile)
    .filter(Boolean);
}

export async function fetchFollowing(userId: string, limit = 50): Promise<PointStackProfile[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("pointstack_user_follows")
    .select(`
      following:profiles!following_id(
        id, display_name, avatar_url, headline, skills, reputation_score, is_verified
      )
    `)
    .eq("follower_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  // Extract profiles from join
  return (data || [])
    .map((row: { following: unknown }) => row.following as PointStackProfile)
    .filter(Boolean);
}
