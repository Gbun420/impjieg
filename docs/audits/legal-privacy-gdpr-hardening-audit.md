# Legal, privacy, GDPR, and data-handling hardening audit

> **Status:** Draft
> **Purpose:** Audit Impjieg’s legal documentation, privacy posture, GDPR documentation, cookie/tracker handling, terms, data-handling records, and compliance gaps.
> **Audience:** Maintainers, legal reviewer, security, product, and implementation agents.
> **Last reviewed:** 2026-06-06
> **Owner:** Impjieg maintainers
> **Legal review required:** Yes

## Executive Summary

**Final status:** LEGAL REVIEW REQUIRED

Impjieg already has public Privacy, Terms, and Cookie pages, plus some useful security and recruitment controls in code. However, the legal surface is incomplete for a recruitment marketplace that handles candidate CVs, employer data, applications, job alerts, admin records, AI-assisted content, payments, and future background checks.

### Public legal pages found

- `/privacy`
- `/terms`
- `/cookies`
- redirect aliases:
  - `/privacy-policy` -> `/privacy`
  - `/terms-of-service` -> `/terms`
  - `/cookie-policy` -> `/cookies`

### Missing or incomplete legal surfaces

- Footer does not link to `/cookies`.
- No public employer privacy notice.
- No public candidate privacy notice.
- No public AI notice.
- No public background-check policy.
- No public acceptable use policy.
- No public DPA template or processor terms.
- No public subprocessor register.
- No public data retention policy.
- No public DSAR/deletion/export process page.
- No public breach-response notice.

### High-risk processing areas

- Candidate CVs, applications, and profile data.
- Employer profiles and job postings.
- Job alerts and unsubscribe handling.
- AI job description generation and AI screening/match scoring.
- Admin access and admin audit logs.
- Payments and commercial grants.
- Cookies/tracking claims that are broader than the runtime implementation.
- Future background-check / Conduct Certificate workflows.

### Immediate blockers

- Public legal pages are too generic for the actual data flows.
- Footer discoverability is incomplete because `/cookies` is not linked.
- Internal compliance records (ROPA, DPA/subprocessor register, retention, DSAR, breach plan, TOMs) are missing as first-class docs.
- AI and background-check legal notices are not yet published.

### Legal review items

- Controller/processor role split for employer-facing recruitment flows.
- Whether any AI screening functionality crosses into profiling/automated decision-making disclosures.
- Whether planned background-check handling is permissible in Malta/EU and under what consent/legal basis.
- Retention periods for CVs, applications, admin logs, analytics, and payment records.
- Subprocessor and transfer position for Supabase, Vercel, Stripe, Resend, Groq, and any future analytics or WhatsApp provider.

## Public Legal Pages Inventory

| Page / route | Exists | Visible in footer | Last updated shown | Covers candidates | Covers employers | Covers job alerts | Covers payments | Covers AI | Covers cookies/tracking | Covers background checks | Status | Notes |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| `/privacy` | Yes | No | Yes | Partial | Partial | Partial | Partial | No | Partial | No | Needs changes | Good baseline, but missing AI, admin logs, background checks, and detailed processing inventory. |
| `/terms` | Yes | No | Yes | Partial | Yes | Partial | Yes | Partial | No | No | Needs changes | Covers platform role and some employer/candidate duties, but not AI, background checks, AUP, or full billing/commercial-grant rules. |
| `/cookies` | Yes | No | Yes | No | No | Indirect | No | No | Partial | No | Needs changes | Mentions consent and third-party cookies, but runtime tracking is minimal and there is no cookie table or script gating detail. |
| `/privacy-policy` | Alias | No | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | OK | Redirect only. |
| `/terms-of-service` | Alias | No | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | OK | Redirect only. |
| `/cookie-policy` | Alias | No | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | OK | Redirect only. |

## Data Processing Inventory

