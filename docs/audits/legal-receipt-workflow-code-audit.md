# Legal Receipt Workflow — Existing Code Audit

> **Status:** Complete
> **Date:** 2026-06-08

---

## Current State

| Area | Status | Gap |
|------|--------|-----|
| Signup Terms/Privacy checkbox | ❌ Missing | No checkbox on signup form |
| Signup legal acceptance recording | ❌ Missing | No acceptance data flows through signup pipeline |
| Application privacy acknowledgement | ❌ Missing | No consent checkbox on application form |
| Employer checkout Terms acceptance | ❌ Missing | No checkbox before payment |
| Talent Directory consent | ✅ Exists | Separate consent with version tracking |
| Cookie consent | ✅ Exists | Versioned cookie consent banner |
| Legal receipt emails | ❌ Missing | No receipt emails sent |
| Internal archive emails | ❌ Missing | No compliance copy sent |
| Legal document versioning | ❌ Missing | No versioning table |
| Email cc/bcc support | ❌ Missing | Email sender doesn't support cc/bcc |
| Legal receipt admin screen | ❌ Missing | No admin section for receipts |
| eIDAS contract records | ❌ Missing | Terms page promises records but nothing implements them |

## Existing Legal Infrastructure

| Component | Path | Notes |
|-----------|------|-------|
| Terms page | `/src/app/terms/page.tsx` | References eIDAS, promises acceptance records |
| Privacy page | `/src/app/privacy/page.tsx` | GDPR-compliant |
| Cookie page | `/src/app/cookies/page.tsx` | ePrivacy Directive |
| DPA page | `/src/app/dpa/page.tsx` | GDPR Art. 28 |
| Cookie consent | `/src/hooks/use-cookie-consent.ts` | Versioned consent |
| Talent Directory consent | `/src/lib/talent-directory/constants.ts` | Version `"1.0"` |
| Email sender | `/src/lib/email-sender.ts` | Resend, no cc/bcc |
| Email branding | `/src/lib/email-branding.ts` | `buildBrandedEmailShell()` |
| Email security | `/src/lib/email-security.ts` | XSS, header injection, signed tokens |

## Key Files to Modify

| File | Change |
|------|--------|
| `src/app/auth/signup/page.tsx` | Add Terms/Privacy checkboxes |
| `src/lib/actions/auth.ts` | Validate legal acceptance |
| `src/lib/actions/apply.ts` | Add privacy acknowledgement |
| `src/lib/email-sender.ts` | Add cc/bcc support |
| `src/app/api/checkout/route.ts` | Add terms acceptance |
| `src/app/employer/checkout/page.tsx` | Add Terms checkbox |
| `src/lib/admin-consoles.ts` | Add legal-receipts section |
| `src/app/admin/[...section]/page.tsx` | Add legal-receipts data loading |
