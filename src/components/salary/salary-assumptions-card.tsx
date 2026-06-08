import { Info } from "lucide-react";

export default function SalaryAssumptionsCard() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Info className="h-4 w-4 text-primary" />
        </div>
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <div>
            <p className="font-semibold text-foreground">Assumptions &amp; Source</p>
            <p className="mt-1">Tax year: <strong className="text-foreground">2026</strong></p>
            <p>Source: <strong className="text-foreground">Malta Tax and Customs Administration</strong></p>
            <p>Last reviewed: <strong className="text-foreground">2026-06-08</strong></p>
          </div>
          <div className="rounded-xl bg-muted/50 p-3">
            <p className="text-xs leading-relaxed">
              This calculator is an estimate for general guidance. It is not tax, payroll, legal, or financial advice.
              Final payroll may vary based on SSC class, fringe benefits, bonuses, residency, part-time rules, and employer payroll setup.
              Employee SSC is estimated at ~10% — exact MTCA Class 1 weekly caps/rates not yet encoded.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
