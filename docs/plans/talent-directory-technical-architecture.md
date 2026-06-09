# Talent Directory — Technical Architecture

> **Status:** Draft
> **Date:** 2026-06-08
> **Phases covered:** 3, 5, 6, 8, 9, 10, 11, 12

---

## A. File Structure

### Lib Module

```
src/lib/talent-directory/
  access.ts          — Auth guards and access helpers
  actions.ts         — Server actions (opt-in, search, contact request, respond)
  queries.ts         — Database queries (search, list, detail)
  resolver.ts        — Credit resolver, visibility resolver
  validation.ts      — Zod schemas
  types.ts           — TypeScript types
  constants.ts       — Plan configs, limits, consent version
  monetization.ts    — Stripe checkout helpers
```

### Components

```
src/components/talent-directory/
  candidate/
    directory-settings-form.tsx
    directory-preview.tsx
    contact-requests-list.tsx
    contact-request-response.tsx
  employer/
    talent-search.tsx
    talent-card.tsx
    talent-profile.tsx
    contact-request-form.tsx
    talent-access-gate.tsx
    talent-upsell-card.tsx
  admin/
    talent-directory-dashboard.tsx
    talent-access-list.tsx
    contact-requests-list.tsx
    directory-audit-log.tsx
```

### Routes

```
src/app/candidate/talent-directory/page.tsx
src/app/candidate/contact-requests/page.tsx
src/app/employer/talent/page.tsx
src/app/employer/talent/[slug]/page.tsx
src/app/employer/talent/requests/page.tsx
src/app/employer/talent/checkout/page.tsx
src/app/admin/talent-directory/page.tsx
```

## B. Environment Variables

```bash
# Feature flag
CV_DIRECTORY_ENABLED=false

# Talent Directory Stripe prices
STRIPE_PRICE_TALENT_STARTER=
STRIPE_PRICE_TALENT_RECRUITER=
STRIPE_PRICE_TALENT_CREDITS_5=
STRIPE_PRICE_TALENT_CREDITS_20=
STRIPE_PRICE_TALENT_CREDITS_50=

# Optional tuning
TALENT_DIRECTORY_CONTACT_CREDIT_MODE=consume_on_acceptance
TALENT_DIRECTORY_MAX_REQUESTS_PER_DAY=20
```

## C. Server Action Result Pattern

```typescript
type TalentDirectoryActionResult<T = unknown> =
  | { ok: true; data: T; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };
```

Rules:
- Use `safeParse`, not `parse`, for expected validation errors
- Do not throw expected validation/auth/payment errors to client
- Throw only unexpected programming failures
- Log internal errors server-side with stable prefixes
- Return safe client messages

## D. Access Model

### Helpers (`src/lib/talent-directory/access.ts`)

```typescript
assertCandidateAccount(authContext)
// Throws if not candidate type

assertEmployerAccount(authContext)
// Throws if not employer type

assertAdminAccount(authContext)
// Throws if not admin

getEmployerTalentAccess(employerId: string)
// Returns employer_talent_access row or null

canEmployerSearchTalent(employerId: string)
// Returns true if active access with credits > 0

canEmployerRequestContact(employerId: string)
// Returns true if can search + has available credits

canCandidateManageDirectoryProfile(candidateUserId: string)
// Returns true if candidate has directory profile

canCandidateRespondToRequest(requestId: string, candidateUserId: string)
// Returns true if request belongs to candidate and is pending

canAdminManageTalentDirectory(authContext)
// Returns true if admin
```

## E. Route Behavior When Feature Flag Disabled

| Route | Behavior |
|-------|----------|
| `/candidate/talent-directory` | 404 or "Coming soon" page |
| `/candidate/contact-requests` | 404 or "Coming soon" page |
| `/employer/talent` | 404 or "Coming soon" page |
| `/employer/talent/*` | 404 |
| `/admin/talent-directory` | Hidden from nav; 404 if accessed directly |

---

## Phase 5 — RLS Proposal

### Global Rules

- Enable RLS on all new tables
- Revoke all from `anon` by default
- Avoid broad `authenticated` SELECT
- `service_role` remains server-side only

### Helper SQL Functions

```sql
-- Check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean AS $$
  SELECT coalesce(
    (current_setting('request.jwt.claims', true)::jsonb->>'role') = 'admin',
    false
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Get current user's employer profile ID
CREATE OR REPLACE FUNCTION public.current_user_employer_id()
RETURNS uuid AS $$
  SELECT id FROM public.employers
  WHERE user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Check if employer has active talent access
CREATE OR REPLACE FUNCTION public.employer_has_active_talent_access(employer_uuid uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.employer_talent_access
    WHERE employer_id = employer_uuid
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at > now())
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Check if employer has available contact credits
CREATE OR REPLACE FUNCTION public.employer_has_contact_credit(employer_uuid uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.employer_talent_access
    WHERE employer_id = employer_uuid
      AND status = 'active'
      AND contact_credits_used < contact_credits_total
      AND (expires_at IS NULL OR expires_at > now())
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;
```

### Table Policies

#### `candidate_directory_profiles`

