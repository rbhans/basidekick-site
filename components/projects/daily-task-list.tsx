"use client";

import { useState, useMemo } from "react";
import { Plus, Trash, Check, Circle, Warning } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDailyTasks } from "./project-hooks";
import { useAuth } from "@/components/providers/auth-provider";
import type { PSKTask } from "@/lib/types";

function TaskItem({
  task,
  onToggle,
  onDelete,
}: {
  task: PSKTask;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const isCompleted = task.status === "completed";

  return (
    <div
      className={`flex items-center gap-3 p-2 border border-border ${
        isCompleted ? "bg-muted/30" : ""
      }`}
    >
      <button
        onClick={onToggle}
        className={`size-5 flex items-center justify-center border ${
          isCompleted
            ? "bg-primary border-primary text-primary-foreground"
            : "border-muted-foreground hover:border-primary"
        }`}
      >
        {isCompleted && <Check className="size-3" weight="bold" />}
      </button>
      <span
        className={`flex-1 text-sm ${
          isCompleted ? "line-through text-muted-foreground" : ""
        }`}
      >
        {task.title}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="size-6 text-muted-foreground hover:text-destructive"
        onClick={onDelete}
      >
        <Trash className="size-3.5" />
      </Button>
    </div>
  );
}

export function DailyTaskList() {
  const { tasks, addTask, deleteTask, toggleTaskComplete } = useDailyTasks();
  const { user } = useAuth();
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  const { todayTasks, missedTasks, completedCount } = useMemo(() => {
    const todayItems: PSKTask[] = [];
    const missedItems: PSKTask[] = [];
    let completed = 0;

    tasks.forEach((task) => {
      if (!task.is_daily) return;

      const taskDate = task.created_at
        ? new Date(task.created_at).toISOString().split("T")[0]
        : todayStr;

      if (task.status === "completed") {
        completed++;
        todayItems.push(task);
      } else if (taskDate === todayStr) {
        todayItems.push(task);
      } else if (task.missed_date || taskDate < todayStr) {
        missedItems.push(task);
      } else {
        todayItems.push(task);
      }
    });

    return {
      todayTasks: todayItems,
      missedTasks: missedItems,
      completedCount: completed,
    };
  }, [tasks, todayStr]);

  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !user?.id) return;

    await addTask({
      user_id: user.id,
      created_by: user.id,
      project_id: null,
      title: newTaskTitle.trim(),
      description: null,
      status: "todo",
      priority: "medium",
      due_date: null,
      completed_at: null,
      is_daily: true,
      missed_date: null,
    });

    setNewTaskTitle("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddTask();
    }
  };

  return (
    <div className="border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h3 className="font-semibold">Daily Tasks</h3>
          <p className="text-xs text-muted-foreground">
            {completedCount}/{todayTasks.length + missedTasks.length} completed
          </p>
        </div>
      </div>

      {/* Add Task */}
      <div className="p-4 border-b border-border">
        <div className="flex gap-2">
          <Input
            placeholder="Add a task..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button onClick={handleAddTask} disabled={!newTaskTitle.trim()}>
            <Plus className="size-4" />
          </Button>
        </div>
      </div>

      {/* Task Lists */}
      <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
        {/* Missed Tasks */}
        {missedTasks.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-amber-500">
              <Warning className="size-4" />
              Missed ({missedTasks.length})
            </div>
            <div className="space-y-1">
              {missedTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={() => toggleTaskComplete(task.id)}
                  onDelete={() => deleteTask(task.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Today's Tasks */}
        <div className="space-y-2">
          {missedTasks.length > 0 && (
            <div className="flex items-center gap-2 text-sm font-medium">
              <Circle className="size-4" />
              Today
            </div>
          )}
          {todayTasks.length === 0 && missedTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No tasks for today. Add one above!
            </p>
          ) : (
            <div className="space-y-1">
              {todayTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={() => toggleTaskComplete(task.id)}
                  onDelete={() => deleteTask(task.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
