# Impjieg — Malta's Modern Job Board

> Your next role, sorted.

A production-ready job board for the Maltese market with salary transparency, employer dashboards, Stripe payments, and PWA support.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** Supabase (PostgreSQL)
- **Payments:** Stripe
- **Email:** Resend
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- Supabase account
- Stripe account

### Environment Setup

1. Copy the environment template:

```bash
cp .env.example .env.local
```

2. Fill in your environment variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret
STRIPE_PRICE_STANDARD=your-standard-price-id
STRIPE_PRICE_FEATURED=your-featured-price-id

# Resend
RESEND_API_KEY=your-resend-api-key

# App
NEXT_PUBLIC_URL=http://localhost:3000
```

### Supabase Setup

1. Create a new Supabase project
2. Run the migration in `supabase/migrations/001_initial_schema.sql`
3. Enable Row Level Security on all tables
4. Configure Auth redirect URLs to `http://localhost:3000/auth/callback`

### Stripe Setup

1. Create products in Stripe:
   - "Standard Listing" — €29 (one-time)
   - "Featured Listing" — €59 (one-time)
2. Copy the Price IDs to your `.env.local`
3. Set up webhook endpoint: `http://localhost:3000/api/webhooks/stripe`
4. Listen for: `checkout.session.completed`, `checkout.session.expired`

### Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
```

### Deploy

1. Push to GitHub
2. Connect repository to Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/               # Authentication pages
│   ├── companies/          # Company directory & profiles
│   ├── employer/           # Employer dashboard
│   ├── jobs/               # Job listings & detail
│   └── api/                # API routes (webhooks)
├── components/
│   ├── ui/                 # Design system primitives
│   ├── layout/             # Header, footer, templates
│   └── jobs/               # Job-specific components
├── lib/
│   ├── actions/            # Server actions
│   ├── supabase/           # Supabase clients & types
│   ├── constants.ts        # Brand constants
│   ├── utils.ts            # Utility functions
│   └── stripe.ts           # Stripe client
└── styles/
    └── globals.css         # Tailwind + brand tokens
```

## License

MIT
