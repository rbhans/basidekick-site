"use client";

import { Kanban, Users, Clock } from "@phosphor-icons/react";
import { useProjects, useClients, useTimeEntries } from "./project-hooks";

export function DashboardStats() {
  const { projects } = useProjects();
  const { clients } = useClients();
  const { timeEntries } = useTimeEntries();

  const activeProjects = projects.filter((project) => !project.is_archived);
  const totalHours = Math.round(
    timeEntries.reduce((sum, entry) => sum + entry.duration, 0) / 60
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div className="border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            Projects
          </span>
          <Kanban className="size-4 text-muted-foreground" />
        </div>
        <p className="text-2xl font-semibold">{activeProjects.length}</p>
        <p className="text-xs text-muted-foreground">Active projects</p>
      </div>

      <div className="border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            Clients
          </span>
          <Users className="size-4 text-muted-foreground" />
        </div>
        <p className="text-2xl font-semibold">{clients.length}</p>
        <p className="text-xs text-muted-foreground">Saved client accounts</p>
      </div>

      <div className="border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            Time Logged
          </span>
          <Clock className="size-4 text-muted-foreground" />
        </div>
        <p className="text-2xl font-semibold">{totalHours}h</p>
        <p className="text-xs text-muted-foreground">Across all entries</p>
      </div>
    </div>
  );
}
