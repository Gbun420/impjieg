# Impjieg product and market roadmap

> **Status:** Active
> **Purpose:** Product and market roadmap for Impjieg.
> **Audience:** Maintainers, product, marketing, and implementation agents.
> **Last reviewed:** 2026-06-04
> **Source of truth:**
> - [Brand modernization execution plan](./2026-06-04-brand-modernization-execution.md)
> - [Documentation style guide](../DOCUMENTATION_STYLE_GUIDE.md)

## Current positioning

Impjieg is Malta’s modern jobs marketplace for tech, digital, and iGaming talent.

## Strategic focus

- Tech roles in Malta.
- Digital roles in Malta.
- iGaming roles in Malta.
- Clear work-mode signals.
- Better employer conversion.
- Better candidate trust.

## Brand modernization dependency

This roadmap depends on the active brand modernization plan and must not drift back to government-like or generic listing-site language.

## Next implementation priorities

- Token foundation.
- Homepage and jobs surface.
- Job detail conversion.
- Branded email shell.
- Logo, favicon, and OG assets.
- Production verification.

## Roadmap snapshot

### Now

- [x] Complete live AI env setup in Vercel.
- [x] Complete live Twilio WhatsApp env setup in Vercel.
- [x] Replace WhatsApp placeholder path with a shared Twilio sender.
- [x] Commit `.env.example` so the documented env contract matches production.

### Must build next

- [x] Turn alerts into a real retention loop.
  - [x] Public `/alerts` now persists records to `job_alerts`.
  - [x] Confirmation email flow added.
  - [x] Unsubscribe route added.
  - [x] Daily digest sender route added.
  - [x] Production cron schedule added in `vercel.json`.
- [~] Strengthen distribution beyond on-site discovery.
  - [x] Add employer-facing email amplification.
  - [x] Add social promotion workflow.
  - [x] Add Google indexing discipline for fresh and expired jobs.
  - [ ] Add broader off-platform distribution beyond direct sharing.
- [~] Upgrade employer brand surfaces.
  - [x] Add richer public company trust and hiring signals from existing data.
  - [x] Add richer editable employer content: benefits, culture, process, workplace details, hiring response expectations.
- [ ] Deepen recruiter workflow.
  - [x] Add response-SLA and backlog visibility.
  - [x] Add better candidate filtering.
  - [x] Add profile-based candidate screening cues.
  - [x] Add notes, scorecards, and collaborator support.

### Next 30 days

- [~] Productize AI matching.
  - [x] Use parsed profile data in recommendations.
  - [x] Use parsed profile data in recruiter screening.
  - [x] Expose explicit fit analysis on job detail pages for signed-in candidates.
  - [x] Extend matching depth beyond heuristic scoring.
- [~] Build trust signals.
  - [x] Public company hiring freshness and salary transparency indicators.
  - [x] Listing quality checks in employer jobs.
  - [x] Public response-time and employer activity signals.
- [ ] Improve monetization.
  - Credit packs, subscriptions, promotion bundles, and screening upsells.

### Next 90 days

- [ ] Build a Malta-specific moat.
  - Visa and work-permit support.
  - Sector-specific templates.
  - Local salary benchmarks.
  - SME hiring workflows.
