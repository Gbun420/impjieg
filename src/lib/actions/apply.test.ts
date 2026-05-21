import test from "node:test";
import assert from "node:assert/strict";
import { buildEmployerNotificationEmail } from "./apply-helpers";

test("buildEmployerNotificationEmail targets the employer, not the candidate", () => {
  const payload = buildEmployerNotificationEmail({
    employerEmail: "employer@example.com",
    candidateEmail: "candidate@example.com",
    candidateName: "Jane Doe",
    candidatePhone: "+35612345678",
    coverLetter: "Hello there",
    cvUrl: "https://cdn.example.com/cv.pdf",
    jobTitle: "Product Engineer",
    dashboardUrl: "https://impjieg.vercel.app/employer/applications",
  });

  assert.deepEqual(payload.to, ["employer@example.com"]);
  assert.deepEqual(payload.replyTo, ["candidate@example.com"]);
  assert.equal(payload.subject, "New Application: Jane Doe applied for Product Engineer");
  assert.match(payload.html, /candidate@example\.com/);
  assert.doesNotMatch(payload.html, /bcc/i);
});
