"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Archive,
  Trash,
  MagnifyingGlass,
  User,
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
    <div className="border border-border bg-card">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold">Projects</h2>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={showArchived ? "default" : "outline"}
              size="sm"
              onClick={() => setShowArchived((value) => !value)}
            >
              <Archive className="mr-1 size-4" />
              {showArchived ? "Show Active" : "Show Archived"}
            </Button>
            <Dialog
              open={isProjectDialogOpen}
              onOpenChange={setIsProjectDialogOpen}
            >
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-1 size-4" />
                  New Project
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
        </div>
        <div className="mt-4 relative">
          <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="space-y-2">
          {filteredProjects.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {searchQuery
                ? "No projects match that search."
                : showArchived
                  ? "No archived projects."
                  : "You haven't created any projects yet."}
            </p>
          ) : (
            filteredProjects.map((project) => {
              const clientName = getClientName(project.client_id);

              return (
                <button
                  key={project.id}
                  onClick={() => handleCardClick(project.id)}
                  className="w-full text-left"
                >
                  <div
                    className={cn(
                      "flex items-center justify-between border border-border p-3 transition hover:bg-accent/50",
                      project.is_archived && "opacity-75"
                    )}
                  >
                    <div className="flex flex-1 items-center gap-3">
                      <div className="flex-1">
                        <p className="font-semibold">{project.name}</p>
                        {clientName && (
                          <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            <User className="size-3" />
                            {clientName}
                          </p>
                        )}
                        {project.is_internal && (
                          <p className="text-xs text-muted-foreground">
                            Internal project
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-muted px-2 py-1 text-xs capitalize">
                        {project.status.replace("-", " ")}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
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
                            "size-4",
                            project.is_archived && "text-primary"
                          )}
                        />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={(event) =>
                          handleDeleteProject(project.id, event)
                        }
                      >
                        <Trash className="size-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
