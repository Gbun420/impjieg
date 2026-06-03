# Admin & Aggregation Foundation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Harden the super-admin surface, add audit logging, and scaffold the core aggregation data model so Impjieg can safely grow into a Malta-first iGaming job board.

**Architecture:** Keep the existing Supabase + Next.js App Router stack. Add non-destructive Supabase migrations for admin logs and aggregation sources/runs/errors, then expose a real admin shell with protected routes that can render live data or safe empty states. The first pass will prioritize security, observability, and operational control over feature breadth.

**Tech Stack:** Next.js App Router, TypeScript, Supabase, Tailwind CSS, Vercel, Zod, Playwright, Node test runner.

---

### Task 1: Add admin and aggregation schema

**Files:**
- Create: `supabase/migrations/009_admin_and_aggregation_foundation.sql`

**Step 1: Write the migration**

```sql
create table if not exists admin_audit_logs (
  id uuid primary key default uuid_generate_v4(),
  admin_email text not null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  before_value jsonb,
  after_value jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz default now() not null
);
```

**Step 2: Add source/run/error tables**

Add `job_sources`, `job_source_runs`, `job_source_errors`, `job_import_snapshots`, and `job_duplicates` with safe defaults and indexes.

**Step 3: Verify the migration is additive**

Run: `sed -n '1,260p' supabase/migrations/009_admin_and_aggregation_foundation.sql`
Expected: No destructive drops; only additive schema changes.

### Task 2: Add admin audit helper

**Files:**
- Create: `src/lib/admin-audit.ts`
- Create: `src/lib/admin-audit.test.ts`

**Step 1: Write the failing test**

Assert the helper returns a normalized audit payload without leaking secrets.

**Step 2: Implement the helper**

Add a typed helper for `action`, `entityType`, `entityId`, `beforeValue`, `afterValue`, and optional request metadata.

**Step 3: Verify the tests pass**

Run: `npm test -- src/lib/admin-audit.test.ts`
Expected: PASS

### Task 3: Add the admin shell and operational routes

**Files:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/jobs/page.tsx`
- Create: `src/app/admin/jobs/pending/page.tsx`
- Create: `src/app/admin/aggregators/page.tsx`
- Create: `src/app/admin/aggregators/sources/page.tsx`
- Create: `src/app/admin/aggregators/runs/page.tsx`
- Create: `src/app/admin/aggregators/errors/page.tsx`

**Step 1: Create the shell**

Build a consistent admin layout with navigation, current section highlights, and safe empty states.

**Step 2: Add route pages**

Render placeholders backed by the new data model and avoid fake “real data” claims until the tables exist.

**Step 3: Verify navigation**

Run: `npm run build`
Expected: New routes are present and build cleanly.

### Task 4: Wire admin actions to audit logging

**Files:**
- Modify: `src/app/admin/actions.ts`
- Modify: `src/app/api/admin/provision/route.ts`

**Step 1: Add audit logging calls**

Log admin login, logout, and provisioning actions.

**Step 2: Remove hardcoded provisioning secrets from code paths where possible**

Replace embedded credentials with safer configuration boundaries or clearly isolated bootstrap code.

**Step 3: Verify security baseline**

Run: `npm run lint && npm test && npm run build`
Expected: All pass.
