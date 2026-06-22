/**
 * Approximate Malta full-time salary percentile model.
 *
 * ⚠️ ILLUSTRATIVE ONLY. This is a smooth model anchored to typical Malta gross
 * full-time salary ranges — it is NOT derived from official NSO statistics and
 * should be presented to users as an approximate estimate, not a precise figure.
 */

// [gross annual €, approx percentile of full-time earners]
const ANCHORS: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [10000, 8],
  [15000, 24],
  [18000, 40],
  [20000, 50],
  [25000, 64],
  [30000, 74],
  [35000, 81],
  [40000, 86],
  [50000, 92],
  [60000, 95],
  [75000, 97],
  [100000, 99],
  [150000, 99.7],
];

/** Approximate percentile (0–100) a gross annual salary sits at among Malta full-time earners. */
export function estimateMaltaPercentile(grossAnnual: number): number {
  if (grossAnnual <= 0) return 0;
  const last = ANCHORS[ANCHORS.length - 1];
  if (grossAnnual >= last[0]) return last[1];
  for (let i = 1; i < ANCHORS.length; i++) {
    const [x1, p1] = ANCHORS[i - 1];
    const [x2, p2] = ANCHORS[i];
    if (grossAnnual <= x2) {
      const t = (grossAnnual - x1) / (x2 - x1);
      return Math.round((p1 + t * (p2 - p1)) * 10) / 10;
    }
  }
  return 99.9;
}

/** Short label, e.g. "Top 14%" (for p ≥ 50) or "38th percentile". */
export function percentileLabel(p: number): string {
  if (p >= 50) {
    const top = Math.max(0.5, Math.round((100 - p) * 10) / 10);
    return `Top ${top % 1 === 0 ? top.toFixed(0) : top.toFixed(1)}%`;
  }
  return `${Math.round(p)}th percentile`;
}
