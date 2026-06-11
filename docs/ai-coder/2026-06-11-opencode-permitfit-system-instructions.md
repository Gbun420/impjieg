# OpenCode system instructions — PermitFit MVP

You are an autonomous senior full-stack engineer working inside the private GitHub repository `Gbun420/impjieg`.

Your task is to implement the first MVP of **Impjieg PermitFit™**, a structured TCN hiring-signal layer for Malta job listings.

You must work from the existing codebase. Do not invent a new architecture. Do not replace the product. Do not rewrite unrelated areas.

## Source of truth

Read these first:

1. `docs/plans/2026-06-11-permitfit-tcn-integration-plan.md`
2. GitHub issue `#14` — `Build PermitFit MVP for structured TCN hiring signals`
3. `README.md`
4. `src/lib/supabase/types.ts`
5. `src/app/employer/post-job/page.tsx`
6. `src/lib/actions/jobs.ts`
7. `src/app/jobs/page.tsx`
8. `src/components/jobs/search-filters.tsx`
9. `src/components/jobs/job-card.tsx`
10. `src/app/jobs/[employerSlug]/[jobSlug]/page.tsx`
11. `src/components/jobs/apply-form.tsx`
12. `src/lib/actions/apply.ts`

## Product goal

Replace the weak single `visa_friendly` experience with structured employer-declared PermitFit signals.

The MVP must allow:

- employers to declare TCN support details when posting a job;
- candidates to filter jobs by more specific TCN support signals;
- job cards to show controlled PermitFit badges;
- job detail pages to explain employer-declared support clearly;
- applications to collect optional candidate work-status information where relevant;
- recruiters to receive better structured application data.

Do not build a full immigration case-management product. This is a job-board clarity feature.

## Hard safety and wording rules

PermitFit must not imply professional advice, official approval, guaranteed eligibility, or guaranteed outcome.

Allowed language:

- `Permit readiness signal`
- `Employer-declared TCN support`
- `Candidate self-declared work status`
- `Start-date risk estimate`
- `Document readiness checklist`
- `Permit signal`

Forbidden language:

- `approved`
- `guaranteed`
- `eligible`
- `government-approved`
- `officially compliant`
- `visa approved`
- `permit approved`

Required disclaimer on detailed PermitFit UI:

> Permit signals are employer-declared and candidate-declared. Impjieg does not provide immigration advice, legal advice, or official approval.

## Technical constraints

The project uses:

- Next.js App Router
- React
- TypeScript
- Supabase
- Server actions
- Tailwind utility classes
- Existing UI primitives under `src/components/ui`

Respect existing patterns. Do not introduce unnecessary new dependencies.

Run these before opening the PR:

```bash
npm run lint
npm test
npm run build
```

All three must pass.

## Branch and PR workflow

Create a branch:

```bash
git checkout -b feat/permitfit-tcn-signals
```

Open a PR titled:

```text
feat: add PermitFit TCN hiring signals MVP
```

The PR body must include:

- summary of changes;
- database migration details;
- affected routes/components;
- backward compatibility note for `visa_friendly`;
- disclaimer / safe wording note;
- test results.

Do not merge directly to `main`.

---

# Implementation plan

## Step 1 — Add PermitFit constants and helpers

Create:

- `src/lib/permitfit/constants.ts`
- `src/lib/permitfit/badges.ts`
- `src/lib/permitfit/scoring.ts`
- optional barrel file `src/lib/permitfit/index.ts`

### `constants.ts`

Export typed option lists:

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

Also export derived union types:

```ts
export type TcnSupportLevel = (typeof TCN_SUPPORT_LEVELS)[number]["value"];
export type PermitRouteSupported = (typeof PERMIT_ROUTES_SUPPORTED)[number]["value"];
export type CandidateWorkStatus = (typeof CANDIDATE_WORK_STATUS_OPTIONS)[number]["value"];
export type PreDepartureCourseStatus = (typeof PRE_DEPARTURE_COURSE_OPTIONS)[number]["value"];
```

Add label helpers:

- `getTcnSupportLabel(value: string | null | undefined): string`
- `getPermitRouteLabel(value: string): string`

Unknown values must not crash the UI. Return a safe fallback.

### `badges.ts`

Create:

```ts
export type PermitFitBadge = {
  label: string;
  variant?: "default" | "secondary" | "accent" | "outline" | "success";
};
```

Create helper:

```ts
export function getPermitFitBadges(job: PermitFitJobLike, limit = 3): PermitFitBadge[]
```

