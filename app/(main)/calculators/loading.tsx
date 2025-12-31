import { Skeleton } from "@/components/ui/skeleton";

export default function CalculatorsLoading() {
  return (
    <div className="min-h-full p-6 md:p-8">
      {/* Header skeleton */}
      <div className="mb-8">
        <Skeleton className="h-8 w-40 mb-2" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      {/* Calculators grid skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="p-5 border border-border rounded-lg"
          >
            <div className="flex items-center gap-3 mb-3">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
