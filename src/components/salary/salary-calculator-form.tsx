"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { SalaryPeriod, TaxProfile } from "@/lib/salary/types";
import { Calculator } from "lucide-react";

const PERIODS: { value: SalaryPeriod; label: string }[] = [
  { value: "annual", label: "Annual" },
  { value: "monthly", label: "Monthly" },
  { value: "weekly", label: "Weekly" },
  { value: "hourly", label: "Hourly" },
];

const PROFILES: { value: TaxProfile; label: string }[] = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "married-1-child", label: "Married with 1 child" },
  { value: "married-2-children", label: "Married with 2+ children" },
  { value: "parent", label: "Parent" },
  { value: "parent-1-child", label: "Parent with 1 child" },
  { value: "parent-2-children", label: "Parent with 2+ children" },
];

interface SalaryCalculatorFormProps {
  onCalculate: (amount: number, period: SalaryPeriod, profile: TaxProfile, hoursPerWeek: number, weeksPerYear: number) => void;
}

export default function SalaryCalculatorForm({ onCalculate }: SalaryCalculatorFormProps) {
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState<SalaryPeriod>("annual");
  const [profile, setProfile] = useState<TaxProfile>("single");
  const [hoursPerWeek, setHoursPerWeek] = useState("40");
  const [weeksPerYear, setWeeksPerYear] = useState("52");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num)) return;
    onCalculate(
      num,
      period,
      profile,
      parseFloat(hoursPerWeek) || 40,
      parseFloat(weeksPerYear) || 52
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="salary-amount" className="block text-sm font-medium text-foreground mb-1.5">
          Gross salary
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
          <input
            id="salary-amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="35000"
            min="0"
            step="any"
            className="w-full rounded-xl border border-border bg-background pl-7 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
      </div>

      <div>
        <label htmlFor="salary-period" className="block text-sm font-medium text-foreground mb-1.5">
          Salary period
        </label>
        <select
          id="salary-period"
          value={period}
          onChange={(e) => setPeriod(e.target.value as SalaryPeriod)}
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        >
          {PERIODS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="tax-profile" className="block text-sm font-medium text-foreground mb-1.5">
          Tax profile
        </label>
        <select
          id="tax-profile"
          value={profile}
          onChange={(e) => setProfile(e.target.value as TaxProfile)}
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        >
          {PROFILES.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      {period === "hourly" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="hours-per-week" className="block text-sm font-medium text-foreground mb-1.5">
              Hours / week
            </label>
            <input
              id="hours-per-week"
              type="number"
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(e.target.value)}
              min="1"
              max="80"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="weeks-per-year" className="block text-sm font-medium text-foreground mb-1.5">
              Weeks / year
            </label>
            <input
              id="weeks-per-year"
              type="number"
              value={weeksPerYear}
              onChange={(e) => setWeeksPerYear(e.target.value)}
              min="1"
              max="52"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
        </div>
      )}

      <Button type="submit" variant="primary" size="lg" className="w-full">
        <Calculator className="mr-2 h-4 w-4" />
        Calculate take-home
      </Button>
    </form>
  );
}
