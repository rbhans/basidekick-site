"use client";

import { create } from "zustand";
import type {
  PSKProject,
  PSKTask,
  PSKClient,
  PSKTimeEntry,
  PSKFile,
  PSKBudgetLineItem,
  PSKCompany,
  PSKWorkspaceContext,
} from "@/lib/types";
import * as api from "./project-api";
import * as companyApi from "./company-api";

// Default workspace is personal
const DEFAULT_WORKSPACE: PSKWorkspaceContext = {
  type: "personal",
  companyId: null,
  companyName: null,
};

interface ProjectStoreState {
  // Data
  projects: PSKProject[];
  tasks: PSKTask[];
  timeEntries: PSKTimeEntry[];
  files: PSKFile[];
  clients: PSKClient[];
  budgetLineItems: PSKBudgetLineItem[];

  // Companies (for team sharing)
  companies: PSKCompany[];

  // Status
  isLoading: boolean;
  error: string | null;

  // Company Management
  initializeCompanies: () => Promise<void>;
  createCompany: (name: string, userId: string) => Promise<PSKCompany>;
  deleteCompany: (id: string) => Promise<void>;

  // Initialization
  initialize: () => Promise<void>;

  // Projects
  addProject: (
    project: Omit<PSKProject, "id" | "created_at" | "updated_at" | "client" | "creator">
  ) => Promise<void>;
  updateProject: (id: string, updates: Partial<PSKProject>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  archiveProject: (id: string) => Promise<void>;

  // Tasks
  addTask: (
    task: Omit<PSKTask, "id" | "created_at" | "project" | "creator">
  ) => Promise<void>;
  updateTask: (id: string, updates: Partial<PSKTask>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskComplete: (id: string) => Promise<void>;

  // Time Entries
  addTimeEntry: (
    entry: Omit<PSKTimeEntry, "id" | "created_at" | "project">
  ) => Promise<void>;
  deleteTimeEntry: (id: string) => Promise<void>;

  // Files
  addFile: (file: Omit<PSKFile, "id" | "uploaded_at">) => Promise<void>;
  deleteFile: (id: string) => Promise<void>;

  // Clients
  addClient: (
    client: Omit<PSKClient, "id" | "created_at" | "updated_at">
  ) => Promise<void>;
  updateClient: (id: string, updates: Partial<PSKClient>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;

  // Budget
  addBudgetLineItem: (
    item: Omit<PSKBudgetLineItem, "id" | "created_at">
  ) => Promise<void>;
  deleteBudgetLineItem: (id: string) => Promise<void>;
}

export const useProjectStore = create<ProjectStoreState>((set, get) => ({
  // Data
  projects: [],
  tasks: [],
  timeEntries: [],
  files: [],
  clients: [],
  budgetLineItems: [],

  // Companies
  companies: [],

  // Status
  isLoading: false,
  error: null,

  // Company Management
  initializeCompanies: async () => {
    try {
      const companies = await companyApi.getCompanies();
      set({ companies });
    } catch (error) {
      console.error("Failed to load companies:", error);
    }
  },

  createCompany: async (name, userId) => {
    const newCompany = await companyApi.createCompany(name, userId);
    set((state) => ({ companies: [...state.companies, newCompany] }));
    return newCompany;
  },

  deleteCompany: async (id) => {
    await companyApi.deleteCompany(id);
    set((state) => ({
      companies: state.companies.filter((c) => c.id !== id),
    }));
    // Re-initialize to refresh projects list
    await get().initialize();
  },

  initialize: async () => {
    set({ isLoading: true, error: null });

    try {
      // First, load companies to know which shared projects to fetch
      const companies = await companyApi.getCompanies();
      const companyIds = companies.map((c) => c.id);
      set({ companies });

      // Always fetch daily tasks (personal only)
      const dailyTasks = await api.getTasks(undefined, { dailyOnly: true });

      // Fetch all data - projects include personal + shared from all companies
      const [projects, projectTasks, timeEntries, files, clients, budgetLineItems] =
        await Promise.all([
          api.getProjects(companyIds),
          api.getTasks(undefined, { projectTasksOnly: true }),
          api.getTimeEntries(),
          api.getFiles(),
          api.getClients(companyIds),
          api.getBudgetLineItems(),
        ]);

      // Combine daily tasks with project tasks
      const tasks = [...dailyTasks, ...projectTasks];

      set({ projects, tasks, timeEntries, files, clients, budgetLineItems });
    } catch (error) {
      console.error("Failed to initialize store:", error);
      set({ error: "Failed to load data" });
    } finally {
      set({ isLoading: false });
    }
  },

  // Projects
  addProject: async (project) => {
    try {
      const newProject = await api.createProject(project);
      set((state) => ({ projects: [newProject, ...state.projects] }));
    } catch (error) {
      console.error("Failed to add project:", error);
      set({ error: "Failed to add project" });
    }
  },

  updateProject: async (id, updates) => {
    try {
      const updatedProject = await api.updateProject(id, updates);
      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === id ? updatedProject : p
        ),
      }));
    } catch (error) {
      console.error("Failed to update project:", error);
      set({ error: "Failed to update project" });
    }
  },

  deleteProject: async (id) => {
    try {
      await api.deleteProject(id);
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        tasks: state.tasks.filter((t) => t.project_id !== id),
        timeEntries: state.timeEntries.filter((t) => t.project_id !== id),
        files: state.files.filter((f) => f.project_id !== id),
        budgetLineItems: state.budgetLineItems.filter(
          (b) => b.project_id !== id
        ),
      }));
    } catch (error) {
      console.error("Failed to delete project:", error);
      set({ error: "Failed to delete project" });
    }
  },

  archiveProject: async (id) => {
    try {
      const updatedProject = await api.updateProject(id, { is_archived: true });
      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === id ? updatedProject : p
        ),
      }));
    } catch (error) {
      console.error("Failed to archive project:", error);
      set({ error: "Failed to archive project" });
    }
  },

  // Tasks
  addTask: async (task) => {
    try {
      const newTask = await api.createTask(task);
      set((state) => ({ tasks: [newTask, ...state.tasks] }));
    } catch (error) {
      console.error("Failed to add task:", error);
      set({ error: "Failed to add task" });
    }
  },

  updateTask: async (id, updates) => {
    try {
      const updatedTask = await api.updateTask(id, updates);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? updatedTask : t)),
      }));
    } catch (error) {
      console.error("Failed to update task:", error);
      set({ error: "Failed to update task" });
    }
  },

  deleteTask: async (id) => {
    try {
      await api.deleteTask(id);
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
      }));
    } catch (error) {
      console.error("Failed to delete task:", error);
      set({ error: "Failed to delete task" });
    }
  },

  toggleTaskComplete: async (id) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;

    const newStatus = task.status === "completed" ? "todo" : "completed";
    const completed_at =
      newStatus === "completed" ? new Date().toISOString() : null;

    try {
      const updatedTask = await api.updateTask(id, {
        status: newStatus,
        completed_at,
      });
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? updatedTask : t)),
      }));
    } catch (error) {
      console.error("Failed to toggle task:", error);
      set({ error: "Failed to toggle task" });
    }
  },

  // Time Entries
  addTimeEntry: async (entry) => {
    try {
      const newEntry = await api.createTimeEntry(entry);
      set((state) => ({ timeEntries: [newEntry, ...state.timeEntries] }));
    } catch (error) {
      console.error("Failed to add time entry:", error);
      set({ error: "Failed to add time entry" });
    }
  },

  deleteTimeEntry: async (id) => {
    try {
      await api.deleteTimeEntry(id);
      set((state) => ({
        timeEntries: state.timeEntries.filter((t) => t.id !== id),
      }));
    } catch (error) {
      console.error("Failed to delete time entry:", error);
      set({ error: "Failed to delete time entry" });
    }
  },

  // Files
  addFile: async (file) => {
    try {
      const newFile = await api.createFile(file);
      set((state) => ({ files: [newFile, ...state.files] }));
    } catch (error) {
      console.error("Failed to add file:", error);
      set({ error: "Failed to add file" });
    }
  },

  deleteFile: async (id) => {
    try {
      await api.deleteFile(id);
      set((state) => ({
        files: state.files.filter((f) => f.id !== id),
      }));
    } catch (error) {
      console.error("Failed to delete file:", error);
      set({ error: "Failed to delete file" });
    }
  },

  // Clients
  addClient: async (client) => {
    try {
      const newClient = await api.createClient(client);
      set((state) => ({ clients: [newClient, ...state.clients] }));
    } catch (error) {
      console.error("Failed to add client:", error);
      set({ error: "Failed to add client" });
    }
  },

  updateClient: async (id, updates) => {
    try {
      const updatedClient = await api.updateClient(id, updates);
      set((state) => ({
        clients: state.clients.map((c) => (c.id === id ? updatedClient : c)),
      }));
    } catch (error) {
      console.error("Failed to update client:", error);
      set({ error: "Failed to update client" });
    }
  },

  deleteClient: async (id) => {
    try {
      await api.deleteClient(id);
      set((state) => ({
        clients: state.clients.filter((c) => c.id !== id),
        projects: state.projects.map((p) =>
          p.client_id === id ? { ...p, client_id: null, client: undefined } : p
        ),
      }));
    } catch (error) {
      console.error("Failed to delete client:", error);
      set({ error: "Failed to delete client" });
    }
  },

  // Budget
  addBudgetLineItem: async (item) => {
    try {
      const newItem = await api.createBudgetLineItem(item);
      set((state) => ({
        budgetLineItems: [newItem, ...state.budgetLineItems],
      }));
    } catch (error) {
      console.error("Failed to add budget item:", error);
      set({ error: "Failed to add budget item" });
    }
  },

  deleteBudgetLineItem: async (id) => {
    try {
      await api.deleteBudgetLineItem(id);
      set((state) => ({
        budgetLineItems: state.budgetLineItems.filter((b) => b.id !== id),
      }));
    } catch (error) {
      console.error("Failed to delete budget item:", error);
      set({ error: "Failed to delete budget item" });
    }
  },
}));
