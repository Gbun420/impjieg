> Status: Historical / Superseded
> This document is retained for context. The current Impjieg brand source of truth is `docs/plans/2026-06-04-brand-modernization-execution.md`.

# Audit Remediation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove the exposed security risks, fix broken data/query paths, and bring the codebase back to a clean verified state.

**Architecture:** Tighten access at the outer boundaries first: Supabase RLS policies and public API routes. Then fix runtime bugs in server actions and candidate flows. Finish by correcting structural React and TypeScript issues that ESLint currently flags as correctness problems rather than style.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Supabase, Stripe, Playwright, ESLint.

---

### Task 1: Lock Down Public and Privileged Routes

**Files:**
- Modify: `src/app/api/setup-auth/route.ts`
- Modify: `src/app/api/setup-candidate-portal/route.ts`
- Modify: `src/app/api/update-auth-urls/route.ts`
- Modify: `src/app/api/notifications/whatsapp/route.ts`
- Test: `src/app/api/api-security.test.ts`

**Step 1: Write failing tests**
- Assert unauthenticated requests to privileged setup routes are rejected.
- Assert unauthenticated requests to WhatsApp notification route are rejected.

**Step 2: Run test to verify it fails**

Run: `npx tsx --test src/app/api/api-security.test.ts`

**Step 3: Write minimal implementation**
- Introduce a shared route guard for admin-only setup endpoints.
- Disable setup endpoints entirely in production by default.
- Require authenticated employer-owned calls for WhatsApp notifications.

**Step 4: Run test to verify it passes**

Run: `npx tsx --test src/app/api/api-security.test.ts`

### Task 2: Fix RLS and Data Exposure

**Files:**
- Modify: `supabase/migrations/004_candidate_portal.sql`
- Modify: `supabase/migrations/001_initial_schema.sql`
- Add: `supabase/migrations/005_lock_down_public_data.sql`

**Step 1: Add migration**
- Remove public candidate profile reads.
- Restrict `job_alerts` reads and payment writes to service-role usage.

**Step 2: Verify schema diff manually**
- Confirm policies no longer use `using (true)` for sensitive data.

### Task 3: Fix Candidate Query and Redirect Bugs

**Files:**
- Modify: `src/app/candidate/dashboard/page.tsx`
- Modify: `src/app/candidate/recommendations/page.tsx`
- Modify: `src/lib/supabase/middleware.ts`
- Modify: `src/app/auth/login/page.tsx`
- Test: `src/app/candidate/candidate-queries.test.ts`

**Step 1: Write failing tests**
- Assert recommendation filters use scalar-compatible predicates.
- Assert login redirect helper preserves candidate redirects.

**Step 2: Run test to verify it fails**

Run: `npx tsx --test src/app/candidate/candidate-queries.test.ts`

**Step 3: Write minimal implementation**
- Replace invalid `overlaps()` calls with scalar-compatible filters.
- Stop forcing authenticated users on auth pages to `/employer/dashboard`.

**Step 4: Run test to verify it passes**

Run: `npx tsx --test src/app/candidate/candidate-queries.test.ts`

### Task 4: Fix Application Submission and Notification Flow

**Files:**
- Modify: `src/lib/actions/apply.ts`
- Modify: `src/lib/actions/notifications.ts`
- Modify: `src/lib/supabase/types.ts` as needed
- Test: `src/lib/actions/apply.test.ts`

**Step 1: Write failing tests**
- Assert application insert uses a schema-valid status.
- Assert employer notifications target employer-controlled contact info.

**Step 2: Run test to verify it fails**

Run: `npx tsx --test src/lib/actions/apply.test.ts`

**Step 3: Write minimal implementation**
- Use a valid application status.
- Resolve employer notification destination from persisted employer/application/job data.

**Step 4: Run test to verify it passes**

Run: `npx tsx --test src/lib/actions/apply.test.ts`

### Task 5: Fix React Structural Violations and ESLint Errors

**Files:**
- Modify: `src/components/ui/input.tsx`
- Modify: `src/components/ui/select.tsx`
- Modify: `src/components/ui/textarea.tsx`
- Modify: `src/components/theme-provider.tsx`
- Modify: `src/hooks/use-cookie-consent.ts`
- Modify: `src/app/candidate/profile/page.tsx`
- Modify additional lint-failing files as required

**Step 1: Write focused failing tests where behavior is practical**
- Input/select/textarea id behavior.
- Candidate profile fetch/save helper behavior if extracted.

**Step 2: Run test to verify it fails**

Run: `npx tsx --test src/components/ui/form-fields.test.ts src/app/candidate/profile/page.test.ts`

**Step 3: Write minimal implementation**
- Make hook ordering unconditional.
- Remove effect-time synchronous mount toggles where avoidable.
- Fix candidate profile fetch function structure and typing.

**Step 4: Run tests and lint**

Run: `npx tsx --test src/components/ui/form-fields.test.ts src/app/candidate/profile/page.test.ts`
Run: `npx eslint src --ext .ts,.tsx`

### Task 6: Full Verification

**Files:**
- No code changes unless verification reveals defects.

**Step 1: Run targeted unit tests**

Run: `npx tsx --test src/app/api/api-security.test.ts src/app/candidate/candidate-queries.test.ts src/lib/actions/apply.test.ts src/components/ui/form-fields.test.ts src/app/candidate/profile/page.test.ts`

**Step 2: Run build**

Run: `npm run build`

**Step 3: Run lint**

Run: `npx eslint src --ext .ts,.tsx`

**Step 4: Run browser smoke tests for production-critical flows**

Run: signup/login smoke checks with Playwright against local or deployed environment.
