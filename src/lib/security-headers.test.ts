import test from "node:test";
import assert from "node:assert/strict";
import { buildContentSecurityPolicy, buildSecurityHeaders } from "./security-headers";

test("buildContentSecurityPolicy includes a nonce and toolbar allowances", () => {
  const csp = buildContentSecurityPolicy({ nonce: "abc123", isDev: false });

  assert.match(csp, /script-src 'self' 'nonce-abc123' https:\/\/vercel\.live/);
  assert.match(csp, /style-src 'self' 'nonce-abc123' https:\/\/vercel\.live/);
  assert.match(csp, /style-src-attr 'unsafe-inline'/);
  assert.match(csp, /connect-src 'self' https:\/\/\*\.supabase\.co https:\/\/\*\.vercel\.app https:\/\/vercel\.live wss:\/\/ws-us3\.pusher\.com/);
});

test("buildSecurityHeaders includes the expected hardening headers", () => {
  const headers = buildSecurityHeaders({ nonce: "abc123", isDev: false });

  assert.equal(headers["X-Frame-Options"], "DENY");
  assert.equal(headers["X-Content-Type-Options"], "nosniff");
  assert.ok(headers["Content-Security-Policy"]);
});
