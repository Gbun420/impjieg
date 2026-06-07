# Impjieg

Impjieg is Malta’s modern jobs marketplace for tech, digital, and iGaming talent.

It helps candidates discover clearer Malta-focused roles and helps employers publish and manage hiring flows with a modern, product-led experience.

## What it does

- Public job discovery for Malta-focused roles.
- Search and filters for role, sector, work mode, seniority, and location where supported.
- Employer job posting and application management where implemented.
- Candidate applications and job alerts where implemented.
- AI-assisted employer tooling where protected and present.
- Email notifications where implemented.
- Admin and aggregation surfaces where present.

## Why it matters

- Less noise than generic listings.
- Clearer work-mode and role signals.
- Faster paths from discovery to application.
- A better marketplace experience for candidates and employers.

## Product status

- Live on Vercel.
- Active hardening and brand modernization are underway.
- Current source of truth: [Brand modernization execution plan](docs/plans/2026-06-04-brand-modernization-execution.md)

## Tech stack

- Next.js App Router
- TypeScript
- Supabase
- Vercel
- Resend where implemented
- Groq where implemented
- Stripe where implemented
- Twilio WhatsApp where implemented
- Tailwind CSS and shared UI primitives where present

## Getting started

### Prerequisites

- Node.js 20+
- npm
- A local `.env.local` file based on `.env.example`

### Install and run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment variables

Use names only. Do not commit values.

### Public client variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_URL`

### Server variables

- `SUPABASE_SERVICE_ROLE_KEY`
- `INTERNAL_ADMIN_TOKEN`
- `JOB_ALERT_UNSUBSCRIBE_SECRET`
- `CRON_SECRET`
- `SUPER_ADMIN_EMAILS`
- `ADMIN_BOOTSTRAP_PRIMARY_EMAIL`
- `ADMIN_BOOTSTRAP_PRIMARY_PASSWORD`
- `ADMIN_BOOTSTRAP_PARTNER_EMAIL`

### Optional integrations

- `GROQ_API_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_STANDARD`
- `STRIPE_PRICE_FEATURED`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_WHATSAPP_NUMBER`

## Development workflow

```bash
npm run lint
npm test
npm run build
```

All three gates must pass before deployment.

## Security notes

- Do not commit secrets.
- AI routes must remain protected.
- Job descriptions must remain sanitized.
- Unsubscribe links must remain token-only.
- Logs must not include raw emails, tokens, secrets, or private candidate or employer data.

## Documentation

- [Documentation style guide](docs/DOCUMENTATION_STYLE_GUIDE.md)
- [Brand modernization execution plan](docs/plans/2026-06-04-brand-modernization-execution.md)
- [Product and market roadmap](docs/plans/2026-05-23-job-board-market-roadmap.md)
