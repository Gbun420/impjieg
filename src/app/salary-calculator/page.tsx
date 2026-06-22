"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import SalaryCalculatorForm from "@/components/salary/salary-calculator-form";
import SalaryResultCard from "@/components/salary/salary-result-card";
import SalaryBreakdownCard from "@/components/salary/salary-breakdown-card";
import SalaryAssumptionsCard from "@/components/salary/salary-assumptions-card";
import { calculateSalary, validateInput } from "@/lib/salary/salary-calculator";
import type { CalculatorInput, TaxResult, SalaryPeriod, TaxProfile } from "@/lib/salary/types";

export default function SalaryCalculatorPage() {
  const [result, setResult] = useState<TaxResult | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const handleCalculate = useCallback((amount: number, period: SalaryPeriod, profile: TaxProfile, hoursPerWeek: number, weeksPerYear: number) => {
    const input: CalculatorInput = { amount, period, profile, hoursPerWeek, weeksPerYear };
    const validationWarnings = validateInput(input);
    setWarnings(validationWarnings.map((w) => w.message));

    if (validationWarnings.some((w) => w.type === "negative")) {
      setResult(null);
      return;
    }

    setResult(calculateSalary(input));
  }, []);

  return (
    <div data-testid="salary-calculator">
      <section className="relative overflow-hidden bg-gradient-to-b from-[#272019] to-[#0C0A08] py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="max-w-3xl text-4xl font-bold tracking-[-0.03em] text-white sm:text-5xl">
            Malta Salary Calculator
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
            Estimate your take-home pay with clearer salary signals.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="primary" size="lg" className="w-full sm:w-auto">
              <Link href="/jobs">
                Browse jobs with salary <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full border-white/25 bg-white/10 text-white hover:bg-white/20 sm:w-auto">
              <Link href="/employer/post-job">
                Post a role with salary visibility
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Calculate</h2>
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
    </div>
  );
}
