import test from "node:test";
import assert from "node:assert/strict";
import { validatePasswordPolicy } from "./password-policy";

test("validatePasswordPolicy rejects passwords shorter than eight characters", () => {
  assert.equal(validatePasswordPolicy("Aa1!"), "Password must be at least 8 characters");
});

test("validatePasswordPolicy rejects passwords missing complexity", () => {
  assert.equal(
    validatePasswordPolicy("password1"),
    "Password must include uppercase, lowercase, number and special character."
  );
});

test("validatePasswordPolicy accepts a strong password", () => {
  assert.equal(validatePasswordPolicy("Strong1!"), null);
});
