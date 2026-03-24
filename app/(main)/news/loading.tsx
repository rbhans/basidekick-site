import { Skeleton } from "@/components/ui/skeleton";

export default function NewsLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Sort tabs skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-16" />
          ))}
        </div>
        <Skeleton className="h-8 w-20" />
      </div>

      {/* Article rows skeleton */}
      <div className="space-y-1 divide-y divide-border/50">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 py-3">
            <Skeleton className="h-4 w-6 mt-1" />
            <div className="space-y-1 shrink-0">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-3 w-4" />
              <Skeleton className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
