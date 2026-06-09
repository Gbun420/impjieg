import test from "node:test";
import assert from "node:assert/strict";
import { hashLegalEvidenceValue } from "./receipts";
import {
  buildUserLegalReceiptEmail,
  buildInternalLegalArchiveEmail,
} from "./email";
import { buildConsentTextSnapshot, getExpectedVersion } from "./documents";
import {
  LEGAL_EVENT_TYPES,
  CONSENT_TEXT,
  LEGAL_DOCUMENTS,
  CURRENT_LEGAL_VERSIONS,
} from "./constants";
import { legalAcceptanceInputSchema } from "./types";

// ============================================================================
// Hash helpers
// ============================================================================

test("hashLegalEvidenceValue produces deterministic hex", () => {
  const a1 = hashLegalEvidenceValue("hello@example.com");
  const a2 = hashLegalEvidenceValue("hello@example.com");
  assert.equal(a1, a2);
  assert.equal(a1.length, 16);
  assert.match(a1, /^[0-9a-f]{16}$/);
});

test("hashLegalEvidenceValue different inputs produce different hashes", () => {
  const a = hashLegalEvidenceValue("alice@example.com");
  const b = hashLegalEvidenceValue("bob@example.com");
  assert.notEqual(a, b);
});

// ============================================================================
// User legal receipt email
// ============================================================================

test("buildUserLegalReceiptEmail includes event, email, and receipt ID", () => {
  const result = buildUserLegalReceiptEmail({
    eventType: "account_signup_candidate",
    email: "candidate@example.com",
    accountType: "candidate",
    sourceRoute: "/auth/signup",
    acceptanceEventId: "evt-001",
  });

  assert.equal(result.subject, "Your Impjieg legal receipt");
  assert.match(result.html, /Account Signup Candidate/);
  assert.match(result.html, /candidate@example\.com/);
  assert.match(result.html, /evt-001/);
  assert.ok(result.text.length > 50);
});

test("buildUserLegalReceiptEmail converts event_type underscores to spaces", () => {
  const result = buildUserLegalReceiptEmail({
    eventType: "employer_checkout_completed",
    email: "e@e.com",
    accountType: "employer",
    sourceRoute: "/employer/checkout",
    acceptanceEventId: "evt-002",
  });

  assert.match(result.html, /Employer Checkout Completed/);
});

test("buildUserLegalReceiptEmail contains no raw HTML injection", () => {
  const result = buildUserLegalReceiptEmail({
    eventType: '<script>alert(1)</script>',
    email: '" onclick="bad@x.com',
    accountType: "candidate",
    sourceRoute: "/auth/signup",
    acceptanceEventId: "evt-003",
  });

  assert.doesNotMatch(result.html, /<script>/i);
  // Event type gets title-cased by replace before escaping
  assert.match(result.html, /&lt;/);
  assert.match(result.html, /&quot;/);
});

// ============================================================================
// Internal archive email
// ============================================================================

test("buildInternalLegalArchiveEmail excludes CV URL and cover letter", () => {
  const result = buildInternalLegalArchiveEmail({
    eventType: "job_application_submitted",
    email: "applicant@example.com",
    accountType: "candidate",
    sourceRoute: "/jobs/slug/slug",
    acceptanceEventId: "evt-004",
    userId: "user-uuid",
    termsAccepted: true,
    privacyAcknowledged: true,
    marketingConsent: false,
    consentTextSnapshot: "terms: accepted",
    relatedEntityType: "application",
    relatedEntityId: "app-uuid",
  });

  // Should NOT contain sensitive data patterns (just table column references)
  assert.doesNotMatch(result.html, /candidate_cvs/i);
  assert.doesNotMatch(result.html, /file_url/i);
  assert.doesNotMatch(result.html, /cover_letter/i);

  // Should contain the compliance disclaimer that mentions these exclusions
  assert.match(result.html, /internal compliance copy/i);
  assert.match(result.html, /not sent to the user/i);
});

