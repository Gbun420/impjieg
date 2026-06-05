import test from "node:test";
import assert from "node:assert/strict";
import { buildContentSecurityPolicy, buildSecurityHeaders } from "./security-headers";

test("buildContentSecurityPolicy removes unsafe-inline and includes a nonce", () => {
  const csp = buildContentSecurityPolicy({ nonce: "abc123", isDev: false });

  assert.match(csp, /script-src 'self' 'nonce-abc123' 'strict-dynamic'/);
  assert.match(csp, /style-src 'self' 'nonce-abc123'/);
  assert.doesNotMatch(csp, /unsafe-inline/);
});

test("buildSecurityHeaders includes the expected hardening headers", () => {
  const headers = buildSecurityHeaders({ nonce: "abc123", isDev: false });

  assert.equal(headers["X-Frame-Options"], "DENY");
  assert.equal(headers["X-Content-Type-Options"], "nosniff");
  assert.ok(headers["Content-Security-Policy"]);
});
