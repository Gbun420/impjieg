import { Skeleton } from "@/components/ui/skeleton";

export default function JobDetailLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8" aria-busy="true" aria-label="Loading job">
      <Skeleton className="h-4 w-40" />
      <div className="mt-6 flex items-start gap-4">
        <Skeleton className="h-16 w-16 shrink-0 rounded-2xl" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      </div>
      <Skeleton className="mt-8 h-11 w-44 rounded-full" />
      <div className="mt-8 space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className={`h-4 ${i % 3 === 0 ? "w-full" : i % 3 === 1 ? "w-5/6" : "w-2/3"}`} />
        ))}
      </div>
    </div>
  );
}
