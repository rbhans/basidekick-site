import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import type { PSKCompany, PSKCompanyMember } from "@/lib/types";

// ============================================================================
// Companies
// ============================================================================

/**
 * Get all companies the current user is a member of
 */
export async function getCompanies(): Promise<PSKCompany[]> {
  const supabase = createSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("psk_companies")
    .select(`
      *,
      members:psk_company_members(
        id,
        user_id,
        role,
        joined_at
      )
    `)
    .order("name", { ascending: true });

  if (error) throw error;
  return data as PSKCompany[];
}

/**
 * Get a single company by ID
 */
export async function getCompany(id: string): Promise<PSKCompany | null> {
  const supabase = createSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("psk_companies")
    .select(`
      *,
      members:psk_company_members(
        id,
        user_id,
        role,
        joined_at
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    throw error;
  }
  return data as PSKCompany;
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

  // Generate slug from name
  const { data: slugData, error: slugError } = await supabase
    .rpc("generate_company_slug", { company_name: name });

  if (slugError) throw slugError;
  const slug = slugData as string;

  // Create company
  const { data: company, error: companyError } = await supabase
    .from("psk_companies")
    .insert({
      name,
      slug,
      owner_id: userId,
    })
    .select()
    .single();

  if (companyError) throw companyError;

  // Add owner as member
  const { error: memberError } = await supabase
    .from("psk_company_members")
    .insert({
      company_id: company.id,
      user_id: userId,
      role: "owner",
    });

  if (memberError) throw memberError;

  return company as PSKCompany;
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

  const { data, error } = await supabase
    .from("psk_companies")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as PSKCompany;
}

/**
 * Delete a company (owner only)
 */
export async function deleteCompany(id: string): Promise<void> {
  const supabase = createSupabaseClient();
  if (!supabase) throw new Error("Supabase client not available");

  const { error } = await supabase
    .from("psk_companies")
    .delete()
    .eq("id", id);

  if (error) throw error;
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
    .from("psk_company_members")
    .select("*")
    .eq("company_id", companyId)
    .order("joined_at", { ascending: true });

  if (error) throw error;
  return data as PSKCompanyMember[];
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
    .from("psk_company_members")
    .delete()
    .eq("company_id", companyId)
    .eq("user_id", userId);

  if (error) throw error;
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
    .rpc("join_company_by_invite", { invite_code_param: inviteCode });

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

  // We need to query without RLS for invite preview
  // Since we can't bypass RLS from client, we'll use a workaround:
  // The user won't be able to see the company until they join,
  // so we'll just attempt to join and get the result

  // For now, return null - the join function will handle validation
  // A better approach would be a server function that returns limited info
  return null;
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
    .rpc("regenerate_company_invite_code", { company_id_param: companyId });

  if (error) throw error;
  return data as string;
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
    .from("psk_companies")
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
    .from("psk_company_members")
    .select("*", { count: "exact", head: true })
    .eq("company_id", companyId)
    .eq("user_id", user.id);

  if (error) return false;
  return (count ?? 0) > 0;
}
