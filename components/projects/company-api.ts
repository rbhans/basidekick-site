import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import type { PSKCompany, PSKCompanyMember, PSKMemberRole } from "@/lib/types";

interface PointStackCompanyMemberRow {
  id: string;
  company_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profile?: { display_name: string | null };
}

interface PointStackCompanyRow {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  invite_code: string | null;
  created_at: string;
  updated_at: string;
  members?: PointStackCompanyMemberRow[];
}

function normalizeRole(role: string): PSKMemberRole {
  return role === "owner" ? "owner" : "member";
}

function mapMemberRow(member: PointStackCompanyMemberRow): PSKCompanyMember {
  return {
    id: member.id,
    company_id: member.company_id,
    user_id: member.user_id,
    role: normalizeRole(member.role),
    joined_at: member.joined_at,
    profile: member.profile,
  };
}

function mapCompanyRow(company: PointStackCompanyRow): PSKCompany {
  return {
    id: company.id,
    pointstack_company_id: company.id,
    name: company.name,
    slug: company.slug,
    owner_id: company.owner_id,
    invite_code: company.invite_code || "",
    created_at: company.created_at,
    updated_at: company.updated_at,
    members: company.members?.map(mapMemberRow) || [],
    member_count: company.members?.length,
  };
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 50) || "company";
}

async function generateUniqueSlug(name: string): Promise<string> {
  const supabase = createSupabaseClient();
  if (!supabase) throw new Error("Supabase client not available");

  const base = slugify(name);
  let candidate = base;

  for (let i = 0; i < 20; i += 1) {
    const { data, error } = await supabase
      .from("pointstack_companies")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (error && error.code !== "PGRST116") throw error;
    if (!data) return candidate;

    candidate = `${base}-${i + 2}`;
  }

  return `${base}-${Date.now().toString(36)}`;
}

async function getLegacyCompanyId(pointstackCompanyId: string): Promise<string | null> {
  const supabase = createSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("psk_companies")
    .select("id")
    .eq("pointstack_company_id", pointstackCompanyId)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    console.error("Failed fetching legacy company mapping:", error);
    return null;
  }

  return data?.id || null;
}

async function ensureLegacyCompanyMirror(company: {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
}): Promise<string | null> {
  const supabase = createSupabaseClient();
  if (!supabase) return null;

  const existingId = await getLegacyCompanyId(company.id);
  if (existingId) return existingId;

  const { data, error } = await supabase
    .from("psk_companies")
    .insert({
      name: company.name,
      slug: company.slug,
      owner_id: company.owner_id,
      pointstack_company_id: company.id,
    })
    .select("id")
    .maybeSingle();

  if (!error) {
    return data?.id || null;
  }

  if (error.code === "23505") {
    const { data: slugMatch, error: slugError } = await supabase
      .from("psk_companies")
      .select("id")
      .eq("slug", company.slug)
      .maybeSingle();

    if (slugError || !slugMatch?.id) {
      console.error("Failed resolving duplicate slug company:", slugError || error);
      return null;
    }

    const { error: updateError } = await supabase
      .from("psk_companies")
      .update({ pointstack_company_id: company.id })
      .eq("id", slugMatch.id);

    if (updateError) {
      console.error("Failed linking duplicate slug company:", updateError);
      return null;
    }

    return slugMatch.id;
  }

  console.error("Failed creating legacy company mirror:", error);
  return null;
}

async function syncLegacyMembership(
  pointstackCompanyId: string,
  userId: string,
  role: PSKMemberRole
): Promise<void> {
  const supabase = createSupabaseClient();
  if (!supabase) return;

  const legacyCompanyId = await getLegacyCompanyId(pointstackCompanyId);
  if (!legacyCompanyId) return;

  const { error } = await supabase
    .from("psk_company_members")
    .insert({
      company_id: legacyCompanyId,
      user_id: userId,
      role,
    });

  if (error && error.code !== "23505") {
    console.error("Failed syncing legacy membership:", error);
  }
}

async function removeLegacyMembership(pointstackCompanyId: string, userId: string): Promise<void> {
  const supabase = createSupabaseClient();
  if (!supabase) return;

  const legacyCompanyId = await getLegacyCompanyId(pointstackCompanyId);
  if (!legacyCompanyId) return;

  const { error } = await supabase
    .from("psk_company_members")
    .delete()
    .eq("company_id", legacyCompanyId)
    .eq("user_id", userId);

  if (error) {
    console.error("Failed removing legacy membership:", error);
  }
}

function isMissingJoinInviteRpcError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  if (error.code === "42883" || error.code === "PGRST202") return true;
  return (error.message || "").toLowerCase().includes("join_pointstack_company_by_invite");
}

// ============================================================================
// Companies
// ============================================================================

/**
 * Get all companies the current user is a member of
 */
