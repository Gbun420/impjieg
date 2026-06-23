# Codex instructions — integrate Work Permit Console into Impjieg

You are an autonomous senior full-stack engineer working inside the GitHub repository `Gbun420/impjieg`.

Your task is to implement **Impjieg Work Permit Console** as an integrated employer-side feature inside the existing job board, not as a separate standalone pilot.

This instruction file supersedes the standalone-only PermitFit pilot direction for this product track.

## Read first

Read these files before editing:

1. `README.md`
2. `package.json`
3. `docs/plans/2026-06-11-permitfit-tcn-integration-plan.md`
4. `docs/plans/2026-06-23-work-permit-compliance-console-integrated-plan.md`
5. `src/lib/constants.ts`
6. Existing employer routes under `src/app/employer`
7. Existing application actions under `src/lib/actions`
8. Existing Supabase types/migrations conventions

## Objective

Turn Impjieg into a Malta permit-aware hiring platform by adding:

- structured TCN / work-authorisation fields to job posting;
- TCN support badges and filters on jobs;
- optional candidate work-status fields during application;
- PermitFit applicant signal in employer dashboards;
- Work Permit Console routes for employers;
- Jobsplus/EURES advertising evidence tracking;
- applicant feedback logging;
- candidate document checklist;
- safe compliance-risk signals;
- audit events.

## Safety rules

Do not use words or UI copy that imply official approval or legal advice.

Forbidden wording:

- approved
- guaranteed
- officially compliant
- government approved
- visa approved
- permit approved
- eligible for permit

Allowed wording:

- permit-ready
- readiness signal
- employer-declared support
- candidate-declared status
- evidence tracker
- document readiness
- risk signal
- checklist

Every Work Permit Console page and PermitFit result must include this disclaimer:

> Impjieg helps organise employer-declared and candidate-declared hiring information. Impjieg is not a government authority, immigration advisor, or law firm, and does not guarantee permit approval. Employers and applicants remain responsible for verifying current requirements with Identità, Jobsplus, and qualified advisors where needed.

## Technical constraints

- Use Next.js App Router patterns already present in the repo.
- Use existing UI primitives and Tailwind conventions.
- Use Supabase patterns already present in the repo.
- Do not introduce unnecessary dependencies.
- Do not break existing public job browsing or application flows.
- Keep `visa_friendly` backward-compatible.
- Rule engine must be deterministic, testable TypeScript. No AI/external API calls.

## Implementation phases

### Phase 1 — Constants, types, rule engine

Add:

```text
src/lib/permit-compliance/constants.ts
src/lib/permit-compliance/types.ts
src/lib/permit-compliance/rules.ts
src/lib/permit-compliance/document-checklists.ts
src/lib/permit-compliance/risk.ts
src/lib/permit-compliance/permitfit.ts
src/lib/permit-compliance/index.ts
src/lib/permit-compliance/*.test.ts
```

Minimum route/support values:

- `standard_single_permit`
- `still_abroad`
- `change_of_employer`
- `renewal`
- `kei`
- `sei`
- `eu_blue_card`
- `skilled_occupation_list`
- `exempt_or_special_case`
- `unknown`

Minimum TCN support levels:

- `none`
- `already_in_malta_only`
- `change_of_employer_supported`
- `first_time_single_permit_supported`
- `full_relocation_supported`
- `unsure`

Implement pure functions:

```ts
getAdvertisingRequirement(input)
getPermitDocumentChecklist(input)
calculateComplianceRisk(input)
calculatePermitFit(input)
assertSafePermitCopy(text)
```

Test at least:

- standard route requires 21 advertising days;
- KEI/SEI/EU Blue Card/skilled route requires 14 advertising days;
- change-of-employer returns advertising exempt;
- missing evidence creates risk signal;
- missing applicant feedback creates risk signal;
- forbidden wording checker catches unsafe copy;
- PermitFit does not return legal approval language.

### Phase 2 — Supabase migration

Create a migration based on the schema in:

```text
docs/plans/2026-06-23-work-permit-compliance-console-integrated-plan.md
```

Add/extend:

