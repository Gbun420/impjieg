import test from "node:test";
import assert from "node:assert/strict";
import {
  buildJobAlertUnsubscribeUrl,
  createSignedToken,
} from "@/lib/email-security";
import { unsubscribeJobAlertWithDeps } from "./logic";

async function withSecret<T>(fn: () => T | Promise<T>) {
  const backup = process.env.JOB_ALERT_UNSUBSCRIBE_SECRET;
  process.env.JOB_ALERT_UNSUBSCRIBE_SECRET = "unit-test-unsubscribe-secret";

  try {
    return await fn();
  } finally {
    process.env.JOB_ALERT_UNSUBSCRIBE_SECRET = backup;
  }
}

test("unsubscribe route accepts a valid signed token", async () => {
  await withSecret(async () => {
    let updateCount = 0;
    const url = buildJobAlertUnsubscribeUrl({
      baseUrl: "https://impjieg.vercel.app",
      alertId: "alert_123",
      now: 1000,
      expiresInMs: 60_000,
    });

    const response = await unsubscribeJobAlertWithDeps(
      new Request(url),
      {
        updateAlertById: async (alertId) => {
          updateCount += 1;
          assert.equal(alertId, "alert_123");
          return { error: null };
        },
        now: () => 1000,
      }
    );

    const body = await response.text();

    assert.equal(response.status, 200);
    assert.match(body, /Job alert unsubscribed/);
    assert.equal(updateCount, 1);
  });
});

test("unsubscribe route rejects tampered tokens", async () => {
  await withSecret(async () => {
    const token = createSignedToken({ alertId: "alert_123" }, 60_000, 1000);
    const tampered = `${token.slice(0, -1)}${token.endsWith("a") ? "b" : "a"}`;

    const response = await unsubscribeJobAlertWithDeps(
      new Request(`https://impjieg.vercel.app/api/job-alerts/unsubscribe?token=${encodeURIComponent(tampered)}`),
      {
        updateAlertById: async () => {
          throw new Error("should not update on tampered token");
        },
      }
    );

    const body = await response.text();

    assert.equal(response.status, 400);
    assert.match(body, /invalid or expired/i);
  });
});

test("unsubscribe route rejects missing token", async () => {
  await withSecret(async () => {
    const response = await unsubscribeJobAlertWithDeps(
      new Request("https://impjieg.vercel.app/api/job-alerts/unsubscribe"),
      {
        updateAlertById: async () => {
          throw new Error("should not update without token");
        },
      }
    );

    const body = await response.text();

    assert.equal(response.status, 400);
    assert.match(body, /invalid or expired/i);
  });
});

test("unsubscribe route rejects legacy raw email links", async () => {
  await withSecret(async () => {
    const response = await unsubscribeJobAlertWithDeps(
      new Request(
        "https://impjieg.vercel.app/api/job-alerts/unsubscribe?id=alert_123&email=person%40example.com"
      ),
      {
        updateAlertById: async () => {
          throw new Error("should not update legacy links");
        },
      }
    );

    const body = await response.text();

    assert.equal(response.status, 400);
    assert.match(body, /invalid or expired/i);
  });
});

test("unsubscribe route rejects malformed token", async () => {
  await withSecret(async () => {
    const response = await unsubscribeJobAlertWithDeps(
      new Request("https://impjieg.vercel.app/api/job-alerts/unsubscribe?token=not-a-token"),
      {
        updateAlertById: async () => {
          throw new Error("should not update on malformed token");
        },
      }
    );

    const body = await response.text();

    assert.equal(response.status, 400);
    assert.match(body, /invalid or expired/i);
  });
});

test("unsubscribe route returns safe error when update fails", async () => {
  await withSecret(async () => {
    const token = createSignedToken({ alertId: "alert_123" }, 60_000, 1000);
    const response = await unsubscribeJobAlertWithDeps(
      new Request(
        `https://impjieg.vercel.app/api/job-alerts/unsubscribe?token=${encodeURIComponent(token)}`
      ),
      {
        updateAlertById: async () => ({
          error: { message: "database unavailable" },
        }),
        now: () => 1000,
      }
    );

    const body = await response.text();

    assert.equal(response.status, 500);
    assert.match(body, /Unable to unsubscribe alert/);
    assert.doesNotMatch(body, /database unavailable/);
  });
});
