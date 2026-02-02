import { Skeleton } from "@/components/ui/skeleton";

export default function PointStackLoading() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Create post skeleton */}
      <div className="mb-6 p-4 border border-border rounded-lg">
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Filters skeleton */}
      <div className="mb-6 flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20" />
        ))}
      </div>

      {/* Feed cards skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-5 border border-border rounded-lg">
            <div className="flex items-start gap-3 mb-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-2/3 mb-4" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
