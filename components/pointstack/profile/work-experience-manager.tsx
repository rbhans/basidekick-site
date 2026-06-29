"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, PencilSimple, Trash, X, LinkedinLogo } from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TagInput } from "../shared/tag-input";
import { WorkExperience } from "@/lib/types";
import {
  workExperienceFormSchema,
  type WorkExperienceFormValues,
  WORK_EXPERIENCE_YEARS,
} from "@/lib/schemas/work-experience";
import * as api from "../pointstack-api";
import { LinkedInImport } from "./linkedin-import";

interface WorkExperienceManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entries: WorkExperience[];
  onChanged: () => void;
}

const EMPTY: WorkExperienceFormValues = {
  kind: "work",
  title: "",
  organization: "",
  organizationUrl: "",
  location: "",
  startYear: WORK_EXPERIENCE_YEARS[1] ?? WORK_EXPERIENCE_YEARS[0],
  isCurrent: true,
  endYear: null,
  description: "",
  tags: [],
};

function toForm(e: WorkExperience): WorkExperienceFormValues {
  return {
    kind: e.kind,
    title: e.title,
    organization: e.organization,
    organizationUrl: e.organization_url || "",
    location: e.location || "",
    startYear: Number(e.start_date.slice(0, 4)),
    isCurrent: e.is_current,
    endYear: e.end_date ? Number(e.end_date.slice(0, 4)) : null,
    description: e.description || "",
    tags: e.tags || [],
  };
}

const SELECT_CLS =
  "w-full rounded-md border border-border bg-card px-3 py-2 text-[14px] text-foreground outline-none transition-colors focus:border-foreground";

