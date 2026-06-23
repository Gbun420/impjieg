# Codex ownership directive — Work Permit Console

You are not a passive code generator for this task. You are the responsible product engineer for **Impjieg Work Permit Console**.

Your job is to take ownership of the feature from discovery to implementation plan to production-safe PR. Do not wait for Glenn to make low-level engineering decisions that can be resolved by inspecting the repository, following existing patterns, and applying safe product judgement.

## Mission

Build the work-permit compliance operating system directly into Impjieg as an employer-side premium layer around job posting, applications, and employer dashboards.

The goal is not to build a separate immigration product. The goal is to make Impjieg the best Maltese job board for employers who need permit-aware hiring workflows.

The product must help employers:

- declare TCN / work-authorisation support when posting jobs;
- avoid vague `visa friendly` signals;
- track Jobsplus/EURES advertising evidence;
- record applicant feedback;
- collect candidate work-status information;
- build document-readiness checklists;
- create work-permit readiness cases from jobs/applications;
- monitor risk signals;
- export or prepare evidence packs later;
- preserve a clear audit trail.

## Ownership standard

Act like a staff engineer/product owner hybrid.

You must:

1. Audit before editing.
2. Use existing repo patterns instead of inventing a new architecture.
3. Preserve existing job-board flows unless the spec explicitly requires extension.
4. Make safe assumptions when details are missing.
5. Prefer incremental implementation over a giant fragile rewrite.
6. Add tests around business rules and safety wording.
7. Keep legal/compliance language conservative.
8. Leave clear notes where the implementation is intentionally scoped down.
9. Produce a PR that a maintainer can review without guessing what changed.
10. Own the final quality: lint, tests, build, accessibility basics, and mobile layout.

Do not ask for permission for routine implementation decisions. Choose the safest option, document it, and proceed.

## Product truth

The existing standalone PermitFit idea is useful, but it is not enough. The new strategic direction is integrated:

- job posting creates permit signals;
- applications collect candidate work-status signals;
- employer dashboard shows PermitFit readiness;
- employer can open/create compliance cases;
- Work Permit Console tracks evidence, documents, feedback, deadlines, and risk.

Use `PermitFit` as the readiness/scoring layer if useful, but the larger product is **Work Permit Console**.

## Hard non-negotiables

### 1. No legal promises

Never imply that Impjieg grants, guarantees, approves, validates, certifies, or legally confirms a work permit.

Forbidden wording in UI, tests, docs, and constants:

- approved
- guaranteed
- government-approved
- officially compliant
- eligible for permit
- visa approved
- permit approved
- legal advice
- immigration advice

Allowed wording:

- readiness signal
- permit-ready
- support declared
- evidence tracker
- document readiness
- risk signal
- applicant feedback log
- employer-declared information
- candidate-declared information

Required disclaimer on all Work Permit Console / PermitFit pages:

> Impjieg helps organise employer-declared and candidate-declared hiring information. Impjieg is not a government authority, immigration advisor, or law firm, and does not guarantee permit approval. Employers and applicants remain responsible for verifying current requirements with Identità, Jobsplus, and qualified advisors where needed.

### 2. No government automation in this PR

Do not automate:

- Jobsplus portal submission;
- EURES submission;
- Identità submission;
- eID login;
- government scraping that risks account or legal issues.

MVP should track evidence and guide the employer, not impersonate the employer or submit externally.

### 3. No worker-paid placement fees

Do not build monetization that charges candidates for getting a job or being placed. Candidate-side tools may be free or informational. Revenue comes from employers, agencies, and premium employer-side workflow.

### 4. Keep existing Impjieg usable

Existing public job browsing, applications, employer job posting, and admin functionality must not be broken. If a migration or UI change risks breaking existing flows, build a compatibility layer.

## Mandatory repo audit

Before coding, inspect and note the current implementation patterns for:

- `package.json` scripts;
- Supabase client/server helpers;
- existing migrations;
- existing RLS patterns;
- job create/edit server actions;
- application submit server action;
- employer dashboard routes;
- job card and job detail components;
- application dashboard components;
- existing `visa_friendly` implementation;
- constants/types patterns;
- test conventions.

Do not assume file names. Search the repo and follow actual structure.

In the PR body, include a short **Repo audit summary** listing the key files touched and why.

## Implementation strategy

Implement in safe vertical slices. Do not attempt a chaotic all-at-once rewrite.

### Slice 1 — Rule engine and types

Create a new isolated module:

```text
src/lib/permit-compliance/
```

Recommended files:

```text
constants.ts
types.ts
rules.ts
document-checklists.ts
risk.ts
permitfit.ts
copy-safety.ts
index.ts
```

