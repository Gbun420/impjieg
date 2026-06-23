# Impjieg Work Permit Compliance Console — integrated job-board plan

> Status: Proposed
> Date: 2026-06-23
> Product owner intent: Build the Malta work-permit compliance operating system *inside* Impjieg, not as a separate standalone tool.
> Supersedes: standalone-only direction in `docs/ai-coder/2026-06-11-opencode-permitfit-standalone-instructions.md` for this product track.

## Executive decision

Build the work-permit product as an employer-side premium compliance layer attached to Impjieg job posting, applications, and employer dashboards.

The product should not be a generic immigration tool and should not promise approval. It should help Maltese employers create permit-aware vacancies, collect applicant feedback, track Jobsplus/EURES advertising evidence, build document checklists, and keep an audit trail.

Recommended product name in-app:

- Public/simple: **Permit-ready hiring**
- Product/admin: **Impjieg Work Permit Console**
- Legacy/internal compatibility: keep **PermitFit** as the scoring/readiness signal name if already referenced in code/docs.

## Compliance-safe positioning

Impjieg must use careful language.

Allowed language:

- Work-permit readiness
- Permit-ready vacancy
- Employer-declared TCN support
- Candidate-declared work-status information
- Jobsplus/EURES evidence tracker
- Document readiness checklist
- Applicant feedback log
- Labour Market Test risk signal
- Exportable evidence pack

Forbidden language:

- Guaranteed approval
- Officially compliant
- Government approved
- Permit approved
- Visa approved
- Eligible for work permit
- Legal advice
- Immigration advice

Required disclaimer wherever results or checklists appear:

> Impjieg helps organise employer-declared and candidate-declared hiring information. Impjieg is not a government authority, immigration advisor, or law firm, and does not guarantee permit approval. Employers and applicants remain responsible for verifying current requirements with Identità, Jobsplus, and qualified advisors where needed.

## Regulatory product basis to encode

The product logic should be rule-based and versioned. Do not hard-code copy across UI files without a central constants/config layer.

### Current rules to model in MVP

1. Before hiring new Third-Country Nationals for New or Still Abroad Single Permit routes, employers generally need Jobsplus/EURES vacancy advertising for three weeks within the two months before application submission.
2. KEI, SEI, EU Blue Card, and Skilled Occupation List routes generally use a reduced two-week advertising period.
3. Some categories are exempt from vacancy advertising, including certain health sector, elderly/disability care, regulator-endorsed cases, sportspersons, and change-of-employer applications.
4. Identità document guidance includes common items such as full passport copy, signed Europass CV, health insurance, health screening where required, employment contract, Jobsplus Declaration of Suitability, and proof of advertisement where applicable.
5. First-time Single Permit TCN applicants have a Pre-Departure Course requirement from 2026. The course includes national integration components and, for certain occupations such as tourism/hospitality, sector-specific validation / Skills Pass requirements may apply.
6. Jobsplus Labour Market Test risk includes employer-side compliance factors such as engagement/termination forms, disability quota compliance, termination patterns, and workforce application limits.

Primary source URLs for future maintainers:

- https://identita.gov.mt/second-phase-of-maltas-labour-migration-policy/
- https://identita.gov.mt/expatriates-unit-main-page/noneu-nationals/employment-related-permits/single-permit/documents-required/
- https://identita.gov.mt/expatriates-unit-main-page/noneu-nationals/employment-related-permits/single-permit/expatriates-unit-single-permit-pre-departure-course/
- https://identita.gov.mt/frequently-asked-questions/expatriates/non-eu-employment/
- https://jobsplus.gov.mt/knowledge-base-employer/the-labour-migration-policy-lmp

## Product architecture

### Core concept

A job posting can create one or more `work_permit_cases`.

A case is attached to:

- employer;
- job vacancy;
- optional candidate/application;
- route type;
- advertising evidence;
- applicant feedback;
- documents;
- deadlines;
- risk checks;
- exportable evidence pack.

### Integration points

#### 1. Employer post-job flow

Add a `Work authorisation / permit support` step.

Questions:

- Do you accept TCN / non-EU applicants for this vacancy?
- Which routes can you support?
  - Standard Single Permit
  - Still Abroad
  - Change of Employer
  - Renewal
  - KEI
  - SEI
  - EU Blue Card
  - Skilled Occupation List
  - Unsure
- Must the candidate already be in Malta?
- Do you support relocation?
- Do you support accommodation?
- Do you support Pre-Departure Course / Skills Pass requirements where applicable?
- Do you want Impjieg to create a permit-readiness checklist for this vacancy?

Public-facing output should be limited to clean badges:

- TCN support declared
- Change of employer supported
- First-time permit support
- Relocation support
- Accommodation support
- Permit-ready vacancy

Avoid noisy legal detail on job cards.

