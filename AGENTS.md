# Impjieg agent instructions

> **Status:** Active
> **Purpose:** Operating instructions for AI coding agents working on Impjieg.
> **Audience:** AI coding agents and maintainers.
> **Last reviewed:** 2026-06-06
> **Owner:** Impjieg maintainers
> **Related docs:**
> - [Brand modernization execution plan](./docs/plans/2026-06-04-brand-modernization-execution.md)
> - [Documentation style guide](./docs/DOCUMENTATION_STYLE_GUIDE.md)

## Brand source of truth

Use [docs/plans/2026-06-04-brand-modernization-execution.md](./docs/plans/2026-06-04-brand-modernization-execution.md) as the active brand source of truth.

Impjieg is Malta’s modern jobs marketplace for tech, digital, and iGaming talent.

## AI maintenance policy

Use [docs/ai-maintenance-policy.md](./docs/ai-maintenance-policy.md) for branch, PR, and label policy when an AI maintenance workflow is involved.

## Operating rules

- Keep the product commercial, product-led, and non-governmental.
- Do not introduce a public-sector, registry, ministry, or generic job-board aesthetic.
- Do not add casino clichés or cheap neon gambling visuals.
- Do not change admin UI unless explicitly scoped.
- Do not change backend, database, auth, security, AI endpoint, email delivery, unsubscribe token, or application-count logic unless explicitly scoped.
- Do not change structured data unless explicitly scoped.
- Preserve existing security hardening and safety flows.

## Required safety guardrails

- Preserve job description XSS protection.
- Preserve token-only unsubscribe links.
- Preserve protected AI routes.
- Preserve server-side jobs pagination.
- Preserve atomic application count RPC behavior.
- Preserve candidate alert partial-update safety.

## Required gates

```bash
npm run lint
npm test
npm run build
```

## Autonomous maintenance workflow

- Treat AI maintenance as branch-based work only.
- Start from a labeled GitHub issue or manually dispatched workflow, not from direct edits to `main`.
- Create one branch per issue or task.
- Scope the work to the issue title and body; do not expand scope without a new issue or explicit approval.
- Open a pull request for every completed task.
- Use Vercel preview deployments and Playwright smoke tests before merge.
- Never push directly to `main`.
- Never deploy directly to production from an AI maintenance workflow.

## Branch And PR Policy

- Branch naming: `ai/<issue-number>-<short-slug>`.
- Keep commits focused and reversible.
- Every PR must include:
  - summary of the change,
  - tests run,
  - preview deployment or smoke-test status,
  - risk notes for any user-facing behavior.
- Merge only after required checks pass and a human reviewer approves when required by label.

## Safe-Label Taxonomy

- `ai-agent:safe`: low-risk fixes the agent may complete and PR automatically.
- `ai-agent:ui`: UI-only changes that may still need preview verification.
- `ai-agent:test-fix`: test or lint repairs scoped to existing behavior.
- `ai-agent:security`: security hardening or CSP/accessibility guardrails; PR only, no auto-merge.
- `ai-agent:db`: schema, migration, or query changes; PR only, human approval required.
- `ai-agent:auth`: auth, session, or identity changes; PR only, human approval required.
- `ai-agent:payment`: Stripe, billing, or monetization changes; PR only, human approval required.
- `ai-agent:admin`: admin surface changes; PR only, human approval required.
- `ai-agent:needs-approval`: anything outside the safe lane or anything ambiguous.

## Framework note

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes. APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
