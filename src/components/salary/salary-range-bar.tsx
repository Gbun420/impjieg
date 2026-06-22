import { formatSalary } from "@/lib/utils";

/**
 * Visual gross-annual salary range: Entry / Typical / Senior figures with a
 * gradient track and a marker at the typical (mid) point. Static, on-brand.
 */
export function SalaryRangeBar({ low, mid, high }: { low: number; mid: number; high: number }) {
  const midPct = high > low ? Math.max(4, Math.min(96, ((mid - low) / (high - low)) * 100)) : 50;

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Entry</p>
          <p className="mt-0.5 font-mono text-lg font-bold text-foreground sm:text-xl">{formatSalary(low)}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8a7a25]">Typical</p>
          <p className="mt-0.5 font-mono text-xl font-extrabold text-foreground sm:text-2xl">{formatSalary(mid)}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Senior</p>
          <p className="mt-0.5 font-mono text-lg font-bold text-foreground sm:text-xl">{formatSalary(high)}</p>
        </div>
      </div>
      <div className="relative mt-4 h-2.5 rounded-full bg-gradient-to-r from-muted via-accent/40 to-accent">
        <div
          className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-foreground shadow"
          style={{ left: `${midPct}%` }}
          aria-hidden="true"
        />
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Approximate gross annual range · 2026 · illustrative, not official statistics
      </p>
    </div>
  );
}
