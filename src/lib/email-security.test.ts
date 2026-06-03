import test from "node:test";
import assert from "node:assert/strict";
import {
  buildJobAlertUnsubscribeUrl,
  createSignedToken,
  escapeHtml,
  sanitizeEmailHeader,
  safeUrlHref,
  verifySignedToken,
} from "./email-security";

function withSecret<T>(fn: () => T) {
  const backup = process.env.JOB_ALERT_UNSUBSCRIBE_SECRET;
  process.env.JOB_ALERT_UNSUBSCRIBE_SECRET = "unit-test-unsubscribe-secret";

  try {
    return fn();
  } finally {
    process.env.JOB_ALERT_UNSUBSCRIBE_SECRET = backup;
  }
}

test("escapeHtml neutralizes malicious HTML payloads", () => {
  const payloads = [
    "<script>alert(1)</script>",
    '<img src=x onerror=alert(1)>',
    '" onclick="alert(1)',
    "<svg onload=alert(1)>",
    "<iframe src=\"https://evil.com\"></iframe>",
    "<style>body{display:none}</style>",
    "&lt;script&gt;alert(1)&lt;/script&gt;",
  ];

  for (const payload of payloads) {
    const escaped = escapeHtml(payload);
    assert.doesNotMatch(escaped, /<script>|<img|<svg|<iframe|<style/i);
    assert.match(escaped, /&lt;|&gt;|&quot;|&#39;|&amp;/);
  }
});

test("sanitizeEmailHeader strips CRLF injection vectors", () => {
  assert.equal(sanitizeEmailHeader("Subject\r\nBcc: test@example.com"), "Subject Bcc: test@example.com");
});

test("safeUrlHref rejects unsafe URLs", () => {
  assert.equal(safeUrlHref("javascript:alert(1)"), "#");
  assert.equal(safeUrlHref("https://impjieg.vercel.app/jobs"), "https://impjieg.vercel.app/jobs");
});

test("signed unsubscribe tokens validate, reject tampering, and expire safely", () => {
  withSecret(() => {
    const token = createSignedToken({ alertId: "alert_123" }, 1_000, 1000);
    const verified = verifySignedToken(token, 1500);

    assert.equal(verified.valid, true);
    if (verified.valid) {
      assert.equal(verified.payload.alertId, "alert_123");
    }

    const tamperedToken = `${token.slice(0, -1)}${token.endsWith("a") ? "b" : "a"}`;
    const tampered = verifySignedToken(tamperedToken, 1500);
    assert.equal(tampered.valid, false);
    if (!tampered.valid) {
      assert.equal(tampered.reason, "invalid");
    }

    const malformed = verifySignedToken("not-a-token", 1500);
    assert.equal(malformed.valid, false);
    if (!malformed.valid) {
      assert.equal(malformed.reason, "malformed");
    }

    const missing = verifySignedToken(null, 1500);
    assert.equal(missing.valid, false);
    if (!missing.valid) {
      assert.equal(missing.reason, "missing");
    }

    const expired = verifySignedToken(token, 2501);
    assert.equal(expired.valid, false);
    if (!expired.valid) {
      assert.equal(expired.reason, "expired");
    }
  });
});

test("buildJobAlertUnsubscribeUrl emits an opaque token without raw email", () => {
  withSecret(() => {
    const url = buildJobAlertUnsubscribeUrl({
      baseUrl: "https://impjieg.vercel.app",
      alertId: "alert_123",
      now: 1000,
      expiresInMs: 60_000,
    });

    assert.match(url, /https:\/\/impjieg\.vercel\.app\/api\/job-alerts\/unsubscribe\?token=/);
    assert.doesNotMatch(url, /email=/);
    assert.doesNotMatch(url, /person%40example\.com/);
  });
});