The module must be pure TypeScript, deterministic, and testable.

Minimum exported functions:

```ts
getAdvertisingRequirement(input)
getPermitDocumentChecklist(input)
calculateComplianceRisk(input)
calculatePermitFit(input)
assertSafePermitCopy(text)
```

Minimum route types:

```ts
standard_single_permit
still_abroad
change_of_employer
renewal
kei
sei
eu_blue_card
skilled_occupation_list
exempt_or_special_case
unknown
```

Minimum support levels:

```ts
none
already_in_malta_only
change_of_employer_supported
first_time_single_permit_supported
full_relocation_supported
unsure
```

Business rules to encode:

- standard New / Still Abroad route generally requires 21 advertising days;
- KEI / SEI / EU Blue Card / Skilled Occupation List generally require 14 advertising days;
- Change of Employer is advertising-exempt for this checklist logic;
- if advertising is required but evidence is missing, return risk;
- if applicant feedback is missing after vacancy closure, return risk;
- if document checklist has required missing documents, return risk;
- if candidate work status is unknown, PermitFit returns `Not enough information`;
- if employer has no TCN support and candidate needs TCN support, PermitFit returns risk;
- if candidate route and employer support match, PermitFit returns possible/strong signal.

### Slice 2 — Tests first for the business rules

Add unit tests before deep UI integration.

Minimum tests:

1. Standard route returns 21-day requirement.
2. KEI route returns 14-day requirement.
3. SEI route returns 14-day requirement.
4. EU Blue Card route returns 14-day requirement.
5. Change of Employer route returns advertising not required.
6. Missing advertising evidence creates risk when advertising is required.
7. Missing applicant feedback creates risk after vacancy closure.
8. Unknown candidate status returns `Not enough information`.
9. TCN candidate + employer support `none` returns permit risk.
10. Matching change-of-employer support returns possible/strong result.
11. Copy safety catches forbidden wording.
12. Generated summaries do not include forbidden wording.

Use the repository's existing test framework. Do not introduce a new test runner.

### Slice 3 — Database migration

Create a Supabase migration following existing naming conventions.

Implement tables/fields from:

```text
docs/plans/2026-06-23-work-permit-compliance-console-integrated-plan.md
```

Minimum migration scope:

- extend `jobs` with structured TCN support fields;
- extend `applications` with optional candidate work-status fields;
- create `employer_compliance_profiles`;
- create `work_permit_cases`;
- create `vacancy_advertising_evidence`;
- create `applicant_feedback_logs`;
- create `permit_documents`;
- create `compliance_audit_events`.

RLS:

- Employers can only read/write their own compliance records.
- Candidates can only submit/update their own candidate-declared application data according to existing application patterns.
- Admins follow existing admin conventions.

If the repo has no clear RLS convention for a table type, implement the safest restrictive policy and document it in the PR.

### Slice 4 — Backward compatibility layer

Do not remove `visa_friendly`.

Add helper logic:

```ts
getJobPermitSignals(job)
```

Behaviour:

- if new structured fields exist, use them;
- if new fields are empty but `visa_friendly = true`, show a generic safe signal such as `Work-authorisation support declared`;
- never infer specific route support from old `visa_friendly` alone.

### Slice 5 — Employer post-job integration

Add a work-authorisation section to the employer job form.

UX principle:

- simple defaults;
- no legal jargon overload;
- contextual help text;
- safe copy;
- mobile-friendly layout.

Fields:

- Does this role accept TCN / non-EU applicants?
- TCN support level.
- Supported routes.
- Candidate must already be in Malta.
- Accommodation support.
- Relocation support.
- Pre-Departure Course / Skills Pass support.
- Public permit notes.

Persist via existing server actions. Validate with Zod or existing validation conventions.

### Slice 6 — Public jobs integration

Update job cards and job details.

Show only high-value badges:

- TCN support declared
- Change of employer supported
- First-time permit support
- Relocation support
- Accommodation support

Job detail page should have a `Permit support signal` card explaining that the information is employer-declared.

Do not crowd the UI.

### Slice 7 — Application flow integration

Only show extra candidate questions when the job has declared work-authorisation/TCN support.

Fields should be optional for MVP:

- current work status;
- already in Malta;
- Maltese residence card;
- needs change of employer;
- applying from abroad;
- pre-departure status;
- earliest start date;
- accommodation/relocation needs.

Persist to `applications`.

Run PermitFit calculation server-side where the application is created/updated.

### Slice 8 — Employer applicant review

In employer applications views, show:

- PermitFit label;
- score if available;
- positive signals;
- risk/missing signals;
- next suggested question;
- button to create/open work-permit case.

