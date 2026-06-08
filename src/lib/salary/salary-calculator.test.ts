import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calculateSalary,
  calculateIncomeTax,
  convertToAnnual,
  validateInput,
} from "./salary-calculator";
import { MALTA_TAX_TABLES_2026 } from "./malta-tax-2026";
import { SSC_CONFIG } from "./malta-ssc-2026";
import type { CalculatorInput, TaxProfile } from "./types";

function makeInput(overrides: Partial<CalculatorInput> = {}): CalculatorInput {
  return {
    amount: 30000,
    period: "annual",
    profile: "single",
    ...overrides,
  };
}

describe("convertToAnnual", () => {
  it("returns annual amount unchanged", () => {
    assert.equal(convertToAnnual(50000, "annual"), 50000);
  });

  it("converts monthly to annual", () => {
    assert.equal(convertToAnnual(5000, "monthly"), 60000);
  });

  it("converts weekly to annual", () => {
    assert.equal(convertToAnnual(1000, "weekly"), 52000);
  });

  it("converts hourly to annual with default hours", () => {
    assert.equal(convertToAnnual(25, "hourly"), 25 * 40 * 52);
  });

  it("converts hourly to annual with custom hours and weeks", () => {
    assert.equal(convertToAnnual(30, "hourly", 35, 48), 30 * 35 * 48);
  });
});

describe("calculateIncomeTax", () => {
  for (const table of MALTA_TAX_TABLES_2026) {
    describe(`${table.profile} (${table.label})`, () => {
      it("returns 0 tax at the zero band threshold", () => {
        const threshold = table.bands[0].upper!;
        const { tax } = calculateIncomeTax(threshold, table.profile);
        assert.equal(tax, 0);
      });

      it("returns 0 tax below the first taxed band", () => {
        const { tax } = calculateIncomeTax(table.bands[0].upper! - 1000, table.profile);
        assert.equal(tax, 0);
      });

      it("returns positive tax at 1000 above first taxed band", () => {
        const firstTaxedUpper = table.bands[1].upper!;
        const { tax } = calculateIncomeTax(firstTaxedUpper, table.profile);
        assert.ok(tax > 0, `Expected positive tax at ${firstTaxedUpper}`);
      });

      it("returns correct tax at 60000 boundary", () => {
        const { tax, band } = calculateIncomeTax(60000, table.profile);
        assert.ok(tax > 0);
        assert.equal(band.upper, 60000);
      });

      it("returns correct tax above 60000", () => {
        const { tax, band } = calculateIncomeTax(80000, table.profile);
        assert.ok(tax > 0);
        assert.equal(band.upper, null);
      });

      it("returns negative tax clamped to 0 for very low income", () => {
        const { tax } = calculateIncomeTax(5000, table.profile);
        assert.equal(tax, 0);
      });
    });
  }

  it("single: €30000 has correct subtract-method tax", () => {
    const { tax } = calculateIncomeTax(30000, "single");
    // 30000 * 0.25 - 3400 = 4100
    assert.equal(tax, 4100);
  });

  it("married: €30000 has correct subtract-method tax", () => {
    const { tax } = calculateIncomeTax(30000, "married");
    // 30000 * 0.25 - 4550 = 2950
    assert.equal(tax, 2950);
  });

  it("single: €100000 has correct top-band tax", () => {
    const { tax } = calculateIncomeTax(100000, "single");
    // 100000 * 0.35 - 9400 = 25600
    assert.equal(tax, 25600);
  });

  it("single: boundary at €12000 is 0 tax", () => {
    const { tax } = calculateIncomeTax(12000, "single");
    assert.equal(tax, 0);
  });

  it("single: €12001 enters 15% band", () => {
    const { tax } = calculateIncomeTax(12001, "single");
    // 12001 * 0.15 - 1800 = 0.15
    assert.equal(tax, 0.15);
  });

  it("single: €16000 boundary", () => {
    const { tax } = calculateIncomeTax(16000, "single");
    // 16000 * 0.15 - 1800 = 600
    assert.equal(tax, 600);
  });

  it("single: €16001 enters 25% band", () => {
    const { tax } = calculateIncomeTax(16001, "single");
    // 16001 * 0.25 - 3400 = 600.25
    assert.equal(tax, 600.25);
  });
});

