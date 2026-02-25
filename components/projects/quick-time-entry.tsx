"use client";

import { useState } from "react";
import { Clock } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProjects, useTimeEntries } from "./project-hooks";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface QuickTimeEntryProps {
  className?: string;
}

export function QuickTimeEntry({ className }: QuickTimeEntryProps) {
  const { user } = useAuth();
  const { projects } = useProjects();
  const { addTimeEntry } = useTimeEntries();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState({
    project_id: "",
    description: "",
    hours: "",
    minutes: "",
    date: new Date().toISOString().split("T")[0],
  });

  // Filter to only active projects
  const activeProjects = projects.filter((p) => !p.is_archived);

  const handleSubmit = async () => {
    if (!user?.id || !formState.project_id) return;

    const hours = parseInt(formState.hours) || 0;
    const minutes = parseInt(formState.minutes) || 0;
    const duration = hours * 60 + minutes;

    if (duration <= 0) return;

    setIsSubmitting(true);
    try {
      await addTimeEntry({
        user_id: user.id,
        created_by: user.id,
        project_id: formState.project_id,
        description: formState.description || null,
        duration,
        date: formState.date,
      });

      toast.success("Time logged successfully");

      // Reset form but keep date and project for quick subsequent entries
      setFormState((prev) => ({
        ...prev,
        description: "",
        hours: "",
        minutes: "",
      }));
    } catch (error) {
      console.error("Failed to log time:", error);
      toast.error("Failed to log time. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProject = projects.find((p) => p.id === formState.project_id);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Project Select */}
      <div>
        <label className="block text-sm font-medium mb-1">Project *</label>
        <select
          value={formState.project_id}
          onChange={(e) =>
            setFormState((prev) => ({ ...prev, project_id: e.target.value }))
          }
          className="w-full h-8 px-3 rounded-md border border-border/60 bg-background text-sm"
        >
          <option value="">Select a project...</option>
          {activeProjects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        {selectedProject?.hourly_rate && (
          <p className="mt-1 text-xs text-muted-foreground">
            Rate: ${selectedProject.hourly_rate}/hr
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Description (optional)
        </label>
        <Input
          placeholder="What did you work on?"
          value={formState.description}
          onChange={(e) =>
            setFormState((prev) => ({ ...prev, description: e.target.value }))
          }
          className="h-8 text-sm"
        />
      </div>

      {/* Duration & Date Row */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1">Duration *</label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Hours"
                min="0"
                value={formState.hours}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, hours: e.target.value }))
                }
                className="h-8 text-sm"
              />
            </div>
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Minutes"
                min="0"
                max="59"
                value={formState.minutes}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    minutes: e.target.value,
                  }))
                }
                className="h-8 text-sm"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <Input
            type="date"
            value={formState.date}
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, date: e.target.value }))
            }
            className="h-8 text-sm"
          />
        </div>
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={
          isSubmitting ||
          !formState.project_id ||
          (!formState.hours && !formState.minutes)
        }
        className="w-full h-8 text-sm"
        size="sm"
      >
        <Clock className="mr-1.5 size-3.5" />
        {isSubmitting ? "Logging..." : "Log Time"}
      </Button>
    </div>
  );
}
