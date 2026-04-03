import type { PointStackPostType } from "@/lib/types";

const POST_TYPE_COLORS: Record<PointStackPostType, string> = {
  discussion: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  question: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  tip: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  project: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  job: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

export function getPostTypeClasses(type: PointStackPostType): string {
  return POST_TYPE_COLORS[type] ?? "bg-muted text-muted-foreground";
}
