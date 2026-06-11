# OpenCode system instructions — standalone PermitFit pilot

You are an autonomous senior full-stack engineer working inside the private GitHub repository `Gbun420/impjieg`.

Your task is to build **Impjieg PermitFit™ as a separate pilot module first**, not as a deep integration into the live job-board posting/application flow.

This supersedes the earlier integrated MVP instructions for now.

## Decision

Build PermitFit separately first.

Do **not** modify the existing live job-posting flow, public jobs search, job cards, job detail pages, or application submission flow in this first standalone pilot unless a small shared UI/helper import is unavoidable.

The goal is to validate the product idea safely before touching the core marketplace.

## Source documents

Read these first:

1. `docs/plans/2026-06-11-permitfit-tcn-integration-plan.md`
2. `docs/ai-coder/2026-06-11-opencode-permitfit-system-instructions.md`
3. GitHub issue `#14`
4. `README.md`
5. `src/lib/constants.ts`
6. Existing UI primitives in `src/components/ui`

Use the earlier integration plan for product logic, but implement this standalone version instead of the full integration.

## Product goal

Create a separate PermitFit pilot that lets employers/recruiters assess whether a Malta role and a TCN candidate have a reasonable work-status/start-date match based on self-declared information.

The pilot should be usable as a product demo and discovery tool.

It should answer:

> Based on employer-declared support and candidate-declared status, is this a strong fit, possible fit, risky, or missing information?

This is not legal advice and not official approval.

## Hard safety and wording rules

PermitFit must not imply professional advice, official approval, guaranteed eligibility, or guaranteed outcome.

Allowed language:

- `Permit readiness signal`
- `Employer-declared TCN support`
- `Candidate self-declared work status`
- `Start-date risk estimate`
- `Document readiness checklist`
- `Permit signal`
- `Readiness result`

Forbidden language:

- `approved`
- `guaranteed`
- `eligible`
- `government-approved`
- `officially compliant`
- `visa approved`
- `permit approved`

Required disclaimer on the page:

> PermitFit uses employer-declared and candidate-declared information. Impjieg does not provide immigration advice, legal advice, or official approval.

## Technical constraints

The project uses:

- Next.js App Router
- React
- TypeScript
- Supabase where already used
- Tailwind utility classes
- Existing UI primitives under `src/components/ui`

Do not introduce unnecessary new dependencies.

Do not break existing routes.

Run these before opening a PR:

```bash
npm run lint
npm test
npm run build
```

## Branch and PR workflow

Create a branch:

```bash
git checkout -b feat/permitfit-standalone-pilot
```

Open a PR titled:

```text
feat: add standalone PermitFit pilot
```

The PR body must include:

- summary of standalone approach;
- routes added;
- helpers added;
- whether any database migration was added;
- safe wording/disclaimer note;
- test results;
- note that core job-board flows were intentionally left untouched.

Do not merge directly to `main`.

---

# Standalone architecture

## Route

Create a standalone public route:

```text
/permitfit
```

Suggested files:

- `src/app/permitfit/page.tsx`
- `src/components/permitfit/permitfit-form.tsx`
- `src/components/permitfit/permitfit-result-card.tsx`
- `src/lib/permitfit/constants.ts`
- `src/lib/permitfit/scoring.ts`
- `src/lib/permitfit/scoring.test.ts`

Optional:

- `src/lib/permitfit/types.ts`
- `src/lib/permitfit/index.ts`

## Do not touch in this PR

Do not modify these core files for the standalone pilot:

- `src/app/employer/post-job/page.tsx`
- `src/lib/actions/jobs.ts`
- `src/app/jobs/page.tsx`
- `src/components/jobs/search-filters.tsx`
- `src/components/jobs/job-card.tsx`
- `src/app/jobs/[employerSlug]/[jobSlug]/page.tsx`
- `src/components/jobs/apply-form.tsx`
- `src/lib/actions/apply.ts`
- `src/lib/supabase/types.ts`

Exception: only modify shared navigation if there is a clear existing pattern and the change is tiny. If unsure, do not add nav links.

## Database

For the first standalone version, prefer **no database migration**.

The page can be a client-side assessment tool that calculates the result in memory.

If persistence is clearly needed, create a separate table later in another PR, such as:

- `permitfit_assessments`

Do not modify the existing `jobs` or `applications` tables in this standalone pilot.

---

# UI requirements

## Page header

Route: `/permitfit`

Title:

```text
PermitFit by Impjieg
```

Subtitle:

