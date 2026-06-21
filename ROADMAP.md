# Impjieg — Product Roadmap

> **Date:** 21 June 2026 · **Owner of this doc:** Anthony (marketing / SEO / UX-UI)
> **Context:** Roadmap drawn up after the UX/UI redesign began, covering what to finish, fix, and add ahead of launch.

---

## Where we are

The public-facing **redesign is ~80% rolled out** — brand tokens (navy + coral), the real `impjieg.work` logo, editorial homepage hero, restyled job cards, `/jobs` listing, job-detail page (incl. a broken-layout fix), footer, and auth screens. A **live, shareable preview** is up at `impjieg-redesign.vercel.app`.

Three pull requests are open for review: **#16** (redesign), **#13** (SEO landing pages), **#12** (blog engine).

**The honest gap:** the board currently shows **no live jobs** (the seeded data expired). All the polish in the world won't convert an empty board — so "live job inventory" is the real launch blocker, called out in §5.

## How to read this

**Lanes:** 🎨 Anthony (UX / SEO / marketing) · ⚙️ Co-founder (backend / data / security) · 🤝 Shared
**Priority:** P1 (do first) · P2 (soon) · P3 (later)

---

## 1. Finish the visual redesign — 🎨

| Item | What it is | Priority |
|------|-----------|----------|
| **★ Sector photo cards** | Replace the text "Browse by sector" tiles with **9:16 portrait cards** — iGaming, Technology, Finance, Healthcare, Hospitality, etc. Each = background photo + navy gradient overlay + sector name + live role count, coral on hover. Desktop grid / mobile swipe. **Bonus:** they double as rich internal SEO links into the sector landing pages. | P1 |
| **Remaining public pages** | Restyle **pricing, companies (list + detail), salary calculator, about, contact, employer-growth** to the new language. They inherit the tokens but need the same per-page polish as the rest. | P1 |
| **Empty & loading states** | An inviting "no roles yet" state (important while the DB is empty) + loading skeletons on dashboards. | P2 |
| **Dark mode + accessibility QA** | Verify dark mode after the token shift; close audit a11y gaps (share-modal focus trap, mobile-menu Escape/focus). | P2 |
| **Dashboards** | Employer & candidate dashboard polish — logged-in, lower visibility, do last. | P3 |

> **Imagery note for the sector cards:** they need **licensed photos** — free stock (Unsplash / Pexels) or on-brand shots generated via Higgsfield. Keep it clean and Malta-credible (the brand guide bans casino/dice clichés for iGaming, etc.). ~8–12 images needed.

## 2. Make it convert — 🎨

- **Social proof** — testimonials, employer logos, an "X companies hiring" counter (the audit flagged none today).
- **Trust & freshness cues** on job cards — verified badge, "posted Xh ago" (partly there; strengthen).
- **Post-signup onboarding** — a short guided nudge for new candidates and employers.

## 3. Fill it with content — SEO (the #1 growth lever) — 🎨

- **Blog content (Track B)** — the engine is built but **empty**. Keyword research → content calendar → write the priority Malta posts (salary guide, work-permit guide, iGaming careers, etc.), grounded in real sources via Perplexity. *This is where organic ranking actually comes from.*
- **Landing-page content (Track A)** — add unique copy per sector/location page to avoid thin/duplicate content; the sector photo cards feed internal links into them.
- **Salary calculator SEO** — it's currently client-only and invisible to Google. Make it server-rendered with metadata — a high-value keyword target and lead magnet.

## 4. Launch kit — 🎨

- **Newsletter** — capture form + email wiring (build on the existing job-alerts / Resend infrastructure). Not built yet.
- **Socials** — the share image is fixed (links now preview correctly); next is the actual profiles + a reusable share-template kit.
- **Logo polish** — a standalone square mark / avatar for social profiles and tight spaces (the wordmark is too wide for a 1:1 avatar).

## 5. Platform & data — the real launch blockers — ⚙️ / 🤝

- **🔴 Live job inventory** — *the* blocker. An empty board doesn't convert, however good it looks. The repo has a job-aggregation pipeline; it needs real Malta jobs flowing in (or a solid seed). **Nothing else moves the needle as much for an actual launch.**
- **Security fixes** (from the audit) — contact-form HTML escaping, gate the `PLAYWRIGHT_E2E` bypass, add rate limiting to contact/upload.
- **Performance** — remove the root `force-dynamic` to unlock caching (single biggest perf win).
- **CI** — fix GitHub Actions (Actions-minutes/billing) so PRs get green checks.
- **Merge** the three open PRs (#16, #13, #12) once reviewed.

---

## Suggested sequence

**Now** → sector photo cards + finish the public-page restyle (pricing / companies / salary calculator). The redesign then reads as complete.
**Next** → blog content (start ranking) + newsletter capture.
**In parallel (co-founder)** → real job inventory + merge PRs + security/perf fixes.

## Open pull requests

| PR | Title | Status |
|----|-------|--------|
| #16 | Apple-clean redesign (brand, logo, hero, job cards, footer, auth, job detail) | Open |
| #13 | SEO landing pages — fixed 8/12 dead sector pages + on-page SEO | Open |
| #12 | Scalable MDX blog engine + schema | Open |

*Live preview: impjieg-redesign.vercel.app*