| Processing activity | Data subjects | Personal data categories | Special / criminal data | Purpose | Lawful basis candidate | Recipients / processors | Retention period | User rights supported | Security controls | Gaps |
|---|---|---|---|---|---|---|---|---|---|---|
| Account registration / login | Candidates, employers, admins | Email, password hash, role metadata, session cookies | No | Authenticate users and protect accounts | Contract / legitimate interests / consent where applicable | Supabase | Until account deletion, subject to legal retention | Access, erasure, rectification, portability | Auth cookies, admin session cookie, MFA for admins | Privacy notice is generic and does not explain all role-specific flows. |
| Candidate profile | Candidates | Name, headline, bio, phone, location, website, LinkedIn, skills, experience, salary expectations, work preferences | Potentially sensitive context in free text | Build candidate profile and matching | Contract / consent / legitimate interests | Supabase | Needs legal review | Access, rectification, erasure, portability | RLS, authenticated access | No candidate-specific privacy notice or retention schedule. |
| CV / resume upload or parsing | Candidates | CV file, extracted resume text, inferred skills, work history, contact data | Potentially sensitive if resume reveals health, union, ethnicity, etc. | Let candidates apply and populate profiles | Contract / consent | Supabase, AI vendor if parsing | Needs legal review | Access, erasure, portability | Private storage, auth, server-side upload checks | No dedicated resume/CV retention policy or AI disclosure page. |
| Job applications | Candidates, employers | Application data, cover letter, CV link, notes, status, employer/job linkage | Could include special-category data if supplied voluntarily | Route applications to employers | Contract / legitimate interests | Supabase, employer dashboard | Needs legal review | Access, rectification, erasure, objection | RLS, protected employer views | No employer-facing privacy notice describing controller split. |
| Saved jobs | Candidates | Saved job IDs, timestamps | No | Personal bookmarking | Contract / legitimate interests | Supabase | Needs legal review | Access, erasure | RLS | Not described in public privacy notice. |
| Job alerts / newsletter-style alerts | Candidates | Email, sectors, job types, location, salary minimum, frequency, WhatsApp/email preference | No | Send matched jobs and reminders | Consent / contract depending design | Supabase, Resend, WhatsApp provider if used | Needs legal review | Withdraw consent, erasure | Token-only unsubscribe, service-role gated updates | Privacy and cookie pages do not fully explain alert lifecycle or provider chain. |
| Employer account / company profile | Employers | Company name, description, website, logo, location, verification data, notifications | No | Let employers post jobs and manage listings | Contract | Supabase | Needs legal review | Access, rectification, erasure | RLS, authenticated employer routes | No employer privacy notice or controller/processor explanation. |
| Job posting | Employers | Job title, description, salary, sector, location, skills, application channel | No | Publish vacancies | Contract | Supabase | Needs legal review | Access, rectification | Sanitized descriptions, slug uniqueness | No detailed acceptable-use policy for illegal/discriminatory postings. |
| Applicant management | Employers | Candidate applications, profile snippets, CV access, notes, screening services | Could contain special-category data if candidates provide it | Recruitment workflow | Legitimate interests / contract / employer controller responsibilities | Supabase, AI vendor if used | Needs legal review | Access, erasure, objection | Protected employer routes, audit logs | Role split and employer obligations need clearer legal wording. |
| AI job description generation | Employers / admins | Prompt text, job description inputs, generated output | No, unless users submit sensitive content | Draft job ads | Consent / contract / legitimate interests | Groq (current code) | Needs legal review | Access, objection, deletion of logs where possible | Auth, rate limit, prompt sanitization | No public AI notice; no vendor DPA/subprocessor page. |
| AI resume parsing / screening / match scoring | Candidates, employers | Resume text, job data, candidate profile data, match analysis | Could expose special-category data if user inputs it | Assist with matching and parsing | Legitimate interests / consent / contract depending feature | Groq (current code) | Needs legal review | Access, objection, erasure | Auth, rate limit, request-size caps | High legal sensitivity; no formal AI processing notice or automated-decision disclaimer page. |
| Contact form | Site visitors | Name, email, message | No | Support and inquiries | Contract / legitimate interests | Email provider / inbox | Needs legal review | Access, erasure | Form validation | Public notice does not clearly separate support email processing from marketing. |
| Admin dashboard | Admins | Admin email, action logs, entity IDs, IP/user-agent, operational metrics | No | Operate the platform and security oversight | Legitimate interests / legal obligation | Supabase, hosting | Needs legal review | Access by admin role only | MFA, protected routes, audit logs | Privacy notice does not disclose admin/security logging clearly. |
| Commercial grants / free credits | Employers, admins | Grant records, audit logs, entitlement state, discount metadata | No | Commercial entitlements and support | Contract / legitimate interests | Supabase | Needs legal review | Access, rectification | Admin-only surfaces, audit logs | No dedicated commercial-grants terms or privacy note. |
| Payments / Stripe checkout | Employers | Billing contact, order metadata, payment status, identifiers | No | Process listing and add-on payments | Contract / legal obligation / legitimate interests | Stripe, Supabase | 7 years likely for accounting, subject to legal review | Access, rectification, deletion where not legally retained | Provider checkout, secure server routes | Public terms and privacy copy are too generic for payment/order retention. |
| Web analytics | Visitors | Pages visited, sessions, referrers, device/browser metadata | Usually no, but can become personal data | Measure site usage | Consent for non-essential tracking | Not currently evident in runtime | Needs legal review | Withdraw consent | Cookie banner exists | Policy mentions analytics/marketing cookies, but code does not show actual tracker gating. |
| Cookies / localStorage / sessionStorage | Visitors, users | Consent prefs, session tokens, theme prefs | No | Site functionality and consent prefs | Necessary / consent | Browser storage, Supabase auth cookies | Variable | Withdraw consent, manage preferences | Cookie banner, localStorage consent state | No cookie table; footer missing cookie link; runtime does not show external tracker gating. |
| Background checks / Conduct Certificate future flow | Candidates, employers | Check requests, consent, documents, status, audit metadata | Yes, potentially Article 10 / criminal-conviction data | Role-specific screening | Legal basis requires lawyer review | Future processor / storage | Needs legal review | Access, erasure where lawful | Private storage, signed URLs, audit logging | No public policy; high-risk flow needs strict controls before launch. |
| Audit logs | Admins, users | Actor, entity, timestamps, IP/user agent, before/after values | No | Security / accountability | Legitimate interests / legal obligation | Supabase | Needs legal review | Access / correction limited | Restricted admin access, logs | Not disclosed clearly in public privacy notice. |
| Security logs | Users, admins | Auth events, request metadata, error traces | No | Security monitoring and incident response | Legitimate interests / legal obligation | Hosting / app logs | Needs legal review | Limited rights due to security necessity | Protected routes, MFA, audit trail | No separate security/privacy notice. |

