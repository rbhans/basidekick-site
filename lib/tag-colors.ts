import type { PointStackPostType } from "@/lib/types";

const POST_TYPE_COLORS: Record<PointStackPostType, string> = {
  discussion: "bg-muted text-muted-foreground",
  question: "bg-accent/15 text-accent",
  tip: "bg-secondary text-foreground",
  project: "border border-accent/40 text-accent",
  job: "bg-destructive/10 text-destructive",
};

export function getPostTypeClasses(type: PointStackPostType): string {
  return POST_TYPE_COLORS[type] ?? "bg-muted text-muted-foreground";
}
