"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useProjects } from "./project-hooks";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { PSKProject } from "@/lib/types";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface CalendarDay {
  date: Date;
  dateKey: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  projects: PSKProject[];
}

function toDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

function getCalendarDays(year: number, month: number, projects: PSKProject[]): CalendarDay[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days: CalendarDay[] = [];

  const firstDayOfWeek = firstDay.getDay();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month, -i);
    days.push({
      date,
      dateKey: toDateKey(date),
      isCurrentMonth: false,
      isToday: date.getTime() === today.getTime(),
      projects: [],
    });
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day);
    const dateKey = toDateKey(date);

    const dayProjects = projects.filter((project) => {
      if (!project.due_date || project.is_archived) return false;
      const projectDateKey = toDateKey(new Date(project.due_date));
      return projectDateKey === dateKey;
    });

    days.push({
      date,
      dateKey,
      isCurrentMonth: true,
      isToday: date.getTime() === today.getTime(),
      projects: dayProjects,
    });
  }

  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i);
    days.push({
      date,
      dateKey: toDateKey(date),
      isCurrentMonth: false,
      isToday: date.getTime() === today.getTime(),
      projects: [],
    });
  }

  return days;
}

function getProjectStatus(project: PSKProject): "overdue" | "soon" | "ok" {
  if (!project.due_date) return "ok";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(project.due_date);
  dueDate.setHours(0, 0, 0, 0);

  const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilDue < 0) return "overdue";
  if (daysUntilDue <= 3) return "soon";
  return "ok";
}

function ProjectChip({ project }: { project: PSKProject }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: project.id,
  });

  const style = transform
    ? {
      transform: CSS.Translate.toString(transform),
    }
    : undefined;

  const status = getProjectStatus(project);

  return (
    <Link
      ref={setNodeRef}
      href={ROUTES.PSK_PROJECT(project.id)}
      style={style}
      draggable={false}
      {...listeners}
      {...attributes}
      className={cn(
        "block text-xs px-1 py-0.5 truncate cursor-move rounded-sm",
        status === "overdue"
          ? "bg-red-500/20 text-red-500"
          : status === "soon"
            ? "bg-amber-500/20 text-amber-500"
            : "bg-emerald-500/20 text-emerald-500",
        isDragging && "opacity-50"
      )}
    >
      {project.name}
    </Link>
  );
}

function CalendarDayCell({ day }: { day: CalendarDay }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `day:${day.dateKey}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[80px] p-1 border border-border/30 rounded-sm transition-colors",
        day.isCurrentMonth ? "bg-background" : "bg-muted/30",
        day.isToday && "ring-2 ring-primary",
        isOver && "border-primary ring-1 ring-primary/50"
      )}
    >
      <div
        className={cn(
          "text-xs font-medium mb-1",
          day.isCurrentMonth ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {day.date.getDate()}
      </div>
      <div className="space-y-0.5">
        {day.projects.slice(0, 3).map((project) => (
          <ProjectChip key={project.id} project={project} />
        ))}
        {day.projects.length > 3 && (
          <div className="text-xs text-muted-foreground px-1">
            +{day.projects.length - 3} more
          </div>
        )}
      </div>
    </div>
  );
}

export function ProjectCalendar() {
  const { projects, updateProject } = useProjects();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDays = useMemo(
    () => getCalendarDays(year, month, projects),
    [year, month, projects]
  );

  const monthName = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const projectsById = useMemo(() => {
    return new Map(projects.map((project) => [project.id, project]));
  }, [projects]);

  const activeProject = activeProjectId ? projectsById.get(activeProjectId) : null;

  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveProjectId(String(event.active.id));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveProjectId(null);

    const projectId = String(event.active.id);
    const draggedProject = projectsById.get(projectId);
    const overId = event.over?.id;

    if (!draggedProject || !overId) return;
    if (typeof overId !== "string" || !overId.startsWith("day:")) return;

    const targetDayKey = overId.replace("day:", "");
    const currentDayKey = draggedProject.due_date
      ? toDateKey(new Date(draggedProject.due_date))
      : null;

    if (currentDayKey === targetDayKey) return;

    await updateProject(projectId, {
      due_date: new Date(`${targetDayKey}T00:00:00.000Z`).toISOString(),
    });
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="rounded-lg border border-border/60 bg-card/50">
        <div className="flex items-center justify-between p-4 border-b border-border/40">
          <h3 className="font-semibold">Project Calendar</h3>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="ghost" size="icon" onClick={goToPrevMonth}>
              <CaretLeft className="size-4" />
            </Button>
            <span className="text-sm font-medium w-32 text-center">
              {monthName}
            </span>
            <Button variant="ghost" size="icon" onClick={goToNextMonth}>
              <CaretRight className="size-4" />
            </Button>
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAYS_OF_WEEK.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day) => (
              <CalendarDayCell key={day.dateKey} day={day} />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 px-4 pb-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="size-3 rounded-sm bg-emerald-500/20 border border-emerald-500/50" />
            On track
          </div>
          <div className="flex items-center gap-1">
            <span className="size-3 rounded-sm bg-amber-500/20 border border-amber-500/50" />
            Due soon (≤3 days)
          </div>
          <div className="flex items-center gap-1">
            <span className="size-3 rounded-sm bg-red-500/20 border border-red-500/50" />
            Overdue
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeProject ? (
          <div
            className={cn(
              "text-xs px-2 py-1 truncate border shadow-lg bg-background",
              getProjectStatus(activeProject) === "overdue"
                ? "bg-red-500/20 text-red-500 border-red-500/50"
                : getProjectStatus(activeProject) === "soon"
                  ? "bg-amber-500/20 text-amber-500 border-amber-500/50"
                  : "bg-emerald-500/20 text-emerald-500 border-emerald-500/50"
            )}
          >
            {activeProject.name}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
