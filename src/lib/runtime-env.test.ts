import test from "node:test";
import assert from "node:assert/strict";
import { requireEnv } from "./runtime-env";

test("requireEnv returns the configured value", () => {
  assert.equal(requireEnv("TEST_ENV", "configured"), "configured");
});

test("requireEnv throws when the value is missing in production", () => {
  const previousNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";

  try {
    assert.throws(() => requireEnv("TEST_ENV", ""), /TEST_ENV/);
  } finally {
    process.env.NODE_ENV = previousNodeEnv;
  }
});
