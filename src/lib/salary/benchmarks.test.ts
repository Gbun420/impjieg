import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  SALARY_BENCHMARKS,
  getAllBenchmarks,
  getBenchmark,
  getBenchmarksBySector,
  getRelatedBenchmarks,
} from "./benchmarks";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

describe("salary benchmarks data integrity", () => {
  it("has a reasonable number of roles", () => {
    assert.ok(SALARY_BENCHMARKS.length >= 20, `expected >=20 roles, got ${SALARY_BENCHMARKS.length}`);
  });

  it("has unique, well-formed slugs", () => {
    const slugs = SALARY_BENCHMARKS.map((b) => b.slug);
    assert.equal(new Set(slugs).size, slugs.length, "duplicate slugs found");
    for (const b of SALARY_BENCHMARKS) {
      assert.match(b.slug, SLUG_RE, `bad slug: ${b.slug}`);
      assert.match(b.sectorSlug, SLUG_RE, `bad sectorSlug: ${b.sectorSlug}`);
    }
  });

  it("has monotonic, positive ranges (low < mid < high)", () => {
    for (const b of SALARY_BENCHMARKS) {
      assert.ok(b.low > 0, `${b.slug}: low must be positive`);
      assert.ok(b.low < b.mid, `${b.slug}: low (${b.low}) must be < mid (${b.mid})`);
      assert.ok(b.mid < b.high, `${b.slug}: mid (${b.mid}) must be < high (${b.high})`);
    }
  });

  it("has non-empty role, sector, blurb, and skills", () => {
    for (const b of SALARY_BENCHMARKS) {
      assert.ok(b.role.length > 0, `${b.slug}: empty role`);
      assert.ok(b.sector.length > 0, `${b.slug}: empty sector`);
      assert.ok(b.blurb.length > 40, `${b.slug}: blurb too short`);
      assert.ok(b.skills.length >= 3, `${b.slug}: needs >=3 skills`);
    }
  });
});

describe("salary benchmarks helpers", () => {
  it("getAllBenchmarks returns all, sorted by role", () => {
    const all = getAllBenchmarks();
    assert.equal(all.length, SALARY_BENCHMARKS.length);
    const roles = all.map((b) => b.role);
    assert.deepEqual(roles, [...roles].sort((a, b) => a.localeCompare(b)));
  });

  it("getBenchmark finds by slug and returns undefined otherwise", () => {
    assert.ok(getBenchmark(SALARY_BENCHMARKS[0].slug));
    assert.equal(getBenchmark("does-not-exist"), undefined);
  });

  it("getBenchmarksBySector groups only non-empty sectors", () => {
    const groups = getBenchmarksBySector();
    assert.ok(groups.length > 0);
    for (const g of groups) {
      assert.ok(g.roles.length > 0);
      assert.ok(g.roles.every((r) => r.sector === g.sector));
    }
    const grouped = groups.reduce((sum, g) => sum + g.roles.length, 0);
    assert.equal(grouped, SALARY_BENCHMARKS.length, "every role should appear in exactly one sector group");
  });

  it("getRelatedBenchmarks returns same-sector roles excluding self", () => {
    const sample = SALARY_BENCHMARKS[0];
    const related = getRelatedBenchmarks(sample.slug);
    assert.ok(related.every((r) => r.sector === sample.sector));
    assert.ok(related.every((r) => r.slug !== sample.slug));
  });
});
