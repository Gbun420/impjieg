# Talent Directory — Existing Code Audit

> **Status:** Draft
> **Date:** 2026-06-08
> **Purpose:** Map existing code to plan Talent Directory integration without breaking current functionality.

---

## 1. Existing Tables That Can Be Reused

| Table | Reuse | Notes |
|-------|-------|-------|
| `candidate_profiles` | **Source data only** | Private source profile. Talent Directory reads from it but never exposes raw fields to employers. |
| `candidate_cvs` | **Reference only** | Private CV storage. Directory references CV IDs for redacted summaries. Never exposes `file_url`. |
| `employers` | **Reference only** | Used to identify employer user and company name. Directory uses `employer_id` FK. |
| `admin_commercial_grants` | **Reuse pattern** | Can extend with `talent_directory_credit` grant type for admin-granted credits. |
| `admin_commercial_grant_audit_logs` | **Extend** | Add `talent_directory_*` actions. |
| `payments` | **Reuse** | Record Talent Directory subscription/credit pack payments. |
| `auth.users` | **Reference** | User identity, email (never exposed to employers). |

## 2. Existing Tables That Must Remain Private

| Table | Reason |
|-------|--------|
| `candidate_profiles` | Contains `full_name`, `phone`, `bio`, `website`, `linkedin_url`. Never exposed to employers directly. |
| `candidate_cvs` | Contains `file_url`. Never exposed to employers. |
| `candidate_applications` | Personal ATS. Private to candidate. |
| `candidate_alerts` | Job alert preferences. Private. |
| `applications` | Employer-side application data. Separate from directory. |
| `saved_jobs` | Candidate saved jobs. Private. |
| `admin_mfa_factors` | Admin MFA secrets. Never exposed. |
| `job_alerts` | Subscriber job alerts. Unrelated. |

## 3. Routes Affected

### Candidate Routes (new)

| Route | Purpose |
|-------|---------|
| `/candidate/talent-directory` | Opt-in, pause, leave, preview |
| `/candidate/contact-requests` | View/respond to contact requests |

### Employer Routes (new)

| Route | Purpose |
|-------|---------|
| `/employer/talent` | Search directory (gated) |
| `/employer/talent/[slug]` | View candidate profile |
| `/employer/talent/requests` | Track contact requests |
| `/employer/talent/checkout` | Stripe checkout for plans/credits |

### Admin Routes (new)

| Route | Purpose |
|-------|---------|
| `/admin/talent-directory` | Directory overview, profiles, access, requests, audit logs |

### Existing Routes Affected

| Route | Change | Risk |
|-------|--------|------|
| `/candidate/dashboard` | Add "Talent Directory" nav item (when flag enabled) | Low — nav-only |
| `/employer/dashboard` | Add "Talent" nav item (when flag enabled) | Low — nav-only |
| `/admin/[...section]` | Add `talent-directory` section (when flag enabled) | Low — follows existing pattern |

## 4. Stripe Files Affected

| File | Change | Risk |
|------|--------|------|
| `src/app/api/checkout/route.ts` | Add `talent_directory` payment type | Low — follows existing pattern |
| `src/app/api/webhooks/stripe/route.ts` | Add `checkout.session.completed` handler for talent plans | Medium — webhook must be atomic |
| `src/lib/stripe.ts` | Add `PRICES` entries for talent directory | Low — additive |
| `src/lib/constants.ts` | Add `TALENT_DIRECTORY_PLANS` and `TALENT_DIRECTORY_CREDIT_PACKS` | Low — additive |
| `src/lib/runtime-env.ts` | Add env defaults for new Stripe price IDs | Low — additive |

## 5. Admin Files Affected

| File | Change | Risk |
|------|--------|------|
| `src/lib/admin-consoles.ts` | Add `talent-directory` section config | Low — follows pattern |
| `src/app/admin/[...section]/page.tsx` | Load talent directory data when `section === "talent-directory"` | Low — follows pattern |
| `src/lib/admin-access.ts` | No change needed | None |

## 6. Risk of Code Overlap

| Area | Risk | Mitigation |
|------|------|------------|
| Stripe checkout | Medium — existing checkout handles 5 payment types | Add `talent_directory` as 6th type; isolate talent-specific logic in separate handler |
| Webhook handler | Medium — existing webhook handles 4 events | Add talent subscription events; keep handler modular |
| Admin grants | Low — pattern is clean | Add `talent_directory_credit` type to existing constants; use existing resolver |
| Candidate profile | Low — read-only reference | Directory profiles are separate tables; never modify `candidate_profiles` |
| Middleware | Low — role guards already exist | Add `/candidate/talent-directory` and `/employer/talent/*` to existing role guards |

## 7. Recommended Isolation Strategy

### Core Principle

**Talent Directory is a new domain, not a modification of existing domains.**

1. **Separate tables** — `candidate_directory_profiles`, `candidate_directory_cv_assets`, `employer_talent_access`, `candidate_contact_requests`, `candidate_directory_audit_logs` are all new tables with their own RLS.

2. **Separate lib module** — `src/lib/talent-directory/` contains all Talent Directory logic (access, actions, queries, validation, types, constants). No existing files modified except additive changes.

3. **Separate components** — `src/components/talent-directory/` contains all UI components. No existing components modified.

4. **Separate routes** — New routes under `/candidate/talent-directory`, `/candidate/contact-requests`, `/employer/talent/*`, `/admin/talent-directory`. No existing routes modified except nav additions.

5. **Feature flag gating** — `CV_DIRECTORY_ENABLED=false` hides all Talent Directory routes, nav items, and actions. When disabled, routes return 404 or coming-soon.

6. **Stripe isolation** — New env vars for talent directory price IDs. New payment type constant. Webhook handler extended but not modified in existing paths.

7. **Admin grants extension** — New `talent_directory_credit` type added to existing constants. Uses existing grant resolver and consumption pattern. No existing grant types modified.

8. **Candidate data flow** — Directory profiles are populated from `candidate_profiles` at opt-in time. Changes to `candidate_profiles` do not affect directory visibility. Directory profiles are independently managed.

### Integration Points (minimal changes)

| File | Change | Type |
|------|--------|------|
| `src/lib/constants.ts` | Add `TALENT_DIRECTORY_PLANS`, `TALENT_DIRECTORY_CREDIT_PACKS` constants | Additive |
| `src/lib/runtime-env.ts` | Add env defaults for talent directory price IDs | Additive |
| `src/lib/stripe.ts` | Add talent directory price IDs to `PRICES` | Additive |
| `src/lib/monetization/admin-grants/constants.ts` | Add `talent_directory_credit` grant type | Additive |
| `src/lib/supabase/middleware.ts` | Add role guard for `/candidate/talent-directory` | Additive |
| `src/app/api/checkout/route.ts` | Add `talent_directory` payment type handler | Additive |
| `src/app/api/webhooks/stripe/route.ts` | Add talent subscription webhook events | Additive |
| `src/lib/admin-consoles.ts` | Add `talent-directory` section | Additive |
| `src/app/admin/[...section]/page.tsx` | Add talent directory data loading | Additive |

**No existing files are modified in a way that changes existing behavior.**
