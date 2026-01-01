"use client";

import { useState } from "react";
import { X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useProjects, useClients } from "./project-hooks";
import { useProjectStore } from "./project-store";
import { useAuth } from "@/components/providers/auth-provider";
import type { PSKProject, PSKKanbanStatus } from "@/lib/types";

interface ProjectFormProps {
  project?: PSKProject;
  onSave: () => void;
  onCancel: () => void;
}

const STATUS_OPTIONS: { value: PSKKanbanStatus; label: string }[] = [
  { value: "backlog", label: "Backlog" },
  { value: "in-progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "completed", label: "Completed" },
];

export function ProjectForm({ project, onSave, onCancel }: ProjectFormProps) {
  const { addProject, updateProject } = useProjects();
  const { clients } = useClients();
  const { user } = useAuth();
  const currentWorkspace = useProjectStore((state) => state.currentWorkspace);

  const [formState, setFormState] = useState({
    name: project?.name ?? "",
    description: project?.description ?? "",
    client_id: project?.client_id ?? "",
    status: project?.status ?? ("backlog" as PSKKanbanStatus),
    is_internal: project?.is_internal ?? false,
    due_date: project?.due_date
      ? new Date(project.due_date).toISOString().split("T")[0]
      : "",
    budget: project?.budget?.toString() ?? "",
    hourly_rate: project?.hourly_rate?.toString() ?? "",
    proton_drive_link: project?.proton_drive_link ?? "",
    notes: project?.notes ?? "",
    color: project?.color ?? "",
  });

  const handleSubmit = async () => {
    if (!formState.name.trim()) {
      alert("Project name is required");
      return;
    }

    if (!user?.id) {
      alert("Unable to save - please sign in");
      return;
    }

    const projectData = {
      name: formState.name.trim(),
      description: formState.description.trim() || null,
      client_id: formState.is_internal ? null : formState.client_id || null,
      status: formState.status,
      is_internal: formState.is_internal,
      is_archived: project?.is_archived ?? false,
      due_date: formState.due_date
        ? new Date(formState.due_date).toISOString()
        : null,
      budget: formState.budget ? parseFloat(formState.budget) : null,
      hourly_rate: formState.hourly_rate
        ? parseFloat(formState.hourly_rate)
        : null,
      proton_drive_link: formState.proton_drive_link.trim() || null,
      notes: formState.notes.trim() || null,
      color: formState.color || null,
    };

    if (project) {
      await updateProject(project.id, projectData);
    } else {
      await addProject({
        ...projectData,
        user_id: user.id,
        company_id: currentWorkspace.companyId,
        created_by: user.id,
      });
    }

    onSave();
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">
            Project Name *
          </label>
          <Input
            placeholder="Enter project name"
            value={formState.name}
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, name: e.target.value }))
            }
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <Textarea
            placeholder="Brief project description"
            value={formState.description}
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, description: e.target.value }))
            }
            rows={3}
          />
        </div>
      </div>

      {/* Project Type */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formState.is_internal}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  is_internal: e.target.checked,
                  client_id: e.target.checked ? "" : prev.client_id,
                }))
              }
              className="size-4"
            />
            <span className="text-sm">Internal Project (no client)</span>
          </label>
        </div>

        {!formState.is_internal && (
          <div>
            <label className="mb-1 block text-sm font-medium">Client</label>
            <select
              value={formState.client_id}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, client_id: e.target.value }))
              }
              className="w-full h-10 px-3 border border-border bg-background text-sm"
            >
              <option value="">Select a client...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Status & Due Date */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Status</label>
          <select
            value={formState.status}
            onChange={(e) =>
              setFormState((prev) => ({
                ...prev,
                status: e.target.value as PSKKanbanStatus,
              }))
            }
            className="w-full h-10 px-3 border border-border bg-background text-sm"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Due Date</label>
          <Input
            type="date"
            value={formState.due_date}
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, due_date: e.target.value }))
            }
          />
        </div>
      </div>

      {/* Budget & Hourly Rate */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Budget ($)</label>
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={formState.budget}
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, budget: e.target.value }))
            }
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Hourly Rate ($)
          </label>
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={formState.hourly_rate}
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, hourly_rate: e.target.value }))
            }
          />
        </div>
      </div>

      {/* Cloud Storage Link */}
      <div>
        <label className="mb-1 block text-sm font-medium">
          Cloud Storage Link
        </label>
        <Input
          type="url"
          placeholder="https://drive.proton.me/..."
          value={formState.proton_drive_link}
          onChange={(e) =>
            setFormState((prev) => ({
              ...prev,
              proton_drive_link: e.target.value,
            }))
          }
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Link to Proton Drive, Google Drive, or other cloud storage
        </p>
      </div>

      {/* Project Color */}
      <div>
        <label className="mb-1 block text-sm font-medium">Project Color</label>
        <div className="flex gap-2">
          <input
            type="color"
            value={formState.color || "#6b7280"}
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, color: e.target.value }))
            }
            className="h-10 w-16 cursor-pointer border border-border"
          />
          <Input
            value={formState.color}
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, color: e.target.value }))
            }
            className="font-mono"
            placeholder="#6b7280"
          />
          {formState.color && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setFormState((prev) => ({ ...prev, color: "" }))}
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="mb-1 block text-sm font-medium">Notes</label>
        <Textarea
          placeholder="Additional notes, links, or context..."
          value={formState.notes}
          onChange={(e) =>
            setFormState((prev) => ({ ...prev, notes: e.target.value }))
          }
          rows={4}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t border-border">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>
          {project ? "Update Project" : "Create Project"}
        </Button>
      </div>
    </div>
  );
}
