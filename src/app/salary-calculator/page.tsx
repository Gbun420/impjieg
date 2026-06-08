"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Briefcase } from "lucide-react";
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
      <section className="relative overflow-hidden bg-harbor py-10 text-foreground sm:py-16">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_18%,rgba(30,99,255,0.24),transparent_28%),radial-gradient(circle_at_85%_12%,rgba(20,199,183,0.16),transparent_30%)]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <Briefcase className="h-3.5 w-3.5" />
            Salary signal
          </div>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-[-0.055em] text-foreground sm:text-5xl">
            Malta Salary Calculator
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
            Estimate your take-home pay with clearer salary signals.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="primary" size="lg" className="w-full sm:w-auto">
              <Link href="/jobs">
                Browse jobs with salary <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto border-primary/30 bg-primary/5 text-primary hover:bg-primary/10">
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
