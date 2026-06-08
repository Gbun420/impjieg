import type { TaxResult } from "@/lib/salary/types";
import { MALTA_TAX_TABLES_2026 } from "@/lib/salary/malta-tax-2026";

function fmt(n: number): string {
  return "€" + n.toLocaleString("en-MT", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

interface SalaryBreakdownCardProps {
  result: TaxResult;
}

export default function SalaryBreakdownCard({ result }: SalaryBreakdownCardProps) {
  const table = MALTA_TAX_TABLES_2026.find((t) => t.profile === result.profile);
  const profileLabel = table?.label ?? result.profile;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">Breakdown</h2>
        <div className="mt-4 space-y-3">
          <Row label="Gross annual" value={fmt(result.grossAnnual)} />
          <Row label="Income tax" value={`-${fmt(result.incomeTax)}`} red />
          <Row label={`Employee SSC${result.isSscEstimate ? " (estimated)" : ""}`} value={`-${fmt(result.employeeSsc)}`} red />
          <div className="border-t border-border/50 pt-3">
            <Row label="Net annual" value={fmt(result.netAnnual)} bold green />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">Monthly &amp; Weekly</h2>
        <div className="mt-4 space-y-3">
          <Row label="Gross monthly" value={fmt(result.grossMonthly)} />
          <Row label="Net monthly" value={fmt(result.netMonthly)} bold />
          <Row label="Net weekly" value={fmt(result.netWeekly)} />
          {result.netHourly !== null && (
            <Row label="Net hourly" value={`€${result.netHourly.toFixed(2)}`} />
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-sm font-semibold text-foreground/75 uppercase tracking-wider">
          Tax Bands — {profileLabel} (2026)
        </h2>
        <div className="mt-4 space-y-2 text-sm">
          {table?.bands.map((band, i) => {
            const prevUpper = table.bands[i - 1]?.upper ?? 0;
            const range = band.upper === null
              ? `€${prevUpper.toLocaleString()}+`
              : `€${prevUpper.toLocaleString()} – €${band.upper.toLocaleString()}`;
            const isActive = result.appliedBand === band;
            return (
              <div key={i} className={`flex justify-between rounded-lg px-2 py-1 ${isActive ? "bg-primary/10 font-semibold" : ""}`}>
                <span className={isActive ? "text-foreground" : "text-foreground/75"}>{range}</span>
                <span className={isActive ? "text-primary" : "text-foreground/75"}>
                  {(band.rate * 100).toFixed(0)}%
                  {band.subtract > 0 && ` (−€${band.subtract.toLocaleString()})`}
                </span>
              </div>
            );
          })}
          <div className="flex justify-between border-t border-border/50 pt-2 mt-2">
            <span className="text-foreground/75">Employee SSC</span>
            <span className="text-foreground/75">~10% (estimated)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold, red, green }: { label: string; value: string; bold?: boolean; red?: boolean; green?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className={bold ? "font-semibold text-foreground" : "text-foreground/75"}>{label}</span>
      <span className={`font-mono ${bold ? "font-bold" : "font-medium"} ${red ? "text-red-600 dark:text-red-400" : green ? "text-emerald-700 dark:text-emerald-400" : "text-foreground"}`}>
        {value}
      </span>
    </div>
  );
}
