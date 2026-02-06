import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import type {
  PSKProject,
  PSKTask,
  PSKClient,
  PSKTimeEntry,
  PSKFile,
  PSKBudgetLineItem,
  PSKNote,
  PSKWorkspaceContext,
} from "@/lib/types";

interface LegacyCompanyRow {
  id: string;
  pointstack_company_id: string | null;
}

interface CompanyRefs {
  legacyCompanyId: string | null;
  pointstackCompanyId: string | null;
}

type PSKClientRow = PSKClient & {
  pointstack_company_id?: string | null;
};

type PSKProjectRow = Omit<PSKProject, "client"> & {
  pointstack_company_id?: string | null;
  client?: PSKClientRow | null;
};

function buildLegacyToPointstackMap(rows: LegacyCompanyRow[]): Map<string, string> {
  return new Map<string, string>(
    rows
      .filter((row) => Boolean(row.pointstack_company_id))
      .map((row) => [row.id, row.pointstack_company_id as string])
  );
}

async function getLegacyCompanyRowsByPointstackIds(
  pointstackCompanyIds?: string[]
): Promise<LegacyCompanyRow[]> {
  if (!pointstackCompanyIds || pointstackCompanyIds.length === 0) {
    return [];
  }

  const supabase = createSupabaseClient();
  if (!supabase) return [];

  const uniquePointstackIds = Array.from(new Set(pointstackCompanyIds.filter(Boolean)));
  if (uniquePointstackIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("psk_companies")
    .select("id, pointstack_company_id")
    .in("pointstack_company_id", uniquePointstackIds);
  if (error) {
    console.error("Failed loading legacy company mappings:", error);
    return [];
  }

  return (data || []) as LegacyCompanyRow[];
}

async function getLegacyCompanyRowsByLegacyIds(
  legacyCompanyIds?: Array<string | null | undefined>
): Promise<LegacyCompanyRow[]> {
  const normalizedIds = Array.from(new Set((legacyCompanyIds || []).filter(Boolean))) as string[];
  if (normalizedIds.length === 0) {
    return [];
  }

  const supabase = createSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("psk_companies")
    .select("id, pointstack_company_id")
    .in("id", normalizedIds);

  if (error) {
    console.error("Failed loading legacy company mappings by ID:", error);
    return [];
  }

  return (data || []) as LegacyCompanyRow[];
}

function normalizeCompanyId(
  row: { company_id?: string | null; pointstack_company_id?: string | null },
  legacyToPointstack: Map<string, string>
): string | null {
  if (row.pointstack_company_id) return row.pointstack_company_id;
  if (row.company_id && legacyToPointstack.has(row.company_id)) {
    return legacyToPointstack.get(row.company_id) || null;
  }
  return row.company_id || null;
}

function normalizeClient(row: PSKClientRow, legacyToPointstack: Map<string, string>): PSKClient {
  return {
    ...row,
    company_id: normalizeCompanyId(row, legacyToPointstack),
  };
}

function normalizeProject(row: PSKProjectRow, legacyToPointstack: Map<string, string>): PSKProject {
  return {
    ...row,
    company_id: normalizeCompanyId(row, legacyToPointstack),
    client: row.client ? normalizeClient(row.client, legacyToPointstack) : undefined,
  };
}

async function resolveCompanyRefs(companyId: string | null | undefined): Promise<CompanyRefs> {
  if (!companyId) {
    return { legacyCompanyId: null, pointstackCompanyId: null };
  }

  const supabase = createSupabaseClient();
  if (!supabase) {
    return { legacyCompanyId: null, pointstackCompanyId: companyId };
  }

  const { data: byLegacyId, error: byLegacyError } = await supabase
    .from("psk_companies")
    .select("id, pointstack_company_id")
    .eq("id", companyId)
    .maybeSingle();

  if (byLegacyError && byLegacyError.code !== "PGRST116") {
    throw byLegacyError;
  }

  if (byLegacyId) {
    return {
      legacyCompanyId: byLegacyId.id,
      pointstackCompanyId: byLegacyId.pointstack_company_id || companyId,
    };
  }

  const { data: byPointstackId, error: byPointstackError } = await supabase
    .from("psk_companies")
    .select("id, pointstack_company_id")
    .eq("pointstack_company_id", companyId)
    .maybeSingle();

  if (byPointstackError && byPointstackError.code !== "PGRST116") {
    throw byPointstackError;
  }

  if (byPointstackId) {
    return {
      legacyCompanyId: byPointstackId.id,
      pointstackCompanyId: byPointstackId.pointstack_company_id || companyId,
    };
  }

  return {
    legacyCompanyId: null,
    pointstackCompanyId: companyId,
  };
}

async function getProjectPointstackCompanyId(projectId: string | null | undefined): Promise<string | null> {
  if (!projectId) return null;
  const supabase = createSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("psk_projects")
    .select("company_id, pointstack_company_id")
    .eq("id", projectId)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    console.error("Failed to lookup project company mapping:", error);
    return null;
  }
  if (!data) return null;

  if (data.pointstack_company_id) return data.pointstack_company_id;
  if (!data.company_id) return null;

  const legacyRows = await getLegacyCompanyRowsByLegacyIds([data.company_id]);
  const legacyToPointstack = buildLegacyToPointstackMap(legacyRows);
  return legacyToPointstack.get(data.company_id) || null;
}