export async function getCompanies(): Promise<PSKCompany[]> {
  const supabase = createSupabaseClient();
  if (!supabase) return [];

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return [];

  const { data, error } = await supabase
    .from("pointstack_company_members")
    .select(`
      company:pointstack_companies(
        id,
        name,
        slug,
        owner_id,
        invite_code,
        created_at,
        updated_at,
        members:pointstack_company_members(
          id,
          company_id,
          user_id,
          role,
          joined_at,
          profile:profiles!user_id(display_name)
        )
      )
    `)
    .eq("user_id", authData.user.id);

  if (error) throw error;
  if (!data) return [];

  const companies: PSKCompany[] = data
    .map((row: { company: PointStackCompanyRow | null }) => row.company)
    .filter((company: PointStackCompanyRow | null): company is PointStackCompanyRow => Boolean(company))
    .map((company: PointStackCompanyRow) => mapCompanyRow(company));

  return companies.sort((a: PSKCompany, b: PSKCompany) => a.name.localeCompare(b.name));
}

/**
 * Get a single company by ID
 */
export async function getCompany(id: string): Promise<PSKCompany | null> {
  const supabase = createSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("pointstack_companies")
    .select(`
      id,
      name,
      slug,
      owner_id,
      invite_code,
      created_at,
      updated_at,
      members:pointstack_company_members(
        id,
        company_id,
        user_id,
        role,
        joined_at,
        profile:profiles!user_id(display_name)
      )
    `)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  if (!data) return null;
  return mapCompanyRow(data as PointStackCompanyRow);
}

/**
 * Create a new company (current user becomes owner)
 */
export async function createCompany(
  name: string,
  userId: string
): Promise<PSKCompany> {
  const supabase = createSupabaseClient();
  if (!supabase) throw new Error("Supabase client not available");

  const slug = await generateUniqueSlug(name);

  const { data: company, error: companyError } = await supabase
    .from("pointstack_companies")
    .insert({
      name,
      slug,
      owner_id: userId,
    })
    .select(`
      id,
      name,
      slug,
      owner_id,
      invite_code,
      created_at,
      updated_at
    `)
    .single();

  if (companyError) throw companyError;

  const { error: memberError } = await supabase
    .from("pointstack_company_members")
    .insert({
      company_id: company.id,
      user_id: userId,
      role: "owner",
    });

  if (memberError) throw memberError;

  await ensureLegacyCompanyMirror({
    id: company.id,
    name: company.name,
    slug: company.slug,
    owner_id: company.owner_id,
  });
  await syncLegacyMembership(company.id, userId, "owner");

  const fullCompany = await getCompany(company.id);
  if (!fullCompany) throw new Error("Failed to load company after creation");

  return fullCompany;
}

/**
 * Update company details (owner only)
 */
export async function updateCompany(
  id: string,
  updates: Partial<Pick<PSKCompany, "name">>
): Promise<PSKCompany> {
  const supabase = createSupabaseClient();
  if (!supabase) throw new Error("Supabase client not available");

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.name !== undefined) {
    payload.name = updates.name;
  }

  const { data, error } = await supabase
    .from("pointstack_companies")
    .update(payload)
    .eq("id", id)
    .select(`
      id,
      name,
      slug,
      owner_id,
      invite_code,
      created_at,
      updated_at,
      members:pointstack_company_members(
        id,
        company_id,
        user_id,
        role,
        joined_at,
        profile:profiles!user_id(display_name)
      )
    `)
    .single();

  if (error) throw error;

  // Keep legacy mirror name in sync where possible
  const legacyCompanyId = await getLegacyCompanyId(id);
  if (legacyCompanyId && updates.name !== undefined) {
    const { error: legacyUpdateError } = await supabase
      .from("psk_companies")
      .update({ name: updates.name, updated_at: new Date().toISOString() })
      .eq("id", legacyCompanyId);

    if (legacyUpdateError) {
      console.error("Failed updating legacy mirror company name:", legacyUpdateError);
    }
  }

  return mapCompanyRow(data as PointStackCompanyRow);
}

/**
 * Delete a company (owner only)
 */
export async function deleteCompany(id: string): Promise<void> {
  const supabase = createSupabaseClient();
  if (!supabase) throw new Error("Supabase client not available");

  const { error } = await supabase
    .from("pointstack_companies")
    .delete()
    .eq("id", id);

  if (error) throw error;

  // Clean up legacy mirror if present
  const { error: legacyError } = await supabase
    .from("psk_companies")
    .delete()
    .eq("pointstack_company_id", id);

  if (legacyError) {
    console.error("Failed deleting legacy company mirror:", legacyError);
  }
}

// ============================================================================
// Company Members
// ============================================================================

/**
 * Get all members of a company
 */
export async function getCompanyMembers(
  companyId: string
): Promise<PSKCompanyMember[]> {
  const supabase = createSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("pointstack_company_members")
    .select(`
      id,
      company_id,
      user_id,
      role,
      joined_at,
      profile:profiles!user_id(display_name)
    `)
    .eq("company_id", companyId)
    .order("joined_at", { ascending: true });

  if (error) throw error;
  return (data || []).map((member: PointStackCompanyMemberRow) => mapMemberRow(member));
}

/**
 * Remove a member from a company (owner only, or self-leave)
 */
