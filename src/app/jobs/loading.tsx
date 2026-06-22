import { Skeleton } from "@/components/ui/skeleton";

export default function JobsLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8" aria-busy="true" aria-label="Loading jobs">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="mt-6 h-14 w-full rounded-2xl" />
      <div className="mt-6 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
            <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