// ============================================================================
// Projects
// ============================================================================

/**
 * Get all projects user has access to:
 * - Personal projects (company_id is null, user_id matches)
 * - Shared projects (company_id matches any company user is a member of)
 *
 * @param companyIds - Optional array of company IDs the user is a member of.
 *                     If not provided, fetches personal projects only.
 */
export async function getProjects(
  companyIds?: string[]
): Promise<PSKProject[]> {
  const supabase = createSupabaseClient();
  if (!supabase) return [];

  const legacyRows = await getLegacyCompanyRowsByPointstackIds(companyIds);
  const legacyToPointstack = buildLegacyToPointstackMap(legacyRows);
  const legacyCompanyIds = legacyRows.map((row) => row.id);

  // Fetch personal projects (no company)
  const personalQuery = supabase
    .from("psk_projects")
    .select(`
      *,
      client:psk_clients(*)
    `)
    .is("pointstack_company_id", null)
    .is("company_id", null)
    .order("updated_at", { ascending: false });

  const { data: personalProjects, error: personalError } = await personalQuery;
  if (personalError) throw personalError;

  // If user has companies, also fetch shared projects
  const sharedProjectsById = new Map<string, PSKProject>();
  if (companyIds && companyIds.length > 0) {
    const sharedPointstackQuery = supabase
      .from("psk_projects")
      .select(`
        *,
        client:psk_clients(*)
      `)
      .in("pointstack_company_id", companyIds)
      .order("updated_at", { ascending: false });

    const { data: pointstackShared, error: pointstackError } = await sharedPointstackQuery;
    if (pointstackError) throw pointstackError;

    for (const project of (pointstackShared || []) as PSKProject[]) {
      sharedProjectsById.set(project.id, project);
    }

    if (legacyCompanyIds.length > 0) {
      const sharedLegacyQuery = supabase
        .from("psk_projects")
        .select(`
          *,
          client:psk_clients(*)
        `)
        .in("company_id", legacyCompanyIds)
        .order("updated_at", { ascending: false });

      const { data: legacyShared, error: legacyError } = await sharedLegacyQuery;
      if (legacyError) throw legacyError;

      for (const project of (legacyShared || []) as PSKProject[]) {
        sharedProjectsById.set(project.id, project);
      }
    }
  }

  // Combine and sort by updated_at
  const normalizedPersonal = (personalProjects as PSKProject[]).map((project) =>
    normalizeProject(project as PSKProjectRow, legacyToPointstack)
  );
  const normalizedShared = Array.from(sharedProjectsById.values()).map((project) =>
    normalizeProject(project as PSKProjectRow, legacyToPointstack)
  );
  const allProjects = [...normalizedPersonal, ...normalizedShared];
  allProjects.sort((a, b) =>
    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );

  return allProjects;
}

export async function createProject(
  project: Omit<PSKProject, "id" | "created_at" | "updated_at" | "client" | "creator">
): Promise<PSKProject> {
  const supabase = createSupabaseClient();
  if (!supabase) throw new Error("Supabase client not available");

  const companyRefs = await resolveCompanyRefs(project.company_id);

  const { data, error } = await supabase
    .from("psk_projects")
    .insert({
      ...project,
      company_id: companyRefs.legacyCompanyId,
      pointstack_company_id: companyRefs.pointstackCompanyId,
    })
    .select(`
      *,
      client:psk_clients(*)
    `)
    .single();

  if (error) throw error;
  const projectRow = data as PSKProjectRow;
  const legacyRows = await getLegacyCompanyRowsByLegacyIds([
    projectRow.company_id,
    projectRow.client?.company_id,
  ]);
  const legacyToPointstack = buildLegacyToPointstackMap(legacyRows);
  return normalizeProject(
    projectRow,
    legacyToPointstack
  );
}

