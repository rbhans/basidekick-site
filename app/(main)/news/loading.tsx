import { Skeleton } from "@/components/ui/skeleton";

export default function NewsLoading() {
  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      {/* Submit box skeleton */}
      <div className="mb-4 p-5 border border-border rounded-xl bg-card">
        <Skeleton className="h-5 w-64" />
      </div>

      {/* Search skeleton */}
      <Skeleton className="h-11 w-full rounded-xl mb-6" />

      {/* Sort tabs skeleton */}
      <div className="mb-8 flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-20 rounded-lg" />
        ))}
      </div>

      {/* Card skeletons */}
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-6 border border-border rounded-xl bg-card">
            <div className="flex items-start gap-3 mb-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-2/3 mb-4" />
            <div className="flex gap-2 mb-4">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-14 rounded-full" />
            </div>
            <div className="flex gap-6 pt-4 border-t border-border">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-14" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
