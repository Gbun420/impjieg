import test from "node:test";
import assert from "node:assert/strict";
import { sendEmail } from "./email-sender";

// Mock global fetch
const originalFetch = global.fetch;

test("sendEmail returns success when fetch succeeds", async () => {
  const backupApiKey = process.env.RESEND_API_KEY;
  const backupFrom = process.env.RESEND_FROM_EMAIL;

  process.env.RESEND_API_KEY = "test-key";
  process.env.RESEND_FROM_EMAIL = "Impjieg <hello@impjieg.com>";
  let capturedBody = "";
  
  global.fetch = async (_url, init) => {
    capturedBody = String(init?.body ?? "");
    return {
      ok: true,
      json: async () => ({ id: "msg_123" }),
    } as Response;
  };

  try {
    const result = await sendEmail({
      to: "test@example.com",
      subject: "Test Subject",
      html: "<p>Hello</p>",
    });

    assert.deepEqual(result, { success: true, messageId: "msg_123" });
    const body = JSON.parse(capturedBody || "{}");
    assert.equal(body.from, "Impjieg <hello@impjieg.com>");
  } finally {
    global.fetch = originalFetch;
    if (backupApiKey === undefined) {
      delete process.env.RESEND_API_KEY;
    } else {
      process.env.RESEND_API_KEY = backupApiKey;
    }
    if (backupFrom === undefined) {
      delete process.env.RESEND_FROM_EMAIL;
    } else {
      process.env.RESEND_FROM_EMAIL = backupFrom;
    }
  }
});

test("sendEmail returns failure when API key is missing", async () => {
  const backup = process.env.RESEND_API_KEY;
  delete process.env.RESEND_API_KEY;

  try {
    const result = await sendEmail({
      to: "test@example.com",
      subject: "Test",
      html: "<p>Test</p>",
    });

    assert.equal(result.success, false);
    if (!result.success) {
      assert.equal(result.category, "setup_failed");
    }
  } finally {
    process.env.RESEND_API_KEY = backup;
  }
});

test("sendEmail handles provider error safely", async () => {
  const backupApiKey = process.env.RESEND_API_KEY;
  const backupFrom = process.env.RESEND_FROM_EMAIL;

  process.env.RESEND_API_KEY = "test-key";
  process.env.RESEND_FROM_EMAIL = "Impjieg <hello@impjieg.com>";
  
  global.fetch = async () => {
    return {
      ok: false,
      status: 400,
      json: async () => ({ message: "invalid recipient" }),
    } as Response;
  };

  try {
    const result = await sendEmail({
      to: "invalid-email",
      subject: "Test",
      html: "<p>Test</p>",
    });

    assert.equal(result.success, false);
    if (!result.success) {
      assert.equal(result.category, "provider_failed");
      assert.match(result.error, /invalid recipient/);
    }
  } finally {
    global.fetch = originalFetch;
    if (backupApiKey === undefined) {
      delete process.env.RESEND_API_KEY;
    } else {
      process.env.RESEND_API_KEY = backupApiKey;
    }
    if (backupFrom === undefined) {
      delete process.env.RESEND_FROM_EMAIL;
    } else {
      process.env.RESEND_FROM_EMAIL = backupFrom;
    }
  }
});

test("sendEmail fails fast in production without a configured sender", async () => {
  const backupApiKey = process.env.RESEND_API_KEY;
  const backupFrom = process.env.RESEND_FROM_EMAIL;
  const backupNodeEnv = process.env.NODE_ENV;

  process.env.RESEND_API_KEY = "test-key";
  delete process.env.RESEND_FROM_EMAIL;
  process.env.NODE_ENV = "production";

  try {
    const result = await sendEmail({
      to: "test@example.com",
      subject: "Test",
      html: "<p>Test</p>",
    });

    assert.equal(result.success, false);
    if (!result.success) {
      assert.equal(result.category, "setup_failed");
      assert.match(result.error, /RESEND_FROM_EMAIL/);
    }
  } finally {
    process.env.RESEND_API_KEY = backupApiKey;
    if (backupFrom === undefined) {
      delete process.env.RESEND_FROM_EMAIL;
    } else {
      process.env.RESEND_FROM_EMAIL = backupFrom;
    }
    if (backupNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = backupNodeEnv;
    }
  }
});