```text
Check whether a Malta role and a TCN candidate have a clear work-status and start-date match before wasting screening time.
```

Badge/label:

```text
Standalone pilot
```

Disclaimer must be visible near the top or result:

```text
PermitFit uses employer-declared and candidate-declared information. Impjieg does not provide immigration advice, legal advice, or official approval.
```

## Layout

Use a two-column layout on desktop:

- left: form
- right: live result / explanation

Use a single-column layout on mobile.

Use existing design language:

- rounded cards;
- subtle borders;
- marketplace/harbor style where appropriate;
- no loud red warnings unless genuinely high risk.

## Form sections

### Section 1 — Role / employer support

Fields:

1. Role title — optional text
2. Sector — select or text using existing sectors if easy
3. Salary range — optional min/max numbers
4. TCN support level — select
5. Supported routes — checkbox group
6. Candidate must already be in Malta — checkbox
7. Accommodation support — checkbox
8. Relocation support — checkbox
9. Pre-departure support — checkbox
10. Employer notes — optional textarea

### Section 2 — Candidate work-status signal

Fields:

1. Candidate work status — select
2. Current country — optional text
3. Already in Malta — checkbox
4. Has Maltese residence card — checkbox
5. Needs change of employer — checkbox
6. Permit expiry date — optional date
7. Pre-departure course status — select
8. Earliest realistic start date — optional date
9. Needs accommodation — checkbox
10. Needs relocation — checkbox

## Result card

Display:

- numeric score, if available;
- label;
- short interpretation;
- positive signals;
- risk/missing-information signals;
- suggested next questions for recruiter/employer;
- disclaimer.

Labels:

- `Strong permit fit`
- `Possible permit fit`
- `Permit risk`
- `Not enough information`

Do not use forbidden wording.

Example result copy:

```text
Possible permit fit
The employer appears open to this candidate route, but start-date confidence depends on missing information.
```

---

# PermitFit constants

Create `src/lib/permitfit/constants.ts`.

```ts
export const TCN_SUPPORT_LEVELS = [
  { value: "none", label: "No TCN support" },
  { value: "already_in_malta_only", label: "TCNs already in Malta only" },
  { value: "change_of_employer_supported", label: "Change of employer supported" },
  { value: "first_time_single_permit_supported", label: "First-time Single Permit supported" },
  { value: "full_relocation_supported", label: "Full relocation support" },
] as const;

export const PERMIT_ROUTES_SUPPORTED = [
  { value: "single_permit", label: "Single Permit" },
  { value: "change_of_employer", label: "Change of employer" },
  { value: "kei", label: "Key Employee Initiative" },
  { value: "sei", label: "Specialist Employee Initiative" },
  { value: "seasonal", label: "Seasonal work" },
  { value: "student_or_intern", label: "Student / internship route" },
] as const;

export const CANDIDATE_WORK_STATUS_OPTIONS = [
  { value: "maltese_or_eu", label: "Maltese / EU citizen" },
  { value: "tcn_in_malta_with_valid_permit", label: "TCN in Malta with valid permit" },
  { value: "tcn_in_malta_needs_change_of_employer", label: "TCN in Malta needing change of employer" },
  { value: "tcn_outside_malta_needs_first_time_permit", label: "TCN outside Malta needing first-time permit" },
  { value: "student_or_other_status", label: "Student or other status" },
  { value: "unknown", label: "Not sure" },
] as const;

export const PRE_DEPARTURE_COURSE_OPTIONS = [
  { value: "not_required_or_unknown", label: "Not required / not sure" },
  { value: "not_started", label: "Not started" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
] as const;
```

Export types:

```ts
export type TcnSupportLevel = (typeof TCN_SUPPORT_LEVELS)[number]["value"];
export type PermitRouteSupported = (typeof PERMIT_ROUTES_SUPPORTED)[number]["value"];
export type CandidateWorkStatus = (typeof CANDIDATE_WORK_STATUS_OPTIONS)[number]["value"];
export type PreDepartureCourseStatus = (typeof PRE_DEPARTURE_COURSE_OPTIONS)[number]["value"];
```

---

# Scoring requirements

Create `src/lib/permitfit/scoring.ts`.

Input shape:

