import test from "node:test";
import assert from "node:assert/strict";
import { isJobPubliclyLive } from "./job-visibility";

test("isJobPubliclyLive returns true for active unexpired jobs", () => {
  assert.equal(
    isJobPubliclyLive(
      {
        status: "active",
        expires_at: "2026-05-25T10:00:00.000Z",
      },
      new Date("2026-05-23T10:00:00.000Z")
    ),
    true
  );
});

test("isJobPubliclyLive returns false for expired jobs", () => {
  assert.equal(
    isJobPubliclyLive(
      {
        status: "active",
        expires_at: "2026-05-20T10:00:00.000Z",
      },
      new Date("2026-05-23T10:00:00.000Z")
    ),
    false
  );
});

test("isJobPubliclyLive returns false for non-active jobs", () => {
  assert.equal(
    isJobPubliclyLive(
      {
        status: "pending",
        expires_at: "2026-05-25T10:00:00.000Z",
      },
      new Date("2026-05-23T10:00:00.000Z")
    ),
    false
  );
});
