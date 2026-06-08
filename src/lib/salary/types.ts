export type TaxProfile =
  | "single"
  | "married"
  | "married-1-child"
  | "married-2-children"
  | "parent"
  | "parent-1-child"
  | "parent-2-children";

export type SalaryPeriod = "annual" | "monthly" | "weekly" | "hourly";

export interface TaxBand {
  readonly upper: number | null;
  readonly rate: number;
  readonly subtract: number;
}

export interface TaxTable {
  readonly profile: TaxProfile;
  readonly label: string;
  readonly bands: readonly TaxBand[];
}

export interface CalculatorInput {
  readonly amount: number;
  readonly period: SalaryPeriod;
  readonly profile: TaxProfile;
  readonly hoursPerWeek?: number;
  readonly weeksPerYear?: number;
}

export interface TaxResult {
  readonly grossAnnual: number;
  readonly grossMonthly: number;
  readonly incomeTax: number;
  readonly employeeSsc: number;
  readonly totalDeductions: number;
  readonly netAnnual: number;
  readonly netMonthly: number;
  readonly netWeekly: number;
  readonly netHourly: number | null;
  readonly effectiveDeductionRate: number;
  readonly takeHomeRatio: number;
  readonly appliedBand: TaxBand;
  readonly profile: TaxProfile;
  readonly isSscEstimate: boolean;
}

export interface ValidationWarning {
  readonly type: "low-salary" | "high-salary" | "invalid-hourly" | "zero" | "negative";
  readonly message: string;
}
