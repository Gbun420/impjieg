import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import {
  ADMIN_SESSION_COOKIE,
  getAdminSessionValue,
} from "./admin-session";

test("getAdminSessionValue derives a stable HMAC from the admin token", () => {
  const token = "super-secret-token";
  const expected = createHmac("sha256", token)
    .update("impjieg-admin-session")
    .digest("hex");

  assert.equal(getAdminSessionValue(token), expected);
});

test("admin session cookie name stays stable", () => {
  assert.equal(ADMIN_SESSION_COOKIE, "impjieg_admin_session");
});
