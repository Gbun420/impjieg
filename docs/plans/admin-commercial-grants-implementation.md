# Admin commercial grants implementation plan

## Metadata
- Status: Draft
- Purpose: Define a controlled admin-only commercial entitlement system for Impjieg.
- Audience: Maintainers, product, engineering, operations, and implementation agents.
- Last reviewed: 2026-06-04
- Owner: Impjieg maintainers

## Current payment and entitlement state

Impjieg already has live monetization primitives in place:
- Employer checkout exists for paid job listings and featured listings.
- Stripe checkout sessions are created from the employer checkout route.
- Stripe webhooks update payment rows and job state.
- Jobs can be marked featured through the existing paid flow.
- Subscriptions, credit packs, and promotion bundles already exist in the product model and database.
- The admin dashboard can read live operational data, but there is no controlled commercial grant system yet.

The current gaps are:
- No admin-controlled entitlement model for temporary free access or discounts.
- No auditable grant lifecycle for trials, credits, or fixed discounts.
- No revocation/expiry system for manual commercial exceptions.
- No shared resolver that can apply admin grants to job posting, checkout, or subscription limits.
- No employer-facing visibility for temporary complimentary access.
- Stripe pricing still has hardcoded dev fallbacks in `src/lib/stripe.ts`.
- The checkout route still contains hardcoded price IDs for legacy monetization products.
- The admin dashboard has a demo fallback path, so any new commercial grants UI must stay clearly production-only and protected.
- Existing admin access is protected by the current admin session flow and must not be reopened by this feature.

## Where paid features are enforced today

Current enforcement is spread across several places:
- `src/app/employer/post-job/page.tsx`
- `src/lib/actions/jobs.ts`
- `src/app/employer/checkout/page.tsx`
- `src/app/api/checkout/route.ts`
- `src/app/api/webhooks/stripe/route.ts`
- `src/lib/actions/payments.ts`
- `src/app/employer/jobs/page.tsx`
- `src/app/employer/dashboard/page.tsx`

Current enforcement behavior:
- Featured jobs are activated through the existing paid checkout flow.
- Checkout uses hardcoded dev price IDs in production-facing logic if env vars are missing.
- Webhooks update payment rows and job state, but there is no admin grant resolution layer.
- Job credits and subscription records already exist, but they are not governed by admin commercial grants.
- Admin dashboard data comes from the live service client when available and falls back to demo data otherwise.

## Existing admin UI and auth state

Admin access is already protected on production:
- `/admin` redirects unauthenticated users to `/admin/login`
- `/admin/dashboard` redirects unauthenticated users to `/admin/login`
- Admin routes require an authenticated admin session

The current admin dashboard exposes live operational data and the wired admin consoles, but there is no commercial grants console yet.

## Grant types

The system should support:
- free_trial
- plan_access
- job_credit
- featured_credit
- boost_credit
- ai_screening_credit
- percent_discount
- fixed_discount
- custom_entitlement

## Access-control rules

- Only authenticated admins can create, update, revoke, or expire grants.
- Employers can only view their own active grants and only the minimum data needed.
- Employers cannot create, edit, or revoke grants.
- Public users must never see grant data.
- Internal notes must remain admin-only.
- Grant data must never be used to bypass admin authentication.

## Expiry and revocation rules

- Every grant must have a reason.
- Every grant must have a start date and an expiry date unless explicitly one-time-use.
- Revoked grants stop unlocking features immediately.
- Expired grants stop unlocking features immediately.
- Consumed credits must decrement through audited actions.
- A grant must never silently persist beyond its expiry.

## Audit logging rules

Every meaningful event should be logged:
- grant_created
- grant_updated
- grant_revoked
- grant_expired
- grant_consumed
- credit_used
- discount_applied

Audit records should:
- include the actor/admin who made the change
- include the employer the grant belongs to
- include the reason
- avoid secrets and payment keys
- avoid exposing internal notes to employers

## Required schema changes

Likely additions:
- `admin_commercial_grants`
- `admin_commercial_grant_audit_logs`

Likely supporting changes:
- a resolver layer that maps active grants to employer entitlements
- optional order/checkout metadata updates if grants need to discount or override checkout flows
- optional employer-facing read model for active complimentary access

## Implementation phases

### Phase 1: Schema and audit storage
Add grant and audit tables, constraints, indexes, and RLS.

### Phase 2: Server layer
Add validation, access checks, grant creation/update/revocation, expiry sweep, and entitlement resolution.

### Phase 3: Admin UI
Add an admin-only commercial grants console with searchable employer targeting, presets, and revoke flows.

### Phase 4: Product integration
Apply grants to job posting credits, featured listings, boosts, AI screening credits, trial access, and checkout discounts.

### Phase 5: Employer visibility
Show active complimentary access and remaining credits in employer surfaces without exposing admin notes.

### Phase 6: Expiry job
Add a cron-safe grant expiration sweep.

### Phase 7: Final review and deployment
Verify access control, auditability, expiry, revocation, and pricing behavior before deployment.

## Acceptance criteria

- Admins can create and revoke commercial grants with a reason.
- Grants expire automatically and stop working after expiry.
- Employers can only see their own active complimentary access.
- No public route exposes grant internals.
- No grant can be created without audit coverage.
- Discounts cannot reduce totals below zero.
- Zero-amount grant scenarios do not create fake paid status.
- Existing admin security protections remain intact.
- Tests pass.