export async function updateProject(
  id: string,
  updates: Partial<PSKProject>
): Promise<PSKProject> {
  const supabase = createSupabaseClient();
  if (!supabase) throw new Error("Supabase client not available");

  // Remove joined data from updates
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { client, creator, ...updateData } = updates;

  let companyUpdateData: Partial<{ company_id: string | null; pointstack_company_id: string | null }> = {};
  if ("company_id" in updateData) {
    const refs = await resolveCompanyRefs(updateData.company_id ?? null);
    companyUpdateData = {
      company_id: refs.legacyCompanyId,
      pointstack_company_id: refs.pointstackCompanyId,
    };
  }

  const { data, error } = await supabase
    .from("psk_projects")
    .update({
      ...updateData,
      ...companyUpdateData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(`
      *,
      client:psk_clients(*)
    `)
    .single();

  if (error) throw error;
  const projectRow = data as PSKProjectRow;
  const legacyRows = await getLegacyCompanyRowsByLegacyIds([
    projectRow.company_id,
    projectRow.client?.company_id,
  ]);
  const legacyToPointstack = buildLegacyToPointstackMap(legacyRows);
  return normalizeProject(
    projectRow,
    legacyToPointstack
  );
}

export async function deleteProject(id: string): Promise<void> {
  const supabase = createSupabaseClient();
  if (!supabase) throw new Error("Supabase client not available");

  const { error } = await supabase.from("psk_projects").delete().eq("id", id);
  if (error) throw error;
}

// ============================================================================
// Tasks
// ============================================================================

/**
 * Get tasks - optionally filtered by workspace
 * Note: Daily tasks (is_daily=true) are always personal and fetched separately
 */
export async function getTasks(
  workspace?: PSKWorkspaceContext,
  options?: { dailyOnly?: boolean; projectTasksOnly?: boolean }
): Promise<PSKTask[]> {
  const supabase = createSupabaseClient();
  if (!supabase) return [];

  let query = supabase
    .from("psk_tasks")
    .select("*")
    .order("created_at", { ascending: false });

  // Daily tasks are always personal - no company filtering
  if (options?.dailyOnly) {
    query = query.eq("is_daily", true);
  } else if (options?.projectTasksOnly) {
    query = query.eq("is_daily", false);
  }

  // For project tasks in company workspace, we rely on RLS to filter based on project.company_id
  // The RLS policy allows viewing tasks in company projects if user is a member

  const { data, error } = await query;

  if (error) throw error;
  return data as PSKTask[];
}

export async function createTask(
  task: Omit<PSKTask, "id" | "created_at" | "project" | "creator">
): Promise<PSKTask> {
  const supabase = createSupabaseClient();
  if (!supabase) throw new Error("Supabase client not available");

  const pointstackCompanyId = await getProjectPointstackCompanyId(task.project_id);

  const { data, error } = await supabase
    .from("psk_tasks")
    .insert({
      ...task,
      pointstack_company_id: pointstackCompanyId,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as PSKTask;
}

export async function updateTask(
  id: string,
  updates: Partial<PSKTask>
): Promise<PSKTask> {
  const supabase = createSupabaseClient();
  if (!supabase) throw new Error("Supabase client not available");

  // Remove joined data from updates
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { project, creator, ...updateData } = updates;

  const { data, error } = await supabase
    .from("psk_tasks")
    .update(updateData)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data as PSKTask;
}

export async function deleteTask(id: string): Promise<void> {
  const supabase = createSupabaseClient();
  if (!supabase) throw new Error("Supabase client not available");

  const { error } = await supabase.from("psk_tasks").delete().eq("id", id);
  if (error) throw error;
}

// ============================================================================
// Clients
// ============================================================================

/**
 * Get all clients user has access to:
 * - Personal clients (company_id is null)
 * - Shared clients (company_id matches any company user is a member of)
 */
export async function getClients(
  companyIds?: string[]
): Promise<PSKClient[]> {
  const supabase = createSupabaseClient();
  if (!supabase) return [];

  const legacyRows = await getLegacyCompanyRowsByPointstackIds(companyIds);
  const legacyToPointstack = buildLegacyToPointstackMap(legacyRows);
  const legacyCompanyIds = legacyRows.map((row) => row.id);

  // Fetch personal clients
  const personalQuery = supabase
    .from("psk_clients")
    .select("*")
    .is("pointstack_company_id", null)
    .is("company_id", null)
    .order("name", { ascending: true });

  const { data: personalClients, error: personalError } = await personalQuery;
  if (personalError) throw personalError;

  // If user has companies, also fetch shared clients
  const sharedClientsById = new Map<string, PSKClient>();
  if (companyIds && companyIds.length > 0) {
    const sharedPointstackQuery = supabase
      .from("psk_clients")
      .select("*")
      .in("pointstack_company_id", companyIds)
      .order("name", { ascending: true });

    const { data: pointstackShared, error: pointstackError } = await sharedPointstackQuery;
    if (pointstackError) throw pointstackError;

    for (const client of (pointstackShared || []) as PSKClient[]) {
      sharedClientsById.set(client.id, client);
    }

    if (legacyCompanyIds.length > 0) {
      const sharedLegacyQuery = supabase
        .from("psk_clients")
        .select("*")
        .in("company_id", legacyCompanyIds)
        .order("name", { ascending: true });

      const { data: legacyShared, error: legacyError } = await sharedLegacyQuery;
      if (legacyError) throw legacyError;

      for (const client of (legacyShared || []) as PSKClient[]) {
        sharedClientsById.set(client.id, client);
      }
    }
  }

  // Combine and sort by name
  const normalizedPersonal = (personalClients as PSKClient[]).map((client) =>
    normalizeClient(client as PSKClientRow, legacyToPointstack)
  );
  const normalizedShared = Array.from(sharedClientsById.values()).map((client) =>
    normalizeClient(client as PSKClientRow, legacyToPointstack)
  );
  const allClients = [...normalizedPersonal, ...normalizedShared];
  allClients.sort((a, b) => a.name.localeCompare(b.name));

  return allClients;
}

export async function createClient(
  client: Omit<PSKClient, "id" | "created_at" | "updated_at">
): Promise<PSKClient> {
  const supabase = createSupabaseClient();
  if (!supabase) throw new Error("Supabase client not available");

  const companyRefs = await resolveCompanyRefs(client.company_id);

  const { data, error } = await supabase
    .from("psk_clients")
    .insert({
      ...client,
      company_id: companyRefs.legacyCompanyId,
      pointstack_company_id: companyRefs.pointstackCompanyId,
    })
    .select()
    .single();

  if (error) throw error;
  const clientRow = data as PSKClientRow;
  const legacyRows = await getLegacyCompanyRowsByLegacyIds([clientRow.company_id]);
  const legacyToPointstack = buildLegacyToPointstackMap(legacyRows);
  return normalizeClient(
    clientRow,
    legacyToPointstack
  );
}

export async function updateClient(
  id: string,
  updates: Partial<PSKClient>
): Promise<PSKClient> {
  const supabase = createSupabaseClient();
  if (!supabase) throw new Error("Supabase client not available");

  let companyUpdateData: Partial<{ company_id: string | null; pointstack_company_id: string | null }> = {};
  if ("company_id" in updates) {
    const refs = await resolveCompanyRefs(updates.company_id ?? null);
    companyUpdateData = {
      company_id: refs.legacyCompanyId,
      pointstack_company_id: refs.pointstackCompanyId,
    };
  }

  const { data, error } = await supabase
    .from("psk_clients")
    .update({
      ...updates,
      ...companyUpdateData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  const clientRow = data as PSKClientRow;
  const legacyRows = await getLegacyCompanyRowsByLegacyIds([clientRow.company_id]);
  const legacyToPointstack = buildLegacyToPointstackMap(legacyRows);
  return normalizeClient(
    clientRow,
    legacyToPointstack
  );
}

export async function deleteClient(id: string): Promise<void> {
  const supabase = createSupabaseClient();
  if (!supabase) throw new Error("Supabase client not available");

  const { error } = await supabase.from("psk_clients").delete().eq("id", id);
  if (error) throw error;
}

// ============================================================================
// Time Entries
// ============================================================================

export async function getTimeEntries(): Promise<PSKTimeEntry[]> {
  const supabase = createSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("psk_time_entries")
    .select("*")
    .order("date", { ascending: false });

  if (error) throw error;
  return data as PSKTimeEntry[];
}

export async function createTimeEntry(
  entry: Omit<PSKTimeEntry, "id" | "created_at" | "project">
): Promise<PSKTimeEntry> {
  const supabase = createSupabaseClient();
  if (!supabase) throw new Error("Supabase client not available");

  const pointstackCompanyId = await getProjectPointstackCompanyId(entry.project_id);

  const { data, error } = await supabase
    .from("psk_time_entries")
    .insert({
      ...entry,
      pointstack_company_id: pointstackCompanyId,
    })
    .select()
    .single();

  if (error) throw error;
  return data as PSKTimeEntry;
}

export async function updateTimeEntry(
  id: string,
  updates: Partial<PSKTimeEntry>
): Promise<PSKTimeEntry> {
  const supabase = createSupabaseClient();
  if (!supabase) throw new Error("Supabase client not available");

  // Remove joined data from updates
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { project, creator, ...updateData } = updates;

  const { data, error } = await supabase
    .from("psk_time_entries")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as PSKTimeEntry;
}

export async function deleteTimeEntry(id: string): Promise<void> {
  const supabase = createSupabaseClient();
  if (!supabase) throw new Error("Supabase client not available");

  const { error } = await supabase
    .from("psk_time_entries")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ============================================================================
// Files
// ============================================================================

export async function getFiles(): Promise<PSKFile[]> {
  const supabase = createSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("psk_files")
    .select("*")
    .order("uploaded_at", { ascending: false });

  if (error) throw error;
  return data as PSKFile[];
}

export async function createFile(
  file: Omit<PSKFile, "id" | "uploaded_at">
): Promise<PSKFile> {
  const supabase = createSupabaseClient();
  if (!supabase) throw new Error("Supabase client not available");

  const pointstackCompanyId = await getProjectPointstackCompanyId(file.project_id);

  const { data, error } = await supabase
    .from("psk_files")
    .insert({
      ...file,
      pointstack_company_id: pointstackCompanyId,
    })
    .select()
    .single();

  if (error) throw error;
  return data as PSKFile;
}

export async function deleteFile(id: string): Promise<void> {
  const supabase = createSupabaseClient();
  if (!supabase) throw new Error("Supabase client not available");

  const { error } = await supabase.from("psk_files").delete().eq("id", id);
  if (error) throw error;
}

// ============================================================================
// Budget Line Items
// ============================================================================

export async function getBudgetLineItems(): Promise<PSKBudgetLineItem[]> {
  const supabase = createSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("psk_budget_line_items")
    .select("*")
    .order("date", { ascending: false });

  if (error) throw error;
  return data as PSKBudgetLineItem[];
}

export async function createBudgetLineItem(
  item: Omit<PSKBudgetLineItem, "id" | "created_at">
): Promise<PSKBudgetLineItem> {
  const supabase = createSupabaseClient();
  if (!supabase) throw new Error("Supabase client not available");

  const pointstackCompanyId = await getProjectPointstackCompanyId(item.project_id);

  const { data, error } = await supabase
    .from("psk_budget_line_items")
    .insert({
      ...item,
      pointstack_company_id: pointstackCompanyId,
    })
    .select()
    .single();

  if (error) throw error;
  return data as PSKBudgetLineItem;
}

export async function deleteBudgetLineItem(id: string): Promise<void> {
  const supabase = createSupabaseClient();
  if (!supabase) throw new Error("Supabase client not available");

  const { error } = await supabase
    .from("psk_budget_line_items")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ============================================================================
// Notes (Site Log / Work Notes)
// ============================================================================

export async function getNotes(): Promise<PSKNote[]> {
  const supabase = createSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("psk_notes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as PSKNote[];
}

export async function createNote(
  note: Omit<PSKNote, "id" | "created_at" | "creator">
): Promise<PSKNote> {
  const supabase = createSupabaseClient();
  if (!supabase) throw new Error("Supabase client not available");

  const pointstackCompanyId = await getProjectPointstackCompanyId(note.project_id);

  const { data, error } = await supabase
    .from("psk_notes")
    .insert({
      ...note,
      pointstack_company_id: pointstackCompanyId,
    })
    .select()
    .single();

  if (error) throw error;
  return data as PSKNote;
}

export async function updateNote(
  id: string,
  updates: Partial<PSKNote>
): Promise<PSKNote> {
  const supabase = createSupabaseClient();
  if (!supabase) throw new Error("Supabase client not available");

  // Remove joined data from updates
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { creator, ...updateData } = updates;

  const { data, error } = await supabase
    .from("psk_notes")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as PSKNote;
}

export async function deleteNote(id: string): Promise<void> {
  const supabase = createSupabaseClient();
  if (!supabase) throw new Error("Supabase client not available");

  const { error } = await supabase.from("psk_notes").delete().eq("id", id);
  if (error) throw error;
}
