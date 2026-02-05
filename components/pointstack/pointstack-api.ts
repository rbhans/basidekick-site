import { getClient } from "@/lib/supabase/client";
import {
  PointStackPost,
  PointStackPostComment,
  PointStackJob,
  PointStackResourceListing,
  PointStackCompany,
  PointStackNotification,
  PointStackNotificationType,
  PointStackConversation,
  PointStackMessage,
  PointStackProfile,
  PointStackUserFollow,
  PointStackFeedFilter,
  CreatePointStackPostInput,
  CreatePointStackCommentInput,
  CreatePointStackJobInput,
  CreatePointStackResourceInput,
  UpdatePointStackProfileInput,
  PointStackPostType,
  ActivityItem,
  BabelContribution,
  EquipmentSubmission,
  EquipmentNote,
  WikiArticle,
  ForumThread,
} from "@/lib/types";
import { ROUTES } from "@/lib/routes";
import { User } from "@supabase/supabase-js";

// ============================================================
// AUTH HELPERS
// ============================================================

/** Require authentication, throws if not authenticated */
async function requireAuth(): Promise<User> {
  const supabase = getClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
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

/** Sanitize search input to escape SQL LIKE wildcards */
function sanitizeSearchInput(input: string): string {
  return input
    .replace(/[%_]/g, "\\$&") // Escape LIKE wildcards
    .slice(0, 100); // Limit length
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
  return data || [];
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
  return data;
}

export async function createPost(input: CreatePointStackPostInput): Promise<PointStackPost> {
  const supabase = getClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

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
  return data;
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
  return data;
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
  if (!user) throw new Error("Not authenticated");

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
        .select("author_id, title, slug")
        .eq("id", postId)
        .single();

      if (post?.author_id && post.author_id !== user.id) {
        await createNotification({
          userId: post.author_id,
          actorId: user.id,
          type: "like",
          title: "New like on your post",
          body: post.title || null,
          link: post.slug ? ROUTES.POINTSTACK_POST(post.slug) : null,
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

// ============================================================
// COMMENTS API
// ============================================================

export async function fetchComments(postId: string): Promise<PointStackPostComment[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("pointstack_post_comments")
    .select(`
      *,
      author:profiles!author_id(display_name, avatar_url)
    `)
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createComment(input: CreatePointStackCommentInput): Promise<PointStackPostComment> {
  const supabase = getClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

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
      .select("author_id, title, slug")
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

    const link = post?.slug ? ROUTES.POINTSTACK_POST(post.slug) : null;
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
      .select("author_id, post:pointstack_posts!post_id(title, slug)")
      .eq("id", commentId)
      .single();

    const recipientId = data?.author_id;
    const post = (data?.post as { title?: string | null; slug?: string | null } | null) ?? null;

    if (recipientId && recipientId !== user.id) {
      await createNotification({
        userId: recipientId,
        actorId: user.id,
        type: "answer_accepted",
        title: "Your answer was accepted",
        body: post?.title || null,
        link: post?.slug ? ROUTES.POINTSTACK_POST(post.slug) : null,
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
  if (!user) throw new Error("Not authenticated");

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
    .select("id, display_name, avatar_url, skills, headline, location, availability_status, reputation_score, is_verified")
    .order("reputation_score", { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    const sanitizedSearch = sanitizeSearchInput(search);
    query = query.ilike("display_name", `%${sanitizedSearch}%`);
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
  if (!user) throw new Error("Not authenticated");

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
  if (!user) throw new Error("Not authenticated");

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
  if (!user) throw new Error("Not authenticated");

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
  if (!user) throw new Error("Not authenticated");

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
  return data;
}

export async function createCompany(name: string, description?: string): Promise<PointStackCompany> {
  const supabase = getClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

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
  await supabase.from("pointstack_company_members").insert({
    company_id: data.id,
    user_id: user.id,
    role: "owner",
  });

  return data;
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
  return data || [];
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
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data;
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
  if (!user) throw new Error("Not authenticated");

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
  return data || [];
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
  return data;
}

export async function createResource(input: CreatePointStackResourceInput): Promise<PointStackResourceListing> {
  const supabase = getClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const slug = generateSlug(input.title);

  const { data, error } = await supabase
    .from("pointstack_resource_listings")
    .insert({
      author_id: user.id,
      title: input.title,
      slug,
      description: input.description,
      category: input.category,
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
  return data;
}

export async function incrementResourceDownloadCount(resourceId: string): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase.rpc("increment_resource_download", { resource_id: resourceId });
  if (error) {
    // Fallback: direct increment
    await supabase
      .from("pointstack_resource_listings")
      .update({ download_count: supabase.rpc("increment", { x: 1 }) as unknown as number })
      .eq("id", resourceId);
  }
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
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  // Extract and flatten conversations
  const conversations = data
    ?.map((item: { conversation: PointStackConversation | null }) => item.conversation)
    .filter((c: PointStackConversation | null): c is PointStackConversation => c !== null);

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
  const supabase = getClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("pointstack_messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content,
    })
    .select(`
      *,
      sender:profiles!sender_id(display_name, avatar_url)
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function startConversation(otherUserId: string, initialMessage: string): Promise<PointStackConversation> {
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
    content: initialMessage,
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
  return data || [];
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
        link: `/pointstack/posts/${post.slug}`,
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

export async function fetchUserForumThreads(userId: string, limit = 20): Promise<(ForumThread & { category?: { slug: string; name: string } })[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("forum_threads")
    .select(`
      *,
      author:profiles!author_id(display_name),
      category:forum_categories!category_id(slug, name)
    `)
    .eq("author_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []) as (ForumThread & { category?: { slug: string; name: string } })[];
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