describe("validateInput", () => {
  it("returns warning for negative salary", () => {
    const warnings = validateInput(makeInput({ amount: -5000 }));
    assert.equal(warnings.length, 1);
    assert.equal(warnings[0].type, "negative");
  });

  it("returns warning for zero salary", () => {
    const warnings = validateInput(makeInput({ amount: 0 }));
    assert.equal(warnings.length, 1);
    assert.equal(warnings[0].type, "zero");
  });

  it("returns warning for unusually low salary", () => {
    const warnings = validateInput(makeInput({ amount: 3000 }));
    assert.ok(warnings.some((w) => w.type === "low-salary"));
  });

  it("returns warning for unusually high salary", () => {
    const warnings = validateInput(makeInput({ amount: 600000 }));
    assert.ok(warnings.some((w) => w.type === "high-salary"));
  });

  it("returns warning for invalid hourly hours per week", () => {
    const warnings = validateInput(makeInput({ amount: 25, period: "hourly", hoursPerWeek: 90 }));
    assert.ok(warnings.some((w) => w.type === "invalid-hourly"));
  });

  it("returns warning for invalid hourly weeks per year", () => {
    const warnings = validateInput(makeInput({ amount: 25, period: "hourly", weeksPerYear: 60 }));
    assert.ok(warnings.some((w) => w.type === "invalid-hourly"));
  });

  it("returns no warnings for valid input", () => {
    const warnings = validateInput(makeInput({ amount: 35000 }));
    assert.equal(warnings.length, 0);
  });

  it("returns no warnings for negative (early return skips other checks)", () => {
    const warnings = validateInput(makeInput({ amount: -100 }));
    assert.equal(warnings.length, 1);
    assert.equal(warnings[0].type, "negative");
  });
});