export async function removeMember(
  companyId: string,
  userId: string
): Promise<void> {
  const supabase = createSupabaseClient();
  if (!supabase) throw new Error("Supabase client not available");

  const { error } = await supabase
    .from("pointstack_company_members")
    .delete()
    .eq("company_id", companyId)
    .eq("user_id", userId);

  if (error) throw error;
  await removeLegacyMembership(companyId, userId);
}

/**
 * Leave a company (removes self from membership)
 */
export async function leaveCompany(companyId: string): Promise<void> {
  const supabase = createSupabaseClient();
  if (!supabase) throw new Error("Supabase client not available");

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Not authenticated");

  await removeMember(companyId, user.id);
}

// ============================================================================
// Invite System
// ============================================================================

/**
 * Join a company using an invite code
 * Returns the company ID on success, null if invalid code
 */
export async function joinCompanyByInvite(
  inviteCode: string
): Promise<string | null> {
  const supabase = createSupabaseClient();
  if (!supabase) throw new Error("Supabase client not available");

  const { data, error } = await supabase
    .rpc("join_pointstack_company_by_invite", { invite_code_param: inviteCode });

  if (error && isMissingJoinInviteRpcError(error)) {
    // Fallback for databases that have not applied the migration yet
    const { data: company, error: companyError } = await supabase
      .from("pointstack_companies")
      .select("id")
      .eq("invite_code", inviteCode)
      .maybeSingle();

    if (companyError) throw companyError;
    if (!company) return null;

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("Not authenticated");

    let insertedMembership = false;
    const { error: memberError } = await supabase
      .from("pointstack_company_members")
      .insert({
        company_id: company.id,
        user_id: userData.user.id,
        role: "member",
      });

    if (memberError && memberError.code !== "23505") throw memberError;
    if (!memberError) insertedMembership = true;

    // Defensive re-check to avoid joining if code rotated between read and insert.
    const { data: stillValidCompany, error: stillValidError } = await supabase
      .from("pointstack_companies")
      .select("id")
      .eq("id", company.id)
      .eq("invite_code", inviteCode)
      .maybeSingle();

    if (stillValidError) throw stillValidError;
    if (!stillValidCompany) {
      if (insertedMembership) {
        await supabase
          .from("pointstack_company_members")
          .delete()
          .eq("company_id", company.id)
          .eq("user_id", userData.user.id);
      }
      return null;
    }

    await syncLegacyMembership(company.id, userData.user.id, "member");
    return company.id;
  }

  if (error) throw error;

  return data as string | null;
}

/**
 * Get company info by invite code (for preview before joining)
 */
export async function getCompanyByInviteCode(
  inviteCode: string
): Promise<{ id: string; name: string; member_count: number } | null> {
  const supabase = createSupabaseClient();
  if (!supabase) return null;

  const { data: company, error: companyError } = await supabase
    .from("pointstack_companies")
    .select("id, name")
    .eq("invite_code", inviteCode)
    .maybeSingle();

  if (companyError) throw companyError;
  if (!company) return null;

  const { count, error: countError } = await supabase
    .from("pointstack_company_members")
    .select("*", { count: "exact", head: true })
    .eq("company_id", company.id);

  if (countError) throw countError;

  return {
    id: company.id,
    name: company.name,
    member_count: count ?? 0,
  };
}

/**
 * Regenerate the invite code for a company (owner only)
 * Returns the new invite code
 */
export async function regenerateInviteCode(
  companyId: string
): Promise<string> {
  const supabase = createSupabaseClient();
  if (!supabase) throw new Error("Supabase client not available");

  const { data, error } = await supabase
    .rpc("regenerate_pointstack_company_invite_code", { company_id_param: companyId });

  if (!error && typeof data === "string") {
    return data;
  }

  // Fallback for databases that have not applied the migration yet
  const randomCode = crypto.randomUUID().replace(/-/g, "").slice(0, 12);

  const { error: updateError } = await supabase
    .from("pointstack_companies")
    .update({ invite_code: randomCode })
    .eq("id", companyId);

  if (updateError) {
    throw error || updateError;
  }

  return randomCode;
}

/**
 * Generate the full invite URL for a company
 */
export function generateInviteUrl(inviteCode: string): string {
  if (typeof window === "undefined") {
    return `/psk/join/${inviteCode}`;
  }
  return `${window.location.origin}/psk/join/${inviteCode}`;
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Check if the current user is the owner of a company
 */
export async function isCompanyOwner(companyId: string): Promise<boolean> {
  const supabase = createSupabaseClient();
  if (!supabase) return false;

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return false;

  const { data, error } = await supabase
    .from("pointstack_companies")
    .select("owner_id")
    .eq("id", companyId)
    .single();

  if (error) return false;
  return data.owner_id === user.id;
}

/**
 * Check if the current user is a member of a company
 */
export async function isCompanyMember(companyId: string): Promise<boolean> {
  const supabase = createSupabaseClient();
  if (!supabase) return false;

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return false;

  const { count, error } = await supabase
    .from("pointstack_company_members")
    .select("*", { count: "exact", head: true })
    .eq("company_id", companyId)
    .eq("user_id", user.id);

  if (error) return false;
  return (count ?? 0) > 0;
}
