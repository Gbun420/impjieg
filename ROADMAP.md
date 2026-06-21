# Impjieg — Product Roadmap

> **Date:** 21 June 2026 (refreshed) · **Owner of this doc:** Anthony (marketing / SEO / UX-UI)
> **Context:** Refreshed after the **Sunlight rebrand** and the **jobs aggregator** build. Supersedes the earlier navy+coral-era roadmap — most of that is now shipped (see below).

---

## Where we are

The site has been **rebranded to "Sunlight" (black · white · yellow)** and the public redesign is essentially complete. A **working, shareable preview** is live at `impjieg-redesign.vercel.app`. A **job aggregator** has been built to solve the empty-board cold-start.

**The honest gap (still the launch gate):** the board shows **no live jobs yet**. The aggregator is built but hasn't been *run* against production — it needs the Supabase service-role key + a one-line seed command. Everything else is ready; **this is the one thing standing between a polished shell and a real launch.**

## ✅ Shipped since the last roadmap

- **Sunlight rebrand** — vibrant-yellow palette, **Barlow** display font, recolored **black/white/yellow logo** + favicons, new OG share image
- **Vibrant homepage** — yellow hero, warm-black bands with white font, scroll-in animations
- **Pricing** restructured for clarity (tabs removed → top-down flow)
- **Site-wide restyle sweep** — about, auth, companies, job filters, employer/admin, email templates, QR
- **9:16 sector cards** with warm amber/black photography (8 sectors)
- **Location taxonomy** expanded to 28 Malta localities + Gozo
- **Jobs aggregator** — Greenhouse / Lever / Workable / Teamtailor / SmartRecruiters adapters, Malta-only filter + locality normalization, dedupe, daily cron, one-command seed of 5 verified Malta sources (`docs/aggregator.md`)
- **Fixed the Vercel deploy** — a sub-daily cron exceeded the Hobby plan limit and was silently failing every build; now daily, deploys green again

## How to read this

**Lanes:** 🎨 Anthony (UX / SEO / marketing) · ⚙️ Co-founder (backend / data / security) · 🤝 Shared
**Priority:** P1 (do first) · P2 (soon) · P3 (later)

---

## 1. Launch gate — get a real, populated site live — 🤝 · P1

- 🔴 **Run the aggregator seed** — `SEED_DEFAULT_STATUS=confirmed npx tsx scripts/aggregator-seed-malta-sources.ts` (with the prod service key) → ~95 real Malta jobs from day one. *Nothing converts on an empty board.*
- **Set production env** — `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET` so the daily import runs.
- **Merge to production** — all current work is on `feat/ux-apple-redesign` + the preview; the live `impjieg` site is unchanged until merged.
- **Google Search Console + Google for Jobs** — verify the domain, submit the sitemap, confirm `JobPosting` indexing (the JSON-LD is already in place). Free, high-intent traffic.
- **Analytics** — Vercel Analytics or Plausible. Can't improve SEO/conversion blind.

## 2. SEO growth engine — the #1 lever — 🎨 · P1–P2

- **Blog content (Track B)** — engine is built but **empty**. Keyword map → write the cornerstone Malta posts (salary guides, work-permit/relocation, iGaming careers). This is where organic ranking actually comes from.
- **Programmatic landing pages (Track A)** — unique intro copy per sector/location (now 28 locations × sectors = 200+ pages) to avoid thin/duplicate content; internal-link from the sector cards.
- **Salary-calculator SEO** — high-intent keyword target + lead magnet.
- **Job alerts + newsletter** — the alerts table + daily cron already exist; turn it into a seeker-retention email loop (Resend).

## 3. Discovery & product depth — 🤝 · P2

- **Search upgrade** — `ilike` substring → Postgres full-text / trigram with relevance ranking, facet counts, and sort. Matters once volume justifies it.
- **Carry Sunlight into inner pages** — jobs list, job detail, companies, sector pages still look plainer than the homepage.
- **Candidate & employer UX** — CV upload, profile → job matching (the "AI match" hook exists), employer dashboard / apply-flow polish.
- **Mobile + accessibility + performance** — a11y contrast audit (especially on yellow), Lighthouse pass, remove root `force-dynamic` where caching is safe.

## 4. Aggregator depth & trust — ⚙️ · P2–P3

- **More sources** — an admin UI to add/monitor feeds (the migration-009 admin tables are ready), Workday/CSV adapters, cross-source dedup (`job_duplicates`).
- **Moderation** — content checks on aggregated jobs (attribution + link-out already handled in the importer).
- **Security & GDPR** — audit fixes (contact-form escaping, rate limits on contact/upload, gate test bypasses) + an EU/Malta privacy review.
- **CI** — the `build-and-lint` check fails on `npm ci` (lockfile/peer conflict; the project needs `--legacy-peer-deps`). Switch CI to `npm install --legacy-peer-deps` or maintain a CI-valid lock so checks are trustworthy.

---

## Suggested sequence

1. **Now** → run the seed + set env + merge → the board goes live **with real jobs**.
2. **Next** → Search Console + analytics + the first blog posts → start ranking.
3. **Then** → search upgrade + inner-page polish + newsletter capture.
4. **Co-founder, in parallel** → more aggregator sources + security / CI / performance.

## Status

- **Branch:** `feat/ux-apple-redesign` (pushed to origin + preview)
- **Preview:** `impjieg-redesign.vercel.app` (deploying green again)
- **Aggregator:** built — setup + run instructions in `docs/aggregator.md`