The helper should use this priority:

1. First-time permit support
2. Change of employer
3. Already in Malta accepted
4. Accommodation
5. Relocation
6. TCN friendly

Do not return more than `limit` badges.

Backward compatibility:

- if `job.visa_friendly === true` but new fields are absent/default, return `TCN friendly`.

### `scoring.ts`

Create deterministic scoring only. Do not use AI.

Create a function:

```ts
export function calculatePermitFit(input: CalculatePermitFitInput): PermitFitScoreResult
```

Return:

```ts
type PermitFitScoreResult = {
  score: number | null;
  label: "Strong permit fit" | "Possible permit fit" | "Permit risk" | "Not enough information";
  reasons: string[];
};
```

Rules:

- Maltese/EU status with any job = strong if enough data exists.
- TCN already in Malta + employer supports already-in-Malta/change-of-employer = stronger.
- TCN outside Malta + employer supports first-time permit/full relocation = possible/strong depending on other flags.
- Missing work status = not enough information.
- Employer support level `none` + TCN work status = permit risk.
- Never return strings containing forbidden words.

Keep scoring simple. The MVP does not need perfection.

---

## Step 2 — Add Supabase migration

Create:

- `supabase/migrations/20260611_add_permitfit_tcn_fields.sql`

Use idempotent SQL:

```sql
alter table public.jobs
  add column if not exists tcn_support_level text not null default 'none'
    check (tcn_support_level in (
      'none',
      'already_in_malta_only',
      'change_of_employer_supported',
      'first_time_single_permit_supported',
      'full_relocation_supported'
    )),
  add column if not exists permit_routes_supported text[] not null default '{}',
  add column if not exists requires_candidate_in_malta boolean not null default false,
  add column if not exists supports_accommodation boolean not null default false,
  add column if not exists supports_relocation boolean not null default false,
  add column if not exists supports_pre_departure_course boolean not null default false,
  add column if not exists permit_notes text;

alter table public.applications
  add column if not exists candidate_work_status text,
  add column if not exists candidate_current_country text,
  add column if not exists candidate_already_in_malta boolean,
  add column if not exists candidate_has_maltese_residence_card boolean,
  add column if not exists candidate_permit_expiry_date date,
  add column if not exists candidate_needs_change_of_employer boolean,
  add column if not exists candidate_pre_departure_course_status text,
  add column if not exists candidate_document_readiness jsonb,
  add column if not exists candidate_earliest_start_date date,
  add column if not exists permitfit_score integer,
  add column if not exists permitfit_label text,
  add column if not exists permitfit_reasons jsonb;
```

If the repo already has a specific migration naming convention, follow it.

---

## Step 3 — Update TypeScript Supabase types

File:

- `src/lib/supabase/types.ts`

Add the new `jobs` fields to `Row`, `Insert`, and `Update`.

Add the new `applications` fields to `Row`, `Insert`, and `Update`.

Keep fields nullable in `Insert` and `Update` where appropriate.

Expected `jobs.Row` additions:

```ts
tcn_support_level: string;
permit_routes_supported: string[];
requires_candidate_in_malta: boolean;
supports_accommodation: boolean;
supports_relocation: boolean;
supports_pre_departure_course: boolean;
permit_notes: string | null;
```

Expected `applications.Row` additions:

```ts
candidate_work_status: string | null;
candidate_current_country: string | null;
candidate_already_in_malta: boolean | null;
candidate_has_maltese_residence_card: boolean | null;
candidate_permit_expiry_date: string | null;
candidate_needs_change_of_employer: boolean | null;
candidate_pre_departure_course_status: string | null;
candidate_document_readiness: Json | null;
candidate_earliest_start_date: string | null;
permitfit_score: number | null;
permitfit_label: string | null;
permitfit_reasons: Json | null;
```

---

## Step 4 — Update employer post-job form

File:

- `src/app/employer/post-job/page.tsx`

Find the current `Visa Friendly` checkbox inside the `Skills & Benefits` card.

Replace it with a dedicated card titled:

```text
TCN / work-permit signals
```

Card helper text:

```text
Help candidates understand whether this role supports third-country national hiring. These are employer-declared signals, not advice or official approval.
```

Add fields:

- `tcnSupportLevel` select
- `permitRoutesSupported` checkbox group
- `requiresCandidateInMalta` checkbox
- `supportsAccommodation` checkbox
- `supportsRelocation` checkbox
- `supportsPreDepartureCourse` checkbox
- `permitNotes` textarea

Implementation notes:

- Use existing `Select`, `Input`, `Textarea`, `Card`, `Badge`, `Button` primitives.
- Do not introduce new UI libraries.
- Make the section visually calm and consistent with existing cards.
- Keep inputs optional.
- `permitNotes` should have a placeholder such as: `Example: We can consider candidates already in Malta who require a change of employer.`
- Do not use forbidden wording.

Backward compatibility:

- You may keep a hidden `visaFriendly` input derived client-side, but the server action must also derive it safely.

---

## Step 5 — Update job creation action

File:

- `src/lib/actions/jobs.ts`

Parse:

```ts
const tcnSupportLevel = (formData.get("tcnSupportLevel") as string) || "none";
const permitRoutesSupported = formData.getAll("permitRoutesSupported").map(String).filter(Boolean);
const requiresCandidateInMalta = formData.get("requiresCandidateInMalta") === "on";
const supportsAccommodation = formData.get("supportsAccommodation") === "on";
const supportsRelocation = formData.get("supportsRelocation") === "on";
const supportsPreDepartureCourse = formData.get("supportsPreDepartureCourse") === "on";
const permitNotes = ((formData.get("permitNotes") as string) || "").trim();
```

Derive:

```ts
const structuredTcnSupport =
  tcnSupportLevel !== "none" ||
  permitRoutesSupported.length > 0 ||
  requiresCandidateInMalta ||
  supportsAccommodation ||
  supportsRelocation ||
  supportsPreDepartureCourse;

const visaFriendly = formData.get("visaFriendly") === "on" || structuredTcnSupport;
```

Insert the new fields into the job row.

Validation:

- Only allow known support levels.
- Only allow known permit routes.
- Trim `permitNotes`.
- Store `null` for blank notes.
- Do not block job creation if PermitFit fields are blank.

---

## Step 6 — Update public jobs query and filters

Files:

- `src/components/jobs/search-filters.tsx`
- `src/app/jobs/page.tsx`

Existing `visa=true` filter must keep working.

Add UI filters:

- `TCN friendly only`
- `Change of employer supported`
- `First-time permit supported`
- `Accommodation support`
- optional: `Relocation support`

Suggested query params:

- `tcn=true`
- `permit=change_of_employer`
- `permit=first_time_single_permit`
- `accommodation=true`
- `relocation=true`

Update `buildQuery` and initial state in `search-filters.tsx`.

Update Supabase query in `jobs/page.tsx`.

Suggested logic:

- `tcn=true`: include jobs where `visa_friendly = true` or `tcn_support_level != none`.
- `permit=change_of_employer`: include jobs where `permit_routes_supported` contains `change_of_employer` or `tcn_support_level = change_of_employer_supported`.
- `permit=first_time_single_permit`: include jobs where `permit_routes_supported` contains `single_permit` or `tcn_support_level = first_time_single_permit_supported`.
- `accommodation=true`: `supports_accommodation = true`.
- `relocation=true`: `supports_relocation = true`.

If Supabase OR syntax becomes awkward, choose the simplest reliable implementation that does not break existing filters.

---

## Step 7 — Update job card badges

File:

- `src/components/jobs/job-card.tsx`

Current card shows `Visa friendly` when `job.visa_friendly` is true.

Replace or extend with `getPermitFitBadges(job)`.

Rules:

- Show maximum 3 PermitFit badges.
- Keep old jobs displaying `TCN friendly` if only `visa_friendly` exists.
- Do not overcrowd the card.
- Use existing `Badge` component.

Example rendering:

```tsx
{getPermitFitBadges(job).map((badge) => (
  <Badge key={badge.label} variant={badge.variant ?? "accent"}>
    {badge.label}
  </Badge>
))}
```

---

## Step 8 — Update job detail page

File:

- `src/app/jobs/[employerSlug]/[jobSlug]/page.tsx`

Add helper:

```ts
function isPermitFitJob(job: JobWithEmployer) {
  return Boolean(
    job.visa_friendly ||
    job.tcn_support_level !== "none" ||
    job.permit_routes_supported?.length ||
    job.supports_accommodation ||
    job.supports_relocation ||
    job.supports_pre_departure_course
  );
}
```

Add a `Permit signal` card when `isPermitFitJob(j)` is true.

Show:

- support level label;
- supported routes;
- already-in-Malta requirement;
- accommodation support;
- relocation support;
- pre-departure support;
- public notes if present;
- required disclaimer.

Keep layout consistent with existing salary and company cards.

Pass `showPermitFitFields={isPermitFitJob(j)}` into `ApplyForm`.

