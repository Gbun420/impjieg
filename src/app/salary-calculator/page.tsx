"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatSalary } from "@/lib/utils";
import { Calculator } from "lucide-react";

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

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <Calculator className="h-8 w-8 text-secondary" />
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Malta Salary Calculator
        </h1>
      </div>
      <p className="mt-2 text-muted-foreground">
        Calculate your take-home pay after Malta income tax and NIC.
      </p>

      <form onSubmit={handleSubmit} className="mt-6">
        <div className="flex gap-3">
          <Input
            label="Gross Annual Salary (EUR)"
            type="number"
            value={gross}
            onChange={(e) => setGross(e.target.value)}
            placeholder="e.g. 35000"
            required
          />
          <Button type="submit" variant="primary" className="self-end">
            Calculate
          </Button>
        </div>
      </form>

      {breakdown && (
        <div className="mt-8 space-y-4">
          <Card className="overflow-hidden">
            <div className="bg-primary p-4 text-center">
              <p className="text-sm text-primary-foreground/70">
                Net Monthly Take-Home
              </p>
              <p className="font-mono text-3xl font-bold text-primary-foreground">
                {formatSalary(breakdown.netMonthly)}
              </p>
            </div>
            <div className="p-4">
              <p className="text-sm text-muted-foreground">
                Net Annual:{" "}
                <span className="font-mono font-semibold text-foreground">
                  {formatSalary(breakdown.netAnnual)}
                </span>
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground">
              Breakdown
            </h2>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gross Annual</span>
                <span className="font-mono font-medium">
                  {formatSalary(breakdown.gross)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Income Tax</span>
                <span className="font-mono font-medium text-error">
                  -{formatSalary(breakdown.tax)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  NIC (10%)
                </span>
                <span className="font-mono font-medium text-error">
                  -{formatSalary(breakdown.nic)}
                </span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="font-semibold text-foreground">Net Annual</span>
                <span className="font-mono font-bold text-success">
                  {formatSalary(breakdown.netAnnual)}
                </span>
              </div>
            </div>
          </Card>

          <div className="rounded-lg bg-muted/50 p-4 text-xs text-muted-foreground">
            <p className="font-medium">Tax Brackets (Malta):</p>
            <ul className="mt-2 space-y-1">
              <li>€0 - €9,100: 0% (tax-free)</li>
              <li>€9,101 - €14,500: 15%</li>
              <li>€14,501 - €19,500: 25%</li>
              <li>€19,501 - €60,000: 25%</li>
              <li>€60,001+: 35%</li>
              <li>NIC: 10% of gross</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
