import { Skeleton } from "@/components/ui/skeleton";

export default function WikiLoading() {
  return (
    <div className="min-h-full flex-1">
      {/* Title block strip placeholder */}
      <div className="title-block">
        <div className="field">
          <span className="field-label">Drawing</span>
          <span className="field-value">Wiki</span>
        </div>
        <div className="field">
          <span className="field-label">Title</span>
          <span className="field-value">Field Guide &amp; Reference</span>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-16 pt-14 pb-16 max-w-[1100px]">
        <Skeleton className="h-5 w-[420px] max-w-full mx-auto mb-10" />
        <Skeleton className="h-7 w-48 mb-6" />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-12">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-md" />
          ))}
        </div>

        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border-b border-muted py-4">
              <Skeleton className="h-5 w-2/3 mb-2" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
