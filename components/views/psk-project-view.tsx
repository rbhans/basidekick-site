"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useProjectStore,
  useProjectWithClient,
  useProjectStats,
  useProjectTasks,
  useTimeEntries,
  useBudgetLineItems,
  useFiles,
  useProjects,
  useNotes,
  ProjectForm,
  STATUS_DOT_COLOR,
} from "@/components/projects";
import { useAuth } from "@/components/providers/auth-provider";
import {
  ArrowLeft,
  CalendarBlank,
  Clock,
  CurrencyDollar,
  User,
  Plus,
  Trash,
  Check,
  PencilSimple,
  File,
  LinkSimple,
  Copy,
  UsersThree,
  Notepad,
  X,
} from "@phosphor-icons/react";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { PSKKanbanStatus } from "@/lib/types";

const TAB_TRIGGER_CLASS =
  "rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-sm";

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
  const { tasks, addTask, deleteTask, toggleTaskComplete } =
    useProjectTasks(projectId);
  const { timeEntries, addTimeEntry, updateTimeEntry, deleteTimeEntry } =
    useTimeEntries(projectId);
  const { budgetLineItems, addBudgetLineItem, deleteBudgetLineItem } =
    useBudgetLineItems(projectId);
  const { files, addFile, deleteFile } = useFiles(projectId);
  const { notes, addNote, updateNote, deleteNote } = useNotes(projectId);
  const { addProject } = useProjects();

  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCloning, setIsCloning] = useState(false);

  // Task form state
  const [newTaskTitle, setNewTaskTitle] = useState("");

  // Time entry form state
  const [timeEntryForm, setTimeEntryForm] = useState({
    description: "",
    hours: "",
    minutes: "",
    date: new Date().toISOString().split("T")[0],
  });

  // Budget item form state
  const [budgetItemForm, setBudgetItemForm] = useState({
    description: "",
    cost: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
  });

  // File form state
  const [fileForm, setFileForm] = useState({
    name: "",
    url: "",
    type: "",
  });

  // Note form state
  const [newNoteContent, setNewNoteContent] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState("");

  // Time entry edit state
  const [editingTimeEntryId, setEditingTimeEntryId] = useState<string | null>(null);
  const [editingTimeEntry, setEditingTimeEntry] = useState({
    description: "",
    hours: "",
    minutes: "",
    date: "",
  });

  // Initialize store when user is authenticated
  useEffect(() => {
    if (user && !authLoading) {
      initialize();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(ROUTES.SIGNIN);
    }
  }, [authLoading, user, router]);

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center h-12 px-4 border-b border-border/40">
        <Link href={ROUTES.PSK} className="text-sm text-muted-foreground hover:text-foreground">
          Projects
        </Link>
        <span className="mx-1.5 text-muted-foreground">/</span>
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col h-full">
        <header className="flex items-center gap-3 h-12 px-4 border-b border-border/40 shrink-0">
          <Link href={ROUTES.PSK} className="text-sm text-muted-foreground hover:text-foreground">
            Projects
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium">Not Found</span>
        </header>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              This project doesn&apos;t exist or you don&apos;t have access.
            </p>
            <Button asChild size="sm">
              <Link href={ROUTES.PSK}>
                <ArrowLeft className="mr-1.5 size-3.5" />
                Back to Projects
              </Link>
            </Button>
          </div>
        </div>
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

  // Task handlers
  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !user?.id) return;
    await addTask({
      user_id: user.id,
      created_by: user.id,
      project_id: projectId,
      title: newTaskTitle.trim(),
      description: null,
      status: "todo",
      priority: "medium",
      due_date: null,
      completed_at: null,
      is_daily: false,
      missed_date: null,
    });
    setNewTaskTitle("");
  };

  // Time entry handlers
  const handleAddTimeEntry = async () => {
    if (!user?.id) return;
    const hours = parseInt(timeEntryForm.hours) || 0;
    const minutes = parseInt(timeEntryForm.minutes) || 0;
    const duration = hours * 60 + minutes;
    if (duration <= 0) return;

    await addTimeEntry({
      user_id: user.id,
      created_by: user.id,
      project_id: projectId,
      description: timeEntryForm.description || null,
      duration,
      date: timeEntryForm.date,
    });
    setTimeEntryForm({
      description: "",
      hours: "",
      minutes: "",
      date: new Date().toISOString().split("T")[0],
    });
  };

  // Budget item handlers
  const handleAddBudgetItem = async () => {
    if (!user?.id || !budgetItemForm.description.trim()) return;
    const cost = parseFloat(budgetItemForm.cost);
    if (isNaN(cost) || cost <= 0) return;

    await addBudgetLineItem({
      user_id: user.id,
      created_by: user.id,
      project_id: projectId,
      description: budgetItemForm.description.trim(),
      cost,
      category: budgetItemForm.category || null,
      date: budgetItemForm.date || null,
    });
    setBudgetItemForm({
      description: "",
      cost: "",
      category: "",
      date: new Date().toISOString().split("T")[0],
    });
  };

  // File handlers
  const handleAddFile = async () => {
    if (!user?.id || !fileForm.name.trim() || !fileForm.url.trim()) return;

    await addFile({
      user_id: user.id,
      created_by: user.id,
      project_id: projectId,
      name: fileForm.name.trim(),
      url: fileForm.url.trim(),
      type: fileForm.type || null,
      size: null,
    });
    setFileForm({ name: "", url: "", type: "" });
  };

  // Note handlers
  const handleAddNote = async () => {
    if (!user?.id || !newNoteContent.trim()) return;

    await addNote({
      user_id: user.id,
      created_by: user.id,
      project_id: projectId,
      content: newNoteContent.trim(),
    });
    setNewNoteContent("");
  };

  const handleEditNote = (noteId: string, content: string) => {
    setEditingNoteId(noteId);
    setEditingNoteContent(content);
  };

  const handleSaveNote = async () => {
    if (!editingNoteId || !editingNoteContent.trim()) return;
    await updateNote(editingNoteId, { content: editingNoteContent.trim() });
    setEditingNoteId(null);
    setEditingNoteContent("");
  };

  const handleCancelEditNote = () => {
    setEditingNoteId(null);
    setEditingNoteContent("");
  };

  // Time entry edit handlers
  const handleEditTimeEntry = (entryId: string) => {
    const entry = timeEntries.find((e) => e.id === entryId);
    if (!entry) return;

    const hours = Math.floor(entry.duration / 60);
    const minutes = entry.duration % 60;

    setEditingTimeEntryId(entryId);
    setEditingTimeEntry({
      description: entry.description || "",
      hours: hours.toString(),
      minutes: minutes.toString(),
      date: entry.date,
    });
  };

  const handleSaveTimeEntry = async () => {
    if (!editingTimeEntryId) return;

    const hours = parseInt(editingTimeEntry.hours) || 0;
    const minutes = parseInt(editingTimeEntry.minutes) || 0;
    const duration = hours * 60 + minutes;

    if (duration <= 0) return;

    await updateTimeEntry(editingTimeEntryId, {
      description: editingTimeEntry.description || null,
      duration,
      date: editingTimeEntry.date,
    });

    setEditingTimeEntryId(null);
    setEditingTimeEntry({ description: "", hours: "", minutes: "", date: "" });
  };

  const handleCancelEditTimeEntry = () => {
    setEditingTimeEntryId(null);
    setEditingTimeEntry({ description: "", hours: "", minutes: "", date: "" });
  };

  // Clone project handler
  const handleCloneProject = async () => {
    if (!user?.id || !project) return;

    setIsCloning(true);
    try {
      await addProject({
        user_id: user.id,
        created_by: user.id,
        name: `${project.name} (Copy)`,
        description: project.description,
        client_id: project.client_id,
        status: "backlog",
        is_internal: project.is_internal,
        is_archived: false,
        due_date: null,
        budget: project.budget,
        hourly_rate: project.hourly_rate,
        proton_drive_link: null,
        notes: project.notes,
        color: project.color,
        company_id: project.company_id,
      });
      router.push(ROUTES.PSK);
    } catch (error) {
      console.error("Failed to clone project:", error);
    } finally {
      setIsCloning(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Compact Breadcrumb Header */}
      <header className="flex items-center gap-3 h-12 px-4 border-b border-border/40 shrink-0">
        <div className="flex items-center gap-1.5 text-sm min-w-0">
          <Link href={ROUTES.PSK} className="text-muted-foreground hover:text-foreground shrink-0">
            Projects
          </Link>
          <span className="text-muted-foreground">/</span>
          <span
            className={cn(
              "size-2 rounded-full shrink-0",
              STATUS_DOT_COLOR[project.status as PSKKanbanStatus] || "bg-muted-foreground"
            )}
          />
          <span className="font-medium truncate">{project.name}</span>
        </div>

        <Separator orientation="vertical" className="h-4" />

        {/* Inline Stats */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0 hidden sm:flex">
          <span>
            <span className="font-medium text-foreground">{stats.completedTasks}/{stats.taskCount}</span> tasks
          </span>
          <span>
            <span className="font-medium text-foreground">{formatMinutes(stats.totalTime)}</span> logged
          </span>
          {project.budget ? (
            <span>
              <span className={cn("font-medium text-foreground", totalSpent > project.budget && "text-destructive")}>
                ${totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
              /${project.budget.toLocaleString()} budget
            </span>
          ) : null}
        </div>

        <div className="flex-1" />

        {/* Metadata */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0 hidden md:flex">
          {project.client && (
            <span className="flex items-center gap-1">
              <User className="size-3" />
              {project.client.name}
            </span>
          )}
          {project.due_date && (
            <span className="flex items-center gap-1">
              <CalendarBlank className="size-3" />
              {formatDate(project.due_date)}
            </span>
          )}
          {project.proton_drive_link && (
            <a
              href={project.proton_drive_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-primary"
            >
              <LinkSimple className="size-3" />
              Cloud
            </a>
          )}
          {project.company_id && (
            <span className="flex items-center gap-1 text-primary">
              <UsersThree className="size-3" weight="fill" />
              Shared
            </span>
          )}
        </div>

        <Separator orientation="vertical" className="h-4 hidden md:block" />

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={handleCloneProject}
            disabled={isCloning}
          >
            <Copy className="size-3.5 mr-1" />
            {isCloning ? "..." : "Clone"}
          </Button>
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 text-xs">
                <PencilSimple className="size-3.5 mr-1" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Project</DialogTitle>
              </DialogHeader>
              <ProjectForm
                project={project}
                onSave={() => setIsEditDialogOpen(false)}
                onCancel={() => setIsEditDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Tabbed Content */}
      <Tabs defaultValue="tasks" className="flex-1 flex flex-col min-h-0">
        <TabsList className="bg-transparent rounded-none border-b border-border/40 h-10 px-4 justify-start gap-0 shrink-0">
          <TabsTrigger value="tasks" className={TAB_TRIGGER_CLASS}>
            Tasks
          </TabsTrigger>
          <TabsTrigger value="time" className={TAB_TRIGGER_CLASS}>
            Time
          </TabsTrigger>
          <TabsTrigger value="budget" className={TAB_TRIGGER_CLASS}>
            Budget
          </TabsTrigger>
          <TabsTrigger value="files" className={TAB_TRIGGER_CLASS}>
            Files
          </TabsTrigger>
          <TabsTrigger value="notes" className={TAB_TRIGGER_CLASS}>
            Notes
          </TabsTrigger>
        </TabsList>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="flex-1 flex flex-col overflow-hidden mt-0">
          <div className="flex gap-2 px-3 py-2 border-b border-border/40">
            <Input
              placeholder="Add a task..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
              className="h-8 text-sm"
            />
            <Button onClick={handleAddTask} disabled={!newTaskTitle.trim()} size="sm" className="h-8">
              <Plus className="size-3.5" />
            </Button>
          </div>
          <div className="flex-1 overflow-auto">
            {tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No tasks yet.</p>
            ) : (
              <ul>
                {tasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center gap-2 px-3 py-1.5 border-b border-border/40 last:border-b-0"
                  >
                    <button
                      onClick={() => toggleTaskComplete(task.id)}
                      className={cn(
                        "size-4 flex items-center justify-center rounded-sm border",
                        task.status === "completed"
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-muted-foreground hover:border-primary"
                      )}
                    >
                      {task.status === "completed" && <Check className="size-2.5" weight="bold" />}
                    </button>
                    <span
                      className={cn(
                        "flex-1 text-sm",
                        task.status === "completed" && "line-through text-muted-foreground"
                      )}
                    >
                      {task.title}
                    </span>
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        task.priority === "high"
                          ? "bg-red-500"
                          : task.priority === "medium"
                            ? "bg-amber-500"
                            : "bg-muted-foreground"
                      )}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-5"
                      onClick={() => deleteTask(task.id)}
                    >
                      <Trash className="size-3 text-muted-foreground" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </TabsContent>

        {/* Time Tab */}
        <TabsContent value="time" className="flex-1 flex flex-col overflow-hidden mt-0">
          <div className="px-3 py-2 border-b border-border/40 space-y-2">
            <div className="grid gap-2 sm:grid-cols-2">
              <Input
                placeholder="Description..."
                value={timeEntryForm.description}
                onChange={(e) => setTimeEntryForm((prev) => ({ ...prev, description: e.target.value }))}
                className="h-8 text-sm"
              />
              <Input
                type="date"
                value={timeEntryForm.date}
                onChange={(e) => setTimeEntryForm((prev) => ({ ...prev, date: e.target.value }))}
                className="h-8 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Hours"
                min="0"
                value={timeEntryForm.hours}
                onChange={(e) => setTimeEntryForm((prev) => ({ ...prev, hours: e.target.value }))}
                className="w-20 h-8 text-sm"
              />
              <Input
                type="number"
                placeholder="Minutes"
                min="0"
                max="59"
                value={timeEntryForm.minutes}
                onChange={(e) => setTimeEntryForm((prev) => ({ ...prev, minutes: e.target.value }))}
                className="w-20 h-8 text-sm"
              />
              <Button onClick={handleAddTimeEntry} size="sm" className="ml-auto h-8 text-xs">
                <Plus className="size-3.5 mr-1" />
                Log Time
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            {timeEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No time logged yet.</p>
            ) : (
              <ul>
                {timeEntries.map((entry) => (
                  <li key={entry.id} className="border-b border-border/40 last:border-b-0">
                    {editingTimeEntryId === entry.id ? (
                      <div className="px-3 py-2 space-y-2">
                        <div className="grid gap-2 sm:grid-cols-2">
                          <Input
                            placeholder="Description..."
                            value={editingTimeEntry.description}
                            onChange={(e) => setEditingTimeEntry((prev) => ({ ...prev, description: e.target.value }))}
                            className="h-8 text-sm"
                          />
                          <Input
                            type="date"
                            value={editingTimeEntry.date}
                            onChange={(e) => setEditingTimeEntry((prev) => ({ ...prev, date: e.target.value }))}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            placeholder="Hours"
                            min="0"
                            value={editingTimeEntry.hours}
                            onChange={(e) => setEditingTimeEntry((prev) => ({ ...prev, hours: e.target.value }))}
                            className="w-20 h-8 text-sm"
                          />
                          <Input
                            type="number"
                            placeholder="Minutes"
                            min="0"
                            max="59"
                            value={editingTimeEntry.minutes}
                            onChange={(e) => setEditingTimeEntry((prev) => ({ ...prev, minutes: e.target.value }))}
                            className="w-20 h-8 text-sm"
                          />
                          <div className="ml-auto flex gap-1">
                            <Button size="sm" variant="ghost" className="h-8" onClick={handleCancelEditTimeEntry}>
                              <X className="size-3.5" />
                            </Button>
                            <Button size="sm" className="h-8" onClick={handleSaveTimeEntry}>
                              <Check className="size-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1.5">
                        <Clock className="size-3.5 text-muted-foreground shrink-0" />
                        <span className="flex-1 text-sm truncate">{entry.description || "No description"}</span>
                        <span className="text-sm font-medium shrink-0">{formatMinutes(entry.duration)}</span>
                        <span className="text-xs text-muted-foreground shrink-0">{formatDate(entry.date)}</span>
                        <Button variant="ghost" size="icon" className="size-5" onClick={() => handleEditTimeEntry(entry.id)}>
                          <PencilSimple className="size-3 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" className="size-5" onClick={() => deleteTimeEntry(entry.id)}>
                          <Trash className="size-3 text-muted-foreground" />
                        </Button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </TabsContent>

        {/* Budget Tab */}
        <TabsContent value="budget" className="flex-1 flex flex-col overflow-hidden mt-0">
          {project.hourly_rate ? (
            <div className="px-3 py-1.5 border-b border-border/40 text-xs text-muted-foreground">
              Rate: ${project.hourly_rate}/hr &middot; Time cost: ${timeCost.toFixed(2)} &middot;{" "}
              <span className={cn("font-medium", totalSpent > (project.budget || 0) && project.budget ? "text-destructive" : "text-foreground")}>
                Total: ${totalSpent.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
            </div>
          ) : null}
          <div className="px-3 py-2 border-b border-border/40 space-y-2">
            <div className="grid gap-2 sm:grid-cols-2">
              <Input
                placeholder="Description..."
                value={budgetItemForm.description}
                onChange={(e) => setBudgetItemForm((prev) => ({ ...prev, description: e.target.value }))}
                className="h-8 text-sm"
              />
              <Input
                type="number"
                placeholder="Cost ($)"
                min="0"
                step="0.01"
                value={budgetItemForm.cost}
                onChange={(e) => setBudgetItemForm((prev) => ({ ...prev, cost: e.target.value }))}
                className="h-8 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Category"
                value={budgetItemForm.category}
                onChange={(e) => setBudgetItemForm((prev) => ({ ...prev, category: e.target.value }))}
                className="h-8 text-sm"
              />
              <Input
                type="date"
                value={budgetItemForm.date}
                onChange={(e) => setBudgetItemForm((prev) => ({ ...prev, date: e.target.value }))}
                className="h-8 text-sm"
              />
              <Button onClick={handleAddBudgetItem} size="sm" className="h-8">
                <Plus className="size-3.5" />
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            {budgetLineItems.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No expenses logged yet.</p>
            ) : (
              <>
                <ul>
                  {budgetLineItems.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center gap-2 px-3 py-1.5 border-b border-border/40 last:border-b-0"
                    >
                      <CurrencyDollar className="size-3.5 text-muted-foreground shrink-0" />
                      <span className="flex-1 text-sm truncate">{item.description}</span>
                      {item.category && (
                        <span className="text-xs bg-muted px-1.5 py-0.5 rounded-sm">{item.category}</span>
                      )}
                      <span className="text-sm font-medium shrink-0">${item.cost.toLocaleString()}</span>
                      <Button variant="ghost" size="icon" className="size-5" onClick={() => deleteBudgetLineItem(item.id)}>
                        <Trash className="size-3 text-muted-foreground" />
                      </Button>
                    </li>
                  ))}
                </ul>
                <div className="px-3 py-2 border-t border-border/40 flex justify-between text-sm">
                  <span className="text-muted-foreground">Expenses Total:</span>
                  <span className="font-medium">${totalBudgetSpent.toLocaleString()}</span>
                </div>
              </>
            )}
          </div>
          {/* Project description if present */}
          {project.notes && (
            <div className="px-3 py-2 border-t border-border/40">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Project Description</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{project.notes}</p>
            </div>
          )}
        </TabsContent>

        {/* Files Tab */}
        <TabsContent value="files" className="flex-1 flex flex-col overflow-hidden mt-0">
          <div className="px-3 py-2 border-b border-border/40 space-y-2">
            <div className="grid gap-2 sm:grid-cols-2">
              <Input
                placeholder="File name..."
                value={fileForm.name}
                onChange={(e) => setFileForm((prev) => ({ ...prev, name: e.target.value }))}
                className="h-8 text-sm"
              />
              <Input
                placeholder="URL..."
                value={fileForm.url}
                onChange={(e) => setFileForm((prev) => ({ ...prev, url: e.target.value }))}
                className="h-8 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Type (e.g., pdf, image, doc)"
                value={fileForm.type}
                onChange={(e) => setFileForm((prev) => ({ ...prev, type: e.target.value }))}
                className="h-8 text-sm"
              />
              <Button onClick={handleAddFile} size="sm" className="h-8">
                <Plus className="size-3.5" />
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            {files.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No files added yet.</p>
            ) : (
              <ul>
                {files.map((file) => (
                  <li
                    key={file.id}
                    className="flex items-center gap-2 px-3 py-1.5 border-b border-border/40 last:border-b-0"
                  >
                    <File className="size-3.5 text-muted-foreground shrink-0" />
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-sm hover:text-primary hover:underline truncate"
                    >
                      {file.name}
                    </a>
                    {file.type && (
                      <span className="text-xs bg-muted px-1.5 py-0.5 rounded-sm uppercase">{file.type}</span>
                    )}
                    <Button variant="ghost" size="icon" className="size-5" onClick={() => deleteFile(file.id)}>
                      <Trash className="size-3 text-muted-foreground" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="flex-1 flex flex-col overflow-hidden mt-0">
          <div className="px-3 py-2 border-b border-border/40">
            <textarea
              placeholder="Add a note..."
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              className="w-full min-h-[60px] px-3 py-2 text-sm rounded-md border border-border/40 bg-background resize-y focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <div className="flex justify-end mt-2">
              <Button onClick={handleAddNote} disabled={!newNoteContent.trim()} size="sm" className="h-8 text-xs">
                <Plus className="size-3.5 mr-1" />
                Add Note
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            {notes.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No notes yet.
              </p>
            ) : (
              <ul>
                {notes.map((note) => (
                  <li key={note.id} className="border-b border-border/40 last:border-b-0">
                    {editingNoteId === note.id ? (
                      <div className="px-3 py-2 space-y-2">
                        <textarea
                          value={editingNoteContent}
                          onChange={(e) => setEditingNoteContent(e.target.value)}
                          className="w-full min-h-[60px] px-3 py-2 text-sm rounded-md border border-border/40 bg-background resize-y focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" className="h-7" onClick={handleCancelEditNote}>
                            <X className="size-3.5" />
                          </Button>
                          <Button size="sm" className="h-7" onClick={handleSaveNote}>
                            <Check className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="px-3 py-2">
                        <div className="flex items-start gap-2">
                          <Notepad className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm whitespace-pre-wrap break-words">{note.content}</p>
                            <p className="text-xs text-muted-foreground mt-1">{formatDate(note.created_at)}</p>
                          </div>
                          <div className="flex gap-0.5 shrink-0">
                            <Button variant="ghost" size="icon" className="size-5" onClick={() => handleEditNote(note.id, note.content)}>
                              <PencilSimple className="size-3 text-muted-foreground" />
                            </Button>
                            <Button variant="ghost" size="icon" className="size-5" onClick={() => deleteNote(note.id)}>
                              <Trash className="size-3 text-muted-foreground" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