## Controller / Processor Role Map

Likely roles, subject to legal review:

- Impjieg is the controller for platform accounts, candidate profiles, job alerts, public marketplace operations, admin operations, security logging, and site analytics.
- Employers are likely independent controllers for the candidate data they receive through applications and ATS-style workflows.
- Some employer-facing recruitment workflows may create a processor or joint-controller relationship depending on the contract and actual instructions.
- Future background-check processing must be treated as a separate legal analysis because criminal-conviction data is highly restricted.

## Processor and Subprocessor Register

| Vendor | Service | Data processed | Purpose | Role | Location / transfer risk | DPA needed | Privacy link placeholder | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|
| Supabase | Auth, database, storage | Account, profile, application, log data | Core platform backend | Processor | Check hosting region and transfer terms | Yes | Required | Likely active | Needs explicit DPA record and retention mapping. |
| Vercel | Hosting / edge / deployment | Site and request metadata, logs | App hosting and delivery | Processor | Check region and subprocessors | Yes | Required | Likely active | Confirm runtime log handling and DPA status. |
| Stripe | Payments | Billing and checkout metadata | Payment processing | Processor / independent controller for some payment data | Cross-border processing likely | Yes | Required | Likely active | Billing retention must align with accounting law. |
| Resend or email provider | Transactional email | Recipient email, subject, content | Emails and notifications | Processor | Transfer risk depends on provider region | Yes | Required | Likely active | No public subprocessor entry yet. |
| Groq / AI provider | AI text generation / parsing | Prompts, CV text, job text | AI job description generation and parsing | Processor | Transfer risk likely | Yes | Required | Active in code | Needs AI-specific notice and vendor record. |
| Twilio / WhatsApp provider | Messaging | Phone numbers, message content | WhatsApp notifications | Processor | Transfer risk likely | Yes | Required if used | Optional / future | Not clearly disclosed in public policy. |
| Analytics provider | Web analytics | Page views, device metadata | Usage analytics | Processor | Depends on vendor | Yes | Required if enabled | Not evident in code | Must not be enabled before consent if non-essential. |

