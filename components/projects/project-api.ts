import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import type {
  PSKProject,
  PSKTask,
  PSKClient,
  PSKTimeEntry,
  PSKFile,
  PSKBudgetLineItem,
} from "@/lib/types";

// ============================================================================
// Projects
// ============================================================================

export async function getProjects(): Promise<PSKProject[]> {
  const supabase = createSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("psk_projects")
    .select("*, client:psk_clients(*)")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data as PSKProject[];
}

export async function createProject(
  project: Omit<PSKProject, "id" | "created_at" | "updated_at" | "client">
): Promise<PSKProject> {
  const supabase = createSupabaseClient();
  if (!supabase) throw new Error("Supabase client not available");

  const { data, error } = await supabase
    .from("psk_projects")
    .insert(project)
    .select("*, client:psk_clients(*)")
    .single();

  if (error) throw error;
  return data as PSKProject;
}

export async function updateProject(
  id: string,
  updates: Partial<PSKProject>
): Promise<PSKProject> {
  const supabase = createSupabaseClient();
  if (!supabase) throw new Error("Supabase client not available");

  // Remove client from updates (it's joined data)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { client, ...updateData } = updates;

  const { data, error } = await supabase
    .from("psk_projects")
    .update({ ...updateData, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*, client:psk_clients(*)")
    .single();

  if (error) throw error;
  return data as PSKProject;
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

export async function getTasks(): Promise<PSKTask[]> {
  const supabase = createSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("psk_tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as PSKTask[];
}

export async function createTask(
  task: Omit<PSKTask, "id" | "created_at" | "project">
): Promise<PSKTask> {
  const supabase = createSupabaseClient();
  if (!supabase) throw new Error("Supabase client not available");

  const { data, error } = await supabase
    .from("psk_tasks")
    .insert(task)
    .select()
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

  // Remove project from updates (it's joined data)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { project, ...updateData } = updates;

  const { data, error } = await supabase
    .from("psk_tasks")
    .update(updateData)
    .eq("id", id)
    .select()
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

export async function getClients(): Promise<PSKClient[]> {
  const supabase = createSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("psk_clients")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return data as PSKClient[];
}

export async function createClient(
  client: Omit<PSKClient, "id" | "created_at" | "updated_at">
): Promise<PSKClient> {
  const supabase = createSupabaseClient();
  if (!supabase) throw new Error("Supabase client not available");

  const { data, error } = await supabase
    .from("psk_clients")
    .insert(client)
    .select()
    .single();

  if (error) throw error;
  return data as PSKClient;
}

export async function updateClient(
  id: string,
  updates: Partial<PSKClient>
): Promise<PSKClient> {
  const supabase = createSupabaseClient();
  if (!supabase) throw new Error("Supabase client not available");

  const { data, error } = await supabase
    .from("psk_clients")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as PSKClient;
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

  const { data, error } = await supabase
    .from("psk_time_entries")
    .insert(entry)
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

  const { data, error } = await supabase
    .from("psk_files")
    .insert(file)
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

  const { data, error } = await supabase
    .from("psk_budget_line_items")
    .insert(item)
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
