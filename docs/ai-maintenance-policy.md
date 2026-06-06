# AI Maintenance Policy

## Purpose

This document defines the operating rules for autonomous or semi-autonomous maintenance work in Impjieg.

The intent is to let an agent diagnose and fix scoped issues safely without ever editing production directly.

## Workflow

1. A labeled GitHub issue or manually dispatched workflow starts the task.
2. The agent creates a branch.
3. The agent makes the smallest scoped fix.
4. The agent runs `npm run lint`, `npm test`, and `npm run build`.
5. The agent opens a pull request.
6. A preview deployment and smoke tests run before merge.
7. A human approves the PR when the label requires it.
8. Only then does the change reach production.

## Branch Policy

- Branches must never target `main` directly.
- One issue, one branch, one PR.
- Use branch names in the form `ai/<issue-number>-<short-slug>`.
- Keep changes small enough to review and revert cleanly.

## PR Policy

- Every PR must include:
  - what changed,
  - why it changed,
  - verification commands and results,
  - risk notes,
  - preview link when available.
- If any required gate fails, the agent stops and reports the failure.
- The agent does not merge its own PRs unless the issue is explicitly marked safe for auto-merge and all checks pass.

## Safe-Label Taxonomy

- `ai-agent:safe`: low-risk maintenance, documentation, lint, test, or UI polish.
- `ai-agent:ui`: user interface-only work.
- `ai-agent:test-fix`: test maintenance and regressions.
- `ai-agent:security`: security-related hardening or audit follow-up.
- `ai-agent:db`: schema, migration, or database access changes.
- `ai-agent:auth`: authentication, session, or identity changes.
- `ai-agent:payment`: payments, billing, or Stripe-related changes.
- `ai-agent:admin`: admin interfaces or admin actions.
- `ai-agent:needs-approval`: any work that should not auto-merge.

## Approval Rules

- Safe lane:
  - `ai-agent:safe`
  - `ai-agent:test-fix`
  - `ai-agent:ui`
- Human approval required:
  - `ai-agent:security`
  - `ai-agent:db`
  - `ai-agent:auth`
  - `ai-agent:payment`
  - `ai-agent:admin`
  - `ai-agent:needs-approval`

## Safety Boundaries

The agent must not change:

- database migrations without approval,
- auth/session logic without approval,
- Stripe/payment logic without approval,
- secrets or environment variables,
- production deployment settings,
- protected admin flows unless explicitly scoped.