## Legal Document Gaps

Missing or not yet created as first-class docs:

- Candidate Privacy Notice
- Employer Privacy Notice
- Cookie Policy that matches runtime behavior
- Terms and Conditions hardening for recruitment use
- Employer Terms
- Candidate Terms
- Acceptable Use Policy
- Data Processing Addendum draft
- Subprocessor List
- Data Retention Policy
- DSAR / data subject rights process
- Breach Response Plan
- Security Measures / TOMs
- AI Processing Notice
- Background Checks Policy
- Commercial Grants / Free Trial Terms

## Cookie / Tracking Audit

Observed runtime state:

- Cookie consent banner exists.
- Consent preferences are stored in localStorage under `impjieg_cookie_consent`.
- No obvious analytics or marketing trackers are currently wired in the `src` tree.
- No consent listener currently gates actual third-party scripts because no third-party analytics script is present in the runtime code inspected.

Gaps:

- `/cookies` discusses analytics and marketing cookies, but the runtime does not expose a cookie table mapping those claims to actual scripts.
- Footer does not link to `/cookies`.
- The banner offers accept/reject/customize, but the project does not yet show a consent-to-script enforcement layer for future trackers.
- The policy should separate necessary cookies from future optional cookies more explicitly.

## AI / Privacy Audit

Observed:

- AI job description generation is authenticated and rate-limited.
- AI resume parsing is authenticated and rate-limited.
- AI match scoring is authenticated and rate-limited.
- The code uses Groq directly.
- Prompts are sanitised and length-limited.

Gaps:

- No public AI notice.
- No explicit disclosure that AI output is decision support only.
- No explicit statement that Impjieg does not make automated hiring decisions.
- No retention policy for prompts/outputs.
- No processor/subprocessor entry for the AI vendor.
- No visible candidate/employer transparency statement for AI-assisted screening.

## Background Checks Audit

Observed:

- The repository contains a draft implementation plan for background checks.
- The codebase already has `screening_services` and paid screening-related checkout paths.

Gaps / concerns:

- No public background-check policy exists.
- No clear Article 10 warning is published on the public site.
- The current product copy includes a background-check upsell, which increases legal sensitivity.
- Conduct Certificate handling must stay restricted, consent-based, and lawyer-reviewed before launch.

## Security / Legal Operational Documents

Missing internal operational docs:

- Breach response plan
- DSAR workflow
- Retention schedule
- Access-control policy
- Admin audit-log policy
- Vendor review process
- DPIA trigger matrix
- Security measures / TOMs

## Findings

