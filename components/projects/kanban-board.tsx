"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { DotsSixVertical, User } from "@phosphor-icons/react";
import { useProjects, useClients } from "./project-hooks";
import { ROUTES } from "@/lib/routes";
import type { PSKKanbanStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const COLUMNS: Array<{ status: PSKKanbanStatus; title: string }> = [
  { status: "backlog", title: "Backlog" },
  { status: "in-progress", title: "In Progress" },
  { status: "review", title: "Review" },
  { status: "completed", title: "Completed" },
];

export function KanbanBoard() {
  const router = useRouter();
  const { projects, updateProject } = useProjects();
  const { clients } = useClients();

  // Filter out archived projects
  const activeProjects = useMemo(
    () => projects.filter((p) => !p.is_archived),
    [projects]
  );

  const groupedProjects = useMemo(() => {
    return COLUMNS.map(({ status }) => ({
      status,
      projects: activeProjects.filter((project) => project.status === status),
    }));
  }, [activeProjects]);

  const handleDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    projectId: string
  ) => {
    event.dataTransfer.setData("text/plain", projectId);
  };

  const handleDragOver = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
  };

  const handleDrop = (
    event: React.DragEvent<HTMLElement>,
    status: PSKKanbanStatus
  ) => {
    event.preventDefault();
    const projectId = event.dataTransfer.getData("text/plain");
    if (projectId) {
      updateProject(projectId, { status });
    }
  };

  const getClientName = (clientId: string | null) => {
    if (!clientId) return null;
    return clients.find((c) => c.id === clientId)?.name;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {groupedProjects.map(({ status, projects: columnProjects }) => (
        <section
          key={status}
          className="border border-border bg-card/40 p-4"
          onDragOver={handleDragOver}
          onDrop={(event) => handleDrop(event, status)}
        >
          <header className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {COLUMNS.find((column) => column.status === status)?.title ??
                status}
            </h3>
            <span className="bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {columnProjects.length}
            </span>
          </header>
          <div className="space-y-3">
            {columnProjects.map((project) => {
              const clientName = getClientName(project.client_id);

              return (
                <div
                  key={project.id}
                  draggable
                  onDragStart={(event) => handleDragStart(event, project.id)}
                  onClick={() => router.push(ROUTES.PSK_PROJECT(project.id))}
                  className={cn(
                    "cursor-move border border-border bg-card p-4 text-left transition",
                    "hover:bg-accent/50 hover:border-primary/50"
                  )}
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">
                      {project.name}
                    </p>
                    <DotsSixVertical className="size-4 shrink-0 text-muted-foreground" />
                  </div>
                  {project.description && (
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {project.description}
                    </p>
                  )}
                  {clientName && (
                    <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                      <User className="size-3" />
                      {clientName}
                    </p>
                  )}
                  {project.is_internal && (
                    <p className="mt-1 text-xs text-muted-foreground italic">
                      Internal project
                    </p>
                  )}
                </div>
              );
            })}
            {columnProjects.length === 0 && (
              <p className="py-4 text-center text-xs text-muted-foreground">
                Drop projects here
              </p>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
