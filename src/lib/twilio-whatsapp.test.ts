import test from "node:test";
import assert from "node:assert/strict";
import {
  buildImpjiegWhatsAppApplicationMessage,
  formatWhatsAppPhone,
  sendWhatsAppMessage,
} from "./twilio-whatsapp";

test("formatWhatsAppPhone preserves international numbers", () => {
  assert.equal(formatWhatsAppPhone("+35699112233"), "+35699112233");
});

test("formatWhatsAppPhone adds leading plus when missing", () => {
  assert.equal(formatWhatsAppPhone("35699112233"), "+35699112233");
});

test("sendWhatsAppMessage returns demo success when env is incomplete", async () => {
  const result = await sendWhatsAppMessage({
    to: "+35699112233",
    body: "hello",
    env: {},
  });

  assert.deepEqual(result, {
    success: true,
    demo: true,
    message: "WhatsApp notification logged (configure Twilio for production)",
  });
});

test("sendWhatsAppMessage posts to Twilio with formatted payload", async () => {
  let capturedUrl = "";
  let capturedInit: RequestInit | undefined;

  const result = await sendWhatsAppMessage({
    to: "35699112233",
    body: "New application",
    env: {
      TWILIO_ACCOUNT_SID: "AC123",
      TWILIO_AUTH_TOKEN: "secret",
      TWILIO_WHATSAPP_NUMBER: "+13202163359",
    },
    fetchImpl: async (url, init) => {
      capturedUrl = String(url);
      capturedInit = init;
      return new Response(JSON.stringify({ sid: "SM123", status: "queued" }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    },
  });

  assert.equal(capturedUrl, "https://api.twilio.com/2010-04-01/Accounts/AC123/Messages.json");
  assert.equal(capturedInit?.method, "POST");

  const body = capturedInit?.body;
  assert.ok(body instanceof URLSearchParams);
  assert.equal(body.get("From"), "whatsapp:+13202163359");
  assert.equal(body.get("To"), "whatsapp:+35699112233");
  assert.equal(body.get("Body"), "New application");

  assert.deepEqual(result, {
    success: true,
    message: "WhatsApp notification sent",
    messageId: "SM123",
    status: "queued",
  });
});

test("buildImpjiegWhatsAppApplicationMessage includes branded copy and dashboard link", () => {
  const message = buildImpjiegWhatsAppApplicationMessage({
    applicationId: "app_123",
    candidateName: "Jane Doe",
    jobTitle: "Product Engineer",
    dashboardUrl: "https://impjieg.vercel.app/employer/applications",
  });

  assert.match(message, /Impjieg/);
  assert.match(message, /Malta.*modern jobs marketplace/);
  assert.match(message, /Candidate: Jane Doe/);
  assert.match(message, /Role: Product Engineer/);
  assert.match(message, /Application ID: app_123/);
  assert.match(message, /https:\/\/impjieg\.vercel\.app\/employer\/applications/);
});
