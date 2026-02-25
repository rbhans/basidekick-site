"use client";

import { Separator } from "@/components/ui/separator";
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
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <span>
        <span className="font-medium text-foreground">
          {activeProjects.length}
        </span>{" "}
        active
      </span>
      <Separator orientation="vertical" className="h-3" />
      <span>
        <span className="font-medium text-foreground">{clients.length}</span>{" "}
        clients
      </span>
      <Separator orientation="vertical" className="h-3" />
      <span>
        <span className="font-medium text-foreground">{totalHours}h</span>{" "}
        logged
      </span>
    </div>
  );
}
