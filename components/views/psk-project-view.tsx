"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SectionLabel } from "@/components/section-label";
import { CircuitBackground } from "@/components/circuit-background";
import { Button } from "@/components/ui/button";
import {
  useProjectStore,
  useProjectWithClient,
  useProjectStats,
  useProjectTasks,
  useTimeEntries,
  useBudgetLineItems,
} from "@/components/projects";
import { useAuth } from "@/components/providers/auth-provider";
import {
  ArrowLeft,
  CalendarBlank,
  Clock,
  CheckSquare,
  CurrencyDollar,
  User,
  Buildings,
} from "@phosphor-icons/react";
import { ROUTES } from "@/lib/routes";

interface PSKProjectViewProps {
  projectId: string;
}

export function PSKProjectView({ projectId }: PSKProjectViewProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const initialize = useProjectStore((state) => state.initialize);
  const isLoading = useProjectStore((state) => state.isLoading);
  const project = useProjectWithClient(projectId);
  const stats = useProjectStats(projectId);
  const { tasks } = useProjectTasks(projectId);
  const { timeEntries } = useTimeEntries(projectId);
  const { budgetLineItems } = useBudgetLineItems(projectId);

  // Initialize store when user is authenticated
  useEffect(() => {
    if (user && !authLoading) {
      initialize();
    }
  }, [user, authLoading, initialize]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(ROUTES.SIGNIN);
    }
  }, [authLoading, user, router]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-full">
        <section className="relative py-12 overflow-hidden">
          <CircuitBackground opacity={0.15} />
          <div className="container mx-auto px-4 relative z-10">
            <SectionLabel>project</SectionLabel>
            <h1 className="mt-6 text-3xl md:text-4xl font-semibold tracking-tight">
              Loading...
            </h1>
          </div>
        </section>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-full">
        <section className="relative py-12 overflow-hidden">
          <CircuitBackground opacity={0.15} />
          <div className="container mx-auto px-4 relative z-10">
            <SectionLabel>project</SectionLabel>
            <h1 className="mt-6 text-3xl md:text-4xl font-semibold tracking-tight">
              Project Not Found
            </h1>
            <p className="mt-2 text-muted-foreground">
              This project doesn&apos;t exist or you don&apos;t have access to
              it.
            </p>
            <Button asChild className="mt-4">
              <Link href={ROUTES.PSK}>
                <ArrowLeft className="mr-2 size-4" />
                Back to Projects
              </Link>
            </Button>
          </div>
        </section>
      </div>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const totalBudgetSpent = budgetLineItems.reduce(
    (sum, item) => sum + item.cost,
    0
  );
  const timeSpentHours = stats.totalTime / 60;
  const timeCost = timeSpentHours * (project.hourly_rate || 0);
  const totalSpent = totalBudgetSpent + timeCost;

  return (
    <div className="min-h-full">
      {/* Header */}
      <section className="relative py-12 overflow-hidden">
        <CircuitBackground opacity={0.15} />
        <div className="container mx-auto px-4 relative z-10">
          <Link
            href={ROUTES.PSK}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="size-4" />
            Back to Projects
          </Link>
          <SectionLabel>{project.status.replace("-", " ")}</SectionLabel>
          <h1 className="mt-6 text-3xl md:text-4xl font-semibold tracking-tight">
            {project.name}
          </h1>
          {project.description && (
            <p className="mt-2 text-muted-foreground max-w-xl">
              {project.description}
            </p>
          )}

          {/* Client/Internal badge */}
          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            {project.client ? (
              <span className="flex items-center gap-1">
                <User className="size-4" />
                {project.client.name}
              </span>
            ) : project.is_internal ? (
              <span className="flex items-center gap-1">
                <Buildings className="size-4" />
                Internal Project
              </span>
            ) : null}
            {project.due_date && (
              <span className="flex items-center gap-1">
                <CalendarBlank className="size-4" />
                Due {formatDate(project.due_date)}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Tasks
                </span>
                <CheckSquare className="size-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-semibold">
                {stats.completedTasks}/{stats.taskCount}
              </p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>

            <div className="border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Time Logged
                </span>
                <Clock className="size-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-semibold">
                {formatMinutes(stats.totalTime)}
              </p>
              <p className="text-xs text-muted-foreground">
                {timeEntries.length} entries
              </p>
            </div>

            <div className="border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Budget
                </span>
                <CurrencyDollar className="size-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-semibold">
                ${project.budget?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-muted-foreground">Total budget</p>
            </div>

            <div className="border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Spent
                </span>
                <CurrencyDollar className="size-4 text-muted-foreground" />
              </div>
              <p
                className={`text-2xl font-semibold ${totalSpent > (project.budget || 0) && project.budget ? "text-destructive" : ""}`}
              >
                ${totalSpent.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-muted-foreground">
                {project.budget
                  ? `${Math.round((totalSpent / project.budget) * 100)}% of budget`
                  : "No budget set"}
              </p>
            </div>
          </div>

          {/* Tasks */}
          <div className="border border-border bg-card mb-6">
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold">Tasks</h2>
            </div>
            <div className="p-4">
              {tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No tasks yet. Add tasks to track your progress.
                </p>
              ) : (
                <ul className="space-y-2">
                  {tasks.map((task) => (
                    <li
                      key={task.id}
                      className="flex items-center gap-3 p-2 border border-border"
                    >
                      <span
                        className={`size-2 rounded-full ${
                          task.status === "completed"
                            ? "bg-green-500"
                            : task.status === "in-progress"
                              ? "bg-yellow-500"
                              : "bg-muted"
                        }`}
                      />
                      <span
                        className={
                          task.status === "completed"
                            ? "line-through text-muted-foreground"
                            : ""
                        }
                      >
                        {task.title}
                      </span>
                      <span className="ml-auto text-xs text-muted-foreground capitalize">
                        {task.priority}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Notes */}
          {project.notes && (
            <div className="border border-border bg-card">
              <div className="p-4 border-b border-border">
                <h2 className="font-semibold">Notes</h2>
              </div>
              <div className="p-4">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {project.notes}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
