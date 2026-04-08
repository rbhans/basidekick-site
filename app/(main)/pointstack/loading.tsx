import { Skeleton } from "@/components/ui/skeleton";

export default function PointStackLoading() {
  return (
    <section className="container mx-auto max-w-[880px] px-4 sm:px-6 lg:px-16 py-10">
      <Skeleton className="h-14 w-full rounded-md mb-6" />
      <div className="flex gap-3 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-20 rounded-sm" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border border-border rounded-md bg-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    </section>
  );
}