---

## Step 9 — Update application form

File:

- `src/components/jobs/apply-form.tsx`

Update props:

```ts
showPermitFitFields?: boolean;
```

If true, render optional section titled:

```text
Work status signal
```

Helper copy:

```text
Optional. This helps the employer understand your start-date and work-status context. It is self-declared information only.
```

Fields:

- `candidateWorkStatus` select
- `candidateCurrentCountry` input
- `candidateAlreadyInMalta` checkbox
- `candidateHasMalteseResidenceCard` checkbox
- `candidateNeedsChangeOfEmployer` checkbox
- `candidatePermitExpiryDate` date input
- `candidatePreDepartureCourseStatus` select
- `candidateEarliestStartDate` date input

Do not make these required.

Application submission must still work when all these fields are empty.

---

## Step 10 — Update submitApplication

File:

- `src/lib/actions/apply.ts`

Parse optional fields:

```ts
const candidateWorkStatus = formData.get("candidateWorkStatus") as string | null;
const candidateCurrentCountry = formData.get("candidateCurrentCountry") as string | null;
const candidateAlreadyInMalta = formData.get("candidateAlreadyInMalta") === "on";
const candidateHasMalteseResidenceCard = formData.get("candidateHasMalteseResidenceCard") === "on";
const candidateNeedsChangeOfEmployer = formData.get("candidateNeedsChangeOfEmployer") === "on";
const candidatePermitExpiryDate = formData.get("candidatePermitExpiryDate") as string | null;
const candidatePreDepartureCourseStatus = formData.get("candidatePreDepartureCourseStatus") as string | null;
const candidateEarliestStartDate = formData.get("candidateEarliestStartDate") as string | null;
```

Fetch minimal job PermitFit fields before insert if needed for scoring.

Calculate score with `calculatePermitFit`.

Insert into `applications`:

- candidate fields;
- `permitfit_score`;
- `permitfit_label`;
- `permitfit_reasons`.

Do not fail the application if scoring cannot be calculated. Use `Not enough information`.

---

## Step 11 — Tests

Add tests:

- `src/lib/permitfit/badges.test.ts`
- `src/lib/permitfit/scoring.test.ts`

Test cases:

1. old `visa_friendly` job returns `TCN friendly` badge;
2. first-time support returns the highest-priority badge;
3. badge helper never returns more than 3 badges;
4. unknown fields do not crash;
5. missing candidate work status returns `Not enough information`;
6. no support + TCN work status returns `Permit risk`;
7. scoring output does not contain forbidden words;
8. Maltese/EU status does not create unnecessary risk;
9. change-of-employer candidate + supported job returns possible or strong fit.

Use the repo’s existing Node test style:

```bash
node --import tsx --test src/**/*.test.ts
```

---

## Step 12 — Manual QA checklist

After coding, test these flows locally:

### Employer flow

1. Go to employer post-job page.
2. Post a standard job with no TCN fields.
3. Confirm old flow still works.
4. Post a TCN-supported job.
5. Confirm it saves structured fields.
6. Confirm `visa_friendly` becomes true for structured support.

### Candidate public jobs flow

1. Go to `/jobs`.
2. Filter by TCN friendly.
3. Filter by change-of-employer support.
4. Filter by first-time permit support.
5. Filter by accommodation support.
6. Clear filters.

### Job detail flow

1. Open a normal job.
2. Confirm no unnecessary Permit signal card appears.
3. Open a PermitFit job.
4. Confirm Permit signal card appears.
5. Confirm disclaimer appears.

### Application flow

1. Apply to normal job.
2. Confirm form works without PermitFit fields.
3. Apply to PermitFit job.
4. Fill optional work-status fields.
5. Submit successfully.
6. Confirm application row stores optional fields.

---

## Non-goals

Do not build these in this PR:

- immigration advisor marketplace;
- government API integration;
- document upload workflow;
- paid PermitFit subscriptions;
- admin review queue;
- full evidence-pack PDF;
- complex AI permit scoring;
- public candidate profiles;
- employer CRM rewrite.

Keep this MVP focused and shippable.

## Final completion checklist

Before opening the PR, verify:

- migration added;
- types updated;
- employer post-job form updated;
- `createJob` updated;
- job filters updated;
- job cards updated;
- job detail page updated;
- application form updated;
- `submitApplication` updated;
- PermitFit helpers added;
- tests added;
- safe wording followed;
- `npm run lint` passes;
- `npm test` passes;
- `npm run build` passes.
