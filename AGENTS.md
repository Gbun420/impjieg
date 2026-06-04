# Impjieg agent instructions

> **Status:** Active
> **Purpose:** Operating instructions for AI coding agents working on Impjieg.
> **Audience:** AI coding agents and maintainers.
> **Last reviewed:** 2026-06-04
> **Owner:** Impjieg maintainers
> **Related docs:**
> - [Brand modernization execution plan](./docs/plans/2026-06-04-brand-modernization-execution.md)
> - [Documentation style guide](./docs/DOCUMENTATION_STYLE_GUIDE.md)

## Brand source of truth

Use [docs/plans/2026-06-04-brand-modernization-execution.md](./docs/plans/2026-06-04-brand-modernization-execution.md) as the active brand source of truth.

Impjieg is Malta’s modern jobs marketplace for tech, digital, and iGaming talent.

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

## Framework note

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes. APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