| Policy | Operation | Rule |
|--------|-----------|------|
| Candidates manage own | SELECT, INSERT, UPDATE, DELETE | `auth.uid() = candidate_user_id` |
| Employers search | SELECT | `visibility_status = 'searchable'` AND `employer_has_active_talent_access(current_user_employer_id())` |
| Admins manage all | ALL | `is_admin_user()` |

#### `candidate_directory_cv_assets`

| Policy | Operation | Rule |
|--------|-----------|------|
| Candidates manage own | SELECT, INSERT, UPDATE, DELETE | `auth.uid() = (SELECT candidate_user_id FROM candidate_directory_profiles WHERE id = directory_profile_id)` |
| Employers cannot access | — | No SELECT policy for employers |
| Admins manage all | ALL | `is_admin_user()` |

#### `employer_talent_access`

| Policy | Operation | Rule |
|--------|-----------|------|
| Employers view own | SELECT | `auth.uid() = (SELECT user_id FROM employers WHERE id = employer_id)` |
| Employers cannot update credits | UPDATE | False (only service/admin) |
| Admins manage all | ALL | `is_admin_user()` |

#### `candidate_contact_requests`

| Policy | Operation | Rule |
|--------|-----------|------|
| Employer insert own | INSERT | `auth.uid() = (SELECT user_id FROM employers WHERE id = employer_id)` AND `employer_has_active_talent_access(employer_id)` AND `employer_has_contact_credit(employer_id)` |
| Employer view own | SELECT | `auth.uid() = (SELECT user_id FROM employers WHERE id = employer_id)` |
| Candidate view own | SELECT | `auth.uid() = candidate_user_id` |
| Candidate update own | UPDATE | `auth.uid() = candidate_user_id` AND `status = 'pending'` |
| Admins manage all | ALL | `is_admin_user()` |

#### `candidate_directory_audit_logs`

| Policy | Operation | Rule |
|--------|-----------|------|
| Admins view all | SELECT | `is_admin_user()` |
| Candidates view own | SELECT | `auth.uid() = candidate_user_id` |
| Employers view own | SELECT | `auth.uid() = (SELECT user_id FROM employers WHERE id = employer_id)` |
| Insert only server-side | INSERT | False (service_role only) |

---

## Phase 6 — Validation Schemas

### `candidateDirectorySettingsSchema`

```typescript
z.object({
  displayMode: z.enum(["anonymous", "first_name", "full_name"]),
  headline: z.string().max(140).optional(),
  summary: z.string().max(1000).optional(),
  skills: z.array(z.string()).max(30).default([]),
  sectors: z.array(z.string()).max(10).default([]),
  jobTypes: z.array(z.string()).default([]),
  remotePreference: z.enum(["On-site", "Remote", "Hybrid"]).optional(),
  experienceYears: z.number().int().min(0).max(50).optional(),
  desiredSalaryMin: z.number().int().min(0).optional(),
  desiredSalaryMax: z.number().int().min(0).optional(),
  availability: z.string().max(200).optional(),
  allowContactRequests: z.boolean().default(true),
  allowCvRequests: z.boolean().default(false),
  allowDirectCvDownload: z.boolean().default(false),
  consentToDirectory: z.literal(true, {
    errorMap: () => ({ message: "You must consent to be listed in the Talent Directory" }),
  }),
});
```

### `employerTalentSearchSchema`

```typescript
z.object({
  query: z.string().max(200).optional(),
  skills: z.array(z.string()).optional(),
  sectors: z.array(z.string()).optional(),
  locations: z.array(z.string()).optional(),
  experienceYearsMin: z.number().int().min(0).optional(),
  experienceYearsMax: z.number().int().max(50).optional(),
  salaryMin: z.number().int().min(0).optional(),
  salaryMax: z.number().int().min(0).optional(),
  remotePreference: z.enum(["On-site", "Remote", "Hybrid"]).optional(),
  availability: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
});
```

### `createContactRequestSchema`

```typescript
z.object({
  candidateDirectoryProfileId: z.string().uuid(),
  message: z.string().min(30).max(2000),
  employerId: z.string().uuid(),
});
```

### `respondToContactRequestSchema`

```typescript
z.object({
  requestId: z.string().uuid(),
  status: z.enum(["accepted", "rejected"]),
  responseMessage: z.string().max(1000).optional(),
});
```

### `createEmployerTalentAccessSchema`

```typescript
z.object({
  employerId: z.string().uuid(),
  planKey: z.enum(["starter", "recruiter"]),
  stripeCustomerId: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
});
```

### `purchaseTalentCreditsSchema`

```typescript
z.object({
  employerId: z.string().uuid(),
  packKey: z.enum(["5", "20", "50"]),
  stripePaymentIntentId: z.string().optional(),
});
```

### `adminSuspendTalentAccessSchema`

```typescript
z.object({
  employerId: z.string().uuid(),
  reason: z.string().min(10).max(2000),
});
```

---

## Phase 8 — Candidate UI Plan

### Route: `/candidate/talent-directory`

**Sections:**

