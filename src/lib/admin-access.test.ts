import test from "node:test";
import assert from "node:assert/strict";
import { isSuperAdminEmail, getSuperAdminEmailsList } from "./admin-access";

test("super admin email allowlist is case-insensitive", () => {
  assert.equal(isSuperAdminEmail("Info@DopamineDigital.Co"), true);
  assert.equal(isSuperAdminEmail("someoneelse@example.com"), false);
  assert.equal(getSuperAdminEmailsList().length, 1);
});
