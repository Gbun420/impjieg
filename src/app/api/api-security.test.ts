import test from "node:test";
import assert from "node:assert/strict";

test("setup-auth GET rejects requests without an admin token", async () => {
  process.env.NODE_ENV = "production";
  process.env.INTERNAL_ADMIN_TOKEN = "secret";

  const { GET } = await import("./setup-auth/route");
  const response = await GET(new Request("https://impjieg.vercel.app/api/setup-auth"));
  const body = await response.json();

  assert.equal(response.status, 403);
  assert.equal(body.error, "Forbidden");
});

test("setup-auth GET allows requests with a valid admin token", async () => {
  process.env.NODE_ENV = "development";
  process.env.INTERNAL_ADMIN_TOKEN = "secret";

  const { GET } = await import("./setup-auth/route");
  const response = await GET(
    new Request("https://impjieg.vercel.app/api/setup-auth", {
      headers: { "x-internal-admin-token": "secret" },
    })
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.status, "ready");
});

test("whatsapp POST rejects unauthenticated external requests", async () => {
  process.env.INTERNAL_ADMIN_TOKEN = "secret";

  const { POST } = await import("./notifications/whatsapp/route");
  const response = await POST(
    new Request("https://impjieg.vercel.app/api/notifications/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicationId: "app_123",
        candidateName: "Jane Doe",
        jobTitle: "Engineer",
        employerPhone: "+35612345678",
      }),
    })
  );
  const body = await response.json();

  assert.equal(response.status, 403);
  assert.equal(body.error, "Forbidden");
});