| ID | Severity | Area | File / route | Problem | Legal risk | Recommended fix | Requires lawyer review | Acceptance criteria |
|---|---|---|---|---|---|---|---|---|
| LPA-001 | High | Public navigation | `src/components/layout/footer.tsx` | Footer links to Privacy and Terms, but not Cookies. | Cookie consent and transparency pages are harder to discover. | Add a visible Cookies link in the footer. | No | Footer includes Privacy, Terms, and Cookies. |
| LPA-002 | High | Privacy notice completeness | `src/app/privacy/page.tsx` | Privacy policy is generic and omits several recruitment-specific processing disclosures. | GDPR Article 13 transparency gaps. | Expand the notice for candidates, employers, admin/security logs, AI, job alerts, and background checks. | Yes | Public privacy notice covers all key processing activities, rights, recipients, retention, and AI/background-check disclosures. |
| LPA-003 | High | Terms completeness | `src/app/terms/page.tsx` | Terms do not fully cover AI, background checks, acceptable use, free trials/commercial grants, or detailed recruitment conduct rules. | Contractual and consumer-law ambiguity. | Add recruitment-specific terms and a separate acceptable use section. | Yes | Terms clearly define platform role, employer responsibilities, candidate conduct, AI limits, and prohibited content. |
| LPA-004 | High | Cookie/tracker governance | `src/app/cookies/page.tsx`, `src/components/cookie-consent-banner.tsx`, `src/hooks/use-cookie-consent.ts` | Cookie policy mentions analytics/marketing cookies, but runtime code does not show actual tracker gating or a cookie table. | Consent wording may outpace implementation if analytics/marketing tools are added. | Publish an accurate cookie table and wire script gating before enabling trackers. | Yes | Policy matches runtime behavior and non-essential trackers are blocked until consent. |
| LPA-005 | High | Missing internal legal docs | `docs/legal/` | No ROPA, DPA draft, subprocessor register, retention policy, DSAR process, breach plan, or TOMs docs exist as first-class records. | No auditable compliance operating model. | Create the internal legal/compliance documentation suite. | Yes | Internal legal docs exist and are linked from a legal index. |
| LPA-006 | High | AI transparency | `src/app/api/ai/generate-description/route.ts`, `src/app/api/ai/parse-resume/route.ts`, `src/app/api/ai/match-score/route.ts` | AI features exist, but there is no public AI processing notice or clear disclosure about decision support only. | Profiling/automated decision-making transparency risk. | Add an AI notice and explicit non-automated-decision wording. | Yes | AI notice is public and matched to runtime behavior. |
| LPA-007 | High | Background checks | `docs/plans/background-checks-malta-implementation.md`, `src/app/api/checkout/route.ts` | Background-check products are already present in the product model, but no public policy or Article 10 guardrail page exists. | Criminal-conviction/offence data risk. | Publish a dedicated background-check policy and keep the feature restricted pending legal review. | Yes | Background-check handling is consent-based, private, and not publicly exposed without policy. |
| LPA-008 | Medium | Admin/security logging disclosure | `src/app/admin/**`, `src/lib/admin-session.ts` | Admin security logging and access controls exist, but the privacy notice does not clearly describe security/admin logs. | Transparency gap for logged operational data. | Add a security/admin logging disclosure section. | Yes | Privacy notice covers admin/security logs and access control. |
| LPA-009 | Medium | Retention schedule | `src/app/privacy/page.tsx` | Retention is described only at a high level. | Deletion/retention claims may not match operational practice. | Publish a structured retention policy and align implementation. | Yes | Retention periods are documented by data category and tied to workflow. |

## Conclusion

Impjieg has a solid technical base and some privacy-friendly controls already in place, but the legal and compliance posture is not yet complete for a recruitment marketplace at scale.

The next phase should create the internal legal/compliance suite first, then harden the public notices and cookie/tracker behavior, and only after that move to DSAR/deletion workflows and recruitment-specific terms.

This audit should be treated as the baseline for those follow-up phases, not as a declaration of compliance.