test("buildInternalLegalArchiveEmail includes consent status", () => {
  const result = buildInternalLegalArchiveEmail({
    eventType: "account_signup_employer",
    email: "boss@example.com",
    accountType: "employer",
    sourceRoute: "/auth/signup",
    acceptanceEventId: "evt-005",
    termsAccepted: true,
    privacyAcknowledged: true,
    marketingConsent: true,
    consentTextSnapshot: "terms: accepted; privacy: accepted; marketing: accepted",
  });

  // Terms/Privacy appear in separate table cells with newlines
  assert.match(result.html, /Terms Accepted[\s\S]*Yes/);
  assert.match(result.html, /Privacy Acknowledged[\s\S]*Yes/);
  assert.match(result.html, /Marketing Consent[\s\S]*Yes/);
  assert.match(result.html, /Internal Compliance Copy/i);
});

test("buildInternalLegalArchiveEmail with no marketing consent shows No", () => {
  const result = buildInternalLegalArchiveEmail({
    eventType: "account_signup_candidate",
    email: "c@c.com",
    accountType: "candidate",
    sourceRoute: "/auth/signup",
    acceptanceEventId: "evt-006",
    termsAccepted: true,
    privacyAcknowledged: true,
    marketingConsent: false,
    consentTextSnapshot: "terms: accepted; privacy: accepted; marketing: not accepted",
  });

  assert.match(result.html, /Marketing Consent[\s\S]*No/);
});

// ============================================================================
// Consent text constants
// ============================================================================

test("CONSENT_TEXT terms contains required language", () => {
  assert.match(CONSENT_TEXT.terms, /Terms of Service/i);
  assert.match(CONSENT_TEXT.terms, /agree/i);
});

test("CONSENT_TEXT privacy contains required language", () => {
  assert.match(CONSENT_TEXT.privacy, /Privacy Notice/i);
  assert.match(CONSENT_TEXT.privacy, /data/i);
});

test("CONSENT_TEXT marketing is opt-in language", () => {
  assert.match(CONSENT_TEXT.marketing, /agree/i);
  assert.match(CONSENT_TEXT.marketing, /unsubscribe/i);
});

// ============================================================================
// Legal event types
// ============================================================================

test("LEGAL_EVENT_TYPES has all required events", () => {
  assert.equal(LEGAL_EVENT_TYPES.SIGNUP_CANDIDATE, "account_signup_candidate");
  assert.equal(LEGAL_EVENT_TYPES.SIGNUP_EMPLOYER, "account_signup_employer");
  assert.equal(LEGAL_EVENT_TYPES.JOB_APPLICATION, "job_application_submitted");
  assert.equal(LEGAL_EVENT_TYPES.CHECKOUT_COMPLETED, "employer_checkout_completed");
  assert.equal(LEGAL_EVENT_TYPES.TALENT_DIRECTORY_OPT_IN, "talent_directory_opt_in");
  assert.equal(LEGAL_EVENT_TYPES.TALENT_DIRECTORY_OPT_OUT, "talent_directory_opt_out");
});

// ============================================================================
// Legal documents constants
// ============================================================================

test("LEGAL_DOCUMENTS has terms-of-service and privacy-notice", () => {
  const slugs = LEGAL_DOCUMENTS.map((d) => d.slug);
  assert.ok(slugs.includes("terms-of-service"));
  assert.ok(slugs.includes("privacy-notice"));
  assert.ok(slugs.includes("cookie-notice"));
  assert.ok(slugs.includes("candidate-terms"));
  assert.ok(slugs.includes("employer-terms"));
  assert.ok(slugs.includes("application-processing-notice"));
  assert.ok(slugs.includes("talent-directory-consent"));
});

test("LEGAL_DOCUMENTS all have publicUrl", () => {
  for (const doc of LEGAL_DOCUMENTS) {
    assert.ok(doc.publicUrl, `${doc.slug} missing publicUrl`);
    assert.ok(doc.publicUrl.startsWith("/"), `${doc.slug} publicUrl must start with /`);
  }
});

test("CURRENT_LEGAL_VERSIONS has entry for every document", () => {
  for (const doc of LEGAL_DOCUMENTS) {
    assert.ok(doc.slug in CURRENT_LEGAL_VERSIONS, `${doc.slug} missing version`);
  }
});

// ============================================================================
// buildConsentTextSnapshot
// ============================================================================

test("buildConsentTextSnapshot formats acceptance map", () => {
  const snapshot = buildConsentTextSnapshot({
    terms: true,
    privacy: true,
    marketing: false,
  });
  assert.match(snapshot, /terms: accepted/);
  assert.match(snapshot, /privacy: accepted/);
  assert.match(snapshot, /marketing: not accepted/);
});

