"use client";

import { useMemo, useState } from "react";
import SalaryAssumptionsCard from "@/components/salary/salary-assumptions-card";
import { calculateSalary, validateInput } from "@/lib/salary/salary-calculator";
import { estimateMaltaPercentile, percentileLabel } from "@/lib/salary/percentile";
import { formatSalary } from "@/lib/utils";
import type { SalaryPeriod, TaxProfile } from "@/lib/salary/types";

const PERIODS: { value: SalaryPeriod; label: string; max: number; step: number; preset: number }[] = [
  { value: "annual", label: "Year", max: 200000, step: 500, preset: 30000 },
  { value: "monthly", label: "Month", max: 16000, step: 50, preset: 2500 },
  { value: "weekly", label: "Week", max: 4000, step: 10, preset: 600 },
  { value: "hourly", label: "Hour", max: 120, step: 1, preset: 15 },
];

const PROFILES: { value: TaxProfile; label: string }[] = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "married-1-child", label: "Married + 1 child" },
  { value: "married-2-children", label: "Married + 2 children" },
  { value: "parent", label: "Parent" },
  { value: "parent-1-child", label: "Parent + 1 child" },
  { value: "parent-2-children", label: "Parent + 2 children" },
];

function pct(part: number, whole: number) {
  return whole > 0 ? Math.max(0, Math.min(100, (part / whole) * 100)) : 0;
}

export default function SalaryCalculatorTool() {
  const [period, setPeriod] = useState<SalaryPeriod>("annual");
  const [profile, setProfile] = useState<TaxProfile>("single");
  const [amount, setAmount] = useState(30000);

  const cfg = PERIODS.find((p) => p.value === period)!;

  const { result, percentile, warning } = useMemo(() => {
    const input = { amount, period, profile, hoursPerWeek: 40, weeksPerYear: 52 };
    const warnings = validateInput(input);
    if (amount <= 0 || warnings.some((w) => w.type === "negative")) {
      return { result: null, percentile: 0, warning: warnings.find((w) => w.type !== "negative")?.message ?? null };
    }
    const r = calculateSalary(input);
    return {
      result: r,
      percentile: estimateMaltaPercentile(r.grossAnnual),
      warning: warnings.find((w) => w.type === "low-salary" || w.type === "high-salary")?.message ?? null,
    };
  }, [amount, period, profile]);

  const switchPeriod = (p: SalaryPeriod) => {
    setPeriod(p);
    setAmount(PERIODS.find((x) => x.value === p)!.preset);
  };

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* ---- Controls ---- */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-[0_1px_2px_rgba(26,22,19,0.04),0_18px_44px_-22px_rgba(26,22,19,0.18)] sm:p-7">
          <div className="flex rounded-full border border-border bg-muted/50 p-1">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => switchPeriod(p.value)}
                className={`flex-1 rounded-full px-2 py-1.5 text-sm font-medium transition-colors ${
                  period === p.value ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="mt-6">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Gross salary / {cfg.label.toLowerCase()}
            </label>
            <div className="mt-2 flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-3">
              <span className="text-2xl font-bold text-muted-foreground">€</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={cfg.max}
                value={amount}
                onChange={(e) => setAmount(Math.max(0, Math.min(cfg.max, Number(e.target.value) || 0)))}
                className="w-full bg-transparent font-mono text-2xl font-bold text-foreground outline-none"
                aria-label={`Gross salary per ${cfg.label.toLowerCase()}`}
              />
            </div>
            <input
              type="range"
              min={0}
              max={cfg.max}
              step={cfg.step}
              value={Math.min(amount, cfg.max)}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="mt-4 w-full accent-[#FFC400]"
              aria-label="Salary slider"
            />
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>€0</span>
              <span>{formatSalary(cfg.max)}</span>
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="tax-profile" className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Tax profile
            </label>
            <select
              id="tax-profile"
              value={profile}
              onChange={(e) => setProfile(e.target.value as TaxProfile)}
              className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground outline-none focus:border-accent"
            >
              {PROFILES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          {warning && (
            <p className="mt-4 rounded-xl border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-foreground/80">
              {warning}
            </p>
          )}
        </div>

        {/* ---- Result ---- */}
        <div className="rounded-3xl border border-accent/40 bg-gradient-to-b from-accent/[0.07] to-card p-6 shadow-[0_1px_2px_rgba(26,22,19,0.04),0_18px_44px_-22px_rgba(26,22,19,0.18)] sm:p-7">
          {result ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Estimated take-home</p>
              <p className="mt-1 font-mono text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                {formatSalary(result.netMonthly)}
                <span className="ml-1 text-lg font-semibold text-muted-foreground">/mo</span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatSalary(result.netAnnual)} per year · {formatSalary(result.netWeekly)} per week, net
              </p>

              {/* Breakdown bar */}
              <div className="mt-6">
                <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-accent transition-all duration-300" style={{ width: `${pct(result.netAnnual, result.grossAnnual)}%` }} />
                  <div className="h-full bg-foreground transition-all duration-300" style={{ width: `${pct(result.incomeTax, result.grossAnnual)}%` }} />
                  <div className="h-full bg-[#9a8f7c] transition-all duration-300" style={{ width: `${pct(result.employeeSsc, result.grossAnnual)}%` }} />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <Legend swatch="bg-accent" label="Net pay" value={formatSalary(result.netAnnual)} />
                  <Legend swatch="bg-foreground" label="Income tax" value={formatSalary(result.incomeTax)} />
                  <Legend swatch="bg-[#9a8f7c]" label="Social security" value={formatSalary(result.employeeSsc)} />
                </div>
              </div>

              <p className="mt-5 text-sm text-muted-foreground">
                You keep <strong className="text-foreground">{result.takeHomeRatio}%</strong> of your gross
                {" "}({result.effectiveDeductionRate}% goes to tax &amp; social security).
              </p>

              {/* Percentile gauge */}
              <div className="mt-6 rounded-2xl border border-border bg-card/70 p-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-semibold text-foreground">Where this ranks in Malta</span>
                  <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-accent-foreground">
                    {percentileLabel(percentile)}
                  </span>
                </div>
                <div className="relative mt-3 h-2 rounded-full bg-gradient-to-r from-muted via-accent/40 to-accent">
                  <div
                    className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-foreground shadow transition-all duration-300"
                    style={{ left: `${percentile}%` }}
                  />
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Earns more than <strong className="text-foreground">~{Math.round(percentile)}%</strong> of full-time workers in Malta.
                  <span className="block opacity-80">Approximate · illustrative, based on typical Malta salary ranges (not official statistics).</span>
                </p>
              </div>
            </>
          ) : (
            <div className="flex h-full min-h-[260px] flex-col items-center justify-center text-center">
              <p className="text-sm text-muted-foreground">Enter a salary to see your estimated take-home pay and where it ranks in Malta.</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <SalaryAssumptionsCard />
      </div>
    </section>
  );
}

function Legend({ swatch, label, value }: { swatch: string; label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5">
        <span className={`h-2.5 w-2.5 shrink-0 rounded-sm ${swatch}`} />
        <span className="truncate text-muted-foreground">{label}</span>
      </div>
      <p className="mt-0.5 font-mono font-semibold text-foreground">{value}</p>
    </div>
  );
}
