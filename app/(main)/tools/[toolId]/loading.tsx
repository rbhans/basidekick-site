import { Skeleton } from "@/components/ui/skeleton";

export default function ToolDetailLoading() {
  return (
    <div className="min-h-full p-6 md:p-8">
      {/* Back link skeleton */}
      <div className="mb-6">
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Tool header skeleton */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Skeleton className="h-12 w-12 rounded" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-5 w-24" />
      </div>

      {/* Features grid skeleton */}
      <div className="mb-10">
        <Skeleton className="h-6 w-24 mb-4" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 border border-border rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Skeleton className="h-6 w-6" />
                <Skeleton className="h-5 w-32" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>

      {/* Steps skeleton */}
      <div className="mb-10">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
