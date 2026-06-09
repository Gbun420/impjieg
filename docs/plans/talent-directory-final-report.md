# Talent Directory — Final Planning Report

> **Status:** Draft
> **Date:** 2026-06-08
> **Purpose:** Summary of all planning work for Impjieg Talent Directory.

---

## 1. Files Created

| File | Purpose |
|------|---------|
| `docs/audits/talent-directory-existing-code-audit.md` | Existing code mapping |
| `docs/plans/talent-directory-product-plan.md` | Product positioning, scope, monetization |
| `docs/audits/talent-directory-gdpr-risk-audit.md` | GDPR and privacy risk assessment |
| `docs/plans/talent-directory-technical-architecture.md` | Architecture, RLS, validation, UI plans, tests |
| `docs/plans/talent-directory-stripe-plan.md` | Stripe integration plan |
| `supabase/migrations/XXX_talent_directory.sql` | Migration draft (not applied) |

## 2. Existing Code Inspected

| Area | Key Findings |
|------|-------------|
| `candidate_profiles` | Private table, RLS locked down, contains PII (phone, bio, linkedin) |
| `candidate_cvs` | Private table, contains `file_url`, must never be exposed |
| `employers` | No billing columns; billing lives in separate tables |
| Stripe | One-time payments only; no subscription lifecycle yet; webhook handles 4 events |
| Admin grants | Fully implemented; extensible with `talent_directory_credit` type |
| Middleware | Role guards check `user_metadata.accountType`; no `/admin/*` middleware guard |
| Tests | 98 unit tests (node:test); 40 e2e tests (Playwright); Puppeteer QA suite |
| QA seed | Uses Auth Admin API; deterministic UUIDs; `qa.*@impjieg.test` emails |
| Feature flags | None exist; closest is `PLAYWRIGHT_E2E` bypass |

## 3. Proposed Schema

| Table | Purpose | Key Constraints |
|-------|---------|-----------------|
| `candidate_directory_profiles` | Opt-in directory profiles | UNIQUE on `candidate_user_id`, visibility_status CHECK |
| `candidate_directory_cv_assets` | Redacted CV summaries | FK to `candidate_directory_profiles` and `candidate_cvs` |
| `employer_talent_access` | Subscription/credits | `contact_credits_used <= contact_credits_total` |
| `candidate_contact_requests` | Contact requests | Status CHECK, FK to employer/candidate/profile |
| `candidate_directory_audit_logs` | Audit trail | actor_type CHECK, FK to user/employer |

## 4. RLS Strategy

- All new tables: RLS enabled, `anon` revoked
- Helper functions: `is_admin_user()`, `current_user_employer_id()`, `employer_has_active_talent_access()`, `employer_has_contact_credit()`
- Employer access gated by active subscription + credits
- Candidates can only manage own profile
- Employers cannot access raw CV assets (no SELECT policy)
- Admins have full access via `is_admin_user()`

## 5. Monetization Strategy

| Product | Price | Credits |
|---------|-------|---------|
| Talent Starter | €49/mo | 10/month |
| Talent Recruiter | €99/mo | 30/month |
| 5-credit pack | €19 | 5 |
| 20-credit pack | €49 | 20 |
| 50-credit pack | €99 | 50 |

**Rule:** Credit consumed only on candidate acceptance.

**Integration:** Uses existing `admin_commercial_grants` with new `talent_directory_credit` type.

## 6. Route Map

| Route | Role | Purpose |
|-------|------|---------|
| `/candidate/talent-directory` | Candidate | Opt-in, settings, preview |
| `/candidate/contact-requests` | Candidate | View/respond to requests |
| `/employer/talent` | Employer | Search directory |
| `/employer/talent/[slug]` | Employer | View profile, send request |
| `/employer/talent/requests` | Employer | Track requests |
| `/employer/talent/checkout` | Employer | Stripe checkout |
| `/admin/talent-directory` | Admin | Overview, profiles, access, audit |

## 7. Feature Flag Behavior

| Route | Flag OFF | Flag ON |
|-------|----------|---------|
| `/candidate/talent-directory` | 404 | Active |
| `/candidate/contact-requests` | 404 | Active |
| `/employer/talent` | 404 | Active |
| `/employer/talent/*` | 404 | Active |
| `/admin/talent-directory` | Hidden from nav | Active |
| Nav items | Hidden | Visible |

## 8. GDPR Risk Summary

| Risk | Mitigation |
|------|------------|
| Candidate consent | Explicit checkbox, version tracking, withdrawable |
| Data minimisation | Only candidate-controlled fields visible |
| Email/phone disclosure | Hidden by default, only on candidate acceptance |
| CV file URL exposure | Never in client payloads |
| Employer scraping | Paid access, rate limits, audit logs |
| Bulk export | No endpoint, no UI |
| DPIA required | Yes — before production launch |

## 9. Implementation Phases

| Phase | Description | Dependencies |
|-------|-------------|-------------|
| 1 | Planning docs | None |
| 2 | Migration draft | Phase 1 |
| 3 | RLS tests | Phase 2 |
| 4 | Feature flag | Phase 2 |
| 5 | Candidate opt-in UI | Phase 4 |
| 6 | Employer gated search shell | Phase 4 |
| 7 | Contact request flow | Phase 5, 6 |
| 8 | Credit resolver | Phase 7 |
| 9 | Stripe checkout | Phase 8 |
| 10 | Admin console | Phase 9 |
| 11 | QA seed scripts | Phase 10 |
| 12 | Browser Use audit | Phase 11 |
| 13 | Production rollout | Phase 12 |

## 10. Test Plan

- **Unit:** 6 test files covering validation, access, resolver, contacts, monetization
- **RLS:** 9 tests covering anon, candidate, employer, admin access patterns
- **Server actions:** 8 tests covering opt-in, opt-out, pause, contact request, accept/reject, errors
- **E2E:** 8 tests covering full candidate and employer flows
- **Browser Use:** 6 tests covering desktop/mobile, all roles, destructive actions

## 11. Open Questions

| Question | Impact | Recommendation |
|----------|--------|----------------|
| DPIA completion timeline | Blocks production launch | Complete before any production deployment |
| Stripe subscription vs one-time | Affects webhook complexity | Start with subscriptions (cleaner lifecycle) |
| CV redaction approach | Affects `candidate_directory_cv_assets` | MVP: summary only, no raw text; post-MVP: AI redaction |
| Abuse reporting | Affects candidate safety | Post-MVP: report form + admin review |
| Saved candidates | Affects employer UX | Post-MVP: bookmark/favourite system |
| Monthly credit rollover | Affects billing | MVP: no rollover; consider rollover in v2 |

## 12. Verdict

**Safe to build now** — behind feature flag, with migration review.

**Conditions:**
1. Migration must be reviewed by a human before applying
2. DPIA should be completed before production launch
3. All new tables use RLS; no anon access
4. No existing private data exposed
5. Feature flag `CV_DIRECTORY_ENABLED=false` hides everything
6. All gates pass: lint, tests, build, e2e

**Not blocked by:**
- Existing code — clean isolation strategy
- Stripe — follows existing patterns
- Admin grants — extensible
- RLS — comprehensive policies defined
- Tests — clear test plan with existing patterns
