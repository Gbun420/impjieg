# Job Board Market Roadmap

## Now

- [x] Complete live AI env setup in Vercel
- [x] Complete live Twilio WhatsApp env setup in Vercel
- [x] Replace WhatsApp placeholder path with a shared Twilio sender
- [x] Commit `.env.example` so the documented env contract matches production

## Must Build Next

- [x] Turn alerts into a real retention loop
  - [x] Public `/alerts` now persists records to `job_alerts`.
  - [x] Confirmation email flow added.
  - [x] Unsubscribe route added.
  - [x] Daily digest sender route added.
  - [x] Production cron schedule added in `vercel.json`.
- [~] Strengthen distribution beyond on-site discovery
  - [x] Add employer-facing email amplification.
  - [x] Add social promotion workflow.
  - [x] Add Google indexing discipline for fresh/expired jobs.
  - [ ] Add broader off-platform distribution beyond direct sharing.
- [~] Upgrade employer brand surfaces
  - [x] Add richer public company trust and hiring signals from existing data.
  - [ ] Add richer editable employer content: benefits, culture, process, workplace details, hiring response expectations.
- [ ] Deepen recruiter workflow
  - Add notes, scorecards, collaborator support, response SLAs, and better candidate filtering.

## Next 30 Days

- [ ] Productize AI matching
  - Use parsed CV/profile data in recommendations and recruiter screening.
- [~] Build trust signals
  - [x] Public company hiring freshness and salary transparency indicators.
  - [x] Listing quality checks in employer jobs.
  - [ ] Verified response times and richer employer activity signals.
- [ ] Improve monetization
  - Credit packs, subscriptions, promotion bundles, and screening upsells.

## Next 90 Days

- [ ] Build a Malta-specific moat
  - Visa/work-permit support
  - Sector-specific templates
  - Local salary benchmarks
  - SME hiring workflows
