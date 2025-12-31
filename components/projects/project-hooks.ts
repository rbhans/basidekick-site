"use client";

import { useMemo } from "react";
import { useProjectStore } from "./project-store";

export function useHydration() {
  const isLoading = useProjectStore((state) => state.isLoading);
  return !isLoading;
}

export function useProjects() {
  const projects = useProjectStore((state) => state.projects);
  const addProject = useProjectStore((state) => state.addProject);
  const updateProject = useProjectStore((state) => state.updateProject);
  const deleteProject = useProjectStore((state) => state.deleteProject);
  const archiveProject = useProjectStore((state) => state.archiveProject);

  return { projects, addProject, updateProject, deleteProject, archiveProject };
}

export function useProject(id: string | undefined) {
  const projects = useProjectStore((state) => state.projects);

  return useMemo(
    () => projects.find((project) => project.id === id),
    [projects, id]
  );
}

export function useProjectsWithClients() {
  const projects = useProjectStore((state) => state.projects);
  const clients = useProjectStore((state) => state.clients);

  return useMemo(
    () =>
      projects.map((project) => ({
        ...project,
        client: project.client_id
          ? clients.find((c) => c.id === project.client_id)
          : undefined,
      })),
    [projects, clients]
  );
}

export function useProjectWithClient(id: string | undefined) {
  const project = useProject(id);
  const clients = useProjectStore((state) => state.clients);

  return useMemo(() => {
    if (!project) return undefined;
    return {
      ...project,
      client: project.client_id
        ? clients.find((c) => c.id === project.client_id)
        : undefined,
    };
  }, [project, clients]);
}

export function useClients() {
  const clients = useProjectStore((state) => state.clients);
  const addClient = useProjectStore((state) => state.addClient);
  const updateClient = useProjectStore((state) => state.updateClient);
  const deleteClient = useProjectStore((state) => state.deleteClient);

  return { clients, addClient, updateClient, deleteClient };
}

export function useClient(id: string | undefined) {
  const clients = useProjectStore((state) => state.clients);

  return useMemo(
    () => clients.find((client) => client.id === id),
    [clients, id]
  );
}

function useTasksInternal(filters?: {
  projectId?: string;
  isDaily?: boolean;
}) {
  const tasks = useProjectStore((state) => state.tasks);
  const addTask = useProjectStore((state) => state.addTask);
  const updateTask = useProjectStore((state) => state.updateTask);
  const deleteTask = useProjectStore((state) => state.deleteTask);
  const toggleTaskComplete = useProjectStore(
    (state) => state.toggleTaskComplete
  );

  const filteredTasks = useMemo(() => {
    if (!filters) return tasks;

    return tasks.filter((task) => {
      if (
        filters.projectId !== undefined &&
        task.project_id !== filters.projectId
      ) {
        return false;
      }

      if (filters.isDaily !== undefined && task.is_daily !== filters.isDaily) {
        return false;
      }

      return true;
    });
  }, [tasks, filters]);

  return {
    tasks: filteredTasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
  };
}

export function useTasks(filters?: { projectId?: string; isDaily?: boolean }) {
  return useTasksInternal(filters);
}

export function useDailyTasks() {
  return useTasksInternal({ isDaily: true });
}

export function useProjectTasks(projectId: string | undefined) {
  return useTasksInternal(projectId ? { projectId } : undefined);
}

export function useTimeEntries(projectId?: string) {
  const timeEntries = useProjectStore((state) => state.timeEntries);
  const addTimeEntry = useProjectStore((state) => state.addTimeEntry);
  const deleteTimeEntry = useProjectStore((state) => state.deleteTimeEntry);

  const filteredEntries = useMemo(() => {
    if (!projectId) return timeEntries;
    return timeEntries.filter((entry) => entry.project_id === projectId);
  }, [timeEntries, projectId]);

  return { timeEntries: filteredEntries, addTimeEntry, deleteTimeEntry };
}