describe("calculateSalary", () => {
  it("calculates annual salary for single profile", () => {
    const result = calculateSalary(makeInput({ amount: 35000 }));
    assert.equal(result.grossAnnual, 35000);
    assert.equal(result.profile, "single");
    assert.ok(result.incomeTax > 0);
    assert.ok(result.employeeSsc > 0);
    assert.ok(result.netAnnual < 35000);
  });

  it("calculates monthly salary conversion", () => {
    const result = calculateSalary(makeInput({ amount: 3000, period: "monthly" }));
    assert.equal(result.grossAnnual, 36000);
    assert.equal(result.grossMonthly, 3000);
  });

  it("calculates weekly salary conversion", () => {
    const result = calculateSalary(makeInput({ amount: 800, period: "weekly" }));
    assert.equal(result.grossAnnual, 41600);
  });

  it("calculates hourly salary with defaults", () => {
    const result = calculateSalary(makeInput({ amount: 25, period: "hourly" }));
    assert.equal(result.grossAnnual, 25 * 40 * 52);
    assert.ok(result.netHourly !== null);
  });

  it("calculates hourly salary with custom hours", () => {
    const result = calculateSalary(makeInput({ amount: 30, period: "hourly", hoursPerWeek: 35, weeksPerYear: 48 }));
    assert.equal(result.grossAnnual, 30 * 35 * 48);
  });

  it("returns zero results for zero input", () => {
    const result = calculateSalary(makeInput({ amount: 0 }));
    assert.equal(result.grossAnnual, 0);
    assert.equal(result.incomeTax, 0);
    assert.equal(result.employeeSsc, 0);
    assert.equal(result.netAnnual, 0);
    assert.equal(result.netMonthly, 0);
    assert.equal(result.netWeekly, 0);
  });

  it("returns zero tax for negative input", () => {
    const result = calculateSalary(makeInput({ amount: -5000 }));
    assert.equal(result.grossAnnual, -5000);
    assert.equal(result.incomeTax, 0);
  });

  it("effectiveDeductionRate is between 0 and 100", () => {
    const result = calculateSalary(makeInput({ amount: 45000 }));
    assert.ok(result.effectiveDeductionRate >= 0);
    assert.ok(result.effectiveDeductionRate <= 100);
  });

  it("takeHomeRatio is between 0 and 100", () => {
    const result = calculateSalary(makeInput({ amount: 45000 }));
    assert.ok(result.takeHomeRatio >= 0);
    assert.ok(result.takeHomeRatio <= 100);
  });

  it("effectiveDeductionRate + takeHomeRatio approximately equals 100", () => {
    const result = calculateSalary(makeInput({ amount: 50000 }));
    const sum = Math.round((result.effectiveDeductionRate + result.takeHomeRatio) * 100) / 100;
    assert.ok(Math.abs(sum - 100) < 0.5, `Sum was ${sum}`);
  });

  it("netHourly is null for non-hourly input", () => {
    const result = calculateSalary(makeInput({ amount: 50000, period: "annual" }));
    assert.equal(result.netHourly, null);
  });

  it("no NaN in results", () => {
    const result = calculateSalary(makeInput({ amount: 40000 }));
    for (const [key, value] of Object.entries(result)) {
      if (typeof value === "number") {
        assert.ok(!Number.isNaN(value), `${key} is NaN`);
        assert.ok(Number.isFinite(value), `${key} is Infinity`);
      }
    }
  });

  it("SSC is flagged as estimated", () => {
    const result = calculateSalary(makeInput());
    assert.equal(result.isSscEstimate, true);
  });

  it("totalDeductions equals incomeTax + employeeSsc", () => {
    const result = calculateSalary(makeInput({ amount: 55000 }));
    const expected = Math.round((result.incomeTax + result.employeeSsc) * 100) / 100;
    assert.equal(result.totalDeductions, expected);
  });

  it("netAnnual equals grossAnnual minus totalDeductions", () => {
    const result = calculateSalary(makeInput({ amount: 48000 }));
    const expected = Math.round((result.grossAnnual - result.totalDeductions) * 100) / 100;
    assert.equal(result.netAnnual, expected);
  });
});

describe("all tax profiles produce valid results", () => {
  const profiles: TaxProfile[] = [
    "single",
    "married",
    "married-1-child",
    "married-2-children",
    "parent",
    "parent-1-child",
    "parent-2-children",
  ];

  for (const profile of profiles) {
    it(`${profile}: €30000 annual produces valid result`, () => {
      const result = calculateSalary(makeInput({ amount: 30000, profile }));
      assert.ok(result.incomeTax >= 0, `${profile}: tax should be >= 0`);
      assert.ok(result.netAnnual > 0, `${profile}: net should be > 0`);
      assert.ok(result.netAnnual < 30000, `${profile}: net should be < gross`);
      assert.equal(result.profile, profile);
    });

    it(`${profile}: €100000 annual produces valid result`, () => {
      const result = calculateSalary(makeInput({ amount: 100000, profile }));
      assert.ok(result.incomeTax > 0);
      assert.ok(result.netAnnual > 0);
      assert.ok(result.netAnnual < 100000);
    });
  }
});

describe("SSC module", () => {
  it("SSC_CONFIG.isEstimate is true", () => {
    assert.equal(SSC_CONFIG.isEstimate, true);
  });

  it("SSC_CONFIG has source documentation", () => {
    assert.ok(SSC_CONFIG.source.length > 0);
  });

  it("SSC_CONFIG has TODO for exact rates", () => {
    assert.ok(SSC_CONFIG.todo.length > 0);
  });
});
