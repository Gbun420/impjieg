"use client";

import { useState, useCallback } from "react";
import SalaryCalculatorForm from "@/components/salary/salary-calculator-form";
import SalaryResultCard from "@/components/salary/salary-result-card";
import SalaryBreakdownCard from "@/components/salary/salary-breakdown-card";
import SalaryAssumptionsCard from "@/components/salary/salary-assumptions-card";
import { calculateSalary, validateInput } from "@/lib/salary/salary-calculator";
import type { CalculatorInput, TaxResult, SalaryPeriod, TaxProfile } from "@/lib/salary/types";

/** Interactive client island for the (server-rendered, SEO-friendly) salary page. */
export default function SalaryCalculatorTool() {
  const [result, setResult] = useState<TaxResult | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const handleCalculate = useCallback(
    (amount: number, period: SalaryPeriod, profile: TaxProfile, hoursPerWeek: number, weeksPerYear: number) => {
      const input: CalculatorInput = { amount, period, profile, hoursPerWeek, weeksPerYear };
      const validationWarnings = validateInput(input);
      setWarnings(validationWarnings.map((w) => w.message));

      if (validationWarnings.some((w) => w.type === "negative")) {
        setResult(null);
        return;
      }

      setResult(calculateSalary(input));
    },
    []
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Calculate</h2>
            <SalaryCalculatorForm onCalculate={handleCalculate} />
          </div>
          <SalaryAssumptionsCard />
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          {result ? (
            <SalaryResultCard result={result} warnings={warnings} />
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center">
              <p className="text-sm text-muted-foreground">Enter a salary to see your estimated take-home pay.</p>
            </div>
          )}
        </div>
      </div>

      {result && (
        <div className="mt-8">
          <SalaryBreakdownCard result={result} />
        </div>
      )}
    </section>
  );
}
