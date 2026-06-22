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

test("buildEmployerNotificationEmail escapes user-controlled HTML and URLs", () => {
  const payload = buildEmployerNotificationEmail({
    employerEmail: "employer@example.com",
    candidateEmail: '" onclick="alert(1)@example.com',
    candidateName: '<script>alert(1)</script> Jane & Doe',
    candidatePhone: '<img src=x onerror=alert(1)>',
    coverLetter: '<div>Hello</div>\n<a href="javascript:alert(1)">click</a>',
    cvUrl: 'javascript:alert(1)',
    jobTitle: 'Senior <Frontend> Engineer',
    dashboardUrl: 'https://impjieg.vercel.app/employer/applications?tab=all&sort=desc',
  });

  assert.match(payload.html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(payload.html, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.match(payload.html, /&quot; onclick=&quot;alert\(1\)@example\.com/);
  assert.match(payload.html, /Senior &lt;Frontend&gt; Engineer/);
  assert.match(payload.html, /Hello&lt;\/div&gt;/);
  // User text is HTML-escaped and kept as inert visible content, so dangerous
  // substrings legitimately survive in escaped form (asserted above). The real
  // security invariant is that no *active* vector is emitted: the cv URL (a real
  // href) is neutralised to "#", and no live event-handler attributes exist on
  // any actual tag.
  assert.match(payload.html, /<a href="#"[^>]*>View CV<\/a>/);
  assert.doesNotMatch(payload.html, /<[^>]+\son\w+=/i);
  assert.doesNotMatch(payload.html, /<script>/i);
  assert.doesNotMatch(payload.html, /<img/i);
  assert.doesNotMatch(payload.html, /href="javascript:/i);
  assert.match(payload.subject, /New Application: <script>alert\(1\)<\/script> Jane & Doe applied for Senior <Frontend> Engineer/);
});