- job TCN support fields;
- application candidate work-status fields;
- `employer_compliance_profiles`;
- `work_permit_cases`;
- `vacancy_advertising_evidence`;
- `applicant_feedback_logs`;
- `permit_documents`;
- `compliance_audit_events`.

Use existing RLS conventions. Employers must only access their own compliance records. Admins follow existing admin-role conventions.

### Phase 3 — Employer post-job integration

Update employer job create/edit flow.

Add a work-authorisation step with:

- accept TCN applicants;
- support level;
- routes supported;
- must already be in Malta;
- accommodation support;
- relocation support;
- pre-departure support;
- permit notes.

Persist fields in existing job server actions.

Backwards compatibility:

- Existing `visa_friendly` stays available.
- If `visa_friendly = true` and new TCN fields are empty, infer a generic TCN support badge without making legal claims.

### Phase 4 — Public job surfaces

Update:

- public job cards;
- job detail page;
- jobs filters.

Add safe badges:

- TCN support declared
- Change of employer supported
- First-time permit support
- Relocation support
- Accommodation support

Add job detail card:

```text
Permit support signal
```

Include disclaimer.

### Phase 5 — Application form integration

For TCN-supporting jobs, show optional work-status fields:

- current status;
- already in Malta;
- residence card;
- change of employer needed;
- applying from abroad;
- pre-departure status;
- earliest realistic start date;
- accommodation/relocation needs.

Persist these to `applications`.

Calculate and store `permitfit_score`, `permitfit_label`, and `permitfit_reasons` server-side.

### Phase 6 — Employer application dashboard

Show PermitFit signal per applicant:

- label;
- score if available;
- positive signals;
- risk/missing signals;
- next suggested question;
- `Create work-permit case` button.

### Phase 7 — Work Permit Console routes

Add:

```text
src/app/employer/compliance/page.tsx
src/app/employer/compliance/[caseId]/page.tsx
src/app/employer/jobs/[jobId]/compliance/page.tsx
```

Dashboard `/employer/compliance`:

- active cases;
- missing evidence;
- incomplete advertising windows;
- missing documents;
- pending Pre-Departure / Skills Pass;
- high risk cases;
- ready-to-export cases.

Job-level page `/employer/jobs/[jobId]/compliance`:

- route summary;
- advertising timer;
- evidence table;
- applicant feedback log;
- document checklist;
- risk signals;
- create case / link case.

Case page `/employer/compliance/[caseId]`:

- case status;
- evidence;
- applicant feedback;
- documents;
- timeline/audit events;
- external-submission status field.

### Phase 8 — Evidence and document UX

MVP can store metadata first if file upload conventions are unclear.

Evidence records:

- platform;
- publication URL;
- publication date;
- notes;
- optional screenshot/report URL.

Documents:

- document type;
- required/not required;
- status;
- expiry date;
- notes;
- optional file URL.

### Phase 9 — Tests and QA

Before final PR:

```bash
npm run lint
npm test
npm run build
```

Also manually test:

1. Existing non-TCN job posting still works.
2. Existing `visa_friendly` jobs still display safely.
3. Employer can create a TCN-supporting job.
4. TCN-supporting job shows safe badges.
5. Candidate can apply with optional work-status fields.
6. Employer sees PermitFit result.
7. Employer can open `/employer/compliance`.
8. Employer can create/open a case.
9. Missing Jobsplus/EURES evidence creates a risk signal.
10. Forbidden wording is absent from UI.

## Branch and PR

Create branch:

```bash
git checkout -b feat/work-permit-compliance-console
```

Open PR:

```text
feat: integrate Work Permit Console into employer hiring flow
```

PR body must include:

- Summary
- Routes added/changed
- Database migration summary
- Safe wording/disclaimer confirmation
- Backward compatibility with `visa_friendly`
- Test output
- Known limitations

## Non-goals

Do not build in the first PR:

- Identità automation;
- Jobsplus portal automation;
- eID login automation;
- legal advice marketplace;
- government API integration;
- PDF export unless trivial;
- AI eligibility decisions;
- worker-paid job placement fees.