export function WorkExperienceManager({
  open,
  onOpenChange,
  entries,
  onChanged,
}: WorkExperienceManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [importMode, setImportMode] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const form = useForm<WorkExperienceFormValues>({
    resolver: zodResolver(workExperienceFormSchema),
    defaultValues: EMPTY,
  });
  const { register, handleSubmit, control, reset, watch, formState } = form;
  const isCurrent = watch("isCurrent");

  useEffect(() => {
    if (!open) {
      setShowForm(false);
      setImportMode(false);
      setEditingId(null);
      reset(EMPTY);
    }
  }, [open, reset]);

  const startAdd = () => {
    setEditingId(null);
    reset(EMPTY);
    setShowForm(true);
  };

  const startEdit = (entry: WorkExperience) => {
    setEditingId(entry.id);
    reset(toForm(entry));
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    reset(EMPTY);
  };

  const onSubmit = async (values: WorkExperienceFormValues) => {
    const payload = {
      kind: values.kind,
      title: values.title.trim(),
      organization: values.organization.trim(),
      organization_url: values.organizationUrl.trim() || null,
      location: values.location.trim() || null,
      start_date: `${values.startYear}-01-01`,
      end_date: values.isCurrent ? null : values.endYear ? `${values.endYear}-01-01` : null,
      is_current: values.isCurrent,
      description: values.description.trim() || null,
      tags: values.tags,
    };

    try {
      if (editingId) {
        await api.updateWorkExperience(editingId, payload);
      } else {
        await api.createWorkExperience(payload);
      }
      toast.success(editingId ? "Experience updated." : "Experience added.");
      closeForm();
      onChanged();
    } catch (error) {
      console.error("Error saving work experience:", error);
      toast.error("Couldn't save. Please try again.");
    }
  };

  const onDelete = async (id: string) => {
    setBusyId(id);
    try {
      await api.deleteWorkExperience(id);
      toast.success("Removed.");
      onChanged();
    } catch (error) {
      console.error("Error removing work experience:", error);
      toast.error("Couldn't remove. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Experience</DialogTitle>
        </DialogHeader>

        {entries.length > 0 && (
          <ul className="divide-y divide-border rounded-md border border-border">
            {entries.map((e) => (
              <li key={e.id} className="flex items-center gap-3 px-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] font-medium text-foreground">{e.title}</div>
                  <div className="truncate font-mono text-[11px] text-muted-foreground">
                    {e.organization} · {e.start_date.slice(0, 4)}—
                    {e.is_current ? "Now" : e.end_date?.slice(0, 4) ?? "—"}
                  </div>
                </div>
                <Button type="button" variant="ghost" size="icon-sm" aria-label="Edit entry" onClick={() => startEdit(e)}>
                  <PencilSimple className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Delete entry"
                  disabled={busyId === e.id}
                  onClick={() => onDelete(e.id)}
                >
                  <Trash className="h-4 w-4 text-destructive" />
                </Button>
              </li>
            ))}
          </ul>
        )}

        {importMode ? (
          <LinkedInImport
            existing={entries}
            onImported={() => {
              setImportMode(false);
              onChanged();
            }}
            onCancel={() => setImportMode(false)}
          />
        ) : showForm ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 rounded-md border border-border p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">{editingId ? "Edit entry" : "New entry"}</h4>
              <button
                type="button"
                onClick={closeForm}
                aria-label="Close form"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Type">
                <select {...register("kind")} className={SELECT_CLS}>
                  <option value="work">Work</option>
                  <option value="education">Education</option>
                </select>
              </Field>
              <Field label="Location">
                <Input placeholder="Phoenix, AZ" {...register("location")} />
              </Field>
            </div>

            <Field label="Title" error={formState.errors.title?.message}>
              <Input placeholder="Senior Controls Engineer" {...register("title")} />
            </Field>
            <Field label="Organization" error={formState.errors.organization?.message}>
              <Input placeholder="Company or school" {...register("organization")} />
            </Field>
            <Field label="Organization URL" error={formState.errors.organizationUrl?.message}>
              <Input type="url" placeholder="https://…" {...register("organizationUrl")} />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Start year" error={formState.errors.startYear?.message}>
                <Controller
                  control={control}
                  name="startYear"
                  render={({ field }) => (
                    <select
                      className={SELECT_CLS}
                      value={field.value == null ? "" : String(field.value)}
                      onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                    >
                      {WORK_EXPERIENCE_YEARS.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  )}
                />
              </Field>
              <Field label="End year" error={formState.errors.endYear?.message}>
                <Controller
                  control={control}
                  name="endYear"
                  render={({ field }) => (
                    <select
                      className={SELECT_CLS}
                      disabled={isCurrent}
                      value={field.value == null ? "" : String(field.value)}
                      onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                    >
                      <option value="">—</option>
                      {WORK_EXPERIENCE_YEARS.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  )}
                />
              </Field>
            </div>

            <label className="flex items-center gap-2 text-[13px] text-foreground">
              <input type="checkbox" {...register("isCurrent")} className="h-4 w-4" />
              I currently work / study here
            </label>

            <Field label="Description" error={formState.errors.description?.message}>
              <textarea
                {...register("description")}
                rows={3}
                maxLength={800}
                placeholder="What you did, scope, and impact."
                className="w-full resize-y rounded-md border border-border bg-card p-3 text-[14px] text-foreground outline-none transition-colors focus:border-foreground"
              />
            </Field>

            <Field label="Tags">
              <Controller
                control={control}
                name="tags"
                render={({ field }) => (
                  <TagInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Niagara N4, Commissioning…"
                    maxTags={8}
                  />
                )}
              />
            </Field>

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={closeForm}>
                Cancel
              </Button>
              <Button type="submit" disabled={formState.isSubmitting}>
                {formState.isSubmitting ? "Saving…" : editingId ? "Save" : "Add"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={startAdd} className="gap-1.5">
              <Plus className="h-4 w-4" /> Add entry
            </Button>
            <Button type="button" variant="ghost" onClick={() => setImportMode(true)} className="gap-1.5">
              <LinkedinLogo className="h-4 w-4" /> Import from LinkedIn
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[13px] font-medium text-foreground">{label}</label>
      {children}
      {error && <p className="text-[12px] text-destructive">{error}</p>}
    </div>
  );
}