export function useFiles(projectId?: string) {
  const files = useProjectStore((state) => state.files);
  const addFile = useProjectStore((state) => state.addFile);
  const deleteFile = useProjectStore((state) => state.deleteFile);

  const filteredFiles = useMemo(() => {
    if (!projectId) return files;
    return files.filter((file) => file.project_id === projectId);
  }, [files, projectId]);

  return { files: filteredFiles, addFile, deleteFile };
}

export function useProjectStats(projectId: string | undefined) {
  const tasks = useProjectStore((state) => state.tasks);
  const timeEntries = useProjectStore((state) => state.timeEntries);

  return useMemo(() => {
    if (!projectId) {
      return { taskCount: 0, completedTasks: 0, totalTime: 0 };
    }

    const projectTasks = tasks.filter((task) => task.project_id === projectId);
    const projectTimeEntries = timeEntries.filter(
      (entry) => entry.project_id === projectId
    );

    return {
      taskCount: projectTasks.length,
      completedTasks: projectTasks.filter((task) => task.status === "completed")
        .length,
      totalTime: projectTimeEntries.reduce(
        (sum, entry) => sum + entry.duration,
        0
      ),
    };
  }, [tasks, timeEntries, projectId]);
}

export function useClientProjects(clientId: string | undefined) {
  const projects = useProjectStore((state) => state.projects);

  return useMemo(() => {
    if (!clientId) return [];
    return projects.filter((project) => project.client_id === clientId);
  }, [projects, clientId]);
}

export function useBudgetLineItems(projectId?: string) {
  const budgetLineItems = useProjectStore((state) => state.budgetLineItems);
  const addBudgetLineItem = useProjectStore(
    (state) => state.addBudgetLineItem
  );
  const deleteBudgetLineItem = useProjectStore(
    (state) => state.deleteBudgetLineItem
  );

  const filteredItems = useMemo(() => {
    if (!projectId) return budgetLineItems;
    return budgetLineItems.filter((item) => item.project_id === projectId);
  }, [budgetLineItems, projectId]);

  return {
    budgetLineItems: filteredItems,
    addBudgetLineItem,
    deleteBudgetLineItem,
  };
}

export function useProjectBudget(projectId: string | undefined) {
  const project = useProject(projectId);
  const budgetLineItems = useProjectStore((state) => state.budgetLineItems);
  const timeEntries = useProjectStore((state) => state.timeEntries);

  return useMemo(() => {
    if (!projectId || !project) {
      return {
        budget: 0,
        hourlyRate: 0,
        totalTimeCost: 0,
        totalLineItemsCost: 0,
        totalSpent: 0,
        remaining: 0,
        percentageUsed: 0,
        isOverBudget: false,
      };
    }

    const projectLineItems = budgetLineItems.filter(
      (item) => item.project_id === projectId
    );
    const projectTimeEntries = timeEntries.filter(
      (entry) => entry.project_id === projectId
    );

    const totalTimeCost = projectTimeEntries.reduce((sum, entry) => {
      const hours = entry.duration / 60;
      return sum + hours * (project.hourly_rate ?? 0);
    }, 0);

    const totalLineItemsCost = projectLineItems.reduce(
      (sum, item) => sum + item.cost,
      0
    );

    const totalSpent = totalTimeCost + totalLineItemsCost;
    const budget = project.budget ?? 0;
    const remaining = budget - totalSpent;
    const percentageUsed = budget > 0 ? (totalSpent / budget) * 100 : 0;
    const isOverBudget = totalSpent > budget && budget > 0;

    return {
      budget,
      hourlyRate: project.hourly_rate ?? 0,
      totalTimeCost,
      totalLineItemsCost,
      totalSpent,
      remaining,
      percentageUsed,
      isOverBudget,
    };
  }, [projectId, project, budgetLineItems, timeEntries]);
}
