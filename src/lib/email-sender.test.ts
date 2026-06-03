import test from "node:test";
import assert from "node:assert/strict";
import { sendEmail } from "./email-sender";

// Mock global fetch
const originalFetch = global.fetch;

test("sendEmail returns success when fetch succeeds", async () => {
  process.env.RESEND_API_KEY = "test-key";
  
  global.fetch = async () => {
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
  } finally {
    global.fetch = originalFetch;
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
  process.env.RESEND_API_KEY = "test-key";
  
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
  }
});