```ts
export type PermitFitInput = {
  roleTitle?: string;
  sector?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  tcnSupportLevel: string;
  permitRoutesSupported: string[];
  requiresCandidateInMalta: boolean;
  supportsAccommodation: boolean;
  supportsRelocation: boolean;
  supportsPreDepartureCourse: boolean;
  candidateWorkStatus: string;
  candidateCurrentCountry?: string;
  candidateAlreadyInMalta: boolean;
  candidateHasMalteseResidenceCard: boolean;
  candidateNeedsChangeOfEmployer: boolean;
  candidatePermitExpiryDate?: string | null;
  candidatePreDepartureCourseStatus: string;
  candidateEarliestStartDate?: string | null;
  candidateNeedsAccommodation: boolean;
  candidateNeedsRelocation: boolean;
};
```

Output shape:

```ts
export type PermitFitResult = {
  score: number | null;
  label: "Strong permit fit" | "Possible permit fit" | "Permit risk" | "Not enough information";
  summary: string;
  positiveSignals: string[];
  riskSignals: string[];
  nextQuestions: string[];
};
```

Minimum scoring rules:

1. Missing or `unknown` candidate work status => `Not enough information`.
2. Maltese/EU status => strong fit if the role does not rely on TCN support.
3. Employer support `none` + TCN candidate status => `Permit risk`.
4. TCN already in Malta + change-of-employer support => strong or possible fit.
5. TCN already in Malta + employer requires candidate in Malta => positive signal.
6. TCN outside Malta + first-time permit/full relocation support => possible fit.
7. Candidate needs accommodation + employer supports accommodation => positive signal.
8. Candidate needs accommodation + employer does not support it => risk signal.
9. Candidate needs relocation + employer supports relocation => positive signal.
10. Candidate needs relocation + employer does not support it => risk signal.
11. Pre-departure completed + employer supports first-time route => positive signal.
12. Pre-departure not started + first-time route => risk/missing signal.

Score guide:

- `80-100`: Strong permit fit
- `50-79`: Possible permit fit
- `1-49`: Permit risk
- `null`: Not enough information

The scoring must be deterministic, simple, and testable.

Do not use AI or external APIs.

---

# Tests

Create:

- `src/lib/permitfit/scoring.test.ts`

Test cases:

1. unknown work status returns `Not enough information`;
2. Maltese/EU candidate returns strong result;
3. TCN with no employer support returns `Permit risk`;
4. change-of-employer candidate with matching support returns possible or strong result;
5. outside-Malta first-time candidate with first-time support returns possible result;
6. accommodation match adds a positive signal;
7. accommodation mismatch adds a risk signal;
8. result text never contains forbidden words;
9. score is bounded between 0 and 100 when not null.

Use the repo’s existing test command:

```bash
npm test
```

---

# Component implementation details

## `src/app/permitfit/page.tsx`

Server component.

Export metadata:

```ts
export const metadata = {
  title: "PermitFit by Impjieg | Malta TCN hiring signal",
  description: "Standalone pilot for checking employer-declared and candidate-declared TCN work-status signals before screening.",
};
```

Render header and `PermitFitForm`.

## `src/components/permitfit/permitfit-form.tsx`

Client component.

Use `useState` to manage form state.

Call `calculatePermitFit` on state changes or on button click.

For MVP, either live calculation or explicit `Calculate signal` button is acceptable. Prefer explicit button if simpler.

Do not submit to database.

## `src/components/permitfit/permitfit-result-card.tsx`

Receives `PermitFitResult` and renders:

- label;
- score;
- summary;
- positive signals;
- risk signals;
- next questions;
- disclaimer.

Use calm visual treatment.

---

# Manual QA checklist

1. Visit `/permitfit`.
2. Confirm page loads on desktop and mobile widths.
3. Leave candidate work status unknown and calculate.
4. Confirm result is `Not enough information`.
5. Select Maltese/EU candidate and calculate.
6. Confirm result is strong.
7. Select TCN needing change of employer and employer support matching route.
8. Confirm result is possible or strong.
9. Select TCN outside Malta, no support.
10. Confirm result is risk.
11. Check that no text uses forbidden wording.
12. Confirm no existing job-posting/job-search/application routes were changed.

---

# Non-goals for this standalone PR

Do not build:

- Supabase persistence;
- changes to existing job posting;
- changes to existing jobs filters;
- changes to application form;
- payment/monetization;
- admin dashboard;
- immigration advisor marketplace;
- document uploads;
- government API integration;
- PDF evidence pack;
- AI permit scoring.

The only goal is a standalone PermitFit pilot tool.

## Final checklist

Before PR:

- `/permitfit` route created;
- standalone form created;
- result card created;
- constants created;
- deterministic scoring created;
- tests created;
- core job-board flows untouched;
- forbidden wording avoided;
- `npm run lint` passes;
- `npm test` passes;
- `npm run build` passes.
