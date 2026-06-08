/**
 * Malta Social Security Contributions (SSC) — Employee share, 2026 estimate.
 *
 * TODO: Encode exact MTCA Class 1 weekly contribution tables including:
 * - Weekly contribution thresholds and rates per band
 * - Class 1 weekly maximum insurable earnings
 * - Different rates for part-time vs full-time
 * - Employer vs employee split
 *
 * For now, this uses a flat 10% estimate of gross annual, which is close
 * to the Class 1 full-time rate but NOT exact. Marked as estimated.
 */

const ESTIMATED_RATE = 0.1;

export const SSC_CONFIG = {
  estimatedRate: ESTIMATED_RATE,
  source: "Estimated from MTCA Class 1 full-time rate",
  isEstimate: true,
  todo: "Encode exact Class 1 weekly caps/rates from MTCA",
} as const;

export function estimateEmployeeSsc(grossAnnual: number): number {
  if (grossAnnual <= 0) return 0;
  return Math.round(grossAnnual * ESTIMATED_RATE * 100) / 100;
}
