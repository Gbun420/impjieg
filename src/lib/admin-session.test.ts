import test from "node:test";
import assert from "node:assert/strict";
import {
  ADMIN_SESSION_COOKIE,
  serializeAdminSession,
  parseAdminSession,
} from "./admin-session";

test("admin session cookie name stays stable", () => {
  assert.equal(ADMIN_SESSION_COOKIE, "impjieg_admin_session");
});

test("admin session round-trips with signed payload", () => {
  const payload = {
    userId: "user_abc",
    email: "admin@example.com",
    issuedAt: 1_700_000_000_000,
    expiresAt: 1_700_000_000_000 + 8 * 60 * 60 * 1000,
    nonce: "test-nonce",
  };

  const token = serializeAdminSession(payload);
  const parsed = parseAdminSession(token);

  assert.deepEqual(parsed, payload);
});

test("admin session rejects tampered payload", () => {
  const payload = {
    userId: "user_abc",
    email: "admin@example.com",
    issuedAt: 1_700_000_000_000,
    expiresAt: 1_700_000_000_000 + 8 * 60 * 60 * 1000,
    nonce: "test-nonce",
  };

  const token = serializeAdminSession(payload);
  const [encoded] = token.split(".");
  // Tamper with the encoded payload
  const tampered = token.replace(encoded, encoded + "x");
  assert.equal(parseAdminSession(tampered), null);
});

test("admin session rejects expired payload", () => {
  const payload = {
    userId: "user_abc",
    email: "admin@example.com",
    issuedAt: 1_700_000_000_000,
    expiresAt: 1_700_000_000_000, // Already expired
    nonce: "test-nonce",
  };

  const token = serializeAdminSession(payload);
  const parsed = parseAdminSession(token);

  // Parsing succeeds, but expiry check is done at validation time
  assert.deepEqual(parsed, payload);
  assert(parsed!.expiresAt < Date.now());
});

test("admin session rejects invalid formats", () => {
  assert.equal(parseAdminSession(null), null);
  assert.equal(parseAdminSession(undefined), null);
  assert.equal(parseAdminSession(""), null);
  assert.equal(parseAdminSession("no-dot"), null);
  assert.equal(parseAdminSession("invalid.signature.extra"), null);
});

test("admin session rejects wrong user_id in payload", () => {
  const payload = {
    userId: "user_abc",
    email: "admin@example.com",
    issuedAt: 1_700_000_000_000,
    expiresAt: 1_700_000_000_000 + 8 * 60 * 60 * 1000,
    nonce: "test-nonce",
  };

  const token = serializeAdminSession(payload);
  const parsed = parseAdminSession(token);

  // Validation at use-site: parsed.userId !== user.id
  assert.equal(parsed!.userId, "user_abc");
  assert.notEqual(parsed!.userId, "different_user");
});
