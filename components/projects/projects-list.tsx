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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useClients, useProjects } from "./project-hooks";
import { useProjectStore } from "./project-store";
import { ROUTES } from "@/lib/routes";
import { ClientForm } from "./client-form";

export function ProjectsList() {
  const router = useRouter();
  const { projects, addProject, updateProject, deleteProject } = useProjects();
  const { clients } = useClients();
  const userId = useProjectStore((state) => state.projects[0]?.user_id);

  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    clientId: "",
    isInternal: false,
    dueDate: "",
  });

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

  const handleCreateProject = async () => {
    if (!newProject.name.trim() || !userId) return;

    await addProject({
      user_id: userId,
      name: newProject.name,
      description: newProject.description || null,
      client_id: newProject.isInternal ? null : newProject.clientId || null,
      status: "backlog",
      is_internal: newProject.isInternal,
      is_archived: false,
      due_date: newProject.dueDate || null,
      color: null,
      proton_drive_link: null,
      notes: null,
      budget: null,
      hourly_rate: null,
    });

    setNewProject({
      name: "",
      description: "",
      clientId: "",
      isInternal: false,
      dueDate: "",
    });
    setIsProjectDialogOpen(false);
  };

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
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Project</DialogTitle>
                </DialogHeader>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Project Name *
                    </label>
                    <Input
                      autoFocus
                      placeholder="Enter project name"
                      value={newProject.name}
                      onChange={(event) =>
                        setNewProject((value) => ({
                          ...value,
                          name: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Description
                    </label>
                    <Textarea
                      placeholder="What's this project about?"
                      value={newProject.description}
                      onChange={(event) =>
                        setNewProject((value) => ({
                          ...value,
                          description: event.target.value,
                        }))
                      }
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Due Date
                    </label>
                    <Input
                      type="date"
                      value={newProject.dueDate}
                      onChange={(event) =>
                        setNewProject((value) => ({
                          ...value,
                          dueDate: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="psk-internal-project"
                      type="checkbox"
                      checked={newProject.isInternal}
                      onChange={(event) =>
                        setNewProject((value) => ({
                          ...value,
                          isInternal: event.target.checked,
                          clientId: event.target.checked ? "" : value.clientId,
                        }))
                      }
                      className="size-4 border-border"
                    />
                    <label
                      htmlFor="psk-internal-project"
                      className="text-sm font-medium"
                    >
                      Internal project (no client)
                    </label>
                  </div>
                  {!newProject.isInternal && (
                    <div className="space-y-2 border border-border p-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Client</label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsClientDialogOpen(true)}
                        >
                          <Plus className="mr-1 size-4" />
                          New Client
                        </Button>
                      </div>
                      {clients.length > 0 ? (
                        <select
                          className="h-10 w-full border border-border bg-background px-3 text-sm"
                          value={newProject.clientId}
                          onChange={(event) =>
                            setNewProject((value) => ({
                              ...value,
                              clientId: event.target.value,
                            }))
                          }
                        >
                          <option value="">Select a client...</option>
                          {clients.map((client) => (
                            <option key={client.id} value={client.id}>
                              {client.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No clients yet. Create one to link this project.
                        </p>
                      )}
                    </div>
                  )}
                  <Button className="w-full" onClick={handleCreateProject}>
                    Create Project
                  </Button>
                </div>
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

      {/* Client Dialog */}
      <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Client</DialogTitle>
          </DialogHeader>
          <ClientForm
            onSave={() => setIsClientDialogOpen(false)}
            onCancel={() => setIsClientDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
