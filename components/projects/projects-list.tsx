"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Archive,
  Trash,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useClients, useProjects } from "./project-hooks";
import { ROUTES } from "@/lib/routes";
import { ProjectForm } from "./project-form";
import { STATUS_DOT_COLOR } from "./status-colors";
import type { PSKKanbanStatus } from "@/lib/types";

export function ProjectsList() {
  const router = useRouter();
  const { projects, updateProject, deleteProject } = useProjects();
  const { clients } = useClients();

  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const filteredProjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesArchive = showArchived
        ? project.is_archived
        : !project.is_archived;
      if (!matchesArchive) return false;

      if (!query) return true;

      const clientName = project.client_id
        ? clients.find((c) => c.id === project.client_id)?.name
        : null;

      return (
        project.name.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query) ||
        clientName?.toLowerCase().includes(query)
      );
    });
  }, [projects, searchQuery, showArchived, clients]);

  const handleToggleArchive = async (
    projectId: string,
    isArchived: boolean,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    await updateProject(projectId, { is_archived: !isArchived });
  };

  const handleDeleteProject = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (window.confirm("Delete this project?")) {
      await deleteProject(id);
    }
  };

  const handleCardClick = (id: string) => {
    router.push(ROUTES.PSK_PROJECT(id));
  };

  const getClientName = (clientId: string | null) => {
    if (!clientId) return null;
    return clients.find((c) => c.id === clientId)?.name;
  };

  return (
    <div className="rounded-md border border-border/40">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40">
        <div className="relative flex-1">
          <MagnifyingGlass className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="h-8 pl-8 text-sm"
          />
        </div>
        <Button
          variant={showArchived ? "default" : "ghost"}
          size="sm"
          className="h-8 text-xs shrink-0"
          onClick={() => setShowArchived((value) => !value)}
        >
          <Archive className="size-3.5 mr-1" />
          {showArchived ? "Active" : "Archived"}
        </Button>
        <Dialog
          open={isProjectDialogOpen}
          onOpenChange={setIsProjectDialogOpen}
        >
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 text-xs shrink-0">
              <Plus className="size-3.5 mr-1" />
              New
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Project</DialogTitle>
            </DialogHeader>
            <ProjectForm
              onSave={() => setIsProjectDialogOpen(false)}
              onCancel={() => setIsProjectDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Project Rows */}
      <div>
        {filteredProjects.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {searchQuery
              ? "No projects match that search."
              : showArchived
                ? "No archived projects."
                : "No projects yet."}
          </p>
        ) : (
          filteredProjects.map((project) => {
            const clientName = getClientName(project.client_id);

            return (
              <button
                key={project.id}
                onClick={() => handleCardClick(project.id)}
                className={cn(
                  "flex w-full items-center gap-3 px-3 py-2 text-left border-b border-border/40 last:border-b-0 transition-colors hover:bg-muted/30",
                  project.is_archived && "opacity-60"
                )}
              >
                <span
                  className={cn(
                    "size-2 rounded-full shrink-0",
                    STATUS_DOT_COLOR[project.status as PSKKanbanStatus] || "bg-muted-foreground"
                  )}
                />
                <span className="flex-1 text-sm font-medium truncate">
                  {project.name}
                </span>
                {clientName && (
                  <span className="text-xs text-muted-foreground truncate max-w-[140px] hidden sm:inline">
                    {clientName}
                  </span>
                )}
                <div
                  className="flex items-center gap-0.5 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-6"
                    title={project.is_archived ? "Unarchive" : "Archive"}
                    onClick={(event) =>
                      handleToggleArchive(
                        project.id,
                        project.is_archived,
                        event
                      )
                    }
                  >
                    <Archive
                      className={cn(
                        "size-3.5",
                        project.is_archived && "text-primary"
                      )}
                    />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-6"
                    onClick={(event) =>
                      handleDeleteProject(project.id, event)
                    }
                  >
                    <Trash className="size-3.5 text-muted-foreground" />
                  </Button>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