#### 2. Public job search and job cards

Extend the existing `visa_friendly` concept but do not remove it immediately.

Recommended filters:

- TCN support declared
- Already in Malta accepted
- Change of employer supported
- First-time permit support
- Relocation support
- Accommodation support

Backward compatibility:

- Existing `jobs.visa_friendly = true` should map to at least `tcn_support_level != none` if new fields are empty.
- Existing public behaviour must not break.

#### 3. Application form

For TCN-supporting jobs, show optional candidate work-status questions:

- What is your current work-authorisation status?
- Are you already in Malta?
- Do you hold a Maltese residence card?
- Do you need a Change of Employer application?
- Are you applying from abroad?
- Have you completed the Pre-Departure Course if required?
- Earliest realistic start date.
- Do you require accommodation or relocation support?

Make these optional at MVP stage to avoid killing conversion.

#### 4. Employer applications dashboard

For each applicant, show:

- PermitFit readiness label;
- missing information;
- candidate work-status declaration;
- start-date risk;
- accommodation/relocation needs;
- recommended next question;
- button: `Create work-permit case`.

#### 5. Work Permit Console dashboard

Route:

```text
/employer/compliance
```

Cards:

- Active permit cases
- Advertising evidence missing
- Advertising window incomplete
- Documents missing
- Pre-Departure / Skills Pass pending
- Renewal deadlines
- High-risk cases
- Evidence packs ready to export

#### 6. Job-level compliance route

Route:

```text
/employer/jobs/[jobId]/compliance
```

Sections:

- Route and requirement summary
- Jobsplus/EURES advertising timer
- Advertisement evidence uploads
- Applicant feedback log
- Candidate/document checklist
- Risk signals
- Export evidence pack

#### 7. Case-level route

Route:

```text
/employer/compliance/[caseId]
```

This is the operating page for a specific permit-readiness file.

## Suggested database migration

Create a new migration under `supabase/migrations`.

```sql
-- 1. Extend jobs with structured TCN support signals
alter table public.jobs
  add column if not exists tcn_support_level text not null default 'none'
    check (tcn_support_level in (
      'none',
      'already_in_malta_only',
      'change_of_employer_supported',
      'first_time_single_permit_supported',
      'full_relocation_supported',
      'unsure'
    )),
  add column if not exists permit_routes_supported text[] not null default '{}',
  add column if not exists requires_candidate_in_malta boolean not null default false,
  add column if not exists supports_accommodation boolean not null default false,
  add column if not exists supports_relocation boolean not null default false,
  add column if not exists supports_pre_departure_course boolean not null default false,
  add column if not exists permit_notes text;

-- 2. Extend applications with candidate-declared work-status signals
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
  add column if not exists candidate_needs_accommodation boolean,
  add column if not exists candidate_needs_relocation boolean,
  add column if not exists permitfit_score integer,
  add column if not exists permitfit_label text,
  add column if not exists permitfit_reasons jsonb;

-- 3. Employer compliance profile
create table if not exists public.employer_compliance_profiles (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null,
  company_size text check (company_size in ('micro','small','medium','large','unknown')) default 'unknown',
  jobsplus_employer_registered boolean default false,
  has_tcn_employees boolean default false,
  estimated_tcn_count integer default 0,
  disability_quota_status text check (disability_quota_status in ('unknown','compliant','non_compliant','not_applicable')) default 'unknown',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Work permit cases
create table if not exists public.work_permit_cases (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null,
  job_id uuid not null,
  application_id uuid,
  candidate_id uuid,
  route_type text not null check (route_type in (
    'standard_single_permit',
    'still_abroad',
    'change_of_employer',
    'renewal',
    'kei',
    'sei',
    'eu_blue_card',
    'skilled_occupation_list',
    'exempt_or_special_case',
    'unknown'
  )),
  case_status text not null default 'draft' check (case_status in (
    'draft',
    'advertising_required',
    'advertising_active',
    'advertising_complete',
    'document_collection',
    'ready_for_review',
    'submitted_externally',
    'approved_externally',
    'rejected_externally',
    'closed'
  )),
  advertising_required boolean not null default true,
  advertising_days_required integer not null default 21,
  advertisement_start_date date,
  advertisement_end_date date,
  application_deadline date,
  predeparture_required boolean not null default false,
  skills_pass_required boolean not null default false,
  health_screening_required boolean not null default false,
  risk_score integer default 0,
  risk_reasons jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. Advertising evidence
create table if not exists public.vacancy_advertising_evidence (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.work_permit_cases(id) on delete cascade,
  platform text not null check (platform in ('impjieg','jobsplus','eures','linkedin','facebook','other')),
  publication_url text,
  publication_date date,
  screenshot_file_url text,
  report_file_url text,
  notes text,
  created_at timestamptz not null default now()
);

-- 6. Applicant feedback log
create table if not exists public.applicant_feedback_logs (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.work_permit_cases(id) on delete cascade,
  application_id uuid,
  applicant_name text,
  applicant_category text check (applicant_category in ('maltese','eu_eea_swiss','tcn_already_in_malta','tcn_still_abroad','unknown')) default 'unknown',
  outcome text check (outcome in ('shortlisted','interviewed','rejected','withdrawn','hired','unknown')) default 'unknown',
  rejection_reason text,
  notes text,
  created_at timestamptz not null default now()
);

-- 7. Permit documents
create table if not exists public.permit_documents (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.work_permit_cases(id) on delete cascade,
  document_type text not null,
  required boolean not null default true,
  status text not null default 'missing' check (status in ('missing','requested','uploaded','verified','rejected','not_applicable')),
  file_url text,
  expiry_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 8. Audit events
create table if not exists public.compliance_audit_events (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.work_permit_cases(id) on delete cascade,
  actor_id uuid,
  event_type text not null,
  event_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
```

