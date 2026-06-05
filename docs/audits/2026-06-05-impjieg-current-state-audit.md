# Impjieg Current-State Audit

> **Status:** Historical
> **Purpose:** Current-state audit of the Impjieg repository and public site.
> **Audience:** Maintainers, engineering, product, and security.
> **Last reviewed:** 2026-06-05
> **Owner:** Impjieg maintainers
> **Related docs:**
> - [Audit hardening implementation plan](../plans/2026-06-05-audit-hardening.md)
> - [Brand modernization execution plan](../plans/2026-06-04-brand-modernization-execution.md)

**Repository:** `Gbun420/impjieg`
**Website reviewed:** `https://impjieg.vercel.app/`
**Repository snapshot date:** 2026-06-05

## Scope And Method

This audit combines repository review, implementation-log review, and public-site observation. It distinguishes between:

- verified code behaviour,
- documentation-only claims,
- runtime observations,
- and recommendations.

The public site was reviewed directly. Backend routes and third-party integrations were not executed as a full staging exercise during the audit.

## Executive Summary

Impjieg is a Malta-focused jobs marketplace for tech, digital, and iGaming roles. The current branch shows meaningful hardening and product maturity improvements:

- password complexity is enforced,
- security headers are applied through a nonce-based CSP,
- AI routes require authentication and apply request limits,
- job descriptions are sanitised before rendering,
- slug generation now retries on collision,
- admin MFA is implemented,
- and the admin provisioning route now uses env-backed credentials instead of hardcoded secrets.

Two caveats remain important:

- AI rate limiting is still in-memory and therefore per-process,
- and some third-party integrations were not executed at runtime during this audit.

The earlier admin MFA and CSP gaps are no longer open in the current branch. They should be recorded as resolved since the earlier snapshot.

## Product Surface

### Verified / observed

- The public surface includes Home, Jobs, Companies, Pricing, About, Contact, Privacy, Terms, Salary Calculator, Job Alerts, candidate authentication, employer posting, and admin login.
- The jobs listing count is a point-in-time runtime observation only. It should never be treated as stable.
- The company and job pages present Malta-relevant employer and role information, not a generic job-board layout.

### Documentation-only

- The README states the product is deployed to Vercel, but this should still be treated as documentation unless deployment is independently verified.
- Pricing/comparison copy includes product claims that should not be confused with security or compliance guarantees.

## Verified Code Behaviour

### Password policy

Password validation is now centralized in [src/lib/password-policy.ts](../../src/lib/password-policy.ts) and enforced during signup in [src/lib/actions/auth.ts](../../src/lib/actions/auth.ts). The policy requires:

- at least 8 characters,
- at least one lowercase letter,
- at least one uppercase letter,
- at least one digit,
- and at least one special character.

Status: resolved since the earlier six-character minimum finding.

### Security headers

Security headers are generated in [src/lib/security-headers.ts](../../src/lib/security-headers.ts) and applied in [middleware.ts](../../middleware.ts). The current policy uses a nonce-based CSP and does not rely on a static `unsafe-inline` allowlist.

This is materially stronger than the earlier configuration because scripts and styles are tied to a per-request nonce.

### AI endpoint protections

The AI routes include:

- authentication checks,
- request body size limits,
- schema validation,
- prompt length limits,
- and output sanitisation where applicable.

Relevant code paths:

- [src/app/api/ai/generate-description/route.ts](../../src/app/api/ai/generate-description/route.ts)
- [src/app/api/ai/bias-check/route.ts](../../src/app/api/ai/bias-check/route.ts)
- [src/lib/ai-security.ts](../../src/lib/ai-security.ts)

Important caveat: the rate-limit store in [src/lib/ai-security.ts](../../src/lib/ai-security.ts) is in-memory. That makes it a partial mitigation only.

### Slug uniqueness

Slug generation now uses [src/lib/unique-slug.ts](../../src/lib/unique-slug.ts) and retries on duplicate-key errors. The schema also already includes unique constraints for employer slugs and job slugs in the Supabase migrations.

This is a much better posture than the earlier random-suffix-only approach. The earlier collision concern is effectively resolved for the current branch.

