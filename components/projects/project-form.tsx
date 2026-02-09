"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { X, UsersThree } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useProjects, useClients } from "./project-hooks";
import { useProjectStore } from "./project-store";
import { useAuth } from "@/components/providers/auth-provider";
import { toast } from "sonner";
import type { PSKProject, PSKKanbanStatus } from "@/lib/types";
import {
  projectFormSchema,
  type ProjectFormValues,
} from "@/lib/schemas/projects";

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

const NO_CLIENT_VALUE = "__none";

function getDefaultValues(project?: PSKProject): ProjectFormValues {
  return {
    name: project?.name ?? "",
    description: project?.description ?? "",
    client_id: project?.client_id ?? "",
    status: project?.status ?? "backlog",
    is_internal: project?.is_internal ?? false,
    is_shared: project?.company_id != null,
    due_date: project?.due_date
      ? new Date(project.due_date).toISOString().split("T")[0]
      : "",
    budget: project?.budget?.toString() ?? "",
    hourly_rate: project?.hourly_rate?.toString() ?? "",
    proton_drive_link: project?.proton_drive_link ?? "",
    notes: project?.notes ?? "",
    color: project?.color ?? "",
  };
}

export function ProjectForm({ project, onSave, onCancel }: ProjectFormProps) {
  const { addProject, updateProject } = useProjects();
  const { clients } = useClients();
  const { user } = useAuth();
  const companies = useProjectStore((state) => state.companies);
  const initializeCompanies = useProjectStore((state) => state.initializeCompanies);

  useEffect(() => {
    if (user && companies.length === 0) {
      initializeCompanies();
    }
  }, [user, companies.length, initializeCompanies]);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: getDefaultValues(project),
  });

  useEffect(() => {
    form.reset(getDefaultValues(project));
  }, [project, form]);

  const userCompany = companies[0] ?? null;

  const isInternal = useWatch({
    control: form.control,
    name: "is_internal",
    defaultValue: false,
  });
  const isShared = useWatch({
    control: form.control,
    name: "is_shared",
    defaultValue: false,
  });
  const color = useWatch({
    control: form.control,
    name: "color",
    defaultValue: "",
  });

  const onSubmit = async (values: ProjectFormValues) => {
    if (!user?.id) {
      toast.error("Unable to save - please sign in");
      return;
    }

    if (values.is_shared && !userCompany) {
      toast.error("Unable to share project - no team available");
      return;
    }

    const projectData = {
      name: values.name.trim(),
      description: values.description.trim() || null,
      client_id: values.is_internal ? null : values.client_id || null,
      status: values.status,
      is_internal: values.is_internal,
      is_archived: project?.is_archived ?? false,
      due_date: values.due_date ? new Date(values.due_date).toISOString() : null,
      budget: values.budget.trim() ? parseFloat(values.budget) : null,
      hourly_rate: values.hourly_rate.trim() ? parseFloat(values.hourly_rate) : null,
      proton_drive_link: values.proton_drive_link.trim() || null,
      notes: values.notes.trim() || null,
      color: values.color.trim() || null,
    };

    if (project) {
      await updateProject(project.id, {
        ...projectData,
        company_id: values.is_shared && userCompany ? userCompany.id : null,
      });
    } else {
      await addProject({
        ...projectData,
        user_id: user.id,
        company_id: values.is_shared && userCompany ? userCompany.id : null,
        created_by: user.id,
      });
    }

    onSave();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter project name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Brief project description"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <FormField
              control={form.control}
              name="is_internal"
              render={({ field }) => (
                <FormItem>
                  <label className="flex cursor-pointer items-center gap-2">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(event) => {
                          const next = event.target.checked;
                          field.onChange(next);
                          if (next) {
                            form.setValue("client_id", "", {
                              shouldDirty: true,
                              shouldTouch: true,
                              shouldValidate: true,
                            });
                          }
                        }}
                        className="size-4"
                      />
                    </FormControl>
                    <span className="text-sm">Internal Project (no client)</span>
                  </label>
                  <FormMessage />
                </FormItem>
              )}
            />

            {userCompany && (
              <FormField
                control={form.control}
                name="is_shared"
                render={({ field }) => (
                  <FormItem>
                    <label className="flex cursor-pointer items-center gap-2">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={(event) => field.onChange(event.target.checked)}
                          className="size-4"
                        />
                      </FormControl>
                      <UsersThree className="size-4 text-primary" />
                      <span className="text-sm">Share with team</span>
                      <span className="text-xs text-muted-foreground">({userCompany.name})</span>
                    </label>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          {!isInternal && (
            <FormField
              control={form.control}
              name="client_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value || undefined}
                      onValueChange={(value) => {
                        field.onChange(value === NO_CLIENT_VALUE ? "" : value);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a client..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NO_CLIENT_VALUE}>Select a client...</SelectItem>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="due_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="budget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Budget ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hourly_rate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hourly Rate ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="proton_drive_link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cloud Storage Link</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://drive.proton.me/..."
                  {...field}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                Link to Proton Drive, Google Drive, or other cloud storage
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Color</FormLabel>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={color || "#6b7280"}
                  onChange={(event) => {
                    field.onChange(event.target.value);
                  }}
                  className="h-10 w-16 cursor-pointer border border-border"
                />
                <FormControl>
                  <Input {...field} className="font-mono" placeholder="#6b7280" />
                </FormControl>
                {field.value && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => form.setValue("color", "")}
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Additional notes, links, or context..."
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting || (isShared && !userCompany)}>
            {project ? "Update Project" : "Create Project"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
