# Documentation style guide

> **Status:** Active
> **Purpose:** Defines how Impjieg documentation should be written and maintained.
> **Audience:** Developers, maintainers, designers, marketers, and AI coding agents.
> **Last reviewed:** 2026-06-04
> **Owner:** Impjieg maintainers
> **Related docs:**
> - [Brand modernization execution plan](./plans/2026-06-04-brand-modernization-execution.md)

## Brand position

Impjieg is Malta’s modern jobs marketplace for tech, digital, and iGaming talent.

Do not use:

- transparent job board
- Malta jobs board
- official portal
- registry
- public-sector platform
- ministry-style language
- government tone

## Voice

Use:

- clear
- commercial
- product-led
- trustworthy
- concise
- operational

Avoid:

- vague startup fluff
- exaggerated claims
- fake production-readiness claims
- public-sector or bureaucratic language
- casino clichés
- cheap neon or gambling language

## Documentation types

Use Diátaxis-style categories:

- Tutorial: learning-oriented walkthrough.
- How-to: task-oriented procedure.
- Reference: facts, commands, APIs, environment variables.
- Explanation: rationale, architecture, strategy.

## Structure

Rules:

- One H1 per file where practical.
- Sentence-case headings.
- Short paragraphs.
- Task-focused sections.
- Fenced code blocks for commands.
- Use `bash` for shell commands.
- Use tables only when they improve scanning.
- Avoid emoji in technical docs.

## Status labels

Use:

- Active
- Draft
- Historical
- Deprecated
- Superseded

Every important active doc should include:

- Status
- Purpose
- Audience
- Last reviewed
- Owner
- Related docs

## Links

Rules:

- Use relative links for repo files.
- Do not use absolute GitHub links for internal docs unless necessary.
- Verify linked docs exist.
- Verify referenced assets exist.

## Commands

Rules:

- Commands must be copy-pasteable.
- Commands must be current.
- Commands must not include real secrets.
- Use placeholders for values.

Valid placeholders:

- `<SUPABASE_URL>`
- `<SUPABASE_ANON_KEY>`
- `<SUPABASE_SERVICE_ROLE_KEY>`
- `<RESEND_API_KEY>`
- `<GROQ_API_KEY>`
- `<INTERNAL_ADMIN_TOKEN>`
- `<JOB_ALERT_UNSUBSCRIBE_SECRET>`
- `<CRON_SECRET>`

## Security and privacy

Rules:

- Never include API keys, tokens, passwords, service role keys, raw emails, private candidate data, private employer data, or production secrets.
- Historical security incidents may be summarized, but secret values must never be repeated.
- Security docs must preserve:
  - protected AI routes
  - token-only unsubscribe links
  - sanitized job descriptions
  - no raw PII in logs
  - no secrets in repo

## Brand language replacements

Use these replacements in active docs:

- “transparent job board” -> “modern jobs marketplace”
- “Malta jobs board” -> “Malta jobs marketplace”
- “official portal” -> “platform”
- “registry” -> “marketplace” or “system”
- “users” -> “candidates”, “employers”, or “admins” where context is specific