### Admin MFA

Admin MFA is implemented in:

- [src/lib/admin-mfa.ts](../../src/lib/admin-mfa.ts)
- [src/app/admin/actions.ts](../../src/app/admin/actions.ts)
- [src/app/admin/login/admin-login-form.tsx](../../src/app/admin/login/admin-login-form.tsx)
- [supabase/migrations/013_admin_mfa.sql](../../supabase/migrations/013_admin_mfa.sql)

The current flow uses a TOTP setup/verification path before the admin session is set. The earlier "admin MFA missing" finding is resolved in the current branch.

### Admin provisioning

The admin provisioning route no longer hardcodes a live password. It now uses environment-backed bootstrap values in [src/app/api/admin/provision/route.ts](../../src/app/api/admin/provision/route.ts).

That removes a serious secret-management issue from the earlier review.

### Job description sanitisation

User-supplied job descriptions are sanitised in [src/lib/job-description.ts](../../src/lib/job-description.ts) to remove scripts, iframes, event-handler attributes, JavaScript URLs, and stray markup while preserving readable text.

Status: strong control, and it should be preserved.

### Accessibility and UX polish

Implementation updates improved logo alt text, placeholder semantics, and post-job error visibility. These are useful quality improvements and should be preserved on any new public surfaces.

## Documentation-Only Claims

The following items were documented but not fully exercised at runtime during the audit:

- Vercel deployment environment details,
- Twilio/WhatsApp delivery success,
- Resend email delivery success,
- Stripe checkout success paths,
- and production monitoring maturity.

These should remain documented claims unless verified in a staging or production-like run.

## Runtime Observations

- The public site was accessible during review.
- The jobs page displayed a live count that can change at any time.
- Marketing copy and operational claims are present on public pages and should not be treated as security evidence.

## Risk Register

| Risk | Status | Severity | Evidence / Basis | Impact | Recommended Fix | Owner |
|---|---|---:|---|---|---|---|
| AI rate limiting is in-memory | Partial mitigation | Medium-High | [src/lib/ai-security.ts](../../src/lib/ai-security.ts) stores counters in process memory. | Limits are not shared across serverless instances or multiple Node processes. | Use a shared store such as Redis, Upstash, Vercel KV, or Supabase-backed counters, and enforce per-IP plus per-user quotas. | Engineering |
| Runtime behaviour of integrations is unverified | Open | Medium | Twilio, Resend, Stripe, and some AI/payment paths were not executed end-to-end during this review. | Hidden production errors could remain undetected. | Add staging smoke tests for notifications, email, checkout, and AI flows. | Engineering / QA |
| Guardrails rely on developer discipline | Open | Medium | Project docs constrain sensitive changes, but enforcement is mostly procedural. | Sensitive flows could still be changed accidentally. | Add CODEOWNERS, protected branches, required reviews, and CI checks for auth, admin, AI, payment, email, and migrations. | Maintainers |
| Marketing claims can be mistaken for verified facts | Open | Low-Medium | Public copy mixes product positioning and operational claims. | Audit readers may overstate what has been verified. | Keep marketing language separate from verified technical/compliance findings. | Product / Compliance |

## Resolved Since The Earlier Audit

These items were earlier risks but are now resolved in the current branch:

- admin MFA,
- CSP hardening,
- password policy,
- slug collision handling,
- and hardcoded admin provisioning credentials.

## Recommendation Order

1. Add distributed AI rate limiting so abuse controls survive scaling.
2. Add staging smoke tests for WhatsApp, Resend, Stripe, and AI routes.
3. Add repository governance around sensitive code paths.
4. Keep the sanitiser, MFA flow, password policy, and nonce-based CSP intact.

## Conclusion

The current branch is materially stronger than the earlier snapshot. The most important controls are now present: password policy, nonce-based CSP, AI route protections, slug collision handling, job sanitisation, admin MFA, and env-backed admin provisioning. The remaining material risk is not a missing core control; it is operational durability, especially distributed rate limiting and unverified third-party integrations. The report should therefore describe Impjieg as improved and credible, but still requiring runtime verification and scaling-aware abuse controls.