RLS must be added according to existing repo conventions. Employers must only access their own compliance profiles, jobs, cases, evidence, documents, and audit events. Admins may access all records according to existing admin role conventions.

## Rule engine

Create:

```text
src/lib/permit-compliance/rules.ts
src/lib/permit-compliance/types.ts
src/lib/permit-compliance/case-status.ts
src/lib/permit-compliance/document-checklists.ts
src/lib/permit-compliance/risk.ts
```

Minimum pure functions:

- `getAdvertisingRequirement(routeType, sector, specialCaseFlags)`
- `getApplicationDeadline(advertisementStartDate, advertisingDaysRequired)`
- `getPermitDocumentChecklist(routeType, candidateStatus, sector)`
- `calculateComplianceRisk(case, evidence, documents, feedback)`
- `getPermitFitResult(jobSignals, applicationSignals)`

Rules must be deterministic and unit-tested. No AI or external APIs in the rule engine.

## UI build order

1. Add constants and types for permit routes/support levels.
2. Add migration and regenerate Supabase types.
3. Update employer job-posting form with structured work-authorisation fields.
4. Update create/update job server actions.
5. Update public job card badges and job detail permit signal card.
6. Update jobs filters for TCN support.
7. Update application form with optional work-status section for TCN-supporting jobs.
8. Update submit application action to store work-status fields.
9. Add PermitFit score utility and tests.
10. Add employer compliance dashboard route `/employer/compliance`.
11. Add job compliance route `/employer/jobs/[jobId]/compliance`.
12. Add case route `/employer/compliance/[caseId]`.
13. Add evidence upload records. Use existing storage conventions if available; otherwise store metadata first and defer file upload.
14. Add applicant feedback log.
15. Add document checklist UI.
16. Add evidence pack export placeholder. Full PDF export can be separate PR.

## Monetization hooks

Do not force pricing in MVP code unless Stripe plans already exist.

Add feature gates/constants so this can become paid:

- Free employer: basic job post, public TCN badge only.
- Pro employer: PermitFit applicant signals.
- Compliance add-on: Work Permit Console, evidence logs, document checklist.
- Agency tier: multiple employers, export packs, case management.

Suggested product copy:

> Permit-ready hiring for Malta employers. Keep vacancy evidence, applicant feedback, and candidate document readiness in one place before you submit anything externally.

## Acceptance criteria

- Employers can create a job with structured TCN/work-authorisation support fields.
- Existing `visa_friendly` jobs remain backward-compatible.
- Public job cards and job detail pages show safe permit-support badges without legal promises.
- Candidates applying to TCN-supporting roles can optionally declare work-status signals.
- Employers can see PermitFit labels on applicants.
- Employers can create a work-permit case from a job/application.
- Case page shows advertising requirement, timer, evidence, applicant feedback, document checklist, and risk signals.
- The app never claims legal eligibility, official compliance, or guaranteed approval.
- Unit tests cover rule engine and wording guardrails.
- `npm run lint`, `npm test`, and `npm run build` pass.

## Non-goals for first integrated PR

- No government portal automation.
- No eID login automation.
- No claim that Impjieg submits applications to Identità or Jobsplus.
- No paid immigration advice.
- No AI decisioning for eligibility.
- No worker-paid placement fees.
- No PDF export in first PR unless trivial.

## Recommended branch / PR

Branch:

```bash
feat/work-permit-compliance-console
```

PR title:

```text
feat: integrate Work Permit Console into employer hiring flow
```

PR body must include:

- Summary of integrated approach.
- Routes changed/added.
- Tables/migrations added.
- Safe wording / disclaimer confirmation.
- Backward compatibility with `visa_friendly`.
- Test/build output.
- Known limitations and official-source caveat.
