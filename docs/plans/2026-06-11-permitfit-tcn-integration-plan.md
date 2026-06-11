# Impjieg PermitFit TCN integration plan

> Status: Proposed
> Purpose: Product, data, and implementation plan for Malta TCN / work-permit hiring support in Impjieg.
> Product name: Impjieg PermitFit™
> Date: 2026-06-11

## Product thesis

Impjieg should move beyond a generic `visa_friendly` flag and build a Malta-specific hiring layer for Third-Country National (TCN) roles.

The core problem is that employers and candidates waste time because work-permit status, start-date risk, permit route, documentation readiness, and employer support are unclear before application.

PermitFit should make these signals visible before candidates apply and before employers waste screening time.

## Compliance-safe positioning

PermitFit is not legal advice, not a government approval, and not a substitute for Identità, Jobsplus, or legal/immigration advisors.

Use wording such as:

- "Permit readiness signal"
- "Employer-declared TCN support"
- "Candidate self-declared work-status information"
- "Start-date risk estimate"
- "Document readiness checklist"

Avoid wording such as:

- "Eligible for permit"
- "Approved for Malta work permit"
- "Guaranteed visa"
- "Government-compliant"

## Current repo fit

Current Impjieg already supports:

- Next.js App Router frontend.
- Supabase backend.
- Employer job posting.
- Public job search and filtering.
- Candidate applications.
- Job cards with salary, work-mode, employer and visa-friendly signals.
- Existing `jobs.visa_friendly` boolean.
- Existing roadmap item for "Visa and work-permit support" under Malta-specific moat.

PermitFit should extend the existing job signal system instead of becoming a separate product.

## MVP scope

### Phase 1: Permit signals on job listings

Add employer-declared fields to jobs:

- `tcn_support_level`
  - `none`
  - `already_in_malta_only`
  - `change_of_employer_supported`
  - `first_time_single_permit_supported`
  - `full_relocation_supported`
- `permit_routes_supported` text array
  - `single_permit`
  - `change_of_employer`
  - `kei`
  - `sei`
  - `seasonal`
  - `student_or_intern`
- `requires_candidate_in_malta` boolean
- `supports_accommodation` boolean
- `supports_relocation` boolean
- `supports_pre_departure_course` boolean
- `permit_notes` text

Public badges:

- `TCN friendly`
- `Already in Malta accepted`
- `Change of employer supported`
- `First-time permit support`
- `Accommodation support`
- `Pre-departure ready role`

### Phase 2: Candidate work-status questions

Add optional candidate fields at application/profile level:

- `work_status`
  - `maltese_or_eu`
  - `tcn_in_malta_with_valid_permit`
  - `tcn_in_malta_needs_change_of_employer`
  - `tcn_outside_malta_needs_first_time_permit`
  - `student_or_other_status`
  - `unknown`
- `current_country`
- `already_in_malta` boolean
- `has_maltese_residence_card` boolean
- `permit_expiry_date`
- `needs_change_of_employer` boolean
- `pre_departure_course_status`
  - `not_required_or_unknown`
  - `not_started`
  - `in_progress`
  - `completed`
- `document_readiness` jsonb
- `earliest_start_date`

### Phase 3: PermitFit score

Calculate a simple non-legal readiness score using employer + candidate signals:

- Work status match.
- Employer support level match.
- Candidate already in Malta.
- Change-of-employer support if needed.
- Pre-departure readiness if first-time permit.
- Salary route signals for SEI/KEI where applicable.
- Accommodation/relocation needs.
- Earliest realistic start date.

Score labels:

- `Strong permit fit`
- `Possible permit fit`
- `Permit risk`
- `Not enough information`

### Phase 4: Employer dashboard and monetization

Employer dashboard should show:

- PermitFit status per applicant.
- Missing information checklist.
- Candidate-declared permit route.
- Start-date risk.
- Accommodation/relocation needs.
- Exportable applicant summary.

Monetization options:

- PermitFit add-on per job.
- PermitFit Pro monthly subscription.
- Labour Market Evidence Pack PDF.
- TCN shortlist service.

## Suggested Supabase migration

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

## UI changes

### Employer post-job form

Replace the single checkbox wording "Visa Friendly (open to work permit sponsorship)" with a structured section:

- Do you accept TCN applicants?
- Must the candidate already be in Malta?
- Do you support change of employer?
- Do you support first-time Single Permit?
- Do you support accommodation?
- Do you support relocation?
- Do you support pre-departure course requirements?
- Add public permit notes.

### Public jobs filter

Replace/extend `Visa friendly only` with:

- TCN friendly only.
- Already in Malta accepted.
- Change of employer supported.
- First-time Single Permit supported.
- Accommodation support.

### Job card

Show only the highest-value badges to avoid clutter:

- TCN friendly.
- Change of employer.
- First-time permit.
- Accommodation.

### Job detail

Add a dedicated `Permit signal` card explaining employer-declared support and a disclaimer that Impjieg does not provide legal advice or permit approval.

### Application form

For TCN-friendly roles, add an optional `Work status` section:

- Are you Maltese/EU or TCN?
- Are you already in Malta?
- Do you already hold a Maltese residence card?
- Do you need a change of employer?
- Have you completed the pre-departure course, if required?
- Earliest realistic start date.

## Implementation order

1. Add constants and type labels for TCN support.
2. Add Supabase migration.
3. Regenerate/update Supabase TypeScript types.
4. Update employer post-job form.
5. Update `createJob` server action.
6. Update public jobs query filters.
7. Update job card badges.
8. Update job detail permit signal card.
9. Update application form TCN fields.
10. Update `submitApplication` server action.
11. Add utility to calculate PermitFit score.
12. Add tests for scoring and form submission.
13. Add docs and legal disclaimer copy.

## Acceptance criteria

- Employers can post a job with structured TCN support data.
- Candidates can filter jobs by specific TCN support level, not just generic visa-friendly.
- Job cards and job detail pages show clear permit support badges.
- Candidates applying to TCN-friendly roles can declare work status.
- Applications store candidate permit readiness fields.
- PermitFit score never claims legal eligibility or approval.
- Existing `visa_friendly` behaviour remains backward compatible.
- Lint, tests and build pass before deployment.

## Notes

Keep the product focused on clarity and matching. Do not build a full immigration case-management system in the first release.