Do not bury the normal recruitment workflow. PermitFit is an enhancer, not a replacement for applicant review.

### Slice 9 — Work Permit Console dashboard

Add route:

```text
/employer/compliance
```

Dashboard sections:

- active cases;
- cases missing advertising evidence;
- cases with incomplete advertising windows;
- documents missing;
- applicant feedback missing;
- Pre-Departure / Skills Pass pending;
- high-risk cases;
- recently updated cases.

Empty state:

> Create a permit-readiness case from a TCN-supporting job or applicant to start tracking evidence, documents, feedback, and risk signals.

### Slice 10 — Job compliance page

Add route:

```text
/employer/jobs/[jobId]/compliance
```

Sections:

- job permit-support summary;
- route selection;
- advertising requirement and timer;
- Jobsplus/EURES evidence table;
- applicant feedback log;
- candidate/document checklist;
- risk signal panel;
- create/open case action.

### Slice 11 — Case page

Add route:

```text
/employer/compliance/[caseId]
```

Sections:

- case status;
- linked job;
- linked applicant if any;
- route and checklist summary;
- advertising evidence;
- applicant feedback;
- permit documents;
- audit timeline;
- external submission status field.

External submission statuses must be worded carefully:

- not submitted externally;
- prepared for external submission;
- submitted externally by employer;
- outcome recorded externally.

Avoid `approved` unless the field is explicitly external and factual. Prefer `outcome recorded externally` in MVP.

### Slice 12 — Audit events

Add audit events for important actions:

- case created;
- route changed;
- evidence added;
- feedback added;
- document status changed;
- risk recalculated;
- case status changed.

Audit trail must not expose private data publicly.

## UI quality bar

The UI should feel like Impjieg, not a government form dump.

Design rules:

- short labels;
- tooltips/help copy for complex terms;
- progressive disclosure;
- calm risk warnings;
- no scary red unless genuinely blocking;
- mobile-first;
- accessible form labels;
- keyboard-friendly controls;
- loading and empty states;
- no dead buttons.

## Error handling

For every server action:

- validate input;
- check ownership/permissions;
- return useful error messages;
- do not leak private data;
- log/audit important state changes.

If a write fails, preserve the user's entered form state where possible.

## Security and privacy

Treat work-permit data as sensitive.

- Do not expose permit documents publicly.
- Do not put sensitive document contents in logs.
- Do not show candidate work-status details to unauthorised employers.
- Use strict RLS.
- Keep candidate-declared fields clearly labelled as self-declared.
- Do not store more than needed in MVP.

## Commercial ownership

Build with monetization in mind, but do not block MVP behind billing unless existing Stripe infrastructure makes it easy.

Feature gates should be ready for:

- free/basic employer: public badge only;
- pro employer: PermitFit applicant signal;
- compliance add-on: Work Permit Console;
- agency tier: multi-case management and exports.

Do not hard-code prices in UI unless there is already a pricing system pattern.

## PR discipline

Open a PR titled:

```text
feat: integrate Work Permit Console into employer hiring flow
```

PR body must include:

- Product summary.
- Repo audit summary.
- Implementation phases completed.
- Files/routes changed.
- Database migration summary.
- RLS/security notes.
- Safe wording/disclaimer confirmation.
- Backward compatibility note for `visa_friendly`.
- Test results.
- Manual QA checklist results.
- Known limitations.
- Follow-up issues recommended.

## Done means done

Do not call the feature done unless:

- `npm run lint` passes;
- `npm test` passes;
- `npm run build` passes;
- unit tests cover permit rules;
- forbidden wording tests pass;
- existing non-TCN job posting still works;
- existing public job browsing still works;
- application submission still works;
- employer can create and view a compliance case;
- risk signals appear when required evidence/documents/feedback are missing;
- disclaimer appears on Work Permit Console / PermitFit surfaces.

If you cannot complete all slices in one PR, ship the safest coherent vertical slice and clearly mark incomplete items as follow-up tasks in the PR body. Do not silently leave half-wired UI.

## If blocked

If blocked by missing schema knowledge, unclear Supabase conventions, or existing broken tests:

1. Do not guess dangerously.
2. Implement the safe isolated layer first.
3. Document the blocker precisely.
4. Leave the codebase better than you found it.
5. Add a follow-up checklist.

Never leave broken main flows.

## Final instruction

Take ownership. Build the product as if you will be responsible for supporting it after launch. Keep the business goal in mind: Impjieg should become Malta's most useful job board for employers who need permit-aware hiring, without pretending to be Identità, Jobsplus, or a law firm.
