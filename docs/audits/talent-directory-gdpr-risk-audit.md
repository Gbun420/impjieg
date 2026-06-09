# Talent Directory — GDPR & Privacy Risk Audit

> **Status:** Draft
> **Date:** 2026-06-08
> **Purpose:** Identify GDPR obligations and privacy risks before implementation.

---

## 1. Lawful Basis

| Data Use | Lawful Basis | Notes |
|----------|-------------|-------|
| Candidate opt-in to directory visibility | **Consent** (Art. 6(1)(a)) | Freely given, specific, informed, explicit positive action |
| Directory profile storage | **Consent** | Only while opted in |
| Employer billing and payment processing | **Contract** (Art. 6(1)(b)) | Necessary for performance of contract |
| Audit logs (contact requests, access) | **Legitimate interest** (Art. 6(1)(f)) | Security, abuse prevention, compliance |
| Admin monitoring of employer access | **Legitimate interest** | Platform integrity |
| Candidate email/phone disclosure | **Consent** | Separate, explicit, only after candidate acceptance |

## 2. Consent Requirements

Candidate opt-in consent must be:

- **Freely given** — No bundling with job application. Opt-in is separate from account creation.
- **Informed** — Clear explanation of what data is visible, to whom, and for what purpose.
- **Specific** — Separate consent for directory visibility, CV sharing, and email/phone disclosure.
- **Explicit positive action** — Checkbox (unchecked by default), not pre-ticked.
- **Clear/plain language** — No legal jargon. Plain English.
- **Withdrawable** — Candidate can pause or leave at any time. Withdrawal is as easy as opt-in.

## 3. Candidate Controls

| Control | Implementation | Priority |
|---------|---------------|----------|
| Opt in | Explicit checkbox + consent version tracking | MVP |
| Pause visibility | Toggle to `paused` status | MVP |
| Withdraw consent | Leave directory, delete profile | MVP |
| Delete directory profile | Remove all directory data | MVP |
| Hide CV | `allow_cv_requests: false` (default) | MVP |
| Hide email | Never shared unless candidate accepts | MVP |
| Hide phone | Never shared unless candidate accepts | MVP |
| Block employer | Future — report/block mechanism | Post-MVP |
| Report abuse | Future — abuse report form | Post-MVP |

## 4. Data Minimisation

### Directory-Visible Data (employer can see when opted in)

| Field | Source | Notes |
|-------|--------|-------|
| Headline | Candidate-controlled | Optional |
| Summary | Candidate-controlled | Optional, max 1000 chars |
| Location | Candidate-controlled | City-level only |
| Skills | Candidate-controlled | Array, max 30 |
| Sectors | Candidate-controlled | Array, max 10 |
| Job types | Candidate-controlled | Array |
| Remote preference | Candidate-controlled | Single value |
| Salary expectation range | Candidate-controlled | Min/max integers |
| Experience years | Candidate-controlled | Integer |
| Availability | Candidate-controlled | Free text |

### Hidden by Default (never exposed to employers)

| Field | Reason |
|-------|--------|
| Email | PII — only shared after explicit candidate acceptance |
| Phone | PII — only shared after explicit candidate acceptance |
| Raw CV file URL | Sensitive document — never shared via client |
| Full address | Overly specific — use city-level location |
| Current employer | Could expose candidate to current employer |
| Internal notes | Private candidate data |
| Sensitive personal data | Never collected or stored |

## 5. Security Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Employer scraping | High | Rate limits, no bulk export, paid access, audit logs |
| Bulk download abuse | High | No bulk export endpoint, credits system, rate limits |
| Fake employers | High | Verified employer only, email verification, admin review |
| Candidate doxxing | High | Email/phone hidden by default, consent-gated disclosure |
| Current employer discovering candidate | Medium | Display mode options (anonymous, first name), salary range not exact |
| Leaking CV file URLs | Critical | CV file URLs never in client payloads, server-side only |
| Weak RLS policies | High | Comprehensive RLS on all new tables, anon blocked |
| Service-role misuse | High | Service role only server-side, audit logging |

## 6. Required Controls

| Control | Status | Priority |
|---------|--------|----------|
| No anon access | Required | MVP |
| Verified employer only | Required | MVP |
| Paid access only | Required | MVP |
| Contact credits | Required | MVP |
| Rate limits | Required | MVP |
| Audit logs | Required | MVP |
| Candidate approval | Required | MVP |
| Admin suspension | Required | MVP |
| Abuse reports | Post-MVP | Post-MVP |
| No bulk export | Required | MVP |
| No raw CV URL in client payloads | Critical | MVP |

## 7. Retention

| Data | Retention | Deletion |
|------|-----------|----------|
| Contact requests | 12 months after resolution | Anonymise after retention |
| Audit logs | 24 months | Archive then delete |
| Candidate opt-out | Immediate | Directory profile deleted, audit log retained |
| Candidate deletion | Immediate | All directory data deleted, audit log anonymised |
| Export requests | 30 days | Handle or escalate |

## 8. DPIA Recommendation

> **Before production launch, complete a lightweight DPIA/privacy review because this feature monetizes access to personal candidate data.**

Key DPIA questions:

1. Is consent truly freely given? (Not bundled with job search)
2. Are candidates fully informed about employer access?
3. Is the data minimisation sufficient?
4. Are the security controls adequate for the risk level?
5. Is the withdrawal mechanism as easy as opt-in?
6. Are audit logs sufficient for accountability?

**Recommendation:** Complete DPIA before production launch. This is a regulatory requirement under GDPR Art. 35 for processing that involves monitoring, profiling, or large-scale processing of personal data.
