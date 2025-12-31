"use client";

import { useEffect, useState } from "react";
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
import {
  Kanban,
  List,
  SignIn,
  Folder,
  Users,
} from "@phosphor-icons/react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";

type Tab = "projects" | "clients";
type ViewMode = "kanban" | "list";

export function PSKView() {
  const { user, loading: authLoading } = useAuth();
  const initialize = useProjectStore((state) => state.initialize);
  const isLoading = useProjectStore((state) => state.isLoading);
  const error = useProjectStore((state) => state.error);
  const [activeTab, setActiveTab] = useState<Tab>("projects");
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");

  // Initialize store when user is authenticated
  useEffect(() => {
    if (user && !authLoading) {
      initialize();
    }
  }, [user, authLoading, initialize]);

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
          {/* Stats */}
          <div className="mb-8">
            <DashboardStats />
          </div>

          {/* Main Content Grid - Calendar & Tasks on right */}
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            {/* Left Column - Projects/Clients */}
            <div>
              {/* Tabs */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex border border-border">
                  <button
                    onClick={() => setActiveTab("projects")}
                    className={`px-4 py-2 text-sm flex items-center gap-2 transition-colors ${
                      activeTab === "projects"
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    }`}
                  >
                    <Folder className="size-4" />
                    Projects
                  </button>
                  <button
                    onClick={() => setActiveTab("clients")}
                    className={`px-4 py-2 text-sm flex items-center gap-2 transition-colors ${
                      activeTab === "clients"
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    }`}
                  >
                    <Users className="size-4" />
                    Clients
                  </button>
                </div>

                {/* View Toggle (only for projects tab) */}
                {activeTab === "projects" && (
                  <div className="flex border border-border">
                    <button
                      onClick={() => setViewMode("kanban")}
                      className={`px-3 py-1.5 text-sm flex items-center gap-1.5 transition-colors ${
                        viewMode === "kanban"
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent"
                      }`}
                    >
                      <Kanban className="size-4" />
                      Kanban
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`px-3 py-1.5 text-sm flex items-center gap-1.5 transition-colors ${
                        viewMode === "list"
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent"
                      }`}
                    >
                      <List className="size-4" />
                      List
                    </button>
                  </div>
                )}
              </div>

              {/* Error State */}
              {error && (
                <div className="mb-6 p-4 border border-destructive/50 bg-destructive/10 text-destructive">
                  {error}
                </div>
              )}

              {/* Loading State */}
              {isLoading ? (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground font-mono">
                    Loading...
                  </p>
                </div>
              ) : (
                <>
                  {/* Tab Content */}
                  {activeTab === "projects" ? (
                    viewMode === "kanban" ? (
                      <KanbanBoard />
                    ) : (
                      <ProjectsList />
                    )
                  ) : (
                    <ClientsList />
                  )}
                </>
              )}
            </div>

            {/* Right Column - Calendar & Daily Tasks */}
            <div className="space-y-6">
              <ProjectCalendar />
              <DailyTaskList />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
