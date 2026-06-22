import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { estimateMaltaPercentile, percentileLabel } from "./percentile";

describe("estimateMaltaPercentile", () => {
  it("returns 0 for zero or negative income", () => {
    assert.equal(estimateMaltaPercentile(0), 0);
    assert.equal(estimateMaltaPercentile(-5000), 0);
  });

  it("stays within the 0–100 bounds", () => {
    for (const gross of [1000, 18000, 30000, 75000, 250000]) {
      const p = estimateMaltaPercentile(gross);
      assert.ok(p >= 0 && p <= 100, `percentile out of range for ${gross}: ${p}`);
    }
  });

  it("is monotonically non-decreasing as salary rises", () => {
    let prev = -1;
    for (let gross = 0; gross <= 200000; gross += 2500) {
      const p = estimateMaltaPercentile(gross);
      assert.ok(p >= prev, `percentile decreased at ${gross}: ${p} < ${prev}`);
      prev = p;
    }
  });

  it("interpolates linearly between anchor points", () => {
    // Midpoint between 20000 (50) and 25000 (64) -> ~57
    assert.equal(estimateMaltaPercentile(22500), 57);
  });

  it("caps at the top anchor for very high salaries", () => {
    assert.equal(estimateMaltaPercentile(500000), estimateMaltaPercentile(150000));
  });

  it("places a typical median Malta salary near the middle", () => {
    const p = estimateMaltaPercentile(20000);
    assert.ok(p >= 45 && p <= 55, `expected ~median, got ${p}`);
  });
});

describe("percentileLabel", () => {
  it("uses a Top X% label at or above the median", () => {
    assert.equal(percentileLabel(74), "Top 26%");
    assert.equal(percentileLabel(95), "Top 5%");
  });

  it("never claims better than Top 0.5%", () => {
    assert.equal(percentileLabel(100), "Top 0.5%");
  });

  it("uses an Nth percentile label below the median", () => {
    assert.equal(percentileLabel(40), "40th percentile");
  });
});
