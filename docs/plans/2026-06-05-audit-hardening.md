# Audit Hardening Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Strengthen account creation, slug generation, security headers, and job-posting UX without changing unrelated backend flows.

**Architecture:** Add small shared helpers for password validation and unique slug generation, then wire them into the existing auth and job actions. Tighten response headers in `next.config.ts`, improve logo accessibility in shared job/company UI, and make post-job errors more visible without changing server semantics.

**Tech Stack:** Next.js App Router, TypeScript, Supabase, node:test, Playwright

---

### Task 1: Password policy helper and signup validation

**Files:**
- Create: `src/lib/password-policy.ts`
- Create: `src/lib/password-policy.test.ts`
- Modify: `src/lib/actions/auth.ts`

**Step 1: Write the failing test**

Assert that passwords shorter than 8 characters or missing uppercase/lowercase/digit/special-character coverage are rejected, and that a valid password passes.

**Step 2: Run test to verify it fails**

Run: `npm test src/lib/password-policy.test.ts`
Expected: FAIL because the helper does not exist yet.

**Step 3: Write minimal implementation**

Implement a pure validation helper and call it from `signup()`.

**Step 4: Run test to verify it passes**

Run: `npm test src/lib/password-policy.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/password-policy.ts src/lib/password-policy.test.ts src/lib/actions/auth.ts
git commit -m "feat: strengthen password policy"
```

### Task 2: Unique slug helper and company/job slug creation

**Files:**
- Create: `src/lib/unique-slug.ts`
- Create: `src/lib/unique-slug.test.ts`
- Modify: `src/lib/actions/jobs.ts`
- Modify: `src/lib/actions/auth.ts`
- Modify: `src/app/api/setup-auth/route.ts`

**Step 1: Write the failing test**

Assert that the helper retries on collisions and returns the first unused slug.

**Step 2: Run test to verify it fails**

Run: `npm test src/lib/unique-slug.test.ts`
Expected: FAIL because the helper does not exist yet.

**Step 3: Write minimal implementation**

Implement a slug retry loop with a caller-provided existence check.

**Step 4: Run test to verify it passes**

Run: `npm test src/lib/unique-slug.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/unique-slug.ts src/lib/unique-slug.test.ts src/lib/actions/jobs.ts src/lib/actions/auth.ts src/app/api/setup-auth/route.ts
git commit -m "feat: avoid slug collisions"
```

### Task 3: Security headers and accessibility polish

**Files:**
- Modify: `next.config.ts`
- Modify: `src/components/jobs/job-card.tsx`
- Modify: `src/app/companies/page.tsx`
- Modify: `src/app/companies/[slug]/page.tsx`
- Modify: `src/app/saved-jobs/page.tsx`
- Modify: `src/app/candidate/recommendations/page.tsx`
- Modify: `src/app/jobs/[employerSlug]/[jobSlug]/page.tsx`
- Modify: `src/app/jobs/sector/[sector]/page.tsx`
- Modify: `src/app/jobs/sector/[sector]/location/[location]/page.tsx`

**Step 1: Write the failing test**

Assert that the exported header config contains a `Content-Security-Policy` entry.

**Step 2: Run test to verify it fails**

Run: `npm test src/lib/security-headers.test.ts`
Expected: FAIL because the header export does not exist yet.

**Step 3: Write minimal implementation**

Export the header list and add a pragmatic CSP; update logo alt text and placeholder semantics.

**Step 4: Run test to verify it passes**

Run: `npm test src/lib/security-headers.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add next.config.ts src/components/jobs/job-card.tsx src/app/companies/page.tsx src/app/companies/[slug]/page.tsx src/app/saved-jobs/page.tsx src/app/candidate/recommendations/page.tsx src/app/jobs/[employerSlug]/[jobSlug]/page.tsx src/app/jobs/sector/[sector]/page.tsx src/app/jobs/sector/[sector]/location/[location]/page.tsx
git commit -m "feat: add CSP and improve logo accessibility"
```

### Task 4: Post-job error visibility

**Files:**
- Modify: `src/app/employer/post-job/page.tsx`

**Step 1: Write the failing test**

Validate the error block is marked as an alert and can be scrolled into view via a ref-triggered effect.

**Step 2: Run test to verify it fails**

Run: `npm test src/app/employer/post-job/page.test.tsx`
Expected: FAIL until the component behavior exists and is testable.

**Step 3: Write minimal implementation**

Add `role="alert"` and a ref-driven scroll effect for errors.

**Step 4: Run test to verify it passes**

Run: `npm test src/app/employer/post-job/page.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/employer/post-job/page.tsx
git commit -m "fix: surface post job errors more clearly"
```

### Task 5: Verification

**Files:**
- None

**Step 1: Run the required gates**

Run:

```bash
npm run lint
npm test
npm run build
```

**Step 2: Fix regressions if any**

Keep the changes narrow and re-run the same gates until clean.

