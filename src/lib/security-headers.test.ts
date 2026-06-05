import test from "node:test";
import assert from "node:assert/strict";
import nextConfig, { securityHeaders } from "../../next.config";

test("securityHeaders includes a content security policy", () => {
  assert.equal(typeof nextConfig.headers, "function");
  const headerSource = securityHeaders[0];
  const csp = headerSource.headers.find((header) => header.key === "Content-Security-Policy");

  assert.ok(csp);
  assert.match(csp?.value ?? "", /default-src 'self'/);
});