// ============================================================================
// getExpectedVersion
// ============================================================================

test("getExpectedVersion returns configured version for known slug", () => {
  const version = getExpectedVersion("terms-of-service");
  assert.equal(version, "2026-01");
});

test("getExpectedVersion returns unknown for invalid slug", () => {
  const version = getExpectedVersion("nonexistent" as any);
  assert.equal(version, "unknown");
});

// ============================================================================
// legalAcceptanceInputSchema validation
// ============================================================================

test("legalAcceptanceInputSchema rejects missing terms acceptance", () => {
  const result = legalAcceptanceInputSchema.safeParse({
    email: "user@example.com",
    accountType: "candidate",
    eventType: "account_signup_candidate",
    termsAccepted: false,
    privacyNoticeAcknowledged: true,
    consentTextSnapshot: "terms: not accepted",
    sourceRoute: "/auth/signup",
  });
  assert.equal(result.success, false);
});

test("legalAcceptanceInputSchema rejects missing privacy acknowledgement", () => {
  const result = legalAcceptanceInputSchema.safeParse({
    email: "user@example.com",
    accountType: "candidate",
    eventType: "account_signup_candidate",
    termsAccepted: true,
    privacyNoticeAcknowledged: false,
    consentTextSnapshot: "privacy: not accepted",
    sourceRoute: "/auth/signup",
  });
  assert.equal(result.success, false);
});

test("legalAcceptanceInputSchema accepts valid input with optional fields", () => {
  const result = legalAcceptanceInputSchema.safeParse({
    email: "user@example.com",
    accountType: "candidate",
    eventType: "account_signup_candidate",
    termsAccepted: true,
    privacyNoticeAcknowledged: true,
    marketingConsent: true,
    consentTextSnapshot: "all accepted",
    sourceRoute: "/auth/signup",
    metadata: { fullName: "Jane Doe" },
  });
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.marketingConsent, true);
    assert.equal(result.data.email, "user@example.com");
  }
});

test("legalAcceptanceInputSchema defaults marketingConsent to false", () => {
  const result = legalAcceptanceInputSchema.safeParse({
    email: "user@example.com",
    accountType: "candidate",
    eventType: "account_signup_candidate",
    termsAccepted: true,
    privacyNoticeAcknowledged: true,
    consentTextSnapshot: "accepted",
    sourceRoute: "/auth/signup",
  });
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.marketingConsent, false);
  }
});

test("legalAcceptanceInputSchema rejects invalid email", () => {
  const result = legalAcceptanceInputSchema.safeParse({
    email: "not-an-email",
    accountType: "candidate",
    eventType: "account_signup_candidate",
    termsAccepted: true,
    privacyNoticeAcknowledged: true,
    consentTextSnapshot: "accepted",
    sourceRoute: "/auth/signup",
  });
  assert.equal(result.success, false);
});

test("legalAcceptanceInputSchema rejects empty consentTextSnapshot", () => {
  const result = legalAcceptanceInputSchema.safeParse({
    email: "user@example.com",
    accountType: "candidate",
    eventType: "account_signup_candidate",
    termsAccepted: true,
    privacyNoticeAcknowledged: true,
    consentTextSnapshot: "",
    sourceRoute: "/auth/signup",
  });
  assert.equal(result.success, false);
});

test("legalAcceptanceInputSchema accepts candidate and employer account types", () => {
  for (const type of ["candidate", "employer", "admin", "guest_applicant", "unknown"]) {
    const result = legalAcceptanceInputSchema.safeParse({
      email: "user@example.com",
      accountType: type,
      eventType: "account_signup_candidate",
      termsAccepted: true,
      privacyNoticeAcknowledged: true,
      consentTextSnapshot: "accepted",
      sourceRoute: "/auth/signup",
    });
    assert.equal(result.success, true, `${type} should be valid`);
  }
});

test("legalAcceptanceInputSchema rejects invalid account type", () => {
  const result = legalAcceptanceInputSchema.safeParse({
    email: "user@example.com",
    accountType: "invalid",
    eventType: "account_signup_candidate",
    termsAccepted: true,
    privacyNoticeAcknowledged: true,
    consentTextSnapshot: "accepted",
    sourceRoute: "/auth/signup",
  });
  assert.equal(result.success, false);
});
