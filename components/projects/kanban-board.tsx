"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
import { DotsSixVertical, User, UsersThree } from "@phosphor-icons/react";
import { useProjects, useClients } from "./project-hooks";
import { ROUTES } from "@/lib/routes";
import type { PSKKanbanStatus, PSKProject } from "@/lib/types";
import { cn } from "@/lib/utils";

const COLUMNS: Array<{ status: PSKKanbanStatus; title: string }> = [
  { status: "backlog", title: "Backlog" },
  { status: "in-progress", title: "In Progress" },
  { status: "review", title: "Review" },
  { status: "completed", title: "Completed" },
];

interface ProjectCardProps {
  project: PSKProject;
  clientName: string | null;
  onOpen: (projectId: string) => void;
}

function ProjectCard({ project, clientName, onOpen }: ProjectCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: project.id,
  });

  const style = transform
    ? {
      transform: CSS.Translate.toString(transform),
    }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => onOpen(project.id)}
      className={cn(
        "cursor-move border border-border bg-card shadow-sm p-4 text-left transition",
        "hover:bg-accent/50 hover:border-primary/50",
        isDragging && "opacity-50"
      )}
    >
      <ProjectCardContent project={project} clientName={clientName} />
    </div>
  );
}

function ProjectCardContent({
  project,
  clientName,
}: {
  project: PSKProject;
  clientName: string | null;
}) {
  return (
    <>
      <div className="mb-2 flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-foreground">{project.name}</p>
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
      {project.company_id && (
        <p className="mt-1 flex items-center gap-1 text-xs text-primary">
          <UsersThree className="size-3" weight="fill" />
          Shared
        </p>
      )}
    </>
  );
}

function KanbanColumn({
  status,
  title,
  count,
  children,
}: {
  status: PSKKanbanStatus;
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "border border-border bg-card/40 p-4 transition-colors",
        isOver && "border-primary ring-1 ring-primary/40"
      )}
    >
      <header className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h3>
        <span className="bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {count}
        </span>
      </header>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export function KanbanBoard() {
  const router = useRouter();
  const { projects, updateProject } = useProjects();
  const { clients } = useClients();
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const activeProjects = useMemo(
    () => projects.filter((p) => !p.is_archived),
    [projects]
  );

  const groupedProjects = useMemo(() => {
    return COLUMNS.map(({ status, title }) => ({
      status,
      title,
      projects: activeProjects.filter((project) => project.status === status),
    }));
  }, [activeProjects]);

  const projectsById = useMemo(() => {
    return new Map(activeProjects.map((project) => [project.id, project]));
  }, [activeProjects]);

  const getClientName = (clientId: string | null) => {
    if (!clientId) return null;
    return clients.find((c) => c.id === clientId)?.name ?? null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveProjectId(String(event.active.id));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveProjectId(null);

    const targetStatus = event.over?.id as PSKKanbanStatus | undefined;
    const projectId = String(event.active.id);
    const draggedProject = projectsById.get(projectId);

    if (!targetStatus || !draggedProject) return;
    if (!COLUMNS.some((column) => column.status === targetStatus)) return;
    if (draggedProject.status === targetStatus) return;

    await updateProject(projectId, { status: targetStatus });
  };

  const activeProject = activeProjectId ? projectsById.get(activeProjectId) : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {groupedProjects.map((column) => (
          <KanbanColumn
            key={column.status}
            status={column.status}
            title={column.title}
            count={column.projects.length}
          >
            {column.projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                clientName={getClientName(project.client_id)}
                onOpen={(projectId) => router.push(ROUTES.PSK_PROJECT(projectId))}
              />
            ))}
            {column.projects.length === 0 && (
              <p className="py-4 text-center text-xs text-muted-foreground">
                Drop projects here
              </p>
            )}
          </KanbanColumn>
        ))}
      </div>

      <DragOverlay>
        {activeProject ? (
          <div className="w-[260px] border border-border bg-card shadow-lg p-4">
            <ProjectCardContent
              project={activeProject}
              clientName={getClientName(activeProject.client_id)}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
