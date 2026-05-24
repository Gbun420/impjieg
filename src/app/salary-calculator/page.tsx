"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatSalary } from "@/lib/utils";
import { Calculator, ArrowDownRight, TrendingUp, Wallet } from "lucide-react";

interface TaxBreakdown {
  gross: number;
  tax: number;
  nic: number;
  netAnnual: number;
  netMonthly: number;
}

function calculateMaltaTax(gross: number): TaxBreakdown {
  let tax = 0;

  if (gross > 60000) {
    tax += (gross - 60000) * 0.35;
    tax += (60000 - 19500) * 0.25;
    tax += (19500 - 14500) * 0.25;
    tax += (14500 - 9100) * 0.15;
  } else if (gross > 19500) {
    tax += (gross - 19500) * 0.25;
    tax += (19500 - 14500) * 0.25;
    tax += (14500 - 9100) * 0.15;
  } else if (gross > 14500) {
    tax += (gross - 14500) * 0.25;
    tax += (14500 - 9100) * 0.15;
  } else if (gross > 9100) {
    tax += (gross - 9100) * 0.15;
  }

  const nic = gross * 0.1;
  const netAnnual = gross - tax - nic;

  return {
    gross,
    tax,
    nic,
    netAnnual,
    netMonthly: netAnnual / 12,
  };
}

export default function SalaryCalculatorPage() {
  const [gross, setGross] = useState("");
  const [breakdown, setBreakdown] = useState<TaxBreakdown | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(gross);
    if (isNaN(amount) || amount <= 0) return;
    setBreakdown(calculateMaltaTax(amount));
  }

  const taxRate = breakdown ? ((breakdown.tax + breakdown.nic) / breakdown.gross * 100).toFixed(1) : "0";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20">
          <Calculator className="h-7 w-7 text-primary" />
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Malta Salary{" "}
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Calculator
          </span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Calculate your take-home pay after Malta income tax and NIC.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <Input
          label="Gross Annual Salary"
          type="number"
          value={gross}
          onChange={(e) => setGross(e.target.value)}
          placeholder="e.g. 35000"
          required
          className="flex-1"
        />
        <Button type="submit" variant="primary" size="lg" className="self-end">
          Calculate
        </Button>
      </form>

      {breakdown && (
        <div className="mt-8 space-y-5 animate-fade-in">
          {/* Net Monthly Card */}
          <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 to-secondary/10">
            <div className="p-6 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground/80">
                Net Monthly Take-Home
              </p>
              <p className="font-mono text-4xl font-bold text-foreground">
                {formatSalary(breakdown.netMonthly)}
              </p>
            </div>
          </Card>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4 border-border/60">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10">
                  <TrendingUp className="h-4 w-4 text-success" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Net Annual</p>
                  <p className="font-mono text-lg font-bold text-foreground">
                    {formatSalary(breakdown.netAnnual)}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-4 border-border/60">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-error/10">
                  <ArrowDownRight className="h-4 w-4 text-error" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Deductions</p>
                  <p className="font-mono text-lg font-bold text-foreground">
                    {taxRate}%
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Breakdown */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground">
              Breakdown
            </h2>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-foreground/75">Gross Annual</span>
                <span className="font-mono font-medium text-foreground">
                  {formatSalary(breakdown.gross)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-foreground/75">Income Tax</span>
                <span className="font-mono font-medium text-red-600 dark:text-red-400">
                  -{formatSalary(breakdown.tax)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-foreground/75">
                  NIC (10%)
                </span>
                <span className="font-mono font-medium text-red-600 dark:text-red-400">
                  -{formatSalary(breakdown.nic)}
                </span>
              </div>
              <div className="border-t border-border/50 pt-3 flex justify-between items-center">
                <span className="font-semibold text-foreground">Net Annual</span>
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                  {formatSalary(breakdown.netAnnual)}
                </span>
              </div>
            </div>
          </Card>

          {/* Tax Brackets */}
          <Card className="p-6 bg-muted/20">
            <h2 className="text-sm font-semibold text-foreground/75 uppercase tracking-wider">
              Tax Brackets (Malta)
            </h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground/75">€0 - €9,100</span>
                <span className="font-medium text-emerald-700 dark:text-emerald-400">0%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/75">€9,101 - €14,500</span>
                <span className="font-medium text-foreground">15%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/75">€14,501 - €19,500</span>
                <span className="font-medium text-foreground">25%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/75">€19,501 - €60,000</span>
                <span className="font-medium text-foreground">25%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/75">€60,001+</span>
                <span className="font-medium text-red-600 dark:text-red-400">35%</span>
              </div>
              <div className="flex justify-between border-t border-border/50 pt-2 mt-2">
                <span className="text-foreground/75">NIC</span>
                <span className="font-medium text-foreground">10% of gross</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
