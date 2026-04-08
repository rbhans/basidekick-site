import { Skeleton } from "@/components/ui/skeleton";

export default function NewsLoading() {
  return (
    <div className="min-h-full flex-1">
      {/* Title block strip placeholder */}
      <div className="title-block">
        <div className="field">
          <span className="field-label">Drawing</span>
          <span className="field-value">News</span>
        </div>
        <div className="field">
          <span className="field-label">Title</span>
          <span className="field-value">Industry Feed</span>
        </div>
      </div>

      <section className="container mx-auto px-4 sm:px-6 lg:px-16 pt-16 pb-16 max-w-[900px]">
        <Skeleton className="h-6 w-[420px] max-w-full mx-auto mb-8 rounded-sm" />
        <Skeleton className="h-12 w-full mb-5 rounded-md" />
        <div className="flex gap-3 mb-10">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-20 rounded-sm" />
          ))}
        </div>

        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border border-border rounded-md bg-card p-5 grid grid-cols-[56px_1fr_120px] gap-5 items-start">
              <Skeleton className="h-10 w-10 rounded-sm" />
              <div>
                <Skeleton className="h-3 w-32 mb-2" />
                <Skeleton className="h-5 w-full mb-2" />
                <Skeleton className="h-3 w-3/4" />
              </div>
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
