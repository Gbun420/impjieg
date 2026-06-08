import type {
  CalculatorInput,
  TaxResult,
  TaxBand,
  ValidationWarning,
  SalaryPeriod,
} from "./types";
import { getTaxTable } from "./malta-tax-2026";
import { estimateEmployeeSsc, SSC_CONFIG } from "./malta-ssc-2026";

const WEEKS_PER_YEAR = 52;
const DEFAULT_HOURS_PER_WEEK = 40;
const DEFAULT_WEEKS_PER_YEAR = 52;

export function convertToAnnual(amount: number, period: SalaryPeriod, hoursPerWeek?: number, weeksPerYear?: number): number {
  switch (period) {
    case "annual":
      return amount;
    case "monthly":
      return amount * 12;
    case "weekly":
      return amount * WEEKS_PER_YEAR;
    case "hourly": {
      const hours = hoursPerWeek ?? DEFAULT_HOURS_PER_WEEK;
      const weeks = weeksPerYear ?? DEFAULT_WEEKS_PER_YEAR;
      return amount * hours * weeks;
    }
  }
}

export function calculateIncomeTax(grossAnnual: number, profile: string): { tax: number; band: TaxBand } {
  const table = getTaxTable(profile);
  const bands = table.bands;

  for (const band of bands) {
    if (band.upper === null || grossAnnual <= band.upper) {
      const tax = Math.max(0, grossAnnual * band.rate - band.subtract);
      return { tax: Math.round(tax * 100) / 100, band };
    }
  }

  const lastBand = bands[bands.length - 1];
  const tax = Math.max(0, grossAnnual * lastBand.rate - lastBand.subtract);
  return { tax: Math.round(tax * 100) / 100, band: lastBand };
}

export function validateInput(input: CalculatorInput): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  if (input.amount < 0) {
    warnings.push({ type: "negative", message: "Salary cannot be negative." });
    return warnings;
  }

  if (input.amount === 0) {
    warnings.push({ type: "zero", message: "Salary is zero. Results will show zero take-home." });
    return warnings;
  }

  const annual = convertToAnnual(input.amount, input.period, input.hoursPerWeek, input.weeksPerYear);

  if (annual < 5000) {
    warnings.push({
      type: "low-salary",
      message: "This salary is unusually low. Results may not reflect real payroll.",
    });
  }

  if (annual > 500000) {
    warnings.push({
      type: "high-salary",
      message: "This salary is unusually high. Results may not reflect real payroll.",
    });
  }

  if (input.period === "hourly") {
    const hours = input.hoursPerWeek ?? DEFAULT_HOURS_PER_WEEK;
    const weeks = input.weeksPerYear ?? DEFAULT_WEEKS_PER_YEAR;
    if (hours <= 0 || hours > 80) {
      warnings.push({
        type: "invalid-hourly",
        message: `Hours per week (${hours}) is unusual. Typical range is 1–80.`,
      });
    }
    if (weeks <= 0 || weeks > 52) {
      warnings.push({
        type: "invalid-hourly",
        message: `Weeks per year (${weeks}) is unusual. Typical range is 1–52.`,
      });
    }
  }

  return warnings;
}

export function calculateSalary(input: CalculatorInput): TaxResult {
  const grossAnnual = convertToAnnual(input.amount, input.period, input.hoursPerWeek, input.weeksPerYear);
  const { tax, band } = calculateIncomeTax(grossAnnual, input.profile);
  const ssc = estimateEmployeeSsc(grossAnnual);
  const totalDeductions = Math.round((tax + ssc) * 100) / 100;
  const netAnnual = Math.round((grossAnnual - totalDeductions) * 100) / 100;
  const netMonthly = Math.round((netAnnual / 12) * 100) / 100;
  const netWeekly = Math.round((netAnnual / WEEKS_PER_YEAR) * 100) / 100;

  let netHourly: number | null = null;
  if (input.period === "hourly") {
    const hours = input.hoursPerWeek ?? DEFAULT_HOURS_PER_WEEK;
    const weeks = input.weeksPerYear ?? DEFAULT_WEEKS_PER_YEAR;
    netHourly = Math.round((netAnnual / (hours * weeks)) * 100) / 100;
  }

  const effectiveDeductionRate = grossAnnual > 0
    ? Math.round((totalDeductions / grossAnnual) * 10000) / 100
    : 0;

  const takeHomeRatio = grossAnnual > 0
    ? Math.round((netAnnual / grossAnnual) * 10000) / 100
    : 0;

  return {
    grossAnnual: Math.round(grossAnnual * 100) / 100,
    grossMonthly: Math.round((grossAnnual / 12) * 100) / 100,
    incomeTax: tax,
    employeeSsc: ssc,
    totalDeductions,
    netAnnual,
    netMonthly,
    netWeekly,
    netHourly,
    effectiveDeductionRate,
    takeHomeRatio,
    appliedBand: band,
    profile: input.profile,
    isSscEstimate: SSC_CONFIG.isEstimate,
  };
}

export { WEEKS_PER_YEAR, DEFAULT_HOURS_PER_WEEK, DEFAULT_WEEKS_PER_YEAR };
