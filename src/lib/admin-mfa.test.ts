import test from "node:test";
import assert from "node:assert/strict";
import {
  buildAdminOtpAuthUri,
  decryptAdminMfaSecret,
  encryptAdminMfaSecret,
  generateAdminMfaSecret,
  generateTotpCode,
  parseAdminMfaChallenge,
  serializeAdminMfaChallenge,
  verifyTotpCode,
} from "./admin-mfa";

test("generateTotpCode matches a known RFC 6238 test vector", () => {
  const code = generateTotpCode("GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ", {
    digits: 8,
    timestamp: 59_000,
  });

  assert.equal(code, "94287082");
  assert.equal(
    verifyTotpCode("GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ", "94287082", {
      digits: 8,
      timestamp: 59_000,
    }),
    true
  );
});

test("admin MFA challenge tokens round-trip and reject tampering", () => {
  const token = serializeAdminMfaChallenge({
    userId: "user_123",
    email: "admin@example.com",
    mode: "setup",
    secret: "BASE32SECRET",
    issuedAt: 1_700_000_000_000,
  });

  assert.deepEqual(parseAdminMfaChallenge(token), {
    userId: "user_123",
    email: "admin@example.com",
    mode: "setup",
    secret: "BASE32SECRET",
    issuedAt: 1_700_000_000_000,
  });
  assert.equal(parseAdminMfaChallenge(`${token}.tampered`), null);
});

test("admin MFA secrets encrypt and decrypt with the application secret", () => {
  const secret = generateAdminMfaSecret();
  const encrypted = encryptAdminMfaSecret(secret);

  assert.notEqual(encrypted, secret);
  assert.equal(decryptAdminMfaSecret(encrypted), secret);
  assert.match(buildAdminOtpAuthUri({ email: "admin@example.com", secret }), /^otpauth:\/\/totp\//);
});
