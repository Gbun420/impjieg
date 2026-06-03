import test from "node:test";
import assert from "node:assert/strict";
import { buildEmployerPromotionLinks } from "./job-promotion";

test("buildEmployerPromotionLinks returns canonical job and share URLs", () => {
  const links = buildEmployerPromotionLinks({
    baseUrl: "https://impjieg.vercel.app",
    employerSlug: "acme",
    jobSlug: "senior-backend-engineer",
    title: "Senior Backend Engineer",
  });

  assert.equal(
    links.jobUrl,
    "https://impjieg.vercel.app/jobs/acme/senior-backend-engineer"
  );
  assert.match(links.linkedinUrl, /linkedin\.com/);
  assert.match(links.xUrl, /twitter\.com/);
  assert.match(links.emailUrl, /mailto:/);
});
