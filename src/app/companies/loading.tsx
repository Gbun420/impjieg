import { Skeleton } from "@/components/ui/skeleton";

export default function CompaniesLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8" aria-busy="true" aria-label="Loading companies">
      <Skeleton className="h-9 w-56" />
      <Skeleton className="mt-3 h-4 w-80" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <Skeleton className="mt-4 h-3 w-full" />
            <Skeleton className="mt-2 h-3 w-4/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
