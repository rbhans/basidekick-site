"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useProjects } from "./project-hooks";
import { ROUTES } from "@/lib/routes";
import type { PSKProject } from "@/lib/types";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  projects: PSKProject[];
}

function getCalendarDays(year: number, month: number, projects: PSKProject[]): CalendarDay[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days: CalendarDay[] = [];

  // Add days from previous month to fill the first week
  const firstDayOfWeek = firstDay.getDay();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month, -i);
    days.push({
      date,
      isCurrentMonth: false,
      isToday: date.getTime() === today.getTime(),
      projects: [],
    });
  }

  // Add days of current month
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split("T")[0];

    const dayProjects = projects.filter((project) => {
      if (!project.due_date || project.is_archived) return false;
      const projectDate = new Date(project.due_date).toISOString().split("T")[0];
      return projectDate === dateStr;
    });

    days.push({
      date,
      isCurrentMonth: true,
      isToday: date.getTime() === today.getTime(),
      projects: dayProjects,
    });
  }

  // Add days from next month to complete the last week
  const remainingDays = 42 - days.length; // 6 rows × 7 days
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i);
    days.push({
      date,
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

export function ProjectCalendar() {
  const { projects, updateProject } = useProjects();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggedProject, setDraggedProject] = useState<PSKProject | null>(null);

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

  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDragStart = (project: PSKProject) => {
    setDraggedProject(project);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    if (!draggedProject) return;

    await updateProject(draggedProject.id, {
      due_date: date.toISOString(),
    });
    setDraggedProject(null);
  };

  return (
    <div className="border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
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

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day Headers */}
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

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`min-h-[80px] p-1 border border-border ${
                day.isCurrentMonth ? "bg-background" : "bg-muted/30"
              } ${day.isToday ? "ring-2 ring-primary" : ""}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, day.date)}
            >
              <div
                className={`text-xs font-medium mb-1 ${
                  day.isCurrentMonth
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {day.date.getDate()}
              </div>
              <div className="space-y-0.5">
                {day.projects.slice(0, 3).map((project) => {
                  const status = getProjectStatus(project);
                  return (
                    <Link
                      key={project.id}
                      href={ROUTES.PSK_PROJECT(project.id)}
                      draggable
                      onDragStart={() => handleDragStart(project)}
                      className={`block text-xs px-1 py-0.5 truncate cursor-move ${
                        status === "overdue"
                          ? "bg-red-500/20 text-red-500"
                          : status === "soon"
                            ? "bg-amber-500/20 text-amber-500"
                            : "bg-emerald-500/20 text-emerald-500"
                      }`}
                    >
                      {project.name}
                    </Link>
                  );
                })}
                {day.projects.length > 3 && (
                  <div className="text-xs text-muted-foreground px-1">
                    +{day.projects.length - 3} more
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 pb-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <span className="size-3 bg-emerald-500/20 border border-emerald-500/50" />
          On track
        </div>
        <div className="flex items-center gap-1">
          <span className="size-3 bg-amber-500/20 border border-amber-500/50" />
          Due soon (≤3 days)
        </div>
        <div className="flex items-center gap-1">
          <span className="size-3 bg-red-500/20 border border-red-500/50" />
          Overdue
        </div>
      </div>
    </div>
  );
}
