"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  useProjectStore,
  DashboardStats,
  KanbanBoard,
  ProjectsList,
  ClientsList,
  ProjectCalendar,
  DailyTaskList,
  BillableHoursReport,
  QuickTimeEntry,
} from "@/components/projects";
import { useAuth } from "@/components/providers/auth-provider";
import { SignIn, Timer } from "@phosphor-icons/react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const TAB_TRIGGER_CLASS =
  "rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-sm";

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
      <div className="flex items-center h-12 px-4 border-b border-border/40">
        <span className="text-sm font-semibold">Projects</span>
        <Separator orientation="vertical" className="mx-3 h-4" />
        <span className="text-xs text-muted-foreground">Loading...</span>
      </div>
    );
  }

  // Show sign-in prompt if not authenticated
  if (!user) {
    return (
      <div className="flex flex-col h-full">
        <header className="flex items-center h-12 px-4 border-b border-border/40 shrink-0">
          <span className="text-sm font-semibold">Projects</span>
        </header>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-sm">
            <SignIn className="size-10 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-1">Sign in to continue</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Create an account or sign in to start managing your projects.
            </p>
            <div className="flex gap-3 justify-center">
              <Button asChild variant="outline" size="sm">
                <Link href={ROUTES.SIGNUP}>Create Account</Link>
              </Button>
              <Button asChild size="sm">
                <Link href={ROUTES.SIGNIN}>Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Compact Toolbar Header */}
      <header className="flex items-center justify-between h-12 px-4 border-b border-border/40 shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold">Projects</h1>
          {!isLoading && (
            <>
              <Separator orientation="vertical" className="h-4" />
              <DashboardStats />
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 text-xs">
                <Timer className="size-3.5 mr-1" />
                Log Time
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Log Time</DialogTitle>
              </DialogHeader>
              <QuickTimeEntry className="border-0 bg-transparent" />
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Error State */}
      {error && (
        <div className="mx-4 mt-2 p-2 text-sm border border-destructive/50 bg-destructive/10 text-destructive rounded-md">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      ) : (
        /* Tabbed Content */
        <Tabs defaultValue="board" className="flex-1 flex flex-col min-h-0">
          <TabsList className="bg-transparent rounded-none border-b border-border/40 h-10 px-4 justify-start gap-0 shrink-0">
            <TabsTrigger value="board" className={TAB_TRIGGER_CLASS}>
              Board
            </TabsTrigger>
            <TabsTrigger value="projects" className={TAB_TRIGGER_CLASS}>
              Projects
            </TabsTrigger>
            <TabsTrigger value="schedule" className={TAB_TRIGGER_CLASS}>
              Schedule
            </TabsTrigger>
            <TabsTrigger value="billing" className={TAB_TRIGGER_CLASS}>
              Billing
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="board"
            className="flex-1 overflow-auto mt-0 p-3"
          >
            <KanbanBoard />
          </TabsContent>

          <TabsContent
            value="projects"
            className="flex-1 overflow-auto mt-0 p-3"
          >
            <div className="space-y-4">
              <ProjectsList />
              <ClientsList />
            </div>
          </TabsContent>

          <TabsContent
            value="schedule"
            className="flex-1 overflow-auto mt-0 p-3"
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <ProjectCalendar />
              <DailyTaskList />
            </div>
          </TabsContent>

          <TabsContent
            value="billing"
            className="flex-1 overflow-auto mt-0 p-3"
          >
            <BillableHoursReport />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
