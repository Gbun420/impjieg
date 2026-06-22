import { Skeleton } from "@/components/ui/skeleton";

export default function SectorLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8" aria-busy="true" aria-label="Loading roles">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-6 h-9 w-2/3" />
      <Skeleton className="mt-3 h-4 w-1/2" />
      <div className="mt-8 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
            <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
