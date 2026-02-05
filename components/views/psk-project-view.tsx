"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SectionLabel } from "@/components/section-label";
import { CircuitBackground } from "@/components/circuit-background";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
      <div className="min-h-full">
        <section className="relative py-12 overflow-hidden">
          <CircuitBackground opacity={0.15} colorGradient />
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
          <CircuitBackground opacity={0.15} colorGradient />
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
    if (!user?.id || !fileForm.name.trim() || !fileForm.url.trim())
      return;

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
        due_date: null, // Reset due date for the clone
        budget: project.budget,
        hourly_rate: project.hourly_rate,
        proton_drive_link: null, // Don't copy cloud storage link
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
    <div className="min-h-full">
      {/* Header */}
      <section className="relative py-12 overflow-hidden">
        <CircuitBackground opacity={0.15} colorGradient />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-start justify-between">
            <div>
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
                {project.proton_drive_link && (
                  <a
                    href={project.proton_drive_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-primary"
                  >
                    <LinkSimple className="size-4" />
                    Cloud Storage
                  </a>
                )}
                {project.company_id && (
                  <span className="flex items-center gap-1 text-primary">
                    <UsersThree className="size-4" weight="fill" />
                    Shared with team
                  </span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCloneProject}
                disabled={isCloning}
              >
                <Copy className="mr-1 size-4" />
                {isCloning ? "Cloning..." : "Clone"}
              </Button>
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <PencilSimple className="mr-1 size-4" />
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
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="border border-border bg-card shadow-sm p-4">
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

            <div className="border border-border bg-card shadow-sm p-4">
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

            <div className="border border-border bg-card shadow-sm p-4">
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

            <div className="border border-border bg-card shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Spent
                </span>
                <CurrencyDollar className="size-4 text-muted-foreground" />
              </div>
              <p
                className={`text-2xl font-semibold ${totalSpent > (project.budget || 0) && project.budget ? "text-destructive" : ""}`}
              >
                $
                {totalSpent.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-xs text-muted-foreground">
                {project.budget
                  ? `${Math.round((totalSpent / project.budget) * 100)}% of budget`
                  : "No budget set"}
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Tasks */}
              <div className="border border-border bg-card shadow-sm">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h2 className="font-semibold">Tasks</h2>
                </div>
                <div className="p-4 border-b border-border">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a task..."
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                    />
                    <Button
                      onClick={handleAddTask}
                      disabled={!newTaskTitle.trim()}
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-4 max-h-[300px] overflow-y-auto">
                  {tasks.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      No tasks yet. Add one above!
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {tasks.map((task) => (
                        <li
                          key={task.id}
                          className="flex items-center gap-3 p-2 border border-border"
                        >
                          <button
                            onClick={() => toggleTaskComplete(task.id)}
                            className={`size-5 flex items-center justify-center border ${
                              task.status === "completed"
                                ? "bg-primary border-primary text-primary-foreground"
                                : "border-muted-foreground hover:border-primary"
                            }`}
                          >
                            {task.status === "completed" && (
                              <Check className="size-3" weight="bold" />
                            )}
                          </button>
                          <span
                            className={`flex-1 text-sm ${
                              task.status === "completed"
                                ? "line-through text-muted-foreground"
                                : ""
                            }`}
                          >
                            {task.title}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 ${
                              task.priority === "high"
                                ? "bg-red-500/20 text-red-500"
                                : task.priority === "medium"
                                  ? "bg-amber-500/20 text-amber-500"
                                  : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {task.priority}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-6"
                            onClick={() => deleteTask(task.id)}
                          >
                            <Trash className="size-3.5 text-muted-foreground" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Time Entries */}
              <div className="border border-border bg-card shadow-sm">
                <div className="p-4 border-b border-border">
                  <h2 className="font-semibold">Time Entries</h2>
                </div>
                <div className="p-4 border-b border-border">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Input
                      placeholder="Description..."
                      value={timeEntryForm.description}
                      onChange={(e) =>
                        setTimeEntryForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    />
                    <Input
                      type="date"
                      value={timeEntryForm.date}
                      onChange={(e) =>
                        setTimeEntryForm((prev) => ({
                          ...prev,
                          date: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="number"
                      placeholder="Hours"
                      min="0"
                      value={timeEntryForm.hours}
                      onChange={(e) =>
                        setTimeEntryForm((prev) => ({
                          ...prev,
                          hours: e.target.value,
                        }))
                      }
                      className="w-24"
                    />
                    <Input
                      type="number"
                      placeholder="Minutes"
                      min="0"
                      max="59"
                      value={timeEntryForm.minutes}
                      onChange={(e) =>
                        setTimeEntryForm((prev) => ({
                          ...prev,
                          minutes: e.target.value,
                        }))
                      }
                      className="w-24"
                    />
                    <Button onClick={handleAddTimeEntry} className="ml-auto">
                      <Plus className="size-4 mr-1" />
                      Log Time
                    </Button>
                  </div>
                </div>
                <div className="p-4 max-h-[250px] overflow-y-auto">
                  {timeEntries.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      No time logged yet.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {timeEntries.map((entry) => (
                        <li
                          key={entry.id}
                          className="border border-border"
                        >
                          {editingTimeEntryId === entry.id ? (
                            <div className="p-2 space-y-2">
                              <div className="grid gap-2 sm:grid-cols-2">
                                <Input
                                  placeholder="Description..."
                                  value={editingTimeEntry.description}
                                  onChange={(e) =>
                                    setEditingTimeEntry((prev) => ({
                                      ...prev,
                                      description: e.target.value,
                                    }))
                                  }
                                />
                                <Input
                                  type="date"
                                  value={editingTimeEntry.date}
                                  onChange={(e) =>
                                    setEditingTimeEntry((prev) => ({
                                      ...prev,
                                      date: e.target.value,
                                    }))
                                  }
                                />
                              </div>
                              <div className="flex gap-2">
                                <Input
                                  type="number"
                                  placeholder="Hours"
                                  min="0"
                                  value={editingTimeEntry.hours}
                                  onChange={(e) =>
                                    setEditingTimeEntry((prev) => ({
                                      ...prev,
                                      hours: e.target.value,
                                    }))
                                  }
                                  className="w-24"
                                />
                                <Input
                                  type="number"
                                  placeholder="Minutes"
                                  min="0"
                                  max="59"
                                  value={editingTimeEntry.minutes}
                                  onChange={(e) =>
                                    setEditingTimeEntry((prev) => ({
                                      ...prev,
                                      minutes: e.target.value,
                                    }))
                                  }
                                  className="w-24"
                                />
                                <div className="ml-auto flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleCancelEditTimeEntry}
                                  >
                                    <X className="size-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={handleSaveTimeEntry}
                                  >
                                    <Check className="size-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 p-2">
                              <Clock className="size-4 text-muted-foreground" />
                              <span className="flex-1 text-sm">
                                {entry.description || "No description"}
                              </span>
                              <span className="text-sm font-medium">
                                {formatMinutes(entry.duration)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(entry.date)}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-6"
                                onClick={() => handleEditTimeEntry(entry.id)}
                              >
                                <PencilSimple className="size-3.5 text-muted-foreground" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-6"
                                onClick={() => deleteTimeEntry(entry.id)}
                              >
                                <Trash className="size-3.5 text-muted-foreground" />
                              </Button>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Budget Items */}
              <div className="border border-border bg-card shadow-sm">
                <div className="p-4 border-b border-border">
                  <h2 className="font-semibold">Expenses</h2>
                  {project.hourly_rate ? (
                    <p className="text-xs text-muted-foreground mt-1">
                      Hourly rate: ${project.hourly_rate}/hr • Time cost: $
                      {timeCost.toFixed(2)}
                    </p>
                  ) : null}
                </div>
                <div className="p-4 border-b border-border">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Input
                      placeholder="Description..."
                      value={budgetItemForm.description}
                      onChange={(e) =>
                        setBudgetItemForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Cost ($)"
                      min="0"
                      step="0.01"
                      value={budgetItemForm.cost}
                      onChange={(e) =>
                        setBudgetItemForm((prev) => ({
                          ...prev,
                          cost: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Category"
                      value={budgetItemForm.category}
                      onChange={(e) =>
                        setBudgetItemForm((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                    />
                    <Input
                      type="date"
                      value={budgetItemForm.date}
                      onChange={(e) =>
                        setBudgetItemForm((prev) => ({
                          ...prev,
                          date: e.target.value,
                        }))
                      }
                    />
                    <Button onClick={handleAddBudgetItem}>
                      <Plus className="size-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-4 max-h-[250px] overflow-y-auto">
                  {budgetLineItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      No expenses logged yet.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {budgetLineItems.map((item) => (
                        <li
                          key={item.id}
                          className="flex items-center gap-3 p-2 border border-border"
                        >
                          <CurrencyDollar className="size-4 text-muted-foreground" />
                          <span className="flex-1 text-sm">
                            {item.description}
                          </span>
                          {item.category && (
                            <span className="text-xs bg-muted px-2 py-0.5">
                              {item.category}
                            </span>
                          )}
                          <span className="text-sm font-medium">
                            ${item.cost.toLocaleString()}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-6"
                            onClick={() => deleteBudgetLineItem(item.id)}
                          >
                            <Trash className="size-3.5 text-muted-foreground" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {budgetLineItems.length > 0 && (
                  <div className="p-4 border-t border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Expenses Total:
                      </span>
                      <span className="font-medium">
                        ${totalBudgetSpent.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Files */}
              <div className="border border-border bg-card shadow-sm">
                <div className="p-4 border-b border-border">
                  <h2 className="font-semibold">Files & Links</h2>
                </div>
                <div className="p-4 border-b border-border">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Input
                      placeholder="File name..."
                      value={fileForm.name}
                      onChange={(e) =>
                        setFileForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                    <Input
                      placeholder="URL..."
                      value={fileForm.url}
                      onChange={(e) =>
                        setFileForm((prev) => ({
                          ...prev,
                          url: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Type (e.g., pdf, image, doc)"
                      value={fileForm.type}
                      onChange={(e) =>
                        setFileForm((prev) => ({
                          ...prev,
                          type: e.target.value,
                        }))
                      }
                    />
                    <Button onClick={handleAddFile}>
                      <Plus className="size-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-4 max-h-[250px] overflow-y-auto">
                  {files.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      No files added yet.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {files.map((file) => (
                        <li
                          key={file.id}
                          className="flex items-center gap-3 p-2 border border-border"
                        >
                          <File className="size-4 text-muted-foreground" />
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-sm hover:text-primary hover:underline"
                          >
                            {file.name}
                          </a>
                          {file.type && (
                            <span className="text-xs bg-muted px-2 py-0.5 uppercase">
                              {file.type}
                            </span>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-6"
                            onClick={() => deleteFile(file.id)}
                          >
                            <Trash className="size-3.5 text-muted-foreground" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Work Notes / Site Log */}
              <div className="border border-border bg-card shadow-sm">
                <div className="p-4 border-b border-border">
                  <h2 className="font-semibold">Work Notes</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Site log and project updates
                  </p>
                </div>
                <div className="p-4 border-b border-border">
                  <textarea
                    placeholder="Add a note..."
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    className="w-full min-h-[80px] px-3 py-2 text-sm border border-border bg-background resize-y focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <div className="flex justify-end mt-2">
                    <Button
                      onClick={handleAddNote}
                      disabled={!newNoteContent.trim()}
                    >
                      <Plus className="size-4 mr-1" />
                      Add Note
                    </Button>
                  </div>
                </div>
                <div className="p-4 max-h-[350px] overflow-y-auto">
                  {notes.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      No notes yet. Add one to keep track of project updates.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {notes.map((note) => (
                        <li
                          key={note.id}
                          className="border border-border"
                        >
                          {editingNoteId === note.id ? (
                            <div className="p-3 space-y-2">
                              <textarea
                                value={editingNoteContent}
                                onChange={(e) => setEditingNoteContent(e.target.value)}
                                className="w-full min-h-[80px] px-3 py-2 text-sm border border-border bg-background resize-y focus:outline-none focus:ring-1 focus:ring-ring"
                              />
                              <div className="flex justify-end gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={handleCancelEditNote}
                                >
                                  <X className="size-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={handleSaveNote}
                                >
                                  <Check className="size-4" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3">
                              <div className="flex items-start gap-2">
                                <Notepad className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm whitespace-pre-wrap break-words">
                                    {note.content}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-2">
                                    {formatDate(note.created_at)}
                                  </p>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-6"
                                    onClick={() => handleEditNote(note.id, note.content)}
                                  >
                                    <PencilSimple className="size-3.5 text-muted-foreground" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-6"
                                    onClick={() => deleteNote(note.id)}
                                  >
                                    <Trash className="size-3.5 text-muted-foreground" />
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
              </div>

              {/* Project Notes (from project form) */}
              {project.notes && (
                <div className="border border-border bg-card shadow-sm">
                  <div className="p-4 border-b border-border">
                    <h2 className="font-semibold">Project Description</h2>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {project.notes}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
