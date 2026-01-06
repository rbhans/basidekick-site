"use client";

import { useEffect } from "react";
import { SectionLabel } from "@/components/section-label";
import { CircuitBackground } from "@/components/circuit-background";
import { Button } from "@/components/ui/button";
import {
  useProjectStore,
  DashboardStats,
  KanbanBoard,
  ProjectsList,
  ClientsList,
  ProjectCalendar,
  DailyTaskList,
} from "@/components/projects";
import { useAuth } from "@/components/providers/auth-provider";
import { SignIn } from "@phosphor-icons/react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";

export function PSKView() {
  const { user, loading: authLoading } = useAuth();
  const initialize = useProjectStore((state) => state.initialize);
  const isLoading = useProjectStore((state) => state.isLoading);
  const error = useProjectStore((state) => state.error);

  // Initialize store when user is authenticated
  useEffect(() => {
    if (user && !authLoading) {
      initialize();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-full">
        <section className="relative py-12 overflow-hidden">
          <CircuitBackground opacity={0.15} />
          <div className="container mx-auto px-4 relative z-10">
            <SectionLabel>project sidekick</SectionLabel>
            <h1 className="mt-6 text-3xl md:text-4xl font-semibold tracking-tight">
              Project Manager
            </h1>
            <p className="mt-2 text-muted-foreground max-w-xl">Loading...</p>
          </div>
        </section>
      </div>
    );
  }

  // Show sign-in prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-full">
        <section className="relative py-12 overflow-hidden">
          <CircuitBackground opacity={0.15} />
          <div className="container mx-auto px-4 relative z-10">
            <SectionLabel>project sidekick</SectionLabel>
            <h1 className="mt-6 text-3xl md:text-4xl font-semibold tracking-tight">
              Project Manager
            </h1>
            <p className="mt-2 text-muted-foreground max-w-xl">
              Track projects, clients, tasks, time, and budgets all in one
              place.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="border border-dashed border-border p-12 text-center max-w-xl mx-auto">
              <SignIn className="size-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                Sign in to continue
              </h2>
              <p className="text-muted-foreground mb-6">
                Create an account or sign in to start managing your projects.
              </p>
              <div className="flex gap-4 justify-center">
                <Button asChild variant="outline">
                  <Link href={ROUTES.SIGNUP}>Create Account</Link>
                </Button>
                <Button asChild>
                  <Link href={ROUTES.SIGNIN}>Sign In</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      {/* Header */}
      <section className="relative py-12 overflow-hidden">
        <CircuitBackground opacity={0.15} />
        <div className="container mx-auto px-4 relative z-10">
          <SectionLabel>project sidekick</SectionLabel>
          <h1 className="mt-6 text-3xl md:text-4xl font-semibold tracking-tight">
            Project Manager
          </h1>
          <p className="mt-2 text-muted-foreground max-w-xl">
            Track projects, clients, tasks, time, and budgets all in one place.
          </p>
        </div>
      </section>

      {/* Dashboard */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {/* Error State */}
          {error && (
            <div className="mb-6 p-4 border border-destructive/50 bg-destructive/10 text-destructive">
              {error}
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground font-mono">Loading...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Stats */}
              <DashboardStats />

              {/* Kanban Board - Full Width */}
              <KanbanBoard />

              {/* Bottom Grid: Projects List, Clients, Calendar, Daily Tasks */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Left: Projects List */}
                <ProjectsList />

                {/* Right: Clients */}
                <div className="border border-border bg-card p-4">
                  <h2 className="text-lg font-semibold mb-4">Clients</h2>
                  <ClientsList />
                </div>
              </div>

              {/* Calendar and Daily Tasks */}
              <div className="grid gap-6 lg:grid-cols-2">
                <ProjectCalendar />
                <DailyTaskList />
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
