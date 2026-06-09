import test from "node:test";
import assert from "node:assert/strict";

/**
 * Verifies the FormData parsing logic used by signup() in auth.ts.
 *
 * This tests the same pattern:
 *   formData.get("legal-terms") === "on"
 *   formData.get("legal-privacy") === "on"
 *   formData.get("legal-marketing") === "on"
 */

function parseLegalConsent(formData: FormData) {
  return {
    termsAccepted: formData.get("legal-terms") === "on",
    privacyAccepted: formData.get("legal-privacy") === "on",
    marketingConsent: formData.get("legal-marketing") === "on",
  };
}

test("signup parseLegalConsent — all checkboxes checked", () => {
  const fd = new FormData();
  fd.set("legal-terms", "on");
  fd.set("legal-privacy", "on");
  fd.set("legal-marketing", "on");

  const result = parseLegalConsent(fd);
  assert.equal(result.termsAccepted, true);
  assert.equal(result.privacyAccepted, true);
  assert.equal(result.marketingConsent, true);
});

test("signup parseLegalConsent — terms unchecked", () => {
  const fd = new FormData();
  fd.set("legal-privacy", "on");

  const result = parseLegalConsent(fd);
  assert.equal(result.termsAccepted, false);
  assert.equal(result.privacyAccepted, true);
  assert.equal(result.marketingConsent, false);
});

test("signup parseLegalConsent — privacy unchecked", () => {
  const fd = new FormData();
  fd.set("legal-terms", "on");

  const result = parseLegalConsent(fd);
  assert.equal(result.termsAccepted, true);
  assert.equal(result.privacyAccepted, false);
  assert.equal(result.marketingConsent, false);
});

test("signup parseLegalConsent — none checked", () => {
  const fd = new FormData();

  const result = parseLegalConsent(fd);
  assert.equal(result.termsAccepted, false);
  assert.equal(result.privacyAccepted, false);
  assert.equal(result.marketingConsent, false);
});

test("signup parseLegalConsent — marketing unchecked defaults false", () => {
  const fd = new FormData();
  fd.set("legal-terms", "on");
  fd.set("legal-privacy", "on");

  const result = parseLegalConsent(fd);
  assert.equal(result.termsAccepted, true);
  assert.equal(result.privacyAccepted, true);
  assert.equal(result.marketingConsent, false);
});

test("signup parseLegalConsent — marketing with unexpected value not treated as true", () => {
  const fd = new FormData();
  fd.set("legal-terms", "on");
  fd.set("legal-privacy", "on");
  fd.set("legal-marketing", "off");
  const result = parseLegalConsent(fd);
  assert.equal(result.marketingConsent, false);
});

test("signup parseLegalConsent — terms value 'true' is not 'on'", () => {
  const fd = new FormData();
  fd.set("legal-terms", "true");
  fd.set("legal-privacy", "on");
  const result = parseLegalConsent(fd);
  assert.equal(result.termsAccepted, false);
});
