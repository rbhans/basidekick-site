import type { PSKKanbanStatus } from "@/lib/types";

export const STATUS_DOT_COLOR: Record<PSKKanbanStatus, string> = {
  backlog: "bg-muted-foreground",
  "in-progress": "bg-yellow-500",
  review: "bg-blue-500",
  completed: "bg-emerald-500",
};
