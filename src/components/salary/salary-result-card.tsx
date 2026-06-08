import type { TaxResult } from "@/lib/salary/types";
import { Wallet, TrendingUp, ArrowDownRight } from "lucide-react";

function fmt(n: number): string {
  return "€" + n.toLocaleString("en-MT", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

interface SalaryResultCardProps {
  result: TaxResult;
  warnings: string[];
}

export default function SalaryResultCard({ result, warnings }: SalaryResultCardProps) {
  return (
    <div className="space-y-4" data-testid="salary-result-card">
      {warnings.length > 0 && (
        <div className="rounded-xl border border-warning/30 bg-warning/5 p-3">
          {warnings.map((w, i) => (
            <p key={i} className="text-xs text-warning-foreground">{w}</p>
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-secondary/10 p-6 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
          <Wallet className="h-5 w-5 text-primary" />
        </div>
        <p className="mt-3 text-sm font-medium text-foreground/80">Net Monthly Take-Home</p>
        <p className="font-mono text-4xl font-bold text-foreground">{fmt(result.netMonthly)}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {fmt(result.netAnnual)} / year
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10">
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Net Annual</p>
              <p className="font-mono text-lg font-bold text-foreground">{fmt(result.netAnnual)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-error/10">
              <ArrowDownRight className="h-4 w-4 text-error" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Deduction rate</p>
              <p className="font-mono text-lg font-bold text-foreground">{result.effectiveDeductionRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {result.netHourly !== null && (
        <div className="rounded-xl border border-border/60 bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground">Net hourly</p>
          <p className="font-mono text-xl font-bold text-foreground">€{result.netHourly.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
}
