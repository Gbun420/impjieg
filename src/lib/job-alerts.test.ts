import test from "node:test";
import assert from "node:assert/strict";
import {
  buildJobAlertConfirmationEmail,
  buildJobAlertDigestEmail,
  jobMatchesAlert,
} from "./job-alerts";

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
  const email = buildJobAlertDigestEmail({
    email: "person@example.com",
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
  assert.match(
    email.html,
    /https:\/\/impjieg\.vercel\.app\/api\/job-alerts\/unsubscribe\?id=alert_123&email=person%40example\.com/
  );
});

test("buildJobAlertConfirmationEmail includes manage and unsubscribe links", () => {
  const email = buildJobAlertConfirmationEmail({
    email: "person@example.com",
    alertId: "alert_123",
    baseUrl: "https://impjieg.vercel.app",
  });

  assert.equal(email.subject, "Your Impjieg job alert is active");
  assert.match(email.html, /Browse the latest jobs/);
  assert.match(
    email.html,
    /https:\/\/impjieg\.vercel\.app\/api\/job-alerts\/unsubscribe\?id=alert_123&email=person%40example\.com/
  );
});
