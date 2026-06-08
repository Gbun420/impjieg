import type { TaxTable } from "./types";

export const MALTA_TAX_TABLES_2026: readonly TaxTable[] = [
  {
    profile: "single",
    label: "Single",
    bands: [
      { upper: 12000, rate: 0, subtract: 0 },
      { upper: 16000, rate: 0.15, subtract: 1800 },
      { upper: 60000, rate: 0.25, subtract: 3400 },
      { upper: null, rate: 0.35, subtract: 9400 },
    ],
  },
  {
    profile: "married",
    label: "Married",
    bands: [
      { upper: 15000, rate: 0, subtract: 0 },
      { upper: 23000, rate: 0.15, subtract: 2250 },
      { upper: 60000, rate: 0.25, subtract: 4550 },
      { upper: null, rate: 0.35, subtract: 10550 },
    ],
  },
  {
    profile: "married-1-child",
    label: "Married with 1 child",
    bands: [
      { upper: 17500, rate: 0, subtract: 0 },
      { upper: 26500, rate: 0.15, subtract: 2625 },
      { upper: 60000, rate: 0.25, subtract: 5275 },
      { upper: null, rate: 0.35, subtract: 11275 },
    ],
  },
  {
    profile: "married-2-children",
    label: "Married with 2+ children",
    bands: [
      { upper: 22500, rate: 0, subtract: 0 },
      { upper: 32000, rate: 0.15, subtract: 3375 },
      { upper: 60000, rate: 0.25, subtract: 6575 },
      { upper: null, rate: 0.35, subtract: 12575 },
    ],
  },
  {
    profile: "parent",
    label: "Parent",
    bands: [
      { upper: 13000, rate: 0, subtract: 0 },
      { upper: 17500, rate: 0.15, subtract: 1950 },
      { upper: 60000, rate: 0.25, subtract: 3700 },
      { upper: null, rate: 0.35, subtract: 9700 },
    ],
  },
  {
    profile: "parent-1-child",
    label: "Parent with 1 child",
    bands: [
      { upper: 14500, rate: 0, subtract: 0 },
      { upper: 21000, rate: 0.15, subtract: 2175 },
      { upper: 60000, rate: 0.25, subtract: 4275 },
      { upper: null, rate: 0.35, subtract: 10275 },
    ],
  },
  {
    profile: "parent-2-children",
    label: "Parent with 2+ children",
    bands: [
      { upper: 18500, rate: 0, subtract: 0 },
      { upper: 25500, rate: 0.15, subtract: 2775 },
      { upper: 60000, rate: 0.25, subtract: 5325 },
      { upper: null, rate: 0.35, subtract: 11325 },
    ],
  },
] as const;

export function getTaxTable(profile: string): TaxTable {
  const table = MALTA_TAX_TABLES_2026.find((t) => t.profile === profile);
  if (!table) {
    throw new Error(`Unknown tax profile: ${profile}`);
  }
  return table;
}
