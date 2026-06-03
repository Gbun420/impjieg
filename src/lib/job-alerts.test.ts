import test from "node:test";
import assert from "node:assert/strict";
import {
  buildJobAlertConfirmationEmail,
  buildJobAlertDigestEmail,
  jobMatchesAlert,
} from "./job-alerts";
import { verifySignedToken } from "./email-security";

function withTestSecret<T>(fn: () => T) {
  const backup = process.env.JOB_ALERT_UNSUBSCRIBE_SECRET;
  process.env.JOB_ALERT_UNSUBSCRIBE_SECRET = "unit-test-unsubscribe-secret";

  try {
    return fn();
  } finally {
    process.env.JOB_ALERT_UNSUBSCRIBE_SECRET = backup;
  }
}

test("jobMatchesAlert returns true when a job satisfies all configured filters", () => {
  const result = jobMatchesAlert(
    {
      sectors: ["Technology"],
      job_type: "Full-time",
      remote_type: "Remote",
      salary_min: 35000,
    },
    {
      sector: "Technology",
      job_type: "Full-time",
      remote_type: "Remote",
      salary_min: 40000,
    }
  );

  assert.equal(result, true);
});

test("jobMatchesAlert returns false when salary falls below the alert minimum", () => {
  const result = jobMatchesAlert(
    {
      sectors: [],
      job_type: null,
      remote_type: null,
      salary_min: 50000,
    },
    {
      sector: "Technology",
      job_type: "Full-time",
      remote_type: "Hybrid",
      salary_min: 42000,
    }
  );

  assert.equal(result, false);
});

test("buildJobAlertDigestEmail includes matching jobs and unsubscribe link", () => {
  withTestSecret(() => {
    const email = buildJobAlertDigestEmail({
      alertId: "alert_123",
      jobs: [
        {
          title: "Senior Backend Engineer",
          employerName: "Acme",
          location: "Sliema, Malta",
          jobType: "Full-time",
          remoteType: "Hybrid",
          salaryMin: 55000,
          salaryMax: 65000,
          url: "https://impjieg.vercel.app/jobs/acme/senior-backend-engineer",
        },
      ],
      baseUrl: "https://impjieg.vercel.app",
    });

    assert.equal(email.subject, "New jobs matching your Impjieg alert");
    assert.match(email.html, /Senior Backend Engineer/);
    assert.match(email.html, /Acme/);
    assert.match(email.html, /55,000/);
    assert.doesNotMatch(email.html, /person%40example\.com/);
    const unsubscribeMatch = email.html.match(
      /https:\/\/impjieg\.vercel\.app\/api\/job-alerts\/unsubscribe\?token=([^"]+)/
    );
    assert.ok(unsubscribeMatch);
    const verified = verifySignedToken(unsubscribeMatch?.[1] ?? null);
    assert.equal(verified.valid, true);
    if (verified.valid) {
      assert.equal(verified.payload.alertId, "alert_123");
    }
  });
});

test("buildJobAlertConfirmationEmail includes manage and unsubscribe links", () => {
  const email = withTestSecret(() =>
    buildJobAlertConfirmationEmail({
      alertId: "alert_123",
      baseUrl: "https://impjieg.vercel.app",
    })
  );

  assert.equal(email.subject, "Your Impjieg job alert is active");
  assert.match(email.html, /Browse the latest jobs/);
  assert.doesNotMatch(email.html, /person%40example\.com/);
  assert.match(
    email.html,
    /https:\/\/impjieg\.vercel\.app\/api\/job-alerts\/unsubscribe\?token=/
  );
});

test("buildJobAlertDigestEmail escapes malicious job fields", () => {
  const email = withTestSecret(() =>
    buildJobAlertDigestEmail({
      alertId: "alert_123",
      jobs: [
        {
          title: '<script>alert(1)</script>',
          employerName: '<img src=x onerror=alert(1)>',
          location: '&lt;script&gt;alert(1)&lt;/script&gt;',
          jobType: '" onclick="alert(1)',
          remoteType: '<iframe src="https://evil.com"></iframe>',
          salaryMin: 1000,
          salaryMax: 2000,
          url: 'javascript:alert(1)',
        },
      ],
      baseUrl: "https://impjieg.vercel.app",
    })
  );

  assert.match(email.html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(email.html, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.match(email.html, /&amp;lt;script&amp;gt;alert\(1\)&amp;lt;\/script&amp;gt;/);
  assert.match(email.html, /&quot; onclick=&quot;alert\(1\)/);
  assert.doesNotMatch(email.html, /javascript:/);
  assert.doesNotMatch(email.html, /<iframe/i);
  assert.doesNotMatch(email.html, /<script>/i);
});
