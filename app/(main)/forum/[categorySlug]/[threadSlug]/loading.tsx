import { Skeleton } from "@/components/ui/skeleton";

export default function ForumThreadLoading() {
  return (
    <div className="min-h-full p-6 md:p-8">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2 mb-6">
        <Skeleton className="h-4 w-14" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-40" />
      </div>

      {/* Thread header skeleton */}
      <div className="mb-8">
        <Skeleton className="h-8 w-3/4 max-w-xl mb-3" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      {/* Posts skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-5 border border-border rounded-lg"
          >
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div>
                <Skeleton className="h-4 w-28 mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>

      {/* Reply form skeleton */}
      <div className="mt-8 p-5 border border-border rounded-lg">
        <Skeleton className="h-5 w-20 mb-3" />
        <Skeleton className="h-24 w-full mb-3" />
        <Skeleton className="h-10 w-28" />
      </div>
    </div>
  );
}
