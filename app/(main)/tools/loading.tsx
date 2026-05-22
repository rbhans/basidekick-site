import { Skeleton } from "@/components/ui/skeleton";

export default function ToolsLoading() {
  return (
    <div className="min-h-full p-6 md:p-8">
      <div className="container mx-auto max-w-[760px] py-24 text-center">
        <Skeleton className="h-3 w-32 mx-auto mb-6" />
        <Skeleton className="h-12 w-3/4 mx-auto mb-6" />
        <Skeleton className="h-4 w-full max-w-[560px] mx-auto mb-2" />
        <Skeleton className="h-4 w-2/3 mx-auto" />
      </div>
    </div>
  );
}