1. **Status card** — Current status: Private / Searchable / Paused
2. **Opt-in panel** — Clear explanation, consent checkbox, preview before activation
3. **Visibility controls** — Display mode: anonymous, first name, full name
4. **Contact controls** — Allow platform contact requests, CV requests, CV download (default false)
5. **Employer-visible preview** — Exactly what paid employers will see
6. **Danger zone** — Pause visibility, leave directory, delete directory profile

### Route: `/candidate/contact-requests`

**UI states:** Pending, accepted, rejected, expired

**Actions:** Accept, reject, report employer (post-MVP)

---

## Phase 9 — Employer UI Plan

### Route: `/employer/talent`

**No access state:**
- Upsell card with pricing comparison
- Anonymised sample cards (2-3)
- CTA to checkout

**Active access state:**
- Search input
- Filters: skills, sector, location, experience, salary, remote, availability
- Result cards with candidate safe profile
- Credits remaining counter
- Saved candidates (post-MVP)

### Route: `/employer/talent/[slug]`

**Show:**
- Candidate safe profile (headline, summary, skills, sectors, etc.)
- No direct email/phone
- No raw CV URL
- Contact request form
- Request status if already contacted

### Route: `/employer/talent/requests`

**Show:**
- Pending requests
- Accepted requests (with candidate contact info)
- Rejected requests
- Expired requests
- Credits used counter
- Response messages

---

## Phase 10 — Admin UI Plan

### Route: `/admin/talent-directory`

**Panels:**

1. **Directory overview** — Opted-in/searchable/paused counts, active employers, contact requests, credits consumed
2. **Candidate directory profiles** — Search, status, last updated, abuse/report status
3. **Employer access** — Employer, plan, status, credits used/total, expiry, suspend/reinstate
4. **Contact requests** — Employer, candidate, status, created, accepted/rejected
5. **Audit logs** — Filter by actor/action/candidate/employer

**Actions:**
- Suspend employer access
- Pause candidate profile (abuse/legal)
- Add admin note
- Export audit logs (post-MVP)

---

## Phase 11 — QA Seed Plan

### Scripts

```
scripts/seed-talent-directory-test-data.ts
scripts/delete-talent-directory-test-data.ts
```

### Seed Data

| Entity | Count | Details |
|--------|-------|---------|
| Opted-in candidates | 10 | Various skills, sectors, locations |
| Private candidates | 3 | Not opted in |
| Paused candidates | 2 | Opted in then paused |
| Employer with starter access | 1 | Active subscription, 10 credits |
| Employer with recruiter access | 1 | Active subscription, 30 credits |
| Employer without access | 1 | Free tier |
| Employer with exhausted credits | 1 | 0 credits remaining |
| Contact requests | 4 | Pending, accepted, rejected, expired |

### Credentials

```
output/qa-talent-directory-credentials.local.md
```

### Gitignore

```
output/qa-talent-directory-credentials.local.md
output/qa-talent-directory-credentials*.json
```

---

## Phase 12 — Test Plan

### Unit Tests

| Test File | Coverage |
|-----------|----------|
| `validation.test.ts` | All Zod schemas, edge cases |
| `access.test.ts` | All access helpers, role checks |
| `resolver.test.ts` | Credit resolver, visibility resolver |
| `contact-request.test.ts` | Status transitions, credit consumption |
| `monetization.test.ts` | Stripe plan mapping, checkout flow |

### RLS Tests

| Test | Expected |
|------|----------|
| Anon cannot select directory profiles | ✅ Blocked |
| Candidate can manage own directory profile | ✅ Allowed |
| Candidate cannot manage another candidate profile | ❌ Blocked |
| Employer without access cannot search | ❌ Blocked |
| Employer with access can search searchable profiles | ✅ Allowed |
| Employer cannot see raw CV file URL | ❌ Blocked |
| Employer cannot contact without credits | ❌ Blocked |
| Wrong employer cannot view another employer request | ❌ Blocked |
| Admin can manage all | ✅ Allowed |

### Server Action Tests

| Test | Expected |
|------|----------|
| Opt in success | `ok: true` |
| Opt out success | `ok: true` |
| Pause success | `ok: true` |
| Create contact request with no access | `ok: false` |
| Create contact request with access | `ok: true` |
| Accept request consumes credit | Credit decremented |
| Reject request does not consume credit | Credit unchanged |
| DB errors return structured safe errors | `ok: false` with safe message |

### E2E Tests

| Test | Route |
|------|-------|
| Candidate opt-in flow | `/candidate/talent-directory` |
| Candidate preview | `/candidate/talent-directory` |
| Employer no-access upsell | `/employer/talent` |
| Employer paid-access search | `/employer/talent` |
| Employer contact request | `/employer/talent/[slug]` |
| Candidate accept request | `/candidate/contact-requests` |
| Credit count decreases | `/employer/talent` |
| Admin audit view | `/admin/talent-directory` |

### Browser Use Tests

| Test | Breakpoint |
|------|------------|
| Candidate route | Desktop + Mobile |
| Employer route | Desktop + Mobile |
| Admin route | Desktop + Mobile |
| Logged-out redirects | Desktop |
| Destructive action confirmation | Desktop |
